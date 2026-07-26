"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getOwnerTurfs, TurfData } from "@/services/turf.service";
import { createOfflineBooking } from "@/services/booking.service";
import { useRouter } from "next/navigation";

const TIME_SLOTS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
  "20:00", "21:00", "22:00"
];

const SOURCES = ["Walk-in", "Phone Call", "WhatsApp"];
const PAYMENT_METHODS = ["Cash", "UPI", "Card"];

export default function OfflineBookingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [turfs, setTurfs] = useState<TurfData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [selectedTurfId, setSelectedTurfId] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [sport, setSport] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [source, setSource] = useState(SOURCES[0]);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [players, setPlayers] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchTurfs = async () => {
      try {
        const ownerTurfs = await getOwnerTurfs(user.uid);
        setTurfs(ownerTurfs);
        if (ownerTurfs.length > 0) {
          const firstTurf = ownerTurfs[0];
          setSelectedTurfId(firstTurf.id || "");
          if (firstTurf.sports && firstTurf.sports.length > 0) {
            setSport(firstTurf.sports[0]);
          }
          setPrice(firstTurf.price || "");
        }
      } catch (error) {
        console.error("Error loading turfs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTurfs();
  }, [user]);

  const selectedTurf = turfs.find(t => t.id === selectedTurfId);
  const turfSports = selectedTurf?.sports && selectedTurf.sports.length > 0 
    ? selectedTurf.sports 
    : ["Football", "Box Cricket", "Badminton"];

  const handleTurfChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tId = e.target.value;
    setSelectedTurfId(tId);
    const turf = turfs.find(t => t.id === tId);
    if (turf) {
      if (turf.sports && turf.sports.length > 0) {
        setSport(turf.sports[0]);
      } else {
        setSport("Football");
      }
      setPrice(turf.price || "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedTurf) return;
    
    if (!selectedTurfId || !date || !slot || !sport || !playerName || !mobile) {
      alert("Please fill in all required fields (Turf, Date, Slot, Sport, Name, Mobile).");
      return;
    }

    setSubmitting(true);
    
    try {
      const bookingData = {
        turfId: selectedTurf.id,
        turfName: selectedTurf.name,
        ownerId: user.uid,
        date,
        slot,
        sport,
        playerName,
        mobile,
        source,
        paymentMethod,
        notes,
        players: players ? Number(players) : 1,
        price: price !== "" ? Number(price) : selectedTurf.price,
      };

      const res = await createOfflineBooking(bookingData);
      
      if (res.success) {
        alert("Offline booking successfully added!");
        router.push("/owner/bookings");
      } else {
        alert("Failed to create booking: " + res.message);
      }
    } catch (error: any) {
      alert("An error occurred: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-4xl font-extrabold text-white">Add Offline Booking</h1>
        <p className="text-gray-400 mt-2">Instantly block slots for walk-ins, phone calls, or WhatsApp reservations.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Venue & Sport */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">📍 Venue & Activity</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Turf *</label>
              <select
                value={selectedTurfId}
                onChange={handleTurfChange}
                className="w-full bg-black border border-zinc-800 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-lime-500 transition font-semibold"
                required
              >
                {turfs.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Sport *</label>
              <div className="flex flex-wrap gap-2">
                {turfSports.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSport(s)}
                    className={`px-4 py-3 rounded-xl text-sm font-bold border transition ${
                      sport === s
                        ? "bg-lime-500 text-black border-lime-500"
                        : "bg-black text-gray-300 border-zinc-800 hover:border-lime-500/50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Date & Time */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">📅 Date & Time</h2>
          
          <div className="space-y-6">
            <div className="max-w-xs space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Date *</label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-black border border-zinc-800 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-lime-500 transition [color-scheme:dark] font-semibold"
                required
              />
            </div>

            {date && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Time Slot *</label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {TIME_SLOTS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSlot(s)}
                      className={`px-2 py-3 rounded-xl text-sm font-bold border transition ${
                        slot === s
                          ? "bg-lime-500 text-black border-lime-500 shadow-md shadow-lime-500/20 scale-105"
                          : "bg-black text-gray-300 border-zinc-800 hover:border-lime-500/50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Customer Details */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">👤 Customer Info</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Customer Name *</label>
              <input
                type="text"
                placeholder="Enter name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full bg-black border border-zinc-800 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-lime-500 transition"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mobile Number *</label>
              <input
                type="tel"
                placeholder="10-digit number"
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-black border border-zinc-800 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-lime-500 transition"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Players Count</label>
              <input
                type="number"
                placeholder="e.g. 10"
                min="1"
                value={players}
                onChange={(e) => setPlayers(e.target.value ? Number(e.target.value) : "")}
                className="w-full bg-black border border-zinc-800 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-lime-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Payment & Source */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">💳 Payment & Source</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left side: Buttons */}
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Booking Source *</label>
                <div className="flex flex-wrap gap-2">
                  {SOURCES.map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setSource(src)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition ${
                        source === src
                          ? "bg-zinc-100 text-black border-zinc-100"
                          : "bg-black text-gray-400 border-zinc-800 hover:border-zinc-500"
                      }`}
                    >
                      {src}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Method *</label>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_METHODS.map((pm) => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setPaymentMethod(pm)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition ${
                        paymentMethod === pm
                          ? "bg-lime-500 text-black border-lime-500"
                          : "bg-black text-gray-400 border-zinc-800 hover:border-lime-500/50"
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side: Amount & Notes */}
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Amount Paid (₹)</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                  className="w-full bg-black border border-zinc-800 text-lime-400 font-bold text-lg rounded-xl px-4 py-3.5 focus:outline-none focus:border-lime-500 transition"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Notes (Optional)</label>
                <textarea
                  placeholder="Any special requests or details..."
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-black border border-zinc-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-lime-500 transition resize-none"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-lime-500 hover:bg-lime-400 disabled:bg-lime-500/50 text-black font-extrabold text-lg py-5 rounded-2xl transition shadow-lg shadow-lime-500/20 active:scale-[0.99]"
        >
          {submitting ? "Processing Booking..." : "✅ Confirm Offline Booking"}
        </button>

      </form>
    </div>
  );
}
