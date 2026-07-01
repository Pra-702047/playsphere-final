"use client";

import { useEffect, useState } from "react";
import { getAllTurfs, verifyTurf, deleteTurf, TurfData } from "@/services/turf.service";
import { getAllUsers, UserProfile } from "@/services/user.service";

export default function AdminTurfsPage() {
  const [turfs, setTurfs] = useState<TurfData[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all' | 'verified' | 'unverified'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const turfData = await getAllTurfs();
      const userData = await getAllUsers();
      setTurfs(turfData);
      setUsers(userData);
    } catch (err) {
      console.error("Error loading turf listings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToggle = async (turfId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const confirmChange = confirm(
      newStatus
        ? "Are you sure you want to verify this turf? It will show a verified badge to players."
        : "Are you sure you want to revoke verification for this turf?"
    );
    if (!confirmChange) return;

    try {
      const res = await verifyTurf(turfId, newStatus);
      if (res.success) {
        alert(newStatus ? "Turf verified successfully!" : "Verification revoked.");
        setTurfs((prev) =>
          prev.map((t) => (t.id === turfId ? { ...t, isVerified: newStatus } : t))
        );
      } else {
        alert("Failed to update verification status: " + res.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTurf = async (turfId: string) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this turf permanently? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      const res = await deleteTurf(turfId);
      if (res.success) {
        alert("Turf deleted successfully!");
        setTurfs((prev) => prev.filter((t) => t.id !== turfId));
      } else {
        alert("Failed to delete turf: " + res.message);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting the turf.");
    }
  };

  const getOwnerDetails = (ownerId: string) => {
    const owner = users.find((u) => u.uid === ownerId);
    return owner ? `${owner.name} (${owner.email})` : "Unknown Owner";
  };

  const filteredTurfs = turfs.filter((t) => {
    if (filter === "verified") return t.isVerified;
    if (filter === "unverified") return !t.isVerified;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-white">Turf Verification</h1>
        <p className="text-gray-400 mt-2">Approve newly listed sports grounds and toggle verified badges for client trust.</p>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex justify-between items-center">
        <div>
          <span className="text-zinc-400 font-semibold text-sm">Filter Listings</span>
        </div>
        <div className="flex bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 gap-1">
          {["all", "verified", "unverified"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition uppercase tracking-wider ${
                filter === f ? "bg-lime-500 text-black" : "text-zinc-400 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Turfs Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
        {filteredTurfs.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No turfs listed under this category.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-gray-400 text-sm bg-zinc-950/40">
                  <th className="py-4 px-6">Turf Detail</th>
                  <th className="py-4 px-6">Owner Account</th>
                  <th className="py-4 px-6">Base Rate</th>
                  <th className="py-4 px-6">Amenities Available</th>
                  <th className="py-4 px-6">Verification</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {filteredTurfs.map((t) => (
                  <tr key={t.id} className="text-gray-300 text-sm hover:bg-zinc-950/10">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white">{t.name}</div>
                      <div className="text-xs text-gray-500">📍 {t.location}</div>
                      <div className="text-xs text-zinc-500 mt-1 line-clamp-1 max-w-[220px]" title={t.description}>
                        {t.description}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs font-medium text-zinc-400">
                      {getOwnerDetails(t.ownerId)}
                    </td>
                    <td className="py-4 px-6 font-bold text-white">₹{t.price}/hr</td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {t.amenities?.map((a, i) => (
                          <span key={i} className="bg-zinc-800 text-zinc-400 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded">
                            {a}
                          </span>
                        )) || <span className="text-zinc-500 text-xs italic">Default</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
                          t.isVerified
                            ? "bg-lime-500/10 text-lime-400 border border-lime-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {t.isVerified ? "✓ Verified" : "⚠️ Unverified"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {t.id && (
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => handleVerifyToggle(t.id!, t.isVerified || false)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-md whitespace-nowrap ${
                              t.isVerified
                                ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20"
                                : "bg-lime-500 hover:bg-lime-400 text-black shadow-lime-500/5"
                            }`}
                          >
                            {t.isVerified ? "Revoke Verification" : "Approve & Verify"}
                          </button>
                          <button
                            onClick={() => handleDeleteTurf(t.id!)}
                            className="px-4 py-2 rounded-xl text-xs font-bold transition shadow-md bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                          >
                            Delete
                          </button>
                        </div>
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
