"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getOwnerTurfs, updateTurf, TurfData } from "@/services/turf.service";

const TIME_SLOTS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", 
  "18:00", "19:00", "20:00"
];

export default function OwnerSlotsPage() {
  const { user } = useAuth();
  const [turfs, setTurfs] = useState<TurfData[]>([]);
  const [selectedTurf, setSelectedTurf] = useState<TurfData | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [holidayDate, setHolidayDate] = useState("");
  const [specialDate, setSpecialDate] = useState("");
  const [specialPrice, setSpecialPrice] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    loadTurfs();
  }, [user]);

  const loadTurfs = async () => {
    if (!user) return;
    try {
      const data = await getOwnerTurfs(user.uid);
      setTurfs(data);
      if (data.length > 0) {
        setSelectedTurf(data[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTurf = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const turf = turfs.find((t) => t.id === e.target.value);
    setSelectedTurf(turf || null);
    // Reset date configurations
    setSelectedDate("");
    setSelectedSlots([]);
    setHolidayDate("");
    setSpecialDate("");
    setSpecialPrice(0);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    setSelectedDate(dateStr);
    if (selectedTurf?.blockedSlots?.[dateStr]) {
      setSelectedSlots(selectedTurf.blockedSlots[dateStr]);
    } else {
      setSelectedSlots([]);
    }
  };

  const toggleSlotSelection = (slot: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const handleSaveBlockedSlots = async () => {
    if (!selectedTurf || !selectedTurf.id || !selectedDate) {
      alert("Please select a turf and a date");
      return;
    }

    const updatedBlockedSlots = {
      ...(selectedTurf.blockedSlots || {}),
      [selectedDate]: selectedSlots,
    };

    // Clean up empty slot arrays
    if (selectedSlots.length === 0) {
      delete updatedBlockedSlots[selectedDate];
    }

    try {
      const res = await updateTurf(selectedTurf.id, {
        blockedSlots: updatedBlockedSlots,
      });

      if (res.success) {
        alert("Blocked slots saved successfully!");
        setSelectedTurf({
          ...selectedTurf,
          blockedSlots: updatedBlockedSlots,
        });
      } else {
        alert("Error saving: " + res.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddHoliday = async () => {
    if (!selectedTurf || !selectedTurf.id || !holidayDate) {
      alert("Please select a holiday date");
      return;
    }

    const currentHolidays = selectedTurf.holidays || [];
    if (currentHolidays.includes(holidayDate)) {
      alert("This date is already marked as a holiday");
      return;
    }

    const updatedHolidays = [...currentHolidays, holidayDate].sort();

    try {
      const res = await updateTurf(selectedTurf.id, {
        holidays: updatedHolidays,
      });

      if (res.success) {
        alert("Holiday added successfully!");
        setSelectedTurf({
          ...selectedTurf,
          holidays: updatedHolidays,
        });
        setHolidayDate("");
      } else {
        alert("Error adding holiday: " + res.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveHoliday = async (dateToRemove: string) => {
    if (!selectedTurf || !selectedTurf.id) return;

    const updatedHolidays = (selectedTurf.holidays || []).filter((h) => h !== dateToRemove);

    try {
      const res = await updateTurf(selectedTurf.id, {
        holidays: updatedHolidays,
      });

      if (res.success) {
        alert("Holiday removed successfully!");
        setSelectedTurf({
          ...selectedTurf,
          holidays: updatedHolidays,
        });
      } else {
        alert("Error: " + res.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSpecialPrice = async () => {
    if (!selectedTurf || !selectedTurf.id || !specialDate || !specialPrice) {
      alert("Please select a date and enter a valid custom price");
      return;
    }

    const updatedSpecialRates = {
      ...(selectedTurf.specialRates || {}),
      [specialDate]: Number(specialPrice),
    };

    try {
      const res = await updateTurf(selectedTurf.id, {
        specialRates: updatedSpecialRates,
      });

      if (res.success) {
        alert("Special price configured successfully!");
        setSelectedTurf({
          ...selectedTurf,
          specialRates: updatedSpecialRates,
        });
        setSpecialDate("");
        setSpecialPrice(0);
      } else {
        alert("Error: " + res.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveSpecialPrice = async (dateToRemove: string) => {
    if (!selectedTurf || !selectedTurf.id) return;

    const updatedSpecialRates = { ...(selectedTurf.specialRates || {}) };
    delete updatedSpecialRates[dateToRemove];

    try {
      const res = await updateTurf(selectedTurf.id, {
        specialRates: updatedSpecialRates,
      });

      if (res.success) {
        alert("Special price configuration removed successfully!");
        setSelectedTurf({
          ...selectedTurf,
          specialRates: updatedSpecialRates,
        });
      } else {
        alert("Error: " + res.message);
      }
    } catch (err) {
      console.error(err);
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
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-white">Slot & Pricing Settings</h1>
        <p className="text-gray-400 mt-2">Block dates, set holiday times, or adjust slot pricing for premium days.</p>
      </div>

      {/* Turf Selector */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <label className="block text-zinc-400 font-semibold text-sm mb-1">Select Turf Property</label>
          <span className="text-zinc-500 text-xs">Choose which venue configurations to view or edit</span>
        </div>
        <select
          value={selectedTurf?.id || ""}
          onChange={handleSelectTurf}
          className="w-full md:w-80 p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500"
        >
          {turfs.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} (Base: ₹{t.price}/hr)
            </option>
          ))}
        </select>
      </div>

      {!selectedTurf ? (
        <div className="text-center py-10 bg-zinc-900 rounded-2xl border border-zinc-800">
          <p className="text-gray-400">Please add a turf first under the Turf Management page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Block Slots Panel */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">🚫 Block Slots</h2>
              <p className="text-xs text-zinc-500 mt-1">Temporarily block specific hours on a date (e.g. for coaching/maintenance)</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-2">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 text-sm"
                />
              </div>

              {selectedDate && (
                <div className="space-y-3">
                  <label className="block text-gray-400 text-xs font-semibold">Select Hours to Block</label>
                  <div className="grid grid-cols-2 gap-2">
                    {TIME_SLOTS.map((slot) => {
                      const isBlocked = selectedSlots.includes(slot);
                      return (
                        <button
                          key={slot}
                          onClick={() => toggleSlotSelection(slot)}
                          className={`p-2 rounded-lg text-xs font-bold transition text-center ${
                            isBlocked
                              ? "bg-red-500 text-white border border-red-500"
                              : "bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-lime-500"
                          }`}
                        >
                          {slot} {isBlocked ? "(Blocked)" : ""}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleSaveBlockedSlots}
                    className="w-full bg-lime-500 hover:bg-lime-400 text-black font-bold py-3 rounded-xl transition text-sm mt-4"
                  >
                    Save Slot Settings
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Holiday Settings */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">🏖️ Holiday Settings</h2>
              <p className="text-xs text-zinc-500 mt-1">Mark entire days off to prevent all booking submissions</p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-2">
                <input
                  type="date"
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  className="flex-1 p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 text-sm"
                />
                <button
                  onClick={handleAddHoliday}
                  className="bg-lime-500 hover:bg-lime-400 text-black px-4 rounded-xl font-bold text-xs"
                >
                  Add
                </button>
              </div>

              {/* Holiday list */}
              <div>
                <h3 className="text-gray-400 text-xs font-semibold mb-3">Marked Holidays</h3>
                {(!selectedTurf.holidays || selectedTurf.holidays.length === 0) ? (
                  <p className="text-zinc-500 text-xs italic">No holidays configured.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedTurf.holidays.map((h) => (
                      <div
                        key={h}
                        className="bg-zinc-800 border border-zinc-700 px-3 py-2 rounded-lg flex justify-between items-center text-xs"
                      >
                        <span className="text-white font-medium">📅 {h}</span>
                        <button
                          onClick={() => handleRemoveHoliday(h)}
                          className="text-red-400 hover:text-red-300 font-bold px-2"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Special Pricing */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">⚡ Special Pricing</h2>
              <p className="text-xs text-zinc-500 mt-1">Configure premium rates for holiday seasons or event periods</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <input
                  type="date"
                  value={specialDate}
                  onChange={(e) => setSpecialDate(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 text-sm"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Custom Price (₹)"
                    value={specialPrice || ""}
                    onChange={(e) => setSpecialPrice(Number(e.target.value))}
                    className="flex-1 p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 text-sm"
                  />
                  <button
                    onClick={handleSaveSpecialPrice}
                    className="bg-lime-500 hover:bg-lime-400 text-black px-4 rounded-xl font-bold text-xs"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Special Rates List */}
              <div>
                <h3 className="text-gray-400 text-xs font-semibold mb-3">Custom Rates Applied</h3>
                {(!selectedTurf.specialRates || Object.keys(selectedTurf.specialRates).length === 0) ? (
                  <p className="text-zinc-500 text-xs italic">No special rates configured.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {Object.entries(selectedTurf.specialRates).map(([date, price]) => (
                      <div
                        key={date}
                        className="bg-zinc-800 border border-zinc-700 px-3 py-2 rounded-lg flex justify-between items-center text-xs"
                      >
                        <span className="text-white font-medium">📅 {date}</span>
                        <span className="text-lime-400 font-bold">₹{price}/hr</span>
                        <button
                          onClick={() => handleRemoveSpecialPrice(date)}
                          className="text-red-400 hover:text-red-300 font-bold px-2"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
