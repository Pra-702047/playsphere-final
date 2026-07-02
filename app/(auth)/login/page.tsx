
"use client";

import { useState } from "react";
import { loginUser, registerUser } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firestore";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDemoLogin = async (role: "player" | "owner" | "admin") => {
    let demoEmail = "";
    let demoName = "";
    const demoPassword = "password123";

    if (role === "player") {
      demoEmail = "demo.player@playsphere.com";
      demoName = "Demo Player";
    } else if (role === "owner") {
      demoEmail = "demo.owner@playsphere.com";
      demoName = "Demo Owner";
    } else {
      demoEmail = "demo.admin@playsphere.com";
      demoName = "Demo Admin";
    }

    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);

    try {
      // 1. Attempt login
      let result = await loginUser(demoEmail, demoPassword);

      // 2. If user doesn't exist, auto-register
      if (!result.success && result.message?.includes("Incorrect")) {
        console.log(`Demo account ${demoEmail} not found. Creating automatic fallback...`);
        const registerResult = await registerUser(demoName, demoEmail, demoPassword, role);
        if (registerResult.success) {
          result = await loginUser(demoEmail, demoPassword);
        } else {
          alert(registerResult.message || "Failed to create demo account");
          setLoading(false);
          return;
        }
      }

      if (result.success && result.user) {
        alert(`Logged in as Demo ${role.toUpperCase()}!`);
        if (role === "admin") {
          router.push("/admin");
        } else if (role === "owner") {
          router.push("/owner");
        } else {
          router.push("/dashboard");
        }
      } else {
        alert(result.message || "Login Failed");
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

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
        // Fetch role from Firestore
        const userDocSnap = await getDoc(doc(db, "users", result.user.uid));
        const userRole = userDocSnap.exists() ? (userDocSnap.data().role || "player") : "player";

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

        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500"
          />

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
            className="w-full bg-lime-500 hover:bg-lime-400 text-black font-bold py-4 rounded-xl transition cursor-pointer"
          >
            {loading
              ? "Logging In..."
              : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-lime-400 hover:text-lime-300"
          >
            Register
          </Link>
        </p>

        {/* Quick Demo Access */}
        <div className="mt-8 pt-6 border-t border-zinc-800/80">
          <p className="text-center text-xs text-zinc-500 font-semibold mb-4 uppercase tracking-wider">
            ⚡ Quick Demo Access
          </p>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleDemoLogin("player")}
              disabled={loading}
              className="bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-xs font-bold py-3 px-2 rounded-xl transition border border-zinc-800 hover:border-lime-500/50 cursor-pointer text-center"
            >
              🏃 Player
            </button>
            <button
              onClick={() => handleDemoLogin("owner")}
              disabled={loading}
              className="bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-xs font-bold py-3 px-2 rounded-xl transition border border-zinc-800 hover:border-lime-500/50 cursor-pointer text-center"
            >
              🏟️ Owner
            </button>
            <button
              onClick={() => handleDemoLogin("admin")}
              disabled={loading}
              className="bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-xs font-bold py-3 px-2 rounded-xl transition border border-zinc-800 hover:border-lime-500/50 cursor-pointer text-center"
            >
              👑 Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
