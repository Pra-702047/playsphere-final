"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAllTurfs, TurfData } from "@/services/turf.service";
import { getAllBookings } from "@/services/booking.service";
import { getAllUsers, UserProfile } from "@/services/user.service";
import Link from "next/link";

type MonthlyRevenue = {
  month: string;
  revenue: number;
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [turfs, setTurfs] = useState<TurfData[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const allTurfs = await getAllTurfs();
        const allBookings = await getAllBookings();
        const allUsers = await getAllUsers();
        setTurfs(allTurfs);
        setBookings(allBookings);
        setUsers(allUsers);
      } catch (err) {
        console.error("Error loading admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  // Calculate platform metrics
  const totalBookings = bookings.length;
  const totalUsers = users.length;
  const totalOwners = users.filter((u) => u.role === "owner").length;
  const unverifiedTurfs = turfs.filter((t) => !t.isVerified).length;

  const confirmedBookings = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "accepted"
  );
  const totalRevenue = confirmedBookings.reduce((sum, b) => {
    const priceVal = typeof b.price === "number" ? b.price : Number(b.price || 0);
    return sum + (isNaN(priceVal) ? 0 : priceVal);
  }, 0);
  const totalCommission = Math.round(totalRevenue * 0.1);

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
    <div className="space-y-10 font-sans">
      {/* Welcome & Overview Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-white">Platform Admin Dashboard</h1>
        <p className="text-gray-400 mt-2">Oversee bookings, verify properties, manage users, and inspect revenue charts.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
          <div>
            <p className="text-gray-450 text-[10px] font-bold uppercase tracking-wider">Platform Revenue</p>
            <p className="text-2xl font-extrabold text-lime-400 mt-2">₹{totalRevenue.toLocaleString("en-IN")}</p>
          </div>
          <span className="text-[10px] text-zinc-550 mt-2 block border-t border-zinc-850 pt-2 font-mono">GROSS EARNINGS</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
          <div>
            <p className="text-gray-455 text-[10px] font-bold uppercase tracking-wider">Commission (10%)</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-2">₹{totalCommission.toLocaleString("en-IN")}</p>
          </div>
          <span className="text-[10px] text-zinc-550 mt-2 block border-t border-zinc-850 pt-2 font-mono">NET PLATFORM REVENUE</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
          <div>
            <p className="text-gray-450 text-[10px] font-bold uppercase tracking-wider">Total Owners</p>
            <p className="text-2xl font-extrabold text-white mt-2">{totalOwners}</p>
          </div>
          <span className="text-[10px] text-zinc-550 mt-2 block border-t border-zinc-850 pt-2 font-mono">PARTNER VENTURES</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
          <div>
            <p className="text-gray-450 text-[10px] font-bold uppercase tracking-wider">Registered Users</p>
            <p className="text-2xl font-extrabold text-white mt-2">{totalUsers}</p>
          </div>
          <span className="text-[10px] text-zinc-550 mt-2 block border-t border-zinc-850 pt-2 font-mono">ACTIVE PLAYERS</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
          <div>
            <p className="text-gray-450 text-[10px] font-bold uppercase tracking-wider">Total Bookings</p>
            <p className="text-2xl font-extrabold text-white mt-2">{totalBookings}</p>
          </div>
          <span className="text-[10px] text-zinc-550 mt-2 block border-t border-zinc-850 pt-2 font-mono">RESERVATIONS LOGGED</span>
        </div>

        <div className={`bg-zinc-900 border p-6 rounded-2xl shadow-lg flex flex-col justify-between transition duration-300 ${
          unverifiedTurfs > 0 ? "border-amber-500/50 border-l-amber-500 border-l-4" : "border-zinc-800"
        }`}>
          <div>
            <p className={`${unverifiedTurfs > 0 ? "text-amber-400" : "text-gray-400"} text-[10px] font-bold uppercase tracking-wider`}>
              Unverified Turfs
            </p>
            <p className="text-2xl font-extrabold text-white mt-2">{unverifiedTurfs}</p>
          </div>
          <span className="text-[10px] text-zinc-550 mt-2 block border-t border-zinc-850 pt-2 font-mono">PENDING APPROVALS</span>
        </div>
      </div>

      {/* Analytics SVG Chart & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SVG Revenue Chart */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl lg:col-span-2">
          <h2 className="text-xl font-bold text-white mb-6">Platform Monthly Revenue</h2>
          <div className="w-full overflow-x-auto flex justify-center py-4">
            <svg width={chartWidth} height={chartHeight + 40} className="overflow-visible">
              <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#27272a" strokeWidth="1" />
              <line x1="0" y1={chartHeight * 0.5} x2={chartWidth} y2={chartHeight * 0.5} stroke="#27272a" strokeDasharray="4 4" />
              <line x1="0" y1="0" x2={chartWidth} y2="0" stroke="#27272a" strokeDasharray="4 4" />

              {last6MonthsData.map((d, index) => {
                const barHeight = (d.revenue / maxRevenue) * chartHeight;
                const x = index * (barWidth + gap) + 40;
                const y = chartHeight - barHeight;

                return (
                  <g key={index}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill="url(#adminLimeGradient)"
                      rx="4"
                      className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                    />
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

              <defs>
                <linearGradient id="adminLimeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#84cc16" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Quick Management Panel */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-3">Operations shortcuts</h2>
            <p className="text-gray-400 text-xs mb-6">Manage all operational elements of the sports booking network.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/admin/users"
              className="text-center bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-white font-semibold py-3 px-2 rounded-xl transition text-xs cursor-pointer"
            >
              👥 Users list
            </Link>
            <Link
              href="/admin/turfs"
              className="text-center bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-white font-semibold py-3 px-2 rounded-xl transition text-xs cursor-pointer"
            >
              🏟️ Verify list
            </Link>
            <Link
              href="/admin/payouts"
              className="text-center bg-zinc-850 hover:bg-zinc-850 border border-zinc-800 text-lime-400 font-bold py-3 px-2 rounded-xl transition text-xs cursor-pointer"
            >
              💰 Payouts
            </Link>
            <Link
              href="/admin/coupons"
              className="text-center bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-white font-semibold py-3 px-2 rounded-xl transition text-xs cursor-pointer"
            >
              🎫 Coupons
            </Link>
            <Link
              href="/admin/banners"
              className="text-center bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-white font-semibold py-3 px-2 rounded-xl transition text-xs cursor-pointer"
            >
              📢 Banners
            </Link>
            <Link
              href="/admin/tickets"
              className="text-center bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-white font-semibold py-3 px-2 rounded-xl transition text-xs cursor-pointer"
            >
              🎫 Tickets
            </Link>
            <Link
              href="/admin/reports"
              className="text-center bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-white font-semibold py-3 px-2 rounded-xl transition text-xs cursor-pointer"
            >
              📊 Reports
            </Link>
            <Link
              href="/admin/logs"
              className="text-center bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-white font-semibold py-3 px-2 rounded-xl transition text-xs cursor-pointer"
            >
              🔒 Audit logs
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Recent Platform Bookings</h2>
          <span className="text-zinc-500 text-xs">{bookings.length} Bookings Total</span>
        </div>

        {bookings.length === 0 ? (
          <p className="text-gray-400 text-center py-6">No bookings created yet.</p>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {bookings.slice(0, 5).map((b) => (
                  <tr key={b.id} className="text-gray-300 text-sm hover:bg-zinc-950/20">
                    <td className="py-4 px-2 font-semibold text-white">{b.turfName || "Unnamed Turf"}</td>
                    <td className="py-4 px-2">
                      <div className="font-medium text-white">{b.playerName}</div>
                      <div className="text-[12px] text-gray-500">{b.userEmail}</div>
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
                            : b.status === "cancelled"
                            ? "bg-zinc-800 text-zinc-400 border border-zinc-700"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {b.status}
                      </span>
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
