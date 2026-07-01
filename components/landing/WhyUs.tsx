"use client";

import React from "react";
import { motion } from "framer-motion";

const features = [
  {
    title: "Instant Confirmation",
    desc: "No more phone tag. Find a slot, book it, and receive instant confirmation within seconds.",
    icon: "⚡",
  },
  {
    title: "100% Verified Venues",
    desc: "Every listed space is verified by our admins to ensure top-notch conditions and facilities.",
    icon: "🛡️",
  },
  {
    title: "Secure Checkout",
    desc: "Seamless payments powered by Razorpay checkout with dynamic receipt generation.",
    icon: "💳",
  },
  {
    title: "Dynamic Pricing",
    desc: "Access special rates, seasonal pricing, and exclusive discounts from turf owners.",
    icon: "💰",
  },
];

export default function WhyUs() {
  return (
    <section className="py-24 bg-zinc-950/40 relative border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-4">
          <h2 className="text-sm font-bold text-lime-400 uppercase tracking-widest">Why PlaySphere</h2>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Designed for Players & Owners
          </h1>
          <p className="text-zinc-500 text-sm">
            We bridge the gap between sports enthusiasts and turf owners with a seamless booking interface.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between hover:border-lime-500/20 transition duration-300 shadow-lg"
            >
              <div>
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
