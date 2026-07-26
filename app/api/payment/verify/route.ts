import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/firebase/firestore";
import { addDoc, collection, doc, updateDoc, getDoc, setDoc, query, where, getDocs } from "firebase/firestore";
import { getPlatformConfig } from "@/services/config.service";

export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingDetails,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingDetails) {
      return NextResponse.json(
        { success: false, message: "Missing verification parameters or booking details" },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return NextResponse.json(
        { success: false, message: "Razorpay credentials are not configured on the server." },
        { status: 500 }
      );
    }

    // 1. Cryptographical signature check using HMAC SHA256
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(text)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.warn("Razorpay payment signature mismatch. Possible fraudulent transaction request.");
      return NextResponse.json(
        { success: false, message: "Payment verification failed. Signature mismatch." },
        { status: 400 }
      );
    }

    // 2. Idempotency Check (Prevent duplicate processing of same payment)
    const paymentsQuery = query(collection(db, "payments"), where("paymentId", "==", razorpay_payment_id));
    const paymentsSnapshot = await getDocs(paymentsQuery);
    if (!paymentsSnapshot.empty) {
      console.log("Payment already verified, ignoring duplicate request");
      return NextResponse.json({
        success: true,
        message: "Payment already verified.",
        paymentId: razorpay_payment_id,
      });
    }

    // 3. Security: Re-fetch Turf to verify true price (Prevent client price tampering)
    const turfDoc = await getDoc(doc(db, "turfs", bookingDetails.turfId));
    if (!turfDoc.exists()) {
      return NextResponse.json({ success: false, message: "Turf not found." }, { status: 404 });
    }
    const turfData = turfDoc.data();
    
    const specialPrice = bookingDetails.date ? turfData.specialRates?.[bookingDetails.date] : undefined;
    const currentHourlyPrice = specialPrice !== undefined ? specialPrice : turfData.price;
    
    let discountAmount = 0;
    if (bookingDetails.appliedCouponId) {
       const couponDoc = await getDoc(doc(db, "coupons", bookingDetails.appliedCouponId));
       if (couponDoc.exists()) {
          const couponData = couponDoc.data();
          if (couponData.discountType === "percentage") {
             discountAmount = Math.round((currentHourlyPrice * couponData.discountValue) / 100);
          } else {
             discountAmount = couponData.discountValue;
          }
       }
    }
    const finalCalculatedPrice = Math.max(0, currentHourlyPrice - discountAmount);

    // 4. Double-Booking Race Condition Fix: Deterministic Document ID Lock
    const deterministicBookingId = `${bookingDetails.turfId}_${bookingDetails.date}_${bookingDetails.slot}`.replace(/[^a-zA-Z0-9_-]/g, "");
    const bookingDocRef = doc(db, "bookings", deterministicBookingId);
    
    // Check if locked
    const existingBooking = await getDoc(bookingDocRef);
    if (existingBooking.exists() && existingBooking.data().status !== "cancelled") {
      return NextResponse.json({ success: false, message: "Slot already booked by another user during payment processing." }, { status: 409 });
    }

    // 5. Create the booking document
    const bookingPayload = {
      userId: bookingDetails.userId,
      userEmail: bookingDetails.userEmail,
      turfId: bookingDetails.turfId,
      turfName: bookingDetails.turfName,
      ownerId: bookingDetails.ownerId,
      price: finalCalculatedPrice, // SECURITY FIX: Use server calculated price
      playerName: bookingDetails.playerName,
      mobile: bookingDetails.mobile,
      players: Number(bookingDetails.players),
      sport: bookingDetails.sport,
      notes: bookingDetails.notes || "",
      date: bookingDetails.date,
      slot: bookingDetails.slot,
      status: "confirmed",
      paymentId: razorpay_payment_id,
      createdAt: new Date(),
      otp: bookingDetails.otp,
      otpVerified: bookingDetails.otpVerified || false,
    };

    await setDoc(bookingDocRef, bookingPayload);

    // 6. Save payment log record
    await addDoc(collection(db, "payments"), {
      bookingId: deterministicBookingId,
      userId: bookingDetails.userId,
      playerName: bookingDetails.playerName,
      amount: finalCalculatedPrice,
      paymentId: razorpay_payment_id,
      status: "success",
      createdAt: new Date(),
    });

    // 7. Settlement Engine: Use Central Config & Advanced Schema
    const config = await getPlatformConfig();
    const platformFee = Math.round(finalCalculatedPrice * config.commissionRate);
    const taxAmount = Math.round(platformFee * config.gstRate); // GST on platform fee
    const ownerPayout = finalCalculatedPrice - platformFee - taxAmount;
    
    await addDoc(collection(db, "settlements"), {
      bookingId: deterministicBookingId,
      turfId: bookingDetails.turfId,
      ownerId: bookingDetails.ownerId,
      amount: finalCalculatedPrice, // Keep for backward compatibility
      grossAmount: currentHourlyPrice,
      discount: discountAmount,
      coupon: bookingDetails.appliedCouponId || null,
      tax: taxAmount,
      platformFee: platformFee,
      ownerPayout: ownerPayout,
      paymentId: razorpay_payment_id,
      status: "pending", // To be settled to bank
      refundStatus: "none",
      createdAt: new Date(),
    });

    // 8. Update coupon usage
    if (bookingDetails.appliedCouponId) {
      try {
        const couponRef = doc(db, "coupons", bookingDetails.appliedCouponId);
        await updateDoc(couponRef, {
          usageCount: bookingDetails.appliedCouponUsageCount + 1,
        });
      } catch (couponError) {
        console.error("Failed to update coupon usage count:", couponError);
      }
    }

    // 9. Log user notifications
    await addDoc(collection(db, "notifications"), {
      userId: bookingDetails.userId,
      title: "Booking Confirmed! ⚽",
      message: `Your booking for ${bookingDetails.turfName} on ${bookingDetails.date} at ${bookingDetails.slot} is confirmed! Receipt: ${razorpay_payment_id}`,
      read: false,
      createdAt: new Date(),
    });

    await addDoc(collection(db, "notifications"), {
      userId: bookingDetails.ownerId,
      title: "New Confirmed Booking! 🏟️",
      message: `${bookingDetails.playerName} booked ${bookingDetails.turfName} on ${bookingDetails.date} at ${bookingDetails.slot}.`,
      read: false,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      bookingId: deterministicBookingId,
      paymentId: razorpay_payment_id,
    });
  } catch (error: any) {
    console.error("Error verifying payment signature:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error during verification" },
      { status: 500 }
    );
  }
}
