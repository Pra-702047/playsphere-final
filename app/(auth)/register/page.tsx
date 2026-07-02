
"use client";

import { useState } from "react";
import { registerUser } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("player");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const result = await registerUser(
        name,
        email,
        password,
        role
      );

      if (result.success) {
        alert("Account created successfully!");
        router.push("/login");
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

        <form
          onSubmit={handleRegister}
          className="space-y-4"
        >
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
            onChange={(e) =>
              setName(e.target.value)
            }
            className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500"
          />

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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lime-500 hover:bg-lime-400 text-black font-bold py-4 rounded-xl transition"
          >
            {loading
              ? "Creating Account..."
              : "Register"}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-lime-400 hover:text-lime-300"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
