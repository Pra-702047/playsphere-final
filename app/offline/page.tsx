"use client";

import { WifiOff, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OfflinePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-sm w-full flex flex-col items-center gap-6 shadow-2xl">
        <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center border border-zinc-700/50 mb-2">
          <WifiOff className="w-10 h-10 text-zinc-500" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            You are Offline
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Please check your internet connection and try again. The PlaySphere app requires a network connection to book turfs.
          </p>
        </div>

        <button
          onClick={() => router.refresh()}
          className="w-full py-4 bg-lime-500 hover:bg-lime-600 text-black font-bold uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(163,255,18,0.2)] flex items-center justify-center gap-2 active:scale-95"
        >
          <RefreshCcw className="w-5 h-5" />
          Try Again
        </button>

        <Link
          href="/"
          className="text-zinc-500 text-xs font-bold uppercase tracking-wider hover:text-white transition"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
