"use client";

import { useState } from "react";
import { loginUser } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firestore";
import OTPVerificationForm from "@/components/auth/OTPVerificationForm";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/auth";

export default function LoginPage() {
  const router = useRouter();

  // "LOGIN" | "OTP"
  const [step, setStep] = useState<"LOGIN" | "OTP">("LOGIN");
  const [uid, setUid] = useState("");
  const [role, setRole] = useState("player");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const result = await loginUser(email, password);

      if (result.success && result.user) {
        // Fetch user data from Firestore to check if they are emailVerified
        const userDocSnap = await getDoc(doc(db, "users", result.user.uid));
        
        let isVerified = false;
        let userRole = "player";
        
        // Also check if the Firebase Auth object claims it's verified (fallback)
        if (result.user.emailVerified) isVerified = true;

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          userRole = data.role || "player";
          if (data.isEmailVerified) isVerified = true;
        }

        setRole(userRole);

        // --- INTERCEPT UNVERIFIED USERS ---
        if (!isVerified) {
          // Immediately sign them out locally so they don't have an active session
          await signOut(auth);
          
          setUid(result.user.uid);
          
          // Trigger OTP Send API
          const otpRes = await fetch("/api/auth/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, uid: result.user.uid }),
          });
          
          const otpData = await otpRes.json();
          if (otpData.success) {
            setStep("OTP");
            return; // Stop the login process
          } else {
            setError(otpData.error || "Failed to send verification code. Please try again.");
            return;
          }
        }

        // --- SUCCESS & VERIFIED ---
        if (userRole === "admin") {
          router.push("/admin");
        } else if (userRole === "owner") {
          router.push("/owner");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(result.message || "Login Failed");
      }
    } catch (err) {
      console.error(err);
      setError("Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-zinc-900 rounded-3xl p-8 shadow-2xl border border-zinc-800">
        
        {step === "LOGIN" ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white">
                Welcome Back 👋
              </h1>
              <p className="text-gray-400 mt-2">
                Login to book your favourite turf
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-4 text-center font-medium">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 transition"
                disabled={loading}
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 transition pr-12"
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

              <div className="flex justify-end text-xs">
                <Link
                  href="/forgot-password"
                  className="text-lime-400 hover:text-lime-300 transition hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-lime-500 hover:bg-lime-400 disabled:opacity-50 text-black font-bold py-4 rounded-xl transition cursor-pointer flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Logging In...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <p className="text-center text-gray-400 mt-6">
              Don't have an account?{" "}
              <Link href="/register" className="text-lime-400 hover:text-lime-300 transition">
                Register
              </Link>
            </p>
          </>
        ) : (
          <OTPVerificationForm 
            email={email} 
            uid={uid} 
            onVerified={() => {
              // The user just verified their OTP successfully, now we can log them in properly
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
