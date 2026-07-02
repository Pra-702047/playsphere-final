import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/firebase/firestore";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";

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

    // Cryptographical signature check using HMAC SHA256
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

    // --- SIGNATURE VERIFICATION SUCCESSFUL ---
    // Create the booking document in Firestore
    const bookingPayload = {
      userId: bookingDetails.userId,
      userEmail: bookingDetails.userEmail,
      turfId: bookingDetails.turfId,
      turfName: bookingDetails.turfName,
      ownerId: bookingDetails.ownerId,
      price: bookingDetails.price,
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

    const bookingRef = await addDoc(collection(db, "bookings"), bookingPayload);

    // Save payment log record
    await addDoc(collection(db, "payments"), {
      bookingId: bookingRef.id,
      userId: bookingDetails.userId,
      playerName: bookingDetails.playerName,
      amount: bookingDetails.price,
      paymentId: razorpay_payment_id,
      status: "success",
      createdAt: new Date(),
    });

    // Update coupon usage count if applicable
    if (bookingDetails.appliedCouponId) {
      try {
        const couponRef = doc(db, "coupons", bookingDetails.appliedCouponId);
        // We increment the count (since this is server side, we can update directly)
        await updateDoc(couponRef, {
          usageCount: bookingDetails.appliedCouponUsageCount + 1,
        });
      } catch (couponError) {
        console.error("Failed to update coupon usage count:", couponError);
      }
    }

    // Log user notifications
    await addDoc(collection(db, "notifications"), {
      userId: bookingDetails.userId,
      title: "Booking Confirmed! ⚽",
      message: `Your booking for ${bookingDetails.turfName} on ${bookingDetails.date} at ${bookingDetails.slot} is confirmed! Payment Receipt ID: ${razorpay_payment_id}`,
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
      bookingId: bookingRef.id,
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
