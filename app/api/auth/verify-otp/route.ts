import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import { verifyHash } from "@/lib/otp";

const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, email, otp } = body;

    if (!uid || !email || !otp) {
      return errorResponse("Missing required fields", "INVALID_INPUT", 400);
    }

    // 1. Fetch Verification Document
    const adminDb = getAdminDb();
    const verificationRef = adminDb.collection("email_verifications").doc(uid);
    const docSnap = await verificationRef.get();

    if (!docSnap.exists) {
      return errorResponse("No pending verification found. Please resend OTP.", "NOT_FOUND", 404);
    }

    const data = docSnap.data()!;

    // 2. Check if already verified
    if (data.verified) {
      return errorResponse("Email is already verified", "ALREADY_VERIFIED", 400);
    }

    // 3. Check Expiry
    const now = new Date();
    const expiresAt = new Date(data.expiresAt);
    if (now > expiresAt) {
      // OTP Expired -> Delete doc
      await verificationRef.delete();
      return errorResponse("OTP has expired. Please request a new one.", "EXPIRED", 400);
    }

    // 4. Check Attempts Limit
    if (data.attempts >= MAX_ATTEMPTS) {
      await verificationRef.delete();
      return errorResponse("Too many failed attempts. Please request a new OTP.", "MAX_ATTEMPTS", 429);
    }

    // 5. Verify the Hash
    const isValid = await verifyHash(otp, data.hashedOTP);

    if (!isValid) {
      // Increment attempts
      const newAttempts = data.attempts + 1;
      await verificationRef.update({ attempts: newAttempts, updatedAt: new Date().toISOString() });
      
      if (newAttempts >= MAX_ATTEMPTS) {
        await verificationRef.delete();
        return errorResponse("Maximum attempts reached. OTP invalidated.", "MAX_ATTEMPTS", 429);
      }
      
      return errorResponse(`Invalid OTP. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`, "INVALID_OTP", 400);
    }

    // 6. SUCCESS! OTP IS VALID
    // 4. Update Firebase Auth User (Set emailVerified = true)
    const adminAuth = getAdminAuth();
    await adminAuth.updateUser(uid, {
      emailVerified: true,
    });

    // Update Firestore users collection (create or merge isEmailVerified flag)
    const userRef = adminDb.collection("users").doc(uid);
    await userRef.set({
      isEmailVerified: true,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // Mark verification doc as verified (or delete it to save space)
    // We will delete it to clean up as requested by architecture best practices.
    await verificationRef.delete();

    return successResponse("Email verified successfully!");
  } catch (error: any) {
    console.error("Verify OTP Error:", error);
    return errorResponse("Verification failed", error.message || "INTERNAL_ERROR", 500);
  }
}
