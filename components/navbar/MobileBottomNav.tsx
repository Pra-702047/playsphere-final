"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function MobileBottomNav() {
  const { user, role, loading } = useAuth();
  const pathname = usePathname();

  // Hide on authentication screens
  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password"
  ) {
    return null;
  }

  const getNavItems = () => {
    if (loading) return [];

    if (!user) {
      return [
        { label: "Home", href: "/", icon: "🏠" },
        { label: "Turfs", href: "/turfs", icon: "🏟️" },
        { label: "Login", href: "/login", icon: "👤" },
      ];
    }

    if (role === "admin") {
      return [
        { label: "Admin", href: "/admin", icon: "👑" },
        { label: "Users", href: "/admin/users", icon: "👤" },
        { label: "Turfs", href: "/admin/turfs", icon: "🏟️" },
        { label: "Reports", href: "/admin/reports", icon: "📊" },
      ];
    }

    if (role === "owner") {
      return [
        { label: "Dashboard", href: "/owner", icon: "🏠" },
        { label: "Turfs", href: "/owner/turfs", icon: "🏟️" },
        { label: "Bookings", href: "/owner/bookings", icon: "📅" },
        { label: "Slots", href: "/owner/slots", icon: "⏰" },
      ];
    }

    // Default Player role
    return [
      { label: "Home", href: "/", icon: "🏠" },
      { label: "Book", href: "/turfs", icon: "🏟️" },
      { label: "Bookings", href: "/dashboard", icon: "📅" },
      { label: "Profile", href: "/user/profile", icon: "👤" },
    ];
  };

  const items = getNavItems();
  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/85 backdrop-blur-2xl border-t border-zinc-900 md:hidden z-40 flex items-center justify-around py-2.5 px-2 shadow-[0_-10px_35px_rgba(0,0,0,0.9)] pb-safe-bottom">
      {items.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 gap-1 text-[9px] font-black uppercase tracking-wider transition-colors duration-300 py-1 ${
              isActive ? "text-lime-400 font-extrabold" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="scale-90 origin-top">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
