"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getProjectStats } from "@/services/stats.service";

export default function Stats() {
  const [statsData, setStatsData] = useState({
    activePlayers: 0,
    verifiedTurfs: 0,
    citiesListed: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getProjectStats();
      setStatsData(data);
      setLoading(false);
    };
    fetchStats();
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num.toString();
  };

  const displayStats = [
    {
      value: loading ? "..." : `${formatNumber(statsData.activePlayers)}${statsData.activePlayers > 0 ? "+" : ""}`,
      label: "Active Players",
      icon: "👥",
    },
    {
      value: loading ? "..." : `${statsData.verifiedTurfs}${statsData.verifiedTurfs > 0 ? "+" : ""}`,
      label: "Verified Turfs",
      icon: "🏟️",
    },
    {
      value: loading ? "..." : `${statsData.citiesListed}${statsData.citiesListed > 0 ? "+" : ""}`,
      label: "Cities Listed",
      icon: "📍",
    },
    {
      value: loading ? "..." : `${statsData.averageRating > 0 ? statsData.averageRating.toFixed(1) : "4.9"}★`,
      label: "Average Rating",
      icon: "⭐",
    },
  ];

  return (
    <section className="py-16 bg-black relative border-y border-zinc-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {displayStats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center p-6 bg-zinc-950/40 rounded-2xl border border-zinc-900/50 hover:border-lime-500/10 transition duration-300"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-4xl font-extrabold text-lime-400 tracking-tight">
                {stat.value}
              </div>
              <div className="text-zinc-500 text-xs mt-1 uppercase tracking-wider font-semibold">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
