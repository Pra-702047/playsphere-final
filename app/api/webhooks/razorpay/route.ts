import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/firebase/firestore";
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, query, where, getDocs } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ success: false, message: "Missing signature" }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("Webhook secret missing from environment variables.");
      return NextResponse.json({ success: false }, { status: 500 });
    }

    // 1. Verify Signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.warn("Invalid webhook signature detected.");
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
    }

    // Parse the validated payload
    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const eventId = payload.headers ? payload.headers["x-razorpay-event-id"] : payload.payload.payment?.entity?.id || Date.now().toString();

    // 2. Idempotency Check (Prevent duplicate webhook processing)
    // We use setDoc without overwrite if possible. Since Admin SDK has no "create only", we use getDoc lock.
    const eventDocRef = doc(db, "webhook_events", eventId);
    const existingEvent = await getDoc(eventDocRef);
    if (existingEvent.exists()) {
      console.log(`Webhook event ${eventId} already processed.`);
      return NextResponse.json({ success: true, message: "Event already processed" });
    }
    
    // Lock the event
    await setDoc(eventDocRef, {
      event,
      processedAt: new Date(),
    });

    // 3. Handle Events
    switch (event) {
      case "payment.captured":
        // Usually handled by frontend verify route, but good for redundancy.
        const paymentEntity = payload.payload.payment.entity;
        // Check if payment log exists
        const pQuery = query(collection(db, "payments"), where("paymentId", "==", paymentEntity.id));
        const pSnap = await getDocs(pQuery);
        if (pSnap.empty) {
            // Edge case: Webhook fired before frontend verification.
            console.log("Payment captured via webhook, but missing from frontend DB logic. Logging for admin review.");
            await addDoc(collection(db, "audit_logs"), {
              action: "WEBHOOK_PAYMENT_CAPTURED_ORPHANED",
              paymentId: paymentEntity.id,
              amount: paymentEntity.amount / 100,
              timestamp: new Date(),
              details: "Payment captured on Razorpay but missing frontend DB confirmation.",
            });
        }
        break;

      case "payment.failed":
        const failedPaymentEntity = payload.payload.payment.entity;
        await addDoc(collection(db, "audit_logs"), {
          action: "WEBHOOK_PAYMENT_FAILED",
          paymentId: failedPaymentEntity.id,
          amount: failedPaymentEntity.amount / 100,
          timestamp: new Date(),
          details: failedPaymentEntity.error_description || "Payment failed",
        });
        break;

      case "refund.processed":
        const refundEntity = payload.payload.refund.entity;
        const paymentId = refundEntity.payment_id;
        
        // Ensure status reflects refunded if API call missed it
        const bQuery = query(collection(db, "bookings"), where("paymentId", "==", paymentId));
        const bSnap = await getDocs(bQuery);
        if (!bSnap.empty) {
          const bookingDoc = bSnap.docs[0];
          if (bookingDoc.data().status !== "refunded") {
             await updateDoc(bookingDoc.ref, { status: "refunded" });
             
             // Reverse settlement
             const sQuery = query(collection(db, "settlements"), where("bookingId", "==", bookingDoc.id));
             const sSnap = await getDocs(sQuery);
             if (!sSnap.empty) {
               await updateDoc(sSnap.docs[0].ref, {
                 refundStatus: "full",
                 ownerPayout: 0,
                 status: "reversed"
               });
             }
          }
        }
        
        // Notify customer asynchronously
        if (!bSnap.empty) {
            const bData = bSnap.docs[0].data();
            await addDoc(collection(db, "notifications"), {
                userId: bData.userId,
                title: "Refund Completed! 💸",
                message: `Razorpay has successfully processed your refund of ₹${refundEntity.amount / 100} for ${bData.turfName}. It should hit your bank within 5-7 days.`,
                read: false,
                createdAt: new Date(),
            });
        }
        break;

      default:
        console.log(`Unhandled event type: ${event}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
