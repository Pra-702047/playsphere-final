"use client";

import { useState, useEffect } from "react";
import { getAllSports, addSport, deleteSport, SportData } from "@/services/sport.service";
import Link from "next/link";
import { Trash2, Plus, ArrowLeft } from "lucide-react";

export default function AdminSports() {
  const [sports, setSports] = useState<SportData[]>([]);
  const [newSport, setNewSport] = useState("");
  const [newEmoji, setNewEmoji] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadSports = async () => {
    setLoading(true);
    const data = await getAllSports();
    setSports(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSports();
  }, []);

  const handleAddSport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSport.trim() || !newEmoji.trim()) return;

    setAdding(true);
    setError("");
    
    // Simple client-side duplicate check
    if (sports.some(sport => sport.name.toLowerCase() === newSport.trim().toLowerCase())) {
      setError("This sport already exists.");
      setAdding(false);
      return;
    }

    const res = await addSport(newSport.trim(), newEmoji.trim());
    if (res.success) {
      setNewSport("");
      setNewEmoji("");
      await loadSports();
    } else {
      setError("Failed to add sport. Please try again.");
    }
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sport?")) return;
    
    setDeletingId(id);
    const res = await deleteSport(id);
    if (res.success) {
      setSports(sports.filter(sport => sport.id !== id));
    } else {
      alert("Failed to delete sport");
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-8 font-sans pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin" className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 transition">
          <ArrowLeft className="text-white" size={20} />
        </Link>
        <div>
          <h1 className="text-4xl font-extrabold text-white">Manage Sports</h1>
          <p className="text-gray-400 mt-2">Add or remove sports available in the platform's search filter.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Add Sport Form */}
        <div className="md:col-span-1">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl sticky top-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Plus size={20} className="text-lime-400" /> Add New Sport
            </h2>
            <form onSubmit={handleAddSport} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 font-bold uppercase mb-2">Emoji Icon</label>
                <input
                  type="text"
                  value={newEmoji}
                  onChange={(e) => setNewEmoji(e.target.value)}
                  placeholder="e.g. 🏏"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 font-bold uppercase mb-2">Sport Name</label>
                <input
                  type="text"
                  value={newSport}
                  onChange={(e) => setNewSport(e.target.value)}
                  placeholder="e.g. Cricket"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-500 transition"
                  required
                />
              </div>
              
              {error && <p className="text-red-400 text-sm">{error}</p>}
              
              <button
                type="submit"
                disabled={adding || !newSport.trim() || !newEmoji.trim()}
                className="w-full bg-lime-400 hover:bg-lime-500 text-black font-black py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? "Adding..." : "Add Sport"}
              </button>
            </form>
          </div>
        </div>

        {/* Sports List */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">Available Sports ({sports.length})</h2>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-lime-500"></div>
            </div>
          ) : sports.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center">
              <p className="text-zinc-400 text-lg">No sports added yet.</p>
              <p className="text-zinc-500 text-sm mt-1">Add a sport from the panel to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sports.map((sport) => (
                <div key={sport.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between group hover:border-zinc-700 transition">
                  <div className="flex items-center gap-3">
                    <div className="bg-zinc-950 p-2 rounded-lg text-xl">
                      {sport.emoji}
                    </div>
                    <span className="font-semibold text-white">{sport.name}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(sport.id)}
                    disabled={deletingId === sport.id}
                    className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition disabled:opacity-50"
                    title="Delete sport"
                  >
                    {deletingId === sport.id ? (
                      <div className="animate-spin h-5 w-5 border-2 border-zinc-500 border-t-transparent rounded-full" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
