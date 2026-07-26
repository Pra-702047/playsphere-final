import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { turfId, date, slot, ownerId, ...otherData } = body;

    if (!turfId || !date || !slot || !ownerId) {
      return NextResponse.json({ success: false, message: "Missing required fields." }, { status: 400 });
    }

    const deterministicBookingId = `${turfId}_${date}_${slot}`.replace(/[^a-zA-Z0-9_-]/g, "");
    
    const bookingRef = adminDb.collection("bookings").doc(deterministicBookingId);
    
    try {
      // Use create() to ensure we don't overwrite an existing booking. It fails if the document already exists.
      await bookingRef.create({
        ...body,
        turfId,
        date,
        slot,
        ownerId,
        bookingType: "offline",
        isOffline: true,
        status: "confirmed",
        createdAt: new Date(),
      });
    } catch (e: any) {
      if (e.code === 6 || e.message.includes("ALREADY_EXISTS")) {
        return NextResponse.json({ success: false, message: "This slot is already booked. Please select another slot." }, { status: 409 });
      }
      throw e;
    }

    // Safely write to audit_logs since we are on the server
    await adminDb.collection("audit_logs").add({
      action: "OFFLINE_BOOKING_CREATED",
      turfId: turfId,
      ownerId: ownerId,
      details: `Owner blocked slot ${date} at ${slot} for offline booking.`,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, id: deterministicBookingId });
  } catch (error: any) {
    console.error("Offline booking error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
