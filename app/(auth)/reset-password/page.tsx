"use client";

import React, { useState, Suspense } from "react";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "@/firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oobCode) {
      showToast("Invalid or expired password reset link.", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("Password must be at least 6 characters long", "warning");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "warning");
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      showToast("Password reset successful! Please login with your new password.", "success");
      router.push("/login");
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Failed to reset password. Link may be expired.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleConfirmReset} className="space-y-6">
      <div>
        <label className="block text-gray-400 text-xs font-semibold mb-2">New Password</label>
        <input
          type="password"
          required
          placeholder="At least 6 characters"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 text-sm"
        />
      </div>

      <div>
        <label className="block text-gray-400 text-xs font-semibold mb-2">Confirm New Password</label>
        <input
          type="password"
          required
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 text-sm"
        />
      </div>

      <Button type="submit" loading={loading} className="w-full py-4">
        Reset Password
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 font-sans">
      <div className="w-full max-w-md bg-zinc-900 rounded-3xl p-8 shadow-2xl border border-zinc-800">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white">Create New Password</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Enter your new secure password below to regain account access.
          </p>
        </div>

        <Suspense fallback={
          <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-lime-500"></div>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>

        <p className="text-center text-gray-400 mt-6 text-sm">
          Go back to{" "}
          <Link href="/login" className="text-lime-400 hover:text-lime-300 font-semibold transition">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
