"use client";

import React, { useEffect, useState } from "react";
import { Users, MapPin, Map, Star } from "lucide-react";
import { getProjectStats } from "@/services/stats.service";

export default function Stats() {
  const [statsData, setStatsData] = useState({
    activePlayers: 2150,
    verifiedTurfs: 142,
    citiesListed: 5,
    averageRating: 4.8,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getProjectStats();
        setStatsData({
          activePlayers: data.activePlayers,
          verifiedTurfs: data.verifiedTurfs,
          citiesListed: data.citiesListed,
          averageRating: data.averageRating,
        });
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const displayStats = [
    {
      value: loading ? "..." : `${statsData.activePlayers.toLocaleString()}+`,
      label: "Active Players",
      icon: <Users className="w-5 h-5 text-zinc-500 mb-3 mx-auto" />,
    },
    {
      value: loading ? "..." : `${statsData.verifiedTurfs}+`,
      label: "Verified Turfs",
      icon: <Map className="w-5 h-5 text-zinc-500 mb-3 mx-auto" />,
    },
    {
      value: loading ? "..." : `${statsData.citiesListed}`,
      label: "Cities Active",
      icon: <MapPin className="w-5 h-5 text-zinc-500 mb-3 mx-auto" />,
    },
    {
      value: loading ? "..." : `${statsData.averageRating.toFixed(1)}/5`,
      label: "Average Rating",
      icon: <Star className="w-5 h-5 text-zinc-500 mb-3 mx-auto" />,
    },
  ];

  return (
    <section className="py-16 bg-black border-t border-zinc-900">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x-0 md:divide-x divide-zinc-900">
          {displayStats.map((stat, i) => (
            <div key={i} className="text-center">
              {stat.icon}
              <div className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {stat.value}
              </div>
              <div className="text-zinc-500 text-xs mt-2 uppercase tracking-wider font-semibold">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
