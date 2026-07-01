"use client";

import React from "react";
import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "PlaySphere made booking turf slots so much easier. The Razorpay checkout was seamless and the slot list update was instantaneous. Outstanding UX!",
    author: "Rohan Sharma",
    role: "Regular Player",
    avatar: "⚽",
  },
  {
    quote: "As an owner, managing slot blocks, custom pricing, and holiday calendars was a nightmare. PlaySphere's owner panel resolved all of that. Highly recommended!",
    author: "Amit Patel",
    role: "Turf Manager",
    avatar: "🏟️",
  },
  {
    quote: "Excellent platform. We easily exported platform financial reports to CSV. Turf verifications let us ensure high-quality standards for players.",
    author: "Nisha Rao",
    role: "Platform Admin",
    avatar: "⚙️",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-zinc-950/40 relative border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-4">
          <h2 className="text-sm font-bold text-lime-400 uppercase tracking-widest">Feedback</h2>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">What Users Say</h1>
          <p className="text-zinc-500 text-sm">Read stories from players, field owners, and platform administrators.</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl flex flex-col justify-between hover:border-lime-500/10 transition duration-300 shadow-md"
            >
              <p className="text-zinc-300 text-sm italic leading-relaxed">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-zinc-800/80">
                <div className="text-2xl bg-zinc-850 p-2 rounded-lg">{t.avatar}</div>
                <div>
                  <h4 className="text-sm font-bold text-white">{t.author}</h4>
                  <p className="text-zinc-500 text-xs mt-0.5">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
