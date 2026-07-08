import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { db } from "@/firebase/firestore";
import { doc, getDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { turfId, date, couponId } = await req.json();

    if (!turfId) {
      return NextResponse.json(
        { success: false, message: "Valid turfId parameter is required" },
        { status: 400 }
      );
    }

    const turfDoc = await getDoc(doc(db, "turfs", turfId));
    if (!turfDoc.exists()) {
       return NextResponse.json({ success: false, message: "Turf not found" }, { status: 404 });
    }
    const turfData = turfDoc.data();
    
    const specialPrice = date ? turfData.specialRates?.[date] : undefined;
    const currentHourlyPrice = specialPrice !== undefined ? specialPrice : turfData.price;
    
    let discountAmount = 0;
    if (couponId) {
       const couponDoc = await getDoc(doc(db, "coupons", couponId));
       if (couponDoc.exists()) {
          const couponData = couponDoc.data();
          if (couponData.discountType === "percentage") {
             discountAmount = Math.round((currentHourlyPrice * couponData.discountValue) / 100);
          } else {
             discountAmount = couponData.discountValue;
          }
       }
    }
    
    const amount = Math.max(0, currentHourlyPrice - discountAmount);

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.warn("Razorpay API Key details are missing in server environment variables.");
      return NextResponse.json(
        { success: false, message: "Razorpay credentials are not configured on the server." },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const orderOptions = {
      amount: Math.round(amount * 100), // in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(orderOptions);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error("Error creating Razorpay Order:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create payment order" },
      { status: 500 }
    );
  }
}
