"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Background neon glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-lime-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 text-center z-10 relative space-y-8">
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold text-white tracking-tight"
        >
          Ready to Book Your Next Game?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-zinc-400 text-sm md:text-base max-w-lg mx-auto leading-relaxed"
        >
          Join thousands of players listed on PlaySphere. Find a court, book a slot, and start playing instantly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row justify-center gap-4 pt-4"
        >
          <Link
            href="/turfs"
            className="bg-lime-500 hover:bg-lime-400 text-black font-extrabold px-8 py-4 rounded-xl transition duration-300 shadow-lg shadow-lime-500/10 text-sm"
          >
            🏟️ Browse Available Turfs
          </Link>
          <Link
            href="/register"
            className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-semibold px-8 py-4 rounded-xl transition duration-300 text-sm"
          >
            👤 Create Free Account
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
