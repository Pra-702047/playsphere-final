"use client";

import React, { useEffect, useState, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import BookingForm from "@/components/booking/BookingForm";
import TurfCard from "@/components/turfs/TurfCard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getTurfById, getAllTurfs, TurfData } from "@/services/turf.service";
import { getTurfReviews, createReview, ReviewData } from "@/services/review.service";
import { getUserFavorites, toggleFavorite } from "@/services/favorite.service";
import { motion, AnimatePresence } from "framer-motion";

export default function TurfDetailsPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(paramsPromise);
  const { user } = useAuth();
  const { showToast } = useToast();

  const [turf, setTurf] = useState<TurfData | null>(null);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [similarTurfs, setSimilarTurfs] = useState<TurfData[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  // Gallery slideshow state
  const [activeImage, setActiveImage] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // Tab State
  const [activeTab, setActiveTab] = useState<"overview" | "facilities" | "map" | "reviews">("overview");

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadTurfDetails();
  }, [id, user]);

  const loadTurfDetails = async () => {
    try {
      const data = await getTurfById(id);
      if (!data) {
        setLoading(false);
        return;
      }
      setTurf(data);
      
      // Set gallery images (combining primary and additional images)
      const images = Array.from(
        new Set([data.imageUrl, ...(data.images || [])].filter(Boolean))
      ) as string[];
      setGalleryImages(images);
      setActiveImage(images[0] || "");

      // Load reviews
      const turfReviews = await getTurfReviews(id);
      setReviews(turfReviews);

      // Load favorites status
      if (user) {
        const favs = await getUserFavorites(user.uid);
        setIsLiked(favs.includes(id));
      }

      // Load similar turfs
      const all = await getAllTurfs();
      const filtered = all
        .filter((t) => t.id !== id && t.isVerified)
        .slice(0, 3);
      setSimilarTurfs(filtered);
    } catch (err) {
      console.error(err);
      showToast("Failed to load turf details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async () => {
    if (!user) {
      showToast("Please log in to like this turf", "warning");
      return;
    }

    try {
      const res = await toggleFavorite(user.uid, id, isLiked);
      if (res.success) {
        setIsLiked(!isLiked);
        showToast(isLiked ? "Removed from favorites" : "Added to favorites!", "success");
      } else {
        showToast("Error updating favorite status", "error");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast("Please log in to leave a review", "warning");
      return;
    }

    if (!comment.trim()) {
      showToast("Please enter a comment", "warning");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await createReview({
        turfId: id,
        userId: user.uid,
        playerName: user.displayName || "Anonymous Player",
        rating,
        comment,
        createdAt: new Date(),
      });

      if (res.success) {
        showToast("Review submitted successfully!", "success");
        setComment("");
        setRating(5);
        // Reload reviews and turf to fetch updated rating aggregates
        loadTurfDetails();
      } else {
        showToast(res.message, "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to submit review", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  if (!turf) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-between">
        <Navbar />
        <div className="text-center py-20">
          <h1 className="text-3xl font-extrabold">Turf Listing Not Found</h1>
          <p className="text-gray-400 mt-2">The link might be expired or removed by admins.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT: Gallery, details tabs */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Gallery slideshow */}
            <div className="space-y-4">
              <div
                className="h-[450px] bg-cover bg-center rounded-3xl relative border border-zinc-800 shadow-2xl overflow-hidden group"
                style={{ backgroundImage: `url(${activeImage})` }}
              >
                {/* Badge Overlay */}
                <div className="absolute top-6 left-6 z-10 flex gap-2">
                  <span
                    className={`inline-block px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                      turf.isVerified
                        ? "bg-lime-500 text-black shadow-md shadow-lime-500/10"
                        : "bg-zinc-800/90 text-zinc-400 border border-zinc-700 backdrop-blur-xs"
                    }`}
                  >
                    {turf.isVerified ? "✓ Verified" : "⚠️ Unverified"}
                  </span>
                </div>

                {/* Favorite Toggler */}
                <button
                  onClick={handleLikeToggle}
                  className="absolute top-6 right-6 z-10 bg-black/60 hover:bg-black/95 text-xl p-3 rounded-full transition shadow-lg border border-zinc-800 backdrop-blur-xs cursor-pointer"
                >
                  {isLiked ? "❤️" : "🤍"}
                </button>
              </div>

              {/* Gallery thumbnails */}
              <div className="flex gap-4 overflow-x-auto pb-2 pr-2">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`h-20 w-32 rounded-xl bg-cover bg-center border-2 transition duration-350 cursor-pointer flex-shrink-0 ${
                      activeImage === img ? "border-lime-500 scale-95" : "border-zinc-800 hover:border-lime-500/50"
                    }`}
                    style={{ backgroundImage: `url(${img})` }}
                  />
                ))}
              </div>
            </div>

            {/* Tabs details */}
            <div className="space-y-6">
              <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-900 gap-2 max-w-md overflow-x-auto">
                {(["overview", "facilities", "map", "reviews"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition whitespace-nowrap ${
                      activeTab === tab
                        ? "bg-lime-500 text-black shadow-md"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Outputs */}
              <div className="min-h-[200px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* OVERVIEW TAB */}
                    {activeTab === "overview" && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h1 className="text-4xl font-extrabold text-white">{turf.name}</h1>
                            {turf.businessName && (
                              <p className="text-lime-400 font-semibold text-sm mt-1">by {turf.businessName}</p>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm">
                          📍 {turf.address ? `${turf.address.area ? turf.address.area + ', ' : ''}${turf.address.city}, ${turf.address.state} - ${turf.address.pinCode}` : turf.location}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-lime-400 font-extrabold text-lg">
                            {turf.avgRating ? `⭐ ${turf.avgRating}` : "⭐ New Venue"}
                          </span>
                          <span className="text-zinc-500 text-sm">
                            {turf.ratingCount ? `(${turf.ratingCount} reviews)` : ""}
                          </span>
                        </div>
                        
                        {/* Sports Supported */}
                        {turf.sports && turf.sports.length > 0 && (
                          <div className="pt-4 mt-4 border-t border-zinc-900">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Sports Supported</h3>
                            <div className="flex flex-wrap gap-2">
                              {turf.sports.map(sport => (
                                <span key={sport} className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300 font-medium">
                                  ⚽ {sport}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Operating Hours */}
                        <div className="pt-4 mt-4 border-t border-zinc-900 grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Operating Hours</h3>
                            <p className="text-white font-medium">{turf.openingTime || '06:00'} to {turf.closingTime || '23:00'}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Days Open</h3>
                            <p className="text-white font-medium text-sm">{(turf.daysOpen || []).join(', ')}</p>
                          </div>
                        </div>

                        <p className="text-zinc-300 text-base leading-relaxed pt-4 border-t border-zinc-900 mt-6">
                          {turf.description}
                        </p>
                        
                        {/* Booking Rules */}
                        {turf.bookingRules && (
                          <div className="pt-4 mt-4 border-t border-zinc-900">
                            <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3">Booking Rules</h3>
                            <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl">
                              <p className="text-zinc-300 text-sm whitespace-pre-wrap">{turf.bookingRules}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* FACILITIES TAB */}
                    {activeTab === "facilities" && (
                      <div className="space-y-6">
                        <h2 className="text-xl font-bold">Venue Amenities</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {(turf.facilities || turf.amenities || []).map((facility, idx) => (
                            <div
                              key={idx}
                              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center text-zinc-300 font-bold text-sm"
                            >
                              🏟️ {facility}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* LOCATION TAB */}
                    {activeTab === "map" && (
                      <div className="space-y-4">
                        <h2 className="text-xl font-bold">Directions & Address</h2>
                        <p className="text-sm text-zinc-400">📍 Location: {turf.address ? `${turf.address.area ? turf.address.area + ', ' : ''}${turf.address.city}, ${turf.address.state} - ${turf.address.pinCode}` : turf.location}</p>
                        {/* Map placeholder or real map if available */}
                        {turf.address?.googleMapLink ? (
                          <div className="h-64 bg-zinc-900/80 border border-zinc-850 rounded-2xl flex flex-col items-center justify-center text-zinc-500 text-sm gap-3">
                            <span className="text-4xl">🗺️</span>
                            <a href={turf.address.googleMapLink} target="_blank" rel="noreferrer" className="text-lime-400 hover:underline font-semibold">
                              Open in Google Maps
                            </a>
                          </div>
                        ) : (
                          <div className="h-64 bg-zinc-900/80 border border-zinc-850 rounded-2xl flex items-center justify-center text-zinc-500 text-sm italic">
                            🗺️ Google Maps Navigation Integrated
                          </div>
                        )}
                      </div>
                    )}

                    {/* REVIEWS TAB */}
                    {activeTab === "reviews" && (
                      <div className="space-y-8">
                        <div className="flex justify-between items-center">
                          <h2 className="text-xl font-bold">Player Reviews</h2>
                          <span className="text-lime-400 text-sm font-semibold">
                            {reviews.length} reviews recorded
                          </span>
                        </div>

                        {/* Review Form */}
                        {user ? (
                          <form onSubmit={handleSubmitReview} className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl space-y-4">
                            <h3 className="font-bold text-sm text-white">Write a Review</h3>
                            
                            <div className="flex items-center gap-4">
                              <span className="text-zinc-400 text-xs font-semibold">Rating:</span>
                              <div className="flex gap-1 text-lg">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`transition cursor-pointer ${
                                      rating >= star ? "text-lime-400" : "text-zinc-700"
                                    }`}
                                  >
                                    ★
                                  </button>
                                ))}
                              </div>
                            </div>

                            <textarea
                              rows={3}
                              placeholder="Share your playing experience at this venue (amenities, lighting, turf quality)..."
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 text-sm"
                            />

                            <div className="flex justify-end">
                              <Button type="submit" loading={submittingReview} className="px-6 py-2.5">
                                Submit Review
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl text-center text-zinc-500 text-sm">
                            Please log in to submit a rating review for this turf.
                          </div>
                        )}

                        {/* Reviews list */}
                        {reviews.length === 0 ? (
                          <p className="text-zinc-500 text-sm italic py-4">No reviews yet. Be the first to play and review!</p>
                        ) : (
                          <div className="space-y-4">
                            {reviews.map((r) => (
                              <div key={r.id} className="p-5 bg-zinc-950/40 border border-zinc-900 rounded-xl space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-bold text-white">{r.playerName}</span>
                                  <span className="text-lime-400 font-bold">{"★".repeat(r.rating)}</span>
                                </div>
                                <p className="text-zinc-400 text-xs leading-relaxed">"{r.comment}"</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

          </div>

          {/* Sticky Booking Form Side Card */}
          <div className="lg:col-span-1 lg:sticky lg:top-24">
            <Card className="border border-zinc-800 shadow-2xl">
              <BookingForm turf={turf} />
            </Card>
          </div>

        </div>

        {/* Similar Turfs Carousel */}
        {similarTurfs.length > 0 && (
          <div className="space-y-6 pt-10 border-t border-zinc-900">
            <h2 className="text-2xl font-bold">Similar Turfs You May Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {similarTurfs.map((t) => (
                <TurfCard
                  key={t.id}
                  id={t.id!}
                  name={t.name}
                  location={t.location || (t.address ? `${t.address.area ? t.address.area + ', ' : ''}${t.address.city}, ${t.address.state}` : "")}
                  price={t.price}
                  imageUrl={t.imageUrl}
                  isVerified={t.isVerified}
                  avgRating={t.avgRating}
                  ratingCount={t.ratingCount}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}