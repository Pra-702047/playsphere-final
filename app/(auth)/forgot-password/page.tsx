"use client";

import { useState } from "react";
import { resetPassword } from "@/services/auth.service";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      alert("Please enter your email address");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccess(false);

    try {
      const res = await resetPassword(email);
      if (res.success) {
        setSuccess(true);
      } else {
        setErrorMsg(res.message || "Failed to send reset email.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-zinc-900 rounded-3xl p-8 shadow-2xl border border-zinc-800">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            Reset Password 🔑
          </h1>
          <p className="text-gray-400 mt-2">
            Enter your email to receive a password reset link
          </p>
        </div>

        {success ? (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-lime-500/10 border border-lime-500/20 text-lime-400 rounded-xl text-sm font-semibold">
              ✓ Password reset email sent! Check your inbox.
            </div>
            <Link href="/login">
              <button className="w-full mt-4 bg-lime-500 hover:bg-lime-400 text-black font-bold py-4 rounded-xl transition cursor-pointer">
                Back to Login
              </button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold">
                ⚠️ {errorMsg}
              </div>
            )}
            
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 text-sm"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-lime-500 hover:bg-lime-400 text-black font-bold py-4 rounded-xl transition cursor-pointer text-sm"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="text-center text-xs mt-4">
              <Link href="/login" className="text-lime-400 hover:text-lime-300 transition hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
