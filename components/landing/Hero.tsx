"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import SportsCanvas from "./SportsCanvas";
import { getAllLocations, LocationData } from "@/services/location.service";

export default function Hero() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [locationsList, setLocationsList] = useState<LocationData[]>([]);
  const [sport, setSport] = useState("all");
  const [date, setDate] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Fetch available locations
    const fetchLocations = async () => {
      const data = await getAllLocations();
      setLocationsList(data);
      if (data.length > 0) {
        setLocation(data[0].name);
      } else {
        setLocation("Nanded, Maharashtra"); // fallback
      }
    };
    fetchLocations();
  }, []);

  const titlePart1 = "Find & Book";
  const titlePart2 = "Sports Turfs";
  const titlePart3 = "Near You Instantly";

  useEffect(() => {
    // GSAP reveal timeline
    const tl = gsap.timeline();

    tl.fromTo(
      ".char-reveal",
      {
        opacity: 0,
        y: 45,
        filter: "blur(3px)",
      },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        stagger: 0.025,
        duration: 0.7,
        ease: "power4.out",
      }
    );

    tl.fromTo(
      ".fade-up-hero",
      {
        opacity: 0,
        y: 35,
      },
      {
        opacity: 1,
        y: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: "power3.out",
      },
      "-=0.3"
    );
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (location) queryParams.set("location", location);
    if (sport !== "all") queryParams.set("sport", sport);
    if (date) queryParams.set("date", date);
    router.push(`/turfs?${queryParams.toString()}`);
  };



  return (
    <section className="relative min-h-[92vh] flex flex-col justify-between bg-black text-white px-6 overflow-hidden select-none pb-12 pt-8">
      {/* Immersive Animated WebGL-like Canvas Background */}
      <SportsCanvas />

      {/* Top ambient dark neon filter */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none z-1" />

      {/* Empty spacer to push content center */}
      <div className="flex-1" />

      {/* Central Content Area */}
      <div className="max-w-5xl w-full mx-auto text-center z-10 space-y-9 mt-12 md:mt-0 relative">
        
        {/* Main Heading Reveal */}
        <h1 className="text-5.5xl md:text-7.5xl font-black leading-[1.08] tracking-tight text-white select-none">
          <span className="block overflow-hidden py-1">
            {(titlePart1 + " " + titlePart2).split("").map((char, i) => (
              <span
                key={i}
                className="char-reveal opacity-0 inline-block translate-y-full font-black text-white"
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </span>
          <span className="text-lime-400 block mt-2 font-black py-1 overflow-hidden">
            {titlePart3.split("").map((char, i) => (
              <span
                key={i}
                className="char-reveal opacity-0 inline-block translate-y-full font-black"
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="fade-up-hero opacity-0 max-w-2xl mx-auto text-zinc-300 text-sm md:text-base leading-relaxed font-semibold">
          Book the best turf grounds in your city in 3 clicks.
        </p>

        {/* Search Form */}
        <form
          ref={formRef}
          onSubmit={handleSearch}
          className="fade-up-hero opacity-0 max-w-4xl mx-auto bg-zinc-950/80 border border-zinc-800 p-3 rounded-2xl md:rounded-full flex flex-col md:flex-row gap-3 items-center transition-all duration-300"
        >
          {/* Location Selector */}
          <div className="flex-1 w-full flex items-center gap-3.5 px-5 py-2 md:py-0 border-b border-zinc-850 md:border-b-0 md:border-r border-zinc-850 text-left">
            <span className="text-zinc-500 text-xl font-bold">📍</span>
            <div className="flex-1">
              <span className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider leading-none">Enter Location</span>
              {locationsList.length > 0 ? (
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-transparent text-white outline-none text-xs font-bold py-1.5 cursor-pointer font-bold select-none border-none p-0"
                >
                  {locationsList.map((loc) => (
                    <option key={loc.id} value={loc.name} className="bg-zinc-950 text-white font-bold">
                      {loc.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Where to play?"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-transparent text-white outline-none placeholder-zinc-550 text-xs font-bold py-1.5"
                />
              )}
            </div>
          </div>

          {/* Sport Selector */}
          <div className="w-full md:w-52 flex items-center gap-3.5 px-5 py-2 md:py-0 border-b border-zinc-850 md:border-b-0 md:border-r border-zinc-850 text-left">
            <span className="text-zinc-500 text-xl font-bold">⚽</span>
            <div className="flex-1">
              <span className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider leading-none">Select Sport</span>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="w-full bg-transparent text-white outline-none text-xs font-bold py-1.5 cursor-pointer font-bold select-none border-none p-0"
              >
                <option value="all" className="bg-zinc-950 text-white font-bold">All Sports</option>
                <option value="Football" className="bg-zinc-950 text-white font-bold">Football</option>
                <option value="Cricket" className="bg-zinc-950 text-white font-bold">Cricket</option>
                <option value="Badminton" className="bg-zinc-950 text-white font-bold">Badminton</option>
              </select>
            </div>
          </div>

          {/* Date Selector */}
          <div className="w-full md:w-52 flex items-center gap-3.5 px-5 py-2 md:py-0 text-left">
            <span className="text-zinc-500 text-xl font-bold">📅</span>
            <div className="flex-1">
              <span className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider leading-none">Select Date</span>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-transparent text-white outline-none text-xs font-bold py-1 cursor-pointer"
              />
            </div>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="w-full md:w-auto relative bg-lime-400 hover:bg-lime-500 text-black font-black px-8 py-4.5 rounded-full transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="relative z-10 flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-black">
              Search Turfs
            </span>
          </button>
        </form>

        {/* Categories Bar Row */}
        <div className="fade-up-hero opacity-0 max-w-2xl mx-auto bg-zinc-950/45 border border-zinc-900/60 p-2 rounded-2xl flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-zinc-400 tracking-wide mt-4">
          <button
            type="button"
            onClick={() => setSport("Football")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition duration-300 cursor-pointer ${
              sport === "Football" ? "bg-zinc-800 text-lime-400 font-black" : "hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <span>⚽</span> Football
          </button>
          <button
            type="button"
            onClick={() => setSport("Cricket")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition duration-300 cursor-pointer ${
              sport === "Cricket" ? "bg-zinc-800 text-lime-400 font-black" : "hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <span>🏏</span> Cricket
          </button>
          <button
            type="button"
            onClick={() => setSport("Badminton")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition duration-300 cursor-pointer ${
              sport === "Badminton" ? "bg-zinc-800 text-lime-400 font-black" : "hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <span>🏸</span> Badminton
          </button>
          <button
            type="button"
            onClick={() => setSport("all")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition duration-300 cursor-pointer ${
              sport === "all" ? "bg-zinc-800 text-lime-400 font-black" : "hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <span>🏀</span> Basketball
          </button>
        </div>
      </div>

    </section>
  );
}
