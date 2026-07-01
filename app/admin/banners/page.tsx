"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { logAdminActivity } from "@/services/log.service";
import { db } from "@/firebase/firestore";
import { addDoc, collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import Button from "@/components/ui/Button";

type BannerData = {
  id?: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  link: string;
  isActive: boolean;
};

export default function BannersPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [link, setLink] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const snap = await getDocs(collection(db, "banners"));
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<BannerData, "id">),
      }));
      setBanners(data);
    } catch (error) {
      console.error(error);
      showToast("Failed to load banners", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !imageUrl.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        title,
        subtitle,
        imageUrl,
        link: link || "/turfs",
        isActive,
      };

      const docRef = await addDoc(collection(db, "banners"), payload);

      await logAdminActivity(
        user.uid,
        user.displayName || "Admin",
        "CREATE_BANNER",
        `Created banner offer ad titled: ${title}`
      );

      showToast("Banner ad listed successfully!", "success");
      setBanners((prev) => [...prev, { id: docRef.id, ...payload }]);
      setModalOpen(false);

      // Clear
      setTitle("");
      setSubtitle("");
      setImageUrl("");
      setLink("");
      setIsActive(true);
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Failed to create banner", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (bannerId: string, currentStatus: boolean, bannerTitle: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "banners", bannerId), {
        isActive: !currentStatus,
      });

      await logAdminActivity(
        user.uid,
        user.displayName || "Admin",
        "TOGGLE_BANNER_STATUS",
        `Toggled active status of banner ${bannerTitle} to ${!currentStatus}`
      );

      showToast("Banner status updated!", "success");
      setBanners((prev) =>
        prev.map((b) => (b.id === bannerId ? { ...b, isActive: !currentStatus } : b))
      );
    } catch (error) {
      console.error(error);
      showToast("Failed to update status", "error");
    }
  };

  const handleDeleteBanner = async (bannerId: string, bannerTitle: string) => {
    if (!user) return;
    const confirmDelete = confirm(`Are you sure you want to delete banner: ${bannerTitle}?`);
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "banners", bannerId));
      await logAdminActivity(
        user.uid,
        user.displayName || "Admin",
        "DELETE_BANNER",
        `Deleted banner ad titled: ${bannerTitle}`
      );

      showToast("Banner deleted successfully!", "success");
      setBanners((prev) => prev.filter((b) => b.id !== bannerId));
    } catch (error) {
      console.error(error);
      showToast("Failed to delete banner", "error");
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
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white">Banner Ads Manager</h1>
          <p className="text-gray-400 mt-2">Manage homepage slides, tournament offers, and custom marketing ads.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-lime-500 hover:bg-lime-400 text-black font-bold py-3 px-6 rounded-xl transition shadow-lg shadow-lime-500/10 cursor-pointer"
        >
          ➕ Add Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {banners.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 p-12 rounded-2xl text-center md:col-span-3">
            <p className="text-gray-400 text-lg">No banner ads listed. Click "Add Banner" to list marketing ads!</p>
          </div>
        ) : (
          banners.map((b) => (
            <div
              key={b.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-lime-500/20 transition duration-300 flex flex-col justify-between shadow-lg"
            >
              {/* Banner Image */}
              <div
                className="h-44 bg-cover bg-center bg-zinc-800 relative"
                style={{ backgroundImage: `url(${b.imageUrl})` }}
              >
                <button
                  onClick={() => b.id && handleToggleStatus(b.id, b.isActive, b.title)}
                  className={`absolute top-4 right-4 text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-full cursor-pointer ${
                    b.isActive
                      ? "bg-lime-500 text-black shadow-md shadow-lime-500/15"
                      : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                  }`}
                >
                  {b.isActive ? "Active" : "Disabled"}
                </button>
              </div>

              {/* Banner Content */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white leading-snug">{b.title}</h2>
                  <p className="text-zinc-500 text-xs mt-1 font-semibold">Subtitle: {b.subtitle || "N/A"}</p>
                  <p className="text-lime-400 text-xs font-bold mt-2 truncate font-mono">Link: {b.link}</p>
                </div>

                <div className="pt-4 border-t border-zinc-850 flex gap-2">
                  <button
                    onClick={() => b.id && handleDeleteBanner(b.id, b.title)}
                    className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Delete Banner
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl p-8 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white transition text-xl cursor-pointer"
            >
              ✕
            </button>

            <h2 className="text-2xl font-extrabold text-white mb-6">List Banner Offer Ad</h2>

            <form onSubmit={handleCreateBanner} className="space-y-5">
              <div>
                <label className="block text-zinc-400 text-xs font-semibold mb-2">Banner Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monsoon Tournament Ads"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-semibold mb-2">Subtitle / Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Get 20% cashback on bookings"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-semibold mb-2">Image URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/banner.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-semibold mb-2">Target Link (Defaults to /turfs)</label>
                <input
                  type="text"
                  placeholder="/turfs"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 text-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-lime-500 bg-zinc-800 border-zinc-700 rounded focus:ring-lime-500"
                />
                <label htmlFor="isActive" className="text-zinc-300 text-xs font-semibold select-none cursor-pointer">
                  Activate banner immediately
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl transition text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <Button type="submit" loading={submitting} className="flex-1 py-4 text-sm">
                  Add Banner
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
