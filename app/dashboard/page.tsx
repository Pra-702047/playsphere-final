"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Dialog from "@/components/ui/Dialog";
import { getUserBookings, cancelBooking } from "@/services/booking.service";
import { createReview } from "@/services/review.service";
import { getAllTurfs, TurfData } from "@/services/turf.service";
import { getUserFavorites, toggleFavorite } from "@/services/favorite.service";
import { getUserNotifications, markNotificationAsRead, NotificationData } from "@/services/notification.service";
import { doc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { auth } from "@/firebase/auth";
import { db } from "@/firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import TurfCard from "@/components/turfs/TurfCard";

const TIME_SLOTS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", 
  "18:00", "19:00", "20:00"
];

export default function UserDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [bookings, setBookings] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [allTurfs, setAllTurfs] = useState<TurfData[]>([]);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"bookings" | "profile" | "favorites" | "notifications" | "calendar">("bookings");

  // Profile Form State
  const [name, setName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Rate/Review Dialog State
  const [rateOpen, setRateOpen] = useState(false);
  const [rateBooking, setRateBooking] = useState<any | null>(null);
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [savingReview, setSavingReview] = useState(false);

  // Invoice Dialog State
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceBooking, setInvoiceBooking] = useState<any | null>(null);

  useEffect(() => {
    if (!user) return;
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      const userBookings = await getUserBookings(user.uid);
      const userFavs = await getUserFavorites(user.uid);
      const turfsList = await getAllTurfs();
      const notifsList = await getUserNotifications(user.uid);

      setBookings(userBookings);
      setFavorites(userFavs);
      setAllTurfs(turfsList);
      setNotifications(notifsList);
      setName(user.displayName || "");
    } catch (err) {
      console.error(err);
      showToast("Failed to load dashboard statistics", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;

    setSavingProfile(true);
    try {
      // 1. Update Auth Profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
      }
      // 2. Update Firestore User Doc
      await updateDoc(doc(db, "users", user.uid), {
        name,
      });

      showToast("Profile updated successfully!", "success");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to update profile", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    const confirmCancel = confirm("Are you sure you want to cancel this booking? Refunds will be initiated accordingly.");
    if (!confirmCancel) return;

    try {
      const res = await cancelBooking(bookingId);
      if (res.success) {
        showToast("Booking cancelled successfully!", "success");
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
        );
      } else {
        showToast(res.message, "error");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenRate = (booking: any) => {
    setRateBooking(booking);
    setRatingVal(5);
    setReviewComment("");
    setRateOpen(true);
  };

  const handleSaveReview = async () => {
    if (!rateBooking) return;
    if (!reviewComment.trim()) {
      showToast("Please write a review comment", "warning");
      return;
    }

    setSavingReview(true);
    try {
      const res = await createReview({
        turfId: rateBooking.turfId,
        userId: user!.uid,
        playerName: rateBooking.playerName || user!.displayName || "Anonymous Player",
        rating: ratingVal,
        comment: reviewComment,
        createdAt: new Date(),
      });

      if (res.success) {
        showToast("Review submitted successfully!", "success");
        setRateOpen(false);
      } else {
        showToast(res.message || "Failed to submit review", "error");
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Error submitting review", "error");
    } finally {
      setSavingReview(false);
    }
  };

  const handleOpenInvoice = (booking: any) => {
    setInvoiceBooking(booking);
    setInvoiceOpen(true);
  };

  const handlePrintInvoice = () => {
    const printContent = document.getElementById("invoice-print-area")?.innerHTML;
    if (!printContent) return;

    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // reload state
  };

  const handleMarkNotifRead = async (id: string) => {
    try {
      const res = await markNotificationAsRead(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveFavorite = async (turfId: string) => {
    if (!user) return;
    try {
      const res = await toggleFavorite(user.uid, turfId, true);
      if (res.success) {
        showToast("Removed from favorites", "success");
        setFavorites((prev) => prev.filter((id) => id !== turfId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  // Calculate statistics
  const totalBookings = bookings.length;
  const activeBookings = bookings.filter((b) => b.status === "confirmed" || b.status === "pending").length;
  
  const totalSpent = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + (typeof b.price === "number" ? b.price : Number(b.price || 0)), 0);

  const favoritedTurfs = allTurfs.filter((t) => favorites.includes(t.id || ""));
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  // Profile completion progress calculations
  const profileFields = [user?.displayName, user?.email, name || user?.displayName];
  const filledFieldsCount = profileFields.filter(Boolean).length;
  const profileCompletion = Math.min(100, Math.round(((filledFieldsCount + (bookings.length > 0 ? 1 : 0)) / 4) * 100));

  // Get recommended top-rated turfs
  const recommendedTurfs = allTurfs
    .filter((t) => t.isVerified || (t.avgRating && t.avgRating >= 4.5))
    .slice(0, 3);

  // Calendar timeline helpers
  const getBookingsForDate = (dateStr: string) => {
    return bookings.filter((b) => b.date === dateStr && (b.status === "confirmed" || b.status === "accepted"));
  };

  const getUpcoming7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d.toISOString().split("T")[0]);
    }
    return days;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 space-y-12">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-zinc-900 pb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">👋 Welcome Back, {user?.displayName || "Player"}</h1>
            <p className="text-gray-400 mt-1">Check your bookings, edit your profile details, and track your invoices.</p>
          </div>
          
          <div className="w-full md:w-64 bg-zinc-900 border border-zinc-800 p-4.5 rounded-2xl flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs font-bold mb-2">
              <span className="text-zinc-400 uppercase tracking-wider text-[10px]">Profile Completion</span>
              <span className="text-lime-400 font-mono font-black">{profileCompletion}%</span>
            </div>
            <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800/80">
              <div
                className="bg-lime-400 h-full rounded-full transition-all duration-1000"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-lime-500">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Total Bookings</p>
            <p className="text-3xl font-extrabold mt-2">{totalBookings}</p>
          </Card>
          <Card>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Active Bookings</p>
            <p className="text-3xl font-extrabold mt-2">{activeBookings}</p>
          </Card>
          <Card>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Total Spent</p>
            <p className="text-3xl font-extrabold text-lime-400 mt-2">₹{totalSpent.toLocaleString("en-IN")}</p>
          </Card>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-900 gap-2 max-w-2xl overflow-x-auto">
          {(["bookings", "calendar", "favorites", "notifications", "profile"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeTab === tab
                  ? "bg-lime-400 text-black shadow-md shadow-lime-400/5"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {tab === "bookings" && "📅 Bookings"}
              {tab === "calendar" && "🗓️ Schedule"}
              {tab === "profile" && "👤 Profile"}
              {tab === "favorites" && "❤️ Favorites"}
              {tab === "notifications" && "🔔 Alerts"}
              
              {tab === "notifications" && unreadNotifs > 0 && (
                <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                  {unreadNotifs}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="min-h-[40vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {/* BOOKINGS TAB */}
              {activeTab === "bookings" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">My Bookings logs</h2>
                  
                  {bookings.length === 0 ? (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center text-zinc-500 italic">
                      No bookings recorded yet. Navigate to "Turfs" to request slots!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {bookings.map((b) => (
                        <Card key={b.id} className="relative flex flex-col justify-between h-full hover:border-lime-500/10 transition">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <h3 className="text-xl font-bold text-white">{b.turfName || "Sports Turf"}</h3>
                              <span
                                className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                  b.status === "pending"
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    : b.status === "confirmed" || b.status === "accepted"
                                    ? "bg-lime-500/10 text-lime-400 border-lime-500/20"
                                    : "bg-red-500/10 text-red-400 border-red-500/20"
                                }`}
                              >
                                {b.status}
                              </span>
                            </div>
                            
                            <div className="text-sm text-zinc-400 space-y-1">
                              <p>📅 Date: <span className="text-white font-semibold">{b.date}</span></p>
                              <p>🕒 Slot: <span className="text-lime-400 font-semibold">{b.slot}</span></p>
                              <p>🏆 Sport: <span className="text-white">{b.sport}</span></p>
                              <p>💰 Price: <span className="text-white font-semibold">₹{b.price}</span></p>
                            </div>
                          </div>

                          {/* Action panel */}
                          <div className="flex gap-2 mt-6 pt-4 border-t border-zinc-800/80">
                            {b.status === "confirmed" && (
                              <>
                                <button
                                  onClick={() => handleOpenInvoice(b)}
                                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-2 rounded-xl text-xs font-semibold border border-zinc-700 transition"
                                >
                                  📄 Invoice
                                </button>
                                <button
                                  onClick={() => handleOpenRate(b)}
                                  className="flex-1 bg-lime-500/10 hover:bg-lime-500/20 text-lime-400 border border-lime-500/20 px-3 py-2 rounded-xl text-xs font-bold transition"
                                >
                                  ⭐ Rate Turf
                                </button>
                              </>
                            )}
                            
                            {b.status !== "cancelled" && b.status !== "rejected" && b.status !== "refunded" && (
                              <button
                                  onClick={() => handleCancel(b.id)}
                                  className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-2 rounded-xl text-xs font-bold transition"
                                >
                                  Cancel
                              </button>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PROFILE TAB */}
              {activeTab === "profile" && (
                <div className="max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
                  <h2 className="text-2xl font-bold">Profile Details</h2>
                  
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="block text-zinc-400 text-xs font-semibold mb-2">Display Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-550 text-xs font-semibold mb-2">Email Address (Read-Only)</label>
                      <input
                        type="email"
                        disabled
                        value={user?.email || ""}
                        className="w-full p-4 rounded-xl bg-zinc-950 border border-zinc-855 text-zinc-500 outline-none text-sm cursor-not-allowed"
                      />
                    </div>
                    
                    <Button type="submit" loading={savingProfile} className="w-full mt-2 py-4">
                      Save Profile Updates
                    </Button>
                  </form>
                </div>
              )}

              {/* CALENDAR TAB */}
              {activeTab === "calendar" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold">🗓️ Schedule Calendar</h2>
                    <p className="text-zinc-400 text-sm mt-1">Track your upcoming play sessions over the next 7 days.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                    {getUpcoming7Days().map((dayStr) => {
                      const dayBookings = getBookingsForDate(dayStr);
                      const parsedDate = new Date(dayStr);
                      const isToday = new Date().toISOString().split("T")[0] === dayStr;

                      return (
                        <div
                          key={dayStr}
                          className={`bg-zinc-900/55 border rounded-2xl p-4 flex flex-col justify-between h-44 text-left transition duration-300 ${
                            isToday ? "border-lime-400/80 bg-zinc-905 shadow-[0_0_15px_rgba(163,230,53,0.05)]" : "border-zinc-800"
                          }`}
                        >
                          <div>
                            <span className="block text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest leading-none">
                              {parsedDate.toLocaleDateString("en-US", { weekday: "short" })}
                            </span>
                            <span className="block text-xl font-black text-white mt-1">
                              {parsedDate.getDate()}
                            </span>
                          </div>

                          <div className="flex-1 mt-3 space-y-1.5 overflow-y-auto max-h-24 pr-1">
                            {dayBookings.length === 0 ? (
                              <span className="text-[10px] text-zinc-600 italic">No bookings</span>
                            ) : (
                              dayBookings.map((b) => (
                                <div
                                  key={b.id}
                                  className="bg-lime-500/10 border border-lime-500/20 text-lime-400 p-1.5 rounded-lg text-[9px] font-bold leading-tight"
                                >
                                  <p className="truncate">{b.turfName}</p>
                                  <p className="font-mono mt-0.5">{b.slot}</p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* FAVORITES TAB */}
              {activeTab === "favorites" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Liked Turf Properties</h2>
                  
                  {favoritedTurfs.length === 0 ? (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center text-zinc-500 italic">
                      No liked turfs found yet. Browse venues and like them to add here!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {favoritedTurfs.map((t) => (
                        <div key={t.id} className="relative group">
                          <button
                            onClick={() => handleRemoveFavorite(t.id!)}
                            className="absolute top-4 right-4 z-20 bg-black/60 hover:bg-black text-red-500 border border-zinc-800/80 p-2 rounded-full transition text-xs cursor-pointer"
                            title="Remove from favorites"
                          >
                            ❤️
                          </button>
                          <TurfCard
                            id={t.id!}
                            name={t.name}
                            location={t.location}
                            price={t.price}
                            imageUrl={t.imageUrl}
                            isVerified={t.isVerified}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">System Alerts</h2>
                  
                  {notifications.length === 0 ? (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center text-zinc-500 italic">
                      No notification messages.
                    </div>
                  ) : (
                    <div className="space-y-4 max-w-2xl">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => !n.read && handleMarkNotifRead(n.id!)}
                          className={`p-5 rounded-2xl border transition duration-300 flex justify-between items-start gap-4 ${
                            n.read
                              ? "bg-zinc-955 border-zinc-900 text-zinc-400"
                              : "bg-zinc-900 border-zinc-800 text-white cursor-pointer hover:border-lime-500/20"
                          }`}
                        >
                          <div>
                            <h4 className="font-bold text-sm">{n.title}</h4>
                            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{n.message}</p>
                          </div>
                          {!n.read && (
                            <span className="w-2.5 h-2.5 bg-lime-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Recommended Turfs Feed */}
        <div className="space-y-6 pt-12 border-t border-zinc-900">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">🏟️ Recommended Venues</h2>
              <p className="text-zinc-500 text-sm mt-0.5">Top-rated venues recommended for you based on ratings and availability.</p>
            </div>
            <a href="/turfs" className="text-lime-400 text-sm font-bold hover:underline">
              View All Turfs &gt;
            </a>
          </div>
          {recommendedTurfs.length === 0 ? (
            <div className="text-zinc-550 italic text-sm">No recommended venues found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedTurfs.map((turfItem) => (
                <TurfCard
                  key={turfItem.id}
                  id={turfItem.id!}
                  name={turfItem.name}
                  location={turfItem.location}
                  price={turfItem.price}
                  imageUrl={turfItem.imageUrl}
                  isVerified={turfItem.isVerified}
                  avgRating={turfItem.avgRating}
                  ratingCount={turfItem.ratingCount}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Rate Turf Modal */}
      <Dialog
        isOpen={rateOpen}
        onClose={() => setRateOpen(false)}
        title={`Rate ${rateBooking?.turfName || "Turf"}`}
      >
        <div className="space-y-6">
          <p className="text-xs text-zinc-400">
            Share your playing experience at this venue to help other players.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-zinc-400 text-xs font-semibold">Rating:</span>
              <div className="flex gap-1.5 text-2xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingVal(star)}
                    className={`transition cursor-pointer ${
                      ratingVal >= star ? "text-lime-400" : "text-zinc-700"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-semibold mb-2">Write Review</label>
              <textarea
                rows={4}
                placeholder="How was the turf quality, lighting, and amenities?"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              onClick={() => setRateOpen(false)}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl transition text-sm"
            >
              Cancel
            </button>
            <Button
              onClick={handleSaveReview}
              loading={savingReview}
              className="flex-1 py-4"
            >
              Submit Review
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Invoice Modal */}
      <Dialog
        isOpen={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        title="Payment Receipt"
        maxWidth="lg"
      >
        {invoiceBooking && (
          <div className="space-y-6">
            <div id="invoice-print-area" className="bg-white text-black p-8 rounded-2xl space-y-8 font-sans">
              <div className="flex justify-between items-start border-b border-zinc-200 pb-6">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-black">PlaySphere Receipt</h1>
                  <p className="text-xs text-zinc-500 mt-1">Generated electronically upon booking</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-zinc-800">Booking Receipt</p>
                  <p className="text-xs text-zinc-500 mt-0.5">ID: {invoiceBooking.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 text-xs text-zinc-700 leading-relaxed">
                <div>
                  <h4 className="font-bold text-black uppercase tracking-wider mb-2">Billed To:</h4>
                  <p className="font-semibold text-zinc-900">{invoiceBooking.playerName}</p>
                  <p>{invoiceBooking.userEmail}</p>
                  <p>📞 {invoiceBooking.mobile}</p>
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-black uppercase tracking-wider mb-2">Venue Details:</h4>
                  <p className="font-semibold text-zinc-900">{invoiceBooking.turfName}</p>
                  <p>Sport: {invoiceBooking.sport}</p>
                  <p>Date: {invoiceBooking.date} • {invoiceBooking.slot}</p>
                </div>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500">
                    <th className="py-2">Description</th>
                    <th className="py-2 text-right">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-100 text-zinc-800 font-medium">
                    <td className="py-3">Court Booking Hourly Fee ({invoiceBooking.slot})</td>
                    <td className="py-3 text-right">₹{invoiceBooking.price}</td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-end pt-4">
                <div className="text-right space-y-1.5">
                  <p className="text-xs text-zinc-500">Subtotal: ₹{invoiceBooking.price}</p>
                  <p className="text-xs text-zinc-500">Taxes (GST 18%): Included</p>
                  <p className="text-lg font-bold text-black">Total Paid: ₹{invoiceBooking.price}</p>
                </div>
              </div>

              <div className="border-t border-zinc-200 pt-6 text-center text-[10px] text-zinc-500">
                PlaySphere Platform Service. Thank you for playing! ⚽🏏🏸
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setInvoiceOpen(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl transition text-sm"
              >
                Close
              </button>
              <Button onClick={handlePrintInvoice} className="flex-1 py-4">
                🖨️ Print / Download PDF
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      <Footer />
    </div>
  );
}