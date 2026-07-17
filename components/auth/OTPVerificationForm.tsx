"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/auth";

interface OTPVerificationFormProps {
  email: string;
  uid: string;
  onVerified?: () => void; // Optional callback
}

export default function OTPVerificationForm({ email, uid, onVerified }: OTPVerificationFormProps) {
  const router = useRouter();
  
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [activeOTPIndex, setActiveOTPIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  // Resend Timer State
  const [resendCountdown, setResendCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeOTPIndex]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0 && !canResend) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    } else if (resendCountdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown, canResend]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { value } = e.target;
    if (!/^[0-9]*$/.test(value)) return;

    const newOTP: string[] = [...otp];
    newOTP[index] = value.substring(value.length - 1);
    setOtp(newOTP);

    if (!value) {
      setActiveOTPIndex(index - 1 >= 0 ? index - 1 : 0);
    } else {
      setActiveOTPIndex(index + 1 < 6 ? index + 1 : 5);
      // Auto-submit if it's the last digit
      if (index === 5) {
        verifyOTP(newOTP.join(""));
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index]) {
      setActiveOTPIndex(index - 1 >= 0 ? index - 1 : 0);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().slice(0, 6);
    if (!/^[0-9]{1,6}$/.test(pastedData)) return;

    const newOTP = [...otp];
    pastedData.split("").forEach((char, i) => {
      newOTP[i] = char;
    });
    setOtp(newOTP);
    
    if (pastedData.length === 6) {
      setActiveOTPIndex(5);
      verifyOTP(pastedData);
    } else {
      setActiveOTPIndex(pastedData.length);
    }
  };

  const verifyOTP = async (otpString: string) => {
    if (otpString.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, uid, otp: otpString }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Refresh the local Firebase token so the frontend knows the email is now verified
        if (auth.currentUser) {
          await auth.currentUser.reload();
        }

        setTimeout(() => {
          if (onVerified) {
            onVerified();
          } else {
            // Use window.location to force a full reload so AuthContext picks up the new token
            window.location.href = "/dashboard";
          }
        }, 1500);
      } else {
        setError(data.error || data.message || "Invalid OTP");
        setOtp(new Array(6).fill(""));
        setActiveOTPIndex(0);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setCanResend(false);
    setResendCountdown(60);
    setError("");

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, uid }),
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.error || "Failed to resend OTP");
        setCanResend(true);
        setResendCountdown(0);
      }
    } catch (err) {
      setError("Network error.");
      setCanResend(true);
      setResendCountdown(0);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-8 text-center space-y-4"
      >
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
        >
          <CheckCircle2 className="w-20 h-20 text-lime-500" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white">Email Verified!</h2>
        <p className="text-gray-400">Redirecting to your dashboard...</p>
      </motion.div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Verify Email</h2>
        <p className="text-gray-400 text-sm">
          We've sent a 6-digit code to <br/>
          <span className="text-lime-400 font-semibold">{email}</span>
        </p>
      </div>

      <motion.div 
        animate={error ? { x: [-10, 10, -10, 10, 0] } : {}} 
        transition={{ duration: 0.4 }}
        className="flex justify-center gap-2 sm:gap-3 mb-6"
      >
        {otp.map((_, index) => (
          <input
            key={index}
            ref={index === activeOTPIndex ? inputRef : null}
            type="text"
            className="w-12 h-14 sm:w-14 sm:h-16 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-center text-2xl font-bold outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 transition-all"
            value={otp[index]}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            disabled={loading}
          />
        ))}
      </motion.div>

      {error && (
        <p className="text-red-400 text-sm font-medium mb-4">{error}</p>
      )}

      <button
        onClick={() => verifyOTP(otp.join(""))}
        disabled={loading || otp.join("").length !== 6}
        className="w-full bg-lime-500 hover:bg-lime-400 disabled:opacity-50 disabled:hover:bg-lime-500 text-black font-bold py-4 rounded-xl transition flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Code"}
      </button>

      <div className="mt-8 text-center text-sm text-gray-400">
        <p>Didn't receive the code?</p>
        <button
          onClick={handleResend}
          disabled={!canResend}
          className="mt-2 flex items-center justify-center gap-2 w-full mx-auto text-lime-400 hover:text-lime-300 disabled:opacity-50 transition"
        >
          <RefreshCw className={`w-4 h-4 ${!canResend && resendCountdown > 0 ? "animate-spin-slow" : ""}`} />
          {canResend ? "Resend OTP" : `Resend in ${resendCountdown}s`}
        </button>
      </div>
    </div>
  );
}
