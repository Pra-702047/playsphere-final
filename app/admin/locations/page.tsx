"use client";

import { useState, useEffect } from "react";
import { getAllLocations, addLocation, deleteLocation, LocationData } from "@/services/location.service";
import Link from "next/link";
import { MapPin, Trash2, Plus, ArrowLeft } from "lucide-react";

export default function AdminLocations() {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [newLocation, setNewLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadLocations = async () => {
    setLoading(true);
    const data = await getAllLocations();
    setLocations(data);
    setLoading(false);
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation.trim()) return;

    setAdding(true);
    setError("");
    
    // Simple client-side duplicate check
    if (locations.some(loc => loc.name.toLowerCase() === newLocation.trim().toLowerCase())) {
      setError("This location already exists.");
      setAdding(false);
      return;
    }

    const res = await addLocation(newLocation.trim());
    if (res.success) {
      setNewLocation("");
      await loadLocations();
    } else {
      setError("Failed to add location. Please try again.");
    }
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this location?")) return;
    
    setDeletingId(id);
    const res = await deleteLocation(id);
    if (res.success) {
      setLocations(locations.filter(loc => loc.id !== id));
    } else {
      alert("Failed to delete location");
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
          <h1 className="text-4xl font-extrabold text-white">Manage Locations</h1>
          <p className="text-gray-400 mt-2">Add or remove cities available in the platform's search dropdown.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Add Location Form */}
        <div className="md:col-span-1">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl sticky top-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Plus size={20} className="text-lime-400" /> Add New Location
            </h2>
            <form onSubmit={handleAddLocation} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 font-bold uppercase mb-2">City Name</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Nanded, Maharashtra"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-500 transition"
                  required
                />
              </div>
              
              {error && <p className="text-red-400 text-sm">{error}</p>}
              
              <button
                type="submit"
                disabled={adding || !newLocation.trim()}
                className="w-full bg-lime-400 hover:bg-lime-500 text-black font-black py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? "Adding..." : "Add Location"}
              </button>
            </form>
          </div>
        </div>

        {/* Locations List */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">Available Locations ({locations.length})</h2>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-lime-500"></div>
            </div>
          ) : locations.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center">
              <MapPin className="mx-auto text-zinc-600 mb-4" size={40} />
              <p className="text-zinc-400 text-lg">No locations added yet.</p>
              <p className="text-zinc-500 text-sm mt-1">Add a location from the panel to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {locations.map((loc) => (
                <div key={loc.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between group hover:border-zinc-700 transition">
                  <div className="flex items-center gap-3">
                    <div className="bg-zinc-950 p-2 rounded-lg">
                      <MapPin size={18} className="text-lime-400" />
                    </div>
                    <span className="font-semibold text-white">{loc.name}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(loc.id)}
                    disabled={deletingId === loc.id}
                    className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition disabled:opacity-50"
                    title="Delete location"
                  >
                    {deletingId === loc.id ? (
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
