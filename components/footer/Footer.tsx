"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-zinc-900 text-white font-sans">
      <div className="max-w-7xl mx-auto px-6 py-16">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Logo & Slogan */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="PlaySphere"
                width={45}
                height={45}
                priority
              />
              <div>
                <h1 className="text-lg font-black tracking-wider text-white">
                  Play<span className="text-lime-400">Sphere</span>
                </h1>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                  Find • Play • Connect
                </p>
              </div>
            </Link>
            <p className="text-zinc-500 text-xs leading-relaxed pt-2">
              The premier sports venue listing and instant court booking platform for enthusiasts.
            </p>
          </div>

          {/* Player links */}
          <div className="space-y-4">
            <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest font-mono">For Players</h3>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li>
                <Link href="/turfs" className="hover:text-lime-400 transition">Explore Turfs</Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-lime-400 transition">Log In</Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-lime-400 transition">Sign Up</Link>
              </li>
            </ul>
          </div>

          {/* Owner links */}
          <div className="space-y-4">
            <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest font-mono">For Turf Owners</h3>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li>
                <Link href="/register?role=owner" className="hover:text-lime-400 transition">List Your Venue</Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-lime-400 transition">Owner Login</Link>
              </li>
              <li>
                <Link href="/owner" className="hover:text-lime-400 transition">Owner Panel</Link>
              </li>
            </ul>
          </div>

          {/* Socials & Contacts */}
          <div className="space-y-4">
            <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest font-mono">Contact Us</h3>
            <div className="space-y-2">
              <Link href="/connect" className="text-xs font-semibold text-lime-400 hover:underline block">
                Connect Page ↗
              </Link>
              <a href="mailto:playspherenanded@gmail.com" className="text-sm text-zinc-505 hover:text-lime-400 transition block">
                📧 playspherenanded@gmail.com
              </a>
            </div>
            <div className="flex gap-4 pt-1 items-center">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/playsphere.in?igsh=MWJoamUwOWZqa28ybQ=="
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-550 hover:text-pink-500 transition"
                title="Instagram"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>

              {/* Telegram */}
              <a
                href="https://t.me/PlaySphereNanded"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-550 hover:text-sky-450 transition"
                title="Telegram"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.24-5.54 3.65-.52.36-.99.53-1.41.52-.46-.01-1.36-.26-2.02-.48-.82-.27-1.47-.41-1.42-.87.03-.24.36-.49.99-.74 3.89-1.69 6.49-2.8 7.8-3.32 3.71-1.48 4.48-1.74 4.99-1.75.11 0 .36.03.52.16.14.11.18.27.2.39-.01.07.01.21 0 .28z" />
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* copyright */}
        <div className="border-t border-zinc-900 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-zinc-600 gap-4">
          <p>© {new Date().getFullYear()} PlaySphere. All Rights Reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-zinc-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-zinc-400 cursor-pointer">Privacy Policy</span>
          </div>
        </div>

      </div>
    </footer>
  );
}