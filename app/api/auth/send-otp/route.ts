import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { getAdminDb } from "@/lib/firebase-admin";
import { generateSecureOTP, hashData } from "@/lib/otp";
import { Resend } from "resend";
import { generateVerificationEmailHtml } from "@/lib/emailTemplates";

// Initialize Resend with env key
const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

const MAX_RESENDS_PER_HOUR = 20; // Increased for development testing
const OTP_EXPIRY_MINUTES = 5;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, uid } = body;

    if (!email || !uid) {
      return errorResponse("Email and UID are required", "INVALID_INPUT", 400);
    }

    // 1. Check Rate Limits (Max 3 resends per hour)
    const adminDb = getAdminDb();
    const logsRef = adminDb.collection("otp_logs").doc(email);
    const logDoc = await logsRef.get();
    
    let sendCount = 0;
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    if (logDoc.exists) {
      const data = logDoc.data()!;
      // Filter out logs older than 1 hour
      const recentSends = (data.timestamps || []).filter((t: number) => t > oneHourAgo);
      
      if (recentSends.length >= MAX_RESENDS_PER_HOUR) {
        return errorResponse("Too many resend requests. Please try again later.", "RATE_LIMIT_EXCEEDED", 429);
      }
      sendCount = recentSends.length;
      
      // Update logs
      await logsRef.set({ timestamps: [...recentSends, now] }, { merge: true });
    } else {
      await logsRef.set({ timestamps: [now] });
    }

    // 2. Generate and Hash OTP
    const otp = generateSecureOTP();
    const hashedOTP = await hashData(otp);
    
    // Calculate precise expiry (5 minutes)
    const expiresAt = new Date(now + OTP_EXPIRY_MINUTES * 60 * 1000);

    // 3. Store in Firestore (Overwrite any existing pending verification for this UID)
    const verificationRef = adminDb.collection("email_verifications").doc(uid);
    await verificationRef.set({
      uid,
      email,
      hashedOTP,
      expiresAt: expiresAt.toISOString(),
      attempts: 0,
      verified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 4. Send Email via Resend
    if (process.env.RESEND_API_KEY) {
      const { data, error } = await resend.emails.send({
        from: "PlaySphere Security <no-reply@playsphere.space>",
        to: email,
        subject: "Verify your PlaySphere account",
        html: generateVerificationEmailHtml(otp),
      });

      if (error) {
        console.error("Resend API Error:", error);
        return errorResponse("Failed to send OTP email via Resend", error.message, 500);
      }
    } else {
      // For local development testing without Resend Key
      console.log("====================================");
      console.log(`MOCK EMAIL SENT TO: ${email}`);
      console.log(`MOCK OTP IS: ${otp}`);
      console.log("====================================");
    }

    return successResponse("OTP sent successfully");
  } catch (error: any) {
    console.error("Send OTP Error:", error);
    return errorResponse("Failed to send OTP", error.message || "INTERNAL_ERROR", 500);
  }
}
