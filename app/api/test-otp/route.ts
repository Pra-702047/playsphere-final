import { NextResponse } from "next/server";
import { createBooking, getBookingByOTP, verifyBookingOTP } from "@/services/booking.service";
import { db } from "@/firebase/firestore";
import { doc, deleteDoc, getDoc } from "firebase/firestore";

export async function GET() {
  const log: string[] = [];
  const addLog = (msg: string) => {
    console.log(msg);
    log.push(msg);
  };

  addLog("=============================================");
  addLog("  STARTING PROGRAMMATIC OTP SERVICES TEST");
  addLog("=============================================");

  const testOwnerId = "test-owner-id-12345";
  const testTurfId = "test-turf-id-54321";
  const testSlot = `${Math.floor(10 + Math.random() * 10)}:00 - ${Math.floor(20 + Math.random() * 4)}:00`;
  const testOtp = Math.floor(1000 + Math.random() * 9000).toString();

  const mockBookingData = {
    userId: "test-player-id-9876",
    userEmail: "tester@playsphere.com",
    turfId: testTurfId,
    turfName: "Automation Test Turf",
    ownerId: testOwnerId,
    price: 1500,
    playerName: "Test Runner Player",
    mobile: "9999999999",
    players: 10,
    sport: "Cricket",
    notes: "Automated test booking",
    date: "2026-07-05",
    slot: testSlot,
    status: "confirmed",
    paymentId: "pay_test_payment_123",
    createdAt: new Date(),
    otp: testOtp,
    otpVerified: false,
  };

  let createdBookingId = "";

  try {
    addLog(`[1] Creating a test booking with OTP: ${testOtp} and Slot: "${testSlot}"...`);
    const createResult = await createBooking(mockBookingData);

    if (!createResult.success) {
      throw new Error(`createBooking failed: ${createResult.message}`);
    }

    createdBookingId = createResult.id as string;
    addLog(`   ✅ Booking created successfully! Document ID: ${createdBookingId}`);

    addLog(`[2] Searching for booking by Owner ID: "${testOwnerId}" and OTP: "${testOtp}"...`);
    const foundBooking = await getBookingByOTP(testOwnerId, testOtp);

    if (!foundBooking) {
      throw new Error("getBookingByOTP failed: No booking found!");
    }

    addLog(`   ✅ Booking found: ID=${foundBooking.id}, Player=${foundBooking.playerName}, status=${foundBooking.status}`);

    if (foundBooking.id !== createdBookingId) {
      throw new Error("Mismatch: Found booking ID does not match created booking ID!");
    }

    addLog(`[3] Verifying OTP check-in status...`);
    const verifyResult = await verifyBookingOTP(createdBookingId);

    if (!verifyResult.success) {
      throw new Error(`verifyBookingOTP failed: ${verifyResult.message}`);
    }
    addLog(`   ✅ OTP verification request succeeded!`);

    addLog(`[4] Querying updated document to confirm status change...`);
    const updatedDocSnap = await getDoc(doc(db, "bookings", createdBookingId));
    if (!updatedDocSnap.exists()) {
      throw new Error("Failed to retrieve updated document!");
    }

    const updatedData = updatedDocSnap.data();
    addLog(`   ✅ Updated Status: "${updatedData.status}" (Expected: "checked_in")`);
    addLog(`   ✅ Updated otpVerified: ${updatedData.otpVerified} (Expected: true)`);

    if (updatedData.status !== "checked_in" || updatedData.otpVerified !== true) {
      throw new Error("Fields were not updated correctly in database.");
    }

    addLog("=============================================");
    addLog(" 🎉 ALL TESTS PASSED SUCCESSFULLY!");
    addLog("=============================================");

    // Clean up
    addLog(`[Cleanup] Deleting test booking document: ${createdBookingId}...`);
    await deleteDoc(doc(db, "bookings", createdBookingId));
    addLog("   ✅ Cleanup complete!");

    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    addLog(`❌ TEST FAILED: ${error.message}`);
    if (createdBookingId) {
      try {
        addLog(`[Cleanup-Error] Deleting test booking document: ${createdBookingId}...`);
        await deleteDoc(doc(db, "bookings", createdBookingId));
        addLog("   ✅ Error Cleanup complete!");
      } catch (err: any) {
        addLog(`   ❌ Error during cleanup: ${err.message}`);
      }
    }
    return NextResponse.json({ success: false, error: error.message, log }, { status: 500 });
  }
}
