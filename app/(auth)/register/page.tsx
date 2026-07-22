"use client";

import { useState } from "react";
import { registerUser } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OTPVerificationForm from "@/components/auth/OTPVerificationForm";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  // "REGISTER" | "OTP"
  const [step, setStep] = useState<"REGISTER" | "OTP">("REGISTER");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("player");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uid, setUid] = useState("");

  const handleRegister = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Please fill all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // 1. Create Firebase Auth User (Client Side)
      const result = await registerUser(
        name,
        email,
        password,
        role
      );

      if (result.success && result.user?.uid) {
        setUid(result.user.uid);
        
        // 2. Trigger Backend OTP Email
        const otpRes = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, uid: result.user.uid }),
        });
        
        const otpData = await otpRes.json();
        
        if (otpData.success) {
          // Switch to OTP Verification Step
          setStep("OTP");
        } else {
          setError(otpData.error || "Failed to send verification email. Please try logging in to trigger it again.");
        }
      } else {
        setError(result.message || "Failed to create account");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-zinc-900 rounded-3xl p-8 shadow-2xl border border-zinc-800">
        
        {step === "REGISTER" ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white">
                Create Account
              </h1>
              <p className="text-gray-400 mt-2">
                Join PlaySphere and start booking turfs instantly ⚽
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-4 text-center font-medium">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Role Selection */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setRole("player")}
                  className={`flex-1 py-3 rounded-xl font-semibold border transition ${
                    role === "player"
                      ? "bg-lime-500 text-black border-lime-500"
                      : "bg-zinc-800 text-gray-400 border-zinc-700 hover:border-lime-500"
                  }`}
                >
                  ⚽ Player
                </button>
                <button
                  type="button"
                  onClick={() => setRole("owner")}
                  className={`flex-1 py-3 rounded-xl font-semibold border transition ${
                    role === "owner"
                      ? "bg-lime-500 text-black border-lime-500"
                      : "bg-zinc-800 text-gray-400 border-zinc-700 hover:border-lime-500"
                  }`}
                >
                  🏟️ Turf Owner
                </button>
              </div>

              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500"
                disabled={loading}
              />

              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500"
                disabled={loading}
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 pr-12"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 pr-12"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-lime-500 hover:bg-lime-400 disabled:opacity-50 text-black font-bold py-4 rounded-xl transition flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Register"
                )}
              </button>
            </form>

            <p className="text-center text-gray-400 mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-lime-400 hover:text-lime-300">
                Login
              </Link>
            </p>
          </>
        ) : (
          <OTPVerificationForm 
            email={email} 
            uid={uid} 
            onVerified={() => {
               if (role === "admin") router.push("/admin");
               else if (role === "owner") router.push("/owner");
               else router.push("/dashboard");
            }} 
          />
        )}

      </div>
    </div>
  );
}
