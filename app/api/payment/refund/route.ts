import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { db } from "@/firebase/firestore";
import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { getPlatformConfig } from "@/services/config.service";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(req: Request) {
  try {
    const { bookingId, adminUid } = await req.json();

    if (!bookingId || !adminUid) {
      return NextResponse.json({ success: false, message: "Missing booking ID or admin ID" }, { status: 400 });
    }

    // 1. Authenticate Admin/Owner (Simplified check for this API)
    const adminDoc = await getDoc(doc(db, "users", adminUid));
    if (!adminDoc.exists() || (adminDoc.data().role !== "admin" && adminDoc.data().role !== "owner")) {
      return NextResponse.json({ success: false, message: "Unauthorized to process refunds" }, { status: 403 });
    }

    // 2. Fetch booking and check eligibility
    const bookingRef = doc(db, "bookings", bookingId);
    const bookingDoc = await getDoc(bookingRef);
    
    if (!bookingDoc.exists()) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    const bookingData = bookingDoc.data();
    if (bookingData.status === "refunded") {
      return NextResponse.json({ success: false, message: "Booking is already refunded" }, { status: 400 });
    }
    if (!bookingData.paymentId || bookingData.isOffline) {
      return NextResponse.json({ success: false, message: "Cannot refund offline or un-paid bookings via Razorpay" }, { status: 400 });
    }

    // Check refund window (e.g. 24 hours prior)
    const config = await getPlatformConfig();
    const bookingDate = new Date(`${bookingData.date}T${bookingData.slot.split(" - ")[0]}:00`);
    const hoursUntilBooking = (bookingDate.getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursUntilBooking < config.refundWindowHours && adminDoc.data().role !== "admin") {
      // Allow admins to override, but block owners
      return NextResponse.json({ 
        success: false, 
        message: `Refund window closed. Bookings must be cancelled at least ${config.refundWindowHours} hours in advance.` 
      }, { status: 400 });
    }

    // 3. Call Razorpay API
    const refundAmount = Math.round(bookingData.price * 100); // Amount in paise
    let razorpayRefund;
    try {
      razorpayRefund = await razorpay.payments.refund(bookingData.paymentId, {
        amount: refundAmount,
        speed: "optimum", // "normal" or "optimum"
        notes: { bookingId },
      });
    } catch (rzpError: any) {
      console.error("Razorpay API Error:", rzpError);
      return NextResponse.json({ success: false, message: rzpError.error?.description || "Gateway failed to process refund." }, { status: 500 });
    }

    // 4. Update Booking Status
    await updateDoc(bookingRef, { status: "refunded" });

    // 5. Reverse Settlement
    const settlementsQuery = query(collection(db, "settlements"), where("bookingId", "==", bookingId));
    const settlementsSnap = await getDocs(settlementsQuery);
    if (!settlementsSnap.empty) {
      const settlementRef = settlementsSnap.docs[0].ref;
      await updateDoc(settlementRef, {
        refundStatus: "full",
        ownerPayout: 0, // Prevent owner from getting paid for refunded booking
        status: "reversed"
      });
    }

    // 6. Write Audit Log
    await addDoc(collection(db, "audit_logs"), {
      action: "BOOKING_REFUNDED",
      bookingId,
      turfId: bookingData.turfId,
      ownerId: bookingData.ownerId,
      adminId: adminUid,
      amount: bookingData.price,
      razorpayRefundId: razorpayRefund.id,
      timestamp: new Date(),
      details: `Refund processed successfully via Razorpay. Refund ID: ${razorpayRefund.id}`,
    });

    // 7. Notify Customer
    await addDoc(collection(db, "notifications"), {
      userId: bookingData.userId,
      title: "Refund Initiated 💸",
      message: `Your booking at ${bookingData.turfName} for ${bookingData.date} was cancelled. A refund of ₹${bookingData.price} has been initiated and will reflect in your account within 5-7 days.`,
      read: false,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, refundId: razorpayRefund.id });
  } catch (error: any) {
    console.error("Server Error processing refund:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
