"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Banners() {
  return (
    <section className="w-full bg-zinc-900 border-y border-zinc-800 py-3">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="bg-lime-500 text-black text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm">
            New
          </span>
          <p className="text-zinc-300 text-sm font-medium">
            Book your first turf slot and get <strong className="text-white">flat 50% off</strong>.
          </p>
        </div>
        <Link 
          href="/login" 
          className="text-lime-400 text-sm font-semibold flex items-center gap-1 hover:text-lime-300 transition-colors"
        >
          Claim Offer <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
