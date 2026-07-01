"use client";

import React from "react";
import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    title: "Find Your Space",
    desc: "Search turfs near you by location, availability, or sports category (Football, Cricket, Badminton).",
  },
  {
    step: "02",
    title: "Book & Pay Securely",
    desc: "Pick a date and hourly slot, fill player details, and pay securely using Razorpay Checkout.",
  },
  {
    step: "03",
    title: "Play & Connect",
    desc: "Get instant confirmation, show up at the court, play with your squad, and rate the turf afterward.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-black relative border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-4">
          <h2 className="text-sm font-bold text-lime-400 uppercase tracking-widest font-mono">Simple Steps</h2>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">How It Works</h1>
          <p className="text-zinc-500 text-sm">Follow these 3 easy steps to book your favorite sports venue in under 2 minutes.</p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="relative space-y-4 text-center md:text-left"
            >
              {/* Number indicator */}
              <div className="text-6xl font-black text-lime-500/10 tracking-widest font-mono select-none">
                {s.step}
              </div>
              <h3 className="text-2xl font-bold text-white">{s.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-sm mx-auto md:mx-0">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
