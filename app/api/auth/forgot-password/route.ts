import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { getAdminAuth } from "@/lib/firebase-admin";
import { Resend } from "resend";
import { generatePasswordResetEmailHtml } from "@/lib/emailTemplates";

const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return errorResponse("Email is required", "INVALID_INPUT", 400);
    }

    try {
      // Generate the reset link using Firebase Admin
      const adminAuth = getAdminAuth();
      const link = await adminAuth.generatePasswordResetLink(email);

      // Send the branded email via Resend
      if (process.env.RESEND_API_KEY) {
        const { data, error } = await resend.emails.send({
          from: "PlaySphere Security <no-reply@playsphere.space>",
          to: email,
          subject: "Reset your PlaySphere password",
          html: generatePasswordResetEmailHtml(link),
        });

        if (error) {
          console.error("Resend API Error (Forgot Password):", error);
          return errorResponse("Failed to send reset email via Resend", error.message, 500);
        }
      } else {
        console.log("====================================");
        console.log(`MOCK PASSWORD RESET EMAIL TO: ${email}`);
        console.log(`LINK IS: ${link}`);
        console.log("====================================");
      }

      return successResponse("Password reset email sent successfully!");
    } catch (firebaseErr: any) {
      if (firebaseErr.code === "auth/user-not-found") {
        // Prevent enumeration attacks by returning success even if user not found
        // The user won't actually get an email, but an attacker won't know that.
        return successResponse("If that email is registered, a reset link has been sent.");
      }
      throw firebaseErr;
    }

  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    return errorResponse("Failed to process request", error.message || "INTERNAL_ERROR", 500);
  }
}
