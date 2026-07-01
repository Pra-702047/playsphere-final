"use client";

import { useEffect, useState } from "react";
import { getAllTurfs, TurfData } from "@/services/turf.service";
import { getAllBookings } from "@/services/booking.service";
import { getAllUsers, UserProfile } from "@/services/user.service";

export default function AdminReportsPage() {
  const [turfs, setTurfs] = useState<TurfData[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const t = await getAllTurfs();
        const b = await getAllBookings();
        const u = await getAllUsers();
        setTurfs(t);
        setBookings(b);
        setUsers(u);
      } catch (err) {
        console.error("Error loading reporting data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportBookings = () => {
    if (bookings.length === 0) {
      alert("No bookings data to export");
      return;
    }

    const headers = ["Booking ID", "Turf Name", "Player Name", "Email", "Phone", "Date", "Slot", "Price (INR)", "Status", "Sport"];
    const rows = bookings.map((b) => [
      b.id || "",
      b.turfName || "Unnamed Turf",
      b.playerName || "",
      b.userEmail || "",
      b.mobile || "",
      b.date || "",
      b.slot || "",
      b.price || 0,
      b.status || "",
      b.sport || "Football",
    ]);

    const csvContent =
      [headers.join(","), ...rows.map((row) => row.map((val) => `"${val}"`).join(","))].join("\n");
    
    downloadCSV(csvContent, `bookings_report_${new Date().toISOString().split("T")[0]}.csv`);
  };

  const handleExportUsers = () => {
    if (users.length === 0) {
      alert("No users data to export");
      return;
    }

    const headers = ["User ID", "Full Name", "Email Address", "Access Role", "Registered Date"];
    const rows = users.map((u) => {
      const regDate = u.createdAt?.toDate 
        ? u.createdAt.toDate().toISOString() 
        : u.createdAt 
          ? new Date(u.createdAt).toISOString()
          : "";
      return [
        u.uid || "",
        u.name || "",
        u.email || "",
        u.role || "",
        regDate,
      ];
    });

    const csvContent =
      [headers.join(","), ...rows.map((row) => row.map((val) => `"${val}"`).join(","))].join("\n");

    downloadCSV(csvContent, `users_report_${new Date().toISOString().split("T")[0]}.csv`);
  };

  const handleExportTurfs = () => {
    if (turfs.length === 0) {
      alert("No turfs data to export");
      return;
    }

    const headers = ["Turf ID", "Turf Name", "Location", "Hourly Base Price", "Owner ID", "Verified Status", "Amenities"];
    const rows = turfs.map((t) => [
      t.id || "",
      t.name || "",
      t.location || "",
      t.price || 0,
      t.ownerId || "",
      t.isVerified ? "Verified" : "Unverified",
      (t.amenities || []).join(" | "),
    ]);

    const csvContent =
      [headers.join(","), ...rows.map((row) => row.map((val) => `"${val}"`).join(","))].join("\n");

    downloadCSV(csvContent, `turfs_report_${new Date().toISOString().split("T")[0]}.csv`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  // Calculate summaries
  const totalTurfs = turfs.length;
  const totalUsers = users.length;
  const totalBookings = bookings.length;
  const confirmed = bookings.filter((b) => b.status === "confirmed" || b.status === "accepted");
  const platformRevenue = confirmed.reduce((sum, b) => {
    const priceVal = typeof b.price === "number" ? b.price : Number(b.price || 0);
    return sum + (isNaN(priceVal) ? 0 : priceVal);
  }, 0);

  return (
    <div className="space-y-10 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-white">System Reports</h1>
        <p className="text-gray-400 mt-2">Generate aggregated summaries and download spreadsheets of platform activity.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Total Bookings</h3>
          <p className="text-3xl font-extrabold text-white mt-2">{totalBookings}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Total Revenue</h3>
          <p className="text-3xl font-extrabold text-lime-400 mt-2">₹{platformRevenue.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Total Users</h3>
          <p className="text-3xl font-extrabold text-white mt-2">{totalUsers}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Total Venues</h3>
          <p className="text-3xl font-extrabold text-white mt-2">{totalTurfs}</p>
        </div>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Bookings Card */}
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl flex flex-col justify-between hover:border-lime-500/35 transition duration-300">
          <div>
            <div className="text-4xl mb-4">📅</div>
            <h2 className="text-2xl font-bold text-white mb-2">Bookings Registry</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Export booking logs including dates, requested slots, pricing, player contact detail fields, and verification status codes.
            </p>
          </div>
          <button
            onClick={handleExportBookings}
            className="w-full bg-lime-500 hover:bg-lime-400 text-black font-bold py-3.5 rounded-xl transition text-sm shadow-md"
          >
            📥 Export Bookings CSV
          </button>
        </div>

        {/* Users Card */}
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl flex flex-col justify-between hover:border-lime-500/35 transition duration-300">
          <div>
            <div className="text-4xl mb-4">👥</div>
            <h2 className="text-2xl font-bold text-white mb-2">Accounts Directory</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Export registered account directories showing names, verified emails, user roles (players/owners/admins), and creation dates.
            </p>
          </div>
          <button
            onClick={handleExportUsers}
            className="w-full bg-lime-500 hover:bg-lime-400 text-black font-bold py-3.5 rounded-xl transition text-sm shadow-md"
          >
            📥 Export Users CSV
          </button>
        </div>

        {/* Turfs Card */}
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl flex flex-col justify-between hover:border-lime-500/35 transition duration-300">
          <div>
            <div className="text-4xl mb-4">🏟️</div>
            <h2 className="text-2xl font-bold text-white mb-2">Turf Catalog</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Export listed venues containing addresses, hourly pricing, verification states, amenities lists, and linking owner IDs.
            </p>
          </div>
          <button
            onClick={handleExportTurfs}
            className="w-full bg-lime-500 hover:bg-lime-400 text-black font-bold py-3.5 rounded-xl transition text-sm shadow-md"
          >
            📥 Export Turfs CSV
          </button>
        </div>

      </div>
    </div>
  );
}
