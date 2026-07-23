"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getOwnerTurfs, TurfData } from "@/services/turf.service";
import { getOwnerBookings, updateBookingStatus, verifyBookingOTP, getBookingByOTP } from "@/services/booking.service";
import * as XLSX from "xlsx";

export default function OwnerBookingsPage() {
  const { user } = useAuth();
  const [turfs, setTurfs] = useState<TurfData[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedTurfId, setSelectedTurfId] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const ownerTurfs = await getOwnerTurfs(user.uid);
        const ownerBookings = await getOwnerBookings(user.uid);
        setTurfs(ownerTurfs);
        setBookings(ownerBookings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    const success = await updateBookingStatus(bookingId, newStatus);
    if (success.success) {
      alert(`Booking status changed to ${newStatus}`);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
    } else {
      alert("Failed to update status: " + success.message);
    }
  };

  const [otpInput, setOtpInput] = useState("");
  const [otpVerifying, setOtpVerifying] = useState(false);

  const handleQuickVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput.trim() || !user) return;

    setOtpVerifying(true);
    try {
      const booking = await getBookingByOTP(user.uid, otpInput.trim());
      if (!booking) {
        alert("Invalid OTP or no booking found matching this code under your turfs.");
        setOtpVerifying(false);
        return;
      }

      if (booking.otpVerified || booking.status === "checked_in") {
        alert(`This slot is already checked in for ${booking.playerName}!`);
        setOtpVerifying(false);
        return;
      }

      const res = await verifyBookingOTP(booking.id);
      if (res.success) {
        alert(`Successfully Checked In ${booking.playerName} for ${booking.turfName} at ${booking.slot}!`);
        setBookings((prev) =>
          prev.map((b) => (b.id === booking.id ? { ...b, status: "checked_in", otpVerified: true } : b))
        );
        setOtpInput("");
      } else {
        alert("Verification failed: " + res.message);
      }
    } catch (err: any) {
      console.error(err);
      alert("Error verifying OTP: " + err.message);
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleInlineVerifyOTP = async (bookingId: string, correctOtp: string) => {
    const entered = prompt(`Enter the 6-digit check-in OTP (Expected: ${correctOtp}):`);
    if (entered === null) return;
    if (entered.trim() !== correctOtp) {
      alert("Incorrect OTP code. Verification failed.");
      return;
    }

    const res = await verifyBookingOTP(bookingId);
    if (res.success) {
      alert("Slot check-in verified successfully!");
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "checked_in", otpVerified: true } : b))
      );
    } else {
      alert("Verification failed: " + res.message);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesTurf = selectedTurfId === "all" || b.turfId === selectedTurfId;
    const matchesStatus = selectedStatus === "all" || b.status === selectedStatus;
    const matchesDate = !selectedDate || b.date === selectedDate;
    return matchesTurf && matchesStatus && matchesDate;
  });

  const handleExportDetailedBookings = () => {
    const exportData = filteredBookings.map((b) => ({
      "Booking ID": b.id,
      "Turf Name": b.turfName || "Unnamed Turf",
      "Player Name": b.playerName,
      "Mobile": b.mobile,
      "Email": b.userEmail,
      "Sport": b.sport,
      "Date": b.date,
      "Slot": b.slot,
      "Number of Players": b.players,
      "Price (₹)": b.price,
      "Status": b.status === "checked_in" ? "Checked In" : b.status,
      "OTP Verified": b.otpVerified ? "Yes" : "No",
      "Special Notes": b.notes || "None",
      "Created At": b.createdAt?.toDate ? b.createdAt.toDate().toLocaleString() : new Date(b.createdAt).toLocaleString(),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Detailed Bookings");
    XLSX.writeFile(wb, `PlaySphere_Bookings_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white">Manage Bookings</h1>
          <p className="text-gray-400 mt-2">Approve client bookings, manage cancellations, and process refunds.</p>
        </div>
        <button
          onClick={handleExportDetailedBookings}
          className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold py-3 px-6 rounded-xl transition cursor-pointer flex items-center gap-2"
        >
          <span>📊</span> Export Detailed Data
        </button>
      </div>

      {/* Quick Check-in Verification Card */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-xl">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">🔑 Quick Check-in Verification</h2>
        <p className="text-gray-400 text-xs mb-4">Enter the 6-digit check-in OTP provided by the player to verify slot occupancy.</p>
        <form onSubmit={handleQuickVerifyOTP} className="flex gap-3">
          <input
            type="text"
            maxLength={6}
            placeholder="e.g. 482195"
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
            className="flex-1 p-3.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 font-mono text-lg font-black tracking-widest text-center"
          />
          <button
            type="submit"
            disabled={otpVerifying}
            className="bg-lime-500 hover:bg-lime-400 disabled:bg-lime-500/50 text-black font-extrabold px-6 rounded-xl transition text-sm cursor-pointer whitespace-nowrap"
          >
            {otpVerifying ? "Verifying..." : "Verify Slot"}
          </button>
        </form>
      </div>

      {/* Filter Bar */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Turf Filter */}
        <div>
          <label className="block text-zinc-400 text-xs font-semibold mb-2">Filter by Turf</label>
          <select
            value={selectedTurfId}
            onChange={(e) => setSelectedTurfId(e.target.value)}
            className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 text-sm"
          >
            <option value="all">All Turfs</option>
            {turfs.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-zinc-400 text-xs font-semibold mb-2">Filter by Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked In</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled (by Player)</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <label className="block text-zinc-400 text-xs font-semibold mb-2">Filter by Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 text-sm"
          />
        </div>

        {/* Reset Filter Button */}
        <div className="flex items-end">
          <button
            onClick={() => {
              setSelectedTurfId("all");
              setSelectedStatus("all");
              setSelectedDate("");
            }}
            className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 py-3 rounded-xl text-white font-semibold transition text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Bookings List Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
        {filteredBookings.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No bookings match the selected filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-gray-400 text-sm bg-zinc-950/40">
                  <th className="py-4 px-6">Turf Name</th>
                  <th className="py-4 px-6">Player Details</th>
                  <th className="py-4 px-6">Date & Slot</th>
                  <th className="py-4 px-6">Sport / Count</th>
                  <th className="py-4 px-6">Price Paid</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="text-gray-300 text-sm hover:bg-zinc-950/10">
                    <td className="py-4 px-6 font-semibold text-white">{b.turfName || "Unnamed Turf"}</td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white">{b.playerName}</div>
                      <div className="text-xs text-gray-500">{b.mobile}</div>
                      <div className="text-xs text-gray-500">{b.userEmail}</div>
                      {b.otp && (b.status === "confirmed" || b.status === "accepted") && !b.otpVerified && (
                        <div className="inline-block mt-1 bg-lime-500/10 text-lime-400 text-[10px] font-black px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                          OTP: {b.otp}
                        </div>
                      )}
                      {b.notes && (
                        <div className="text-xs text-amber-500/80 italic mt-1 max-w-[200px] truncate" title={b.notes}>
                          "{b.notes}"
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div>📅 {b.date}</div>
                      <div className="text-xs font-semibold text-lime-400 mt-0.5">🕒 {b.slot}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div>{b.sport || "Football"}</div>
                      <div className="text-xs text-gray-500">{b.players} players</div>
                    </td>
                    <td className="py-4 px-6 font-bold text-white">₹{b.price}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
                          b.status === "pending"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : b.status === "confirmed" || b.status === "accepted"
                            ? "bg-lime-500/10 text-lime-400 border border-lime-500/20"
                            : b.status === "checked_in"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : b.status === "cancelled"
                            ? "bg-zinc-800 text-zinc-400 border border-zinc-700"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {b.status === "checked_in" ? "Checked In" : b.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {b.status === "pending" ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleStatusChange(b.id, "confirmed")}
                            className="bg-lime-500 hover:bg-lime-400 text-black px-3 py-1.5 rounded-lg text-xs font-bold transition"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleStatusChange(b.id, "rejected")}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                          >
                            Reject
                          </button>
                        </div>
                      ) : b.status === "confirmed" || b.status === "accepted" ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleInlineVerifyOTP(b.id, b.otp || "")}
                            className="bg-lime-500 hover:bg-lime-400 text-black px-3 py-1.5 rounded-lg text-xs font-bold transition"
                          >
                            Verify OTP
                          </button>
                          <button
                            onClick={() => handleStatusChange(b.id, "refunded")}
                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-700 transition"
                          >
                            Refund
                          </button>
                        </div>
                      ) : b.status === "cancelled" ? (
                        <button
                          onClick={() => handleStatusChange(b.id, "refunded")}
                          className="bg-lime-500/10 hover:bg-lime-500/20 text-lime-400 border border-lime-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                        >
                          Process Refund
                        </button>
                      ) : b.status === "checked_in" ? (
                        <span className="text-emerald-400 text-xs font-extrabold flex justify-end items-center gap-1">
                          ✅ Verified Check-in
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-xs italic">No actions available</span>
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
