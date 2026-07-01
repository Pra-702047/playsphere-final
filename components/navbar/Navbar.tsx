"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/firebase/auth";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    setMobileOpen(false);
    router.push("/");
  };

  return (
    <nav className="sticky top-0 bg-black/60 backdrop-blur-xl border-b border-zinc-900 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4.5 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="PlaySphere"
            width={45}
            height={45}
            priority
          />

          <div>
            <h1 className="text-lg font-black text-white tracking-wide leading-tight">
              Play<span className="text-lime-400 font-extrabold">Sphere</span>
            </h1>

            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
              Find • Play • Connect
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-7">
          <Link href="/" className="text-sm font-bold text-zinc-400 hover:text-white transition">
            Home
          </Link>

          <Link href="/turfs" className="text-sm font-bold text-zinc-400 hover:text-white transition">
            Turfs
          </Link>

          <Link href="/connect" className="text-sm font-bold text-zinc-400 hover:text-white transition">
            Connect
          </Link>

          {loading ? (
            <span className="text-zinc-500 text-xs font-semibold">Loading...</span>
          ) : !user ? (
            <>
              <Link
                href="/login"
                className="text-sm font-extrabold text-zinc-350 hover:text-white border border-zinc-800 hover:border-zinc-700 px-4 py-2 rounded-xl transition"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="bg-lime-400 text-black px-5 py-2.5 rounded-xl text-sm font-black hover:bg-lime-300 transition shadow-[0_0_15px_rgba(163,230,53,0.15)]"
              >
                Register
              </Link>
            </>
          ) : role === "admin" ? (
            <>
              <Link href="/admin" className="text-sm font-bold text-zinc-450 hover:text-white transition">
                Dashboard
              </Link>
              <Link href="/admin/users" className="text-sm font-bold text-zinc-450 hover:text-white transition">
                Users
              </Link>
              <Link href="/admin/turfs" className="text-sm font-bold text-zinc-450 hover:text-white transition">
                Verifications
              </Link>
              <Link href="/admin/reports" className="text-sm font-bold text-zinc-450 hover:text-white transition">
                Reports
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl text-xs font-bold transition"
              >
                Logout
              </button>
            </>
          ) : role === "owner" ? (
            <>
              <Link href="/owner" className="text-sm font-bold text-zinc-450 hover:text-white transition">
                Dashboard
              </Link>
              <Link href="/owner/turfs" className="text-sm font-bold text-zinc-450 hover:text-white transition">
                My Turfs
              </Link>
              <Link href="/owner/bookings" className="text-sm font-bold text-zinc-450 hover:text-white transition">
                Bookings
              </Link>
              <Link href="/owner/slots" className="text-sm font-bold text-zinc-450 hover:text-white transition">
                Slots
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl text-xs font-bold transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="text-sm font-bold text-zinc-450 hover:text-white transition">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl text-xs font-bold transition"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-white hover:text-lime-400 p-2 text-2xl transition cursor-pointer"
        >
          ☰
        </button>
      </div>

      {/* Slide-in Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black z-40 cursor-pointer"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 right-0 bottom-0 w-64 bg-zinc-950 border-l border-zinc-900 z-50 p-6 flex flex-col gap-6 shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={() => setMobileOpen(false)}
                className="self-end text-zinc-500 hover:text-white text-xl font-bold cursor-pointer"
              >
                ✕
              </button>

              {/* Navigation links list */}
              <div className="flex flex-col gap-3 text-left">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-bold text-zinc-400 hover:text-white py-2 transition"
                >
                  Home
                </Link>
                <Link
                  href="/turfs"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-bold text-zinc-400 hover:text-white py-2 transition"
                >
                  Turfs
                </Link>
                <Link
                  href="/connect"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-bold text-zinc-400 hover:text-white py-2 transition"
                >
                  Connect
                </Link>

                <hr className="border-zinc-900 my-2" />

                {loading ? (
                  <span className="text-zinc-650 text-xs font-semibold">Loading...</span>
                ) : !user ? (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="text-sm font-bold text-zinc-400 hover:text-white py-2 transition"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileOpen(false)}
                      className="text-sm font-bold text-zinc-400 hover:text-white py-2 transition text-lime-400"
                    >
                      Register
                    </Link>
                  </>
                ) : role === "admin" ? (
                  <>
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="text-sm font-bold text-zinc-400 hover:text-white py-2"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/admin/users"
                      onClick={() => setMobileOpen(false)}
                      className="text-sm font-bold text-zinc-400 hover:text-white py-2"
                    >
                      Users
                    </Link>
                    <Link
                      href="/admin/turfs"
                      onClick={() => setMobileOpen(false)}
                      className="text-sm font-bold text-zinc-400 hover:text-white py-2"
                    >
                      Verifications
                    </Link>
                    <Link
                      href="/admin/reports"
                      onClick={() => setMobileOpen(false)}
                      className="text-sm font-bold text-zinc-400 hover:text-white py-2"
                    >
                      Reports
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="bg-red-500/10 text-red-400 border border-red-500/20 py-3 rounded-xl text-xs font-bold mt-4"
                    >
                      Logout
                    </button>
                  </>
                ) : role === "owner" ? (
                  <>
                    <Link
                      href="/owner"
                      onClick={() => setMobileOpen(false)}
                      className="text-sm font-bold text-zinc-400 hover:text-white py-2"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/owner/turfs"
                      onClick={() => setMobileOpen(false)}
                      className="text-sm font-bold text-zinc-400 hover:text-white py-2"
                    >
                      My Turfs
                    </Link>
                    <Link
                      href="/owner/bookings"
                      onClick={() => setMobileOpen(false)}
                      className="text-sm font-bold text-zinc-400 hover:text-white py-2"
                    >
                      Bookings
                    </Link>
                    <Link
                      href="/owner/slots"
                      onClick={() => setMobileOpen(false)}
                      className="text-sm font-bold text-zinc-400 hover:text-white py-2"
                    >
                      Slots
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="bg-red-500/10 text-red-400 border border-red-500/20 py-3 rounded-xl text-xs font-bold mt-4"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="text-sm font-bold text-zinc-400 hover:text-white py-2"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="bg-red-500/10 text-red-400 border border-red-500/20 py-3 rounded-xl text-xs font-bold mt-4"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}