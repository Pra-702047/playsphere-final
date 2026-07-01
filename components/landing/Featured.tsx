"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getAllTurfs, TurfData } from "@/services/turf.service";
import TurfCard from "@/components/turfs/TurfCard";
import Link from "next/link";

export default function Featured() {
  const [featuredTurfs, setFeaturedTurfs] = useState<TurfData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const all = await getAllTurfs();
        // Get verified turfs (max 3 for landing page)
        const verified = all.filter((t) => t.isVerified).slice(0, 3);
        setFeaturedTurfs(verified);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  if (loading || featuredTurfs.length === 0) return null;

  return (
    <section className="py-24 bg-black relative">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-sm font-bold text-lime-400 uppercase tracking-widest">Premium Selection</h2>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mt-2 tracking-tight">
              Featured Venues 🏟️
            </h1>
          </div>
          <Link
            href="/turfs"
            className="text-lime-400 hover:text-lime-300 font-bold transition text-sm flex items-center gap-1 group"
          >
            Explore All Turfs
            <span className="transition duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {/* Turf Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredTurfs.map((turf, i) => (
            <motion.div
              key={turf.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <TurfCard
                id={turf.id!}
                name={turf.name}
                location={turf.location}
                price={turf.price}
                imageUrl={turf.imageUrl}
                isVerified={turf.isVerified}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
