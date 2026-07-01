"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getOwnerTurfs, TurfData } from "@/services/turf.service";
import { getOwnerBookings, updateBookingStatus } from "@/services/booking.service";
import Link from "next/link";

type MonthlyRevenue = {
  month: string;
  revenue: number;
};

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [turfs, setTurfs] = useState<TurfData[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const ownerTurfs = await getOwnerTurfs(user.uid);
        const ownerBookings = await getOwnerBookings(user.uid);
        setTurfs(ownerTurfs);
        setBookings(ownerBookings);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    const success = await updateBookingStatus(bookingId, newStatus);
    if (success.success) {
      alert(`Booking updated to ${newStatus}`);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
    } else {
      alert("Failed to update status: " + success.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  // Calculate statistics
  const totalBookings = bookings.length;
  const activeTurfs = turfs.length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;

  const confirmedBookings = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "accepted"
  );
  
  const totalRevenue = confirmedBookings.reduce((sum, b) => {
    const priceVal = typeof b.price === "number" ? b.price : Number(b.price || 0);
    return sum + (isNaN(priceVal) ? 0 : priceVal);
  }, 0);

  // Group revenue by month for SVG chart (Last 6 Months)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const last6MonthsData: MonthlyRevenue[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    last6MonthsData.push({
      month: `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`,
      revenue: 0,
    });
  }

  confirmedBookings.forEach((b) => {
    let bDate = new Date();
    if (b.date) {
      bDate = new Date(b.date);
    } else if (b.createdAt) {
      bDate = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
    }

    const bMonthName = `${monthNames[bDate.getMonth()]} ${bDate.getFullYear().toString().substring(2)}`;
    const monthObj = last6MonthsData.find((m) => m.month === bMonthName);
    if (monthObj) {
      const priceVal = typeof b.price === "number" ? b.price : Number(b.price || 0);
      monthObj.revenue += isNaN(priceVal) ? 0 : priceVal;
    }
  });

  // SVG Chart calculation parameters
  const chartHeight = 160;
  const chartWidth = 500;
  const maxRevenue = Math.max(...last6MonthsData.map((d) => d.revenue), 1000);
  const barWidth = 40;
  const gap = 35;

  return (
    <div className="space-y-10">
      {/* Welcome & Overview Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-white">Owner Dashboard</h1>
        <p className="text-gray-400 mt-2">Manage your sports venues and review bookings metrics in real-time.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg">
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Total Revenue</p>
          <p className="text-3xl font-extrabold text-lime-400 mt-2">₹{totalRevenue.toLocaleString("en-IN")}</p>
          <span className="text-[12px] text-zinc-500 mt-1 block">From accepted bookings</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg">
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Total Bookings</p>
          <p className="text-3xl font-extrabold text-white mt-2">{totalBookings}</p>
          <span className="text-[12px] text-zinc-500 mt-1 block">All times booked</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg">
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Active Turfs</p>
          <p className="text-3xl font-extrabold text-white mt-2">{activeTurfs}</p>
          <span className="text-[12px] text-zinc-500 mt-1 block">Listed properties</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg border-l-lime-500 border-l-4">
          <p className="text-lime-400 text-sm font-semibold uppercase tracking-wider">Pending Bookings</p>
          <p className="text-3xl font-extrabold text-white mt-2">{pendingBookings}</p>
          <span className="text-[12px] text-zinc-500 mt-1 block">Awaiting confirmation</span>
        </div>
      </div>

      {/* Analytics SVG Chart & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SVG Revenue Chart */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl lg:col-span-2">
          <h2 className="text-xl font-bold text-white mb-6">Revenue Analytics (Last 6 Months)</h2>
          <div className="w-full overflow-x-auto flex justify-center py-4">
            <svg width={chartWidth} height={chartHeight + 40} className="overflow-visible">
              {/* Grid lines */}
              <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#27272a" strokeWidth="1" />
              <line x1="0" y1={chartHeight * 0.5} x2={chartWidth} y2={chartHeight * 0.5} stroke="#27272a" strokeDasharray="4 4" />
              <line x1="0" y1="0" x2={chartWidth} y2="0" stroke="#27272a" strokeDasharray="4 4" />

              {last6MonthsData.map((d, index) => {
                const barHeight = (d.revenue / maxRevenue) * chartHeight;
                const x = index * (barWidth + gap) + 40;
                const y = chartHeight - barHeight;

                return (
                  <g key={index}>
                    {/* Bar */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill="url(#limeGradient)"
                      rx="4"
                      className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                    />
                    {/* Revenue Tag */}
                    <text
                      x={x + barWidth / 2}
                      y={y - 8}
                      textAnchor="middle"
                      fill="#a3e635"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {d.revenue > 0 ? `₹${d.revenue}` : ""}
                    </text>
                    {/* Month Label */}
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight + 20}
                      textAnchor="middle"
                      fill="#a1a1aa"
                      fontSize="11"
                    >
                      {d.month}
                    </text>
                  </g>
                );
              })}

              {/* Gradient Definition */}
              <defs>
                <linearGradient id="limeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#84cc16" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Quick Management Tools */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Quick Management</h2>
            <p className="text-gray-400 text-sm mb-6">Easily toggle between updating your turfs catalog, managing booking calendar, or modifying slot restrictions.</p>
          </div>
          <div className="space-y-4">
            <Link
              href="/owner/turfs"
              className="block text-center w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-4 rounded-xl border border-zinc-700 transition"
            >
              🏟️ Manage Turfs
            </Link>
            <Link
              href="/owner/bookings"
              className="block text-center w-full bg-lime-500 hover:bg-lime-400 text-black font-bold py-3 px-4 rounded-xl transition"
            >
              📅 Review Bookings
            </Link>
            <Link
              href="/owner/slots"
              className="block text-center w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 px-4 rounded-xl border border-zinc-700 transition"
            >
              ⚙️ Slot & Holiday Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Pending & Recent Bookings List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Recent Booking Requests</h2>
          <Link href="/owner/bookings" className="text-lime-400 text-sm hover:underline">
            View All Bookings
          </Link>
        </div>

        {bookings.length === 0 ? (
          <p className="text-gray-400 text-center py-6">No bookings recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-gray-400 text-sm">
                  <th className="py-4 px-2">Turf</th>
                  <th className="py-4 px-2">Player</th>
                  <th className="py-4 px-2">Date & Slot</th>
                  <th className="py-4 px-2">Price</th>
                  <th className="py-4 px-2">Status</th>
                  <th className="py-4 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {bookings.slice(0, 5).map((b) => (
                  <tr key={b.id} className="text-gray-300 text-sm hover:bg-zinc-950/20">
                    <td className="py-4 px-2 font-semibold text-white">{b.turfName || "Unnamed Turf"}</td>
                    <td className="py-4 px-2">
                      <div className="font-medium text-white">{b.playerName}</div>
                      <div className="text-[12px] text-gray-500">{b.mobile}</div>
                    </td>
                    <td className="py-4 px-2">
                      <div>📅 {b.date}</div>
                      <div className="text-[12px] text-lime-400 font-semibold">🕒 {b.slot}</div>
                    </td>
                    <td className="py-4 px-2 font-bold text-white">₹{b.price}</td>
                    <td className="py-4 px-2">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold ${
                          b.status === "pending"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : b.status === "confirmed" || b.status === "accepted"
                            ? "bg-lime-500/10 text-lime-400 border border-lime-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-right">
                      {b.status === "pending" ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleStatusChange(b.id, "confirmed")}
                            className="bg-lime-500 hover:bg-lime-400 text-black px-3 py-1 rounded-lg text-xs font-bold"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleStatusChange(b.id, "rejected")}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1 rounded-lg text-xs font-bold"
                          >
                            Reject
                          </button>
                        </div>
                      ) : b.status === "confirmed" || b.status === "accepted" ? (
                        <button
                          onClick={() => handleStatusChange(b.id, "refunded")}
                          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1 rounded-lg text-xs font-medium border border-zinc-700"
                        >
                          Refund
                        </button>
                      ) : (
                        <span className="text-zinc-500 text-xs">No Action</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
