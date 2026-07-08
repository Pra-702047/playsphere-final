"use client";

import { useState, useEffect } from "react";
import { auth } from "@/firebase/auth";
import { createBooking } from "@/services/booking.service";
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/firestore";
import { TurfData } from "@/services/turf.service";
import Dialog from "@/components/ui/Dialog";
import { useToast } from "@/context/ToastContext";

const DEFAULT_TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return `${hour}:00`;
});

export default function BookingForm({ turf }: { turf: TurfData }) {
  const { showToast } = useToast();

  const [playerName, setPlayerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [players, setPlayers] = useState(10);
  const [sport, setSport] = useState("Football");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [loading, setLoading] = useState(false);

  // Simulated checkout state
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card">("upi");
  const [upiId, setUpiId] = useState("");
  const [upiProvider, setUpiProvider] = useState<"gpay" | "phonepe">("gpay");
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Coupon Engine state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Live slot validation states
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [checkingBookings, setCheckingBookings] = useState(false);

  useEffect(() => {
    if (!date || !turf?.id) {
      setBookedSlots([]);
      return;
    }

    const fetchBookedSlots = async () => {
      setCheckingBookings(true);
      try {
        const q = query(
          collection(db, "bookings"),
          where("turfId", "==", turf.id),
          where("date", "==", date)
        );
        const snapshot = await getDocs(q);
        const slots = snapshot.docs
          .map((doc) => doc.data())
          .filter((b) => b.status !== "cancelled" && b.status !== "rejected" && b.status !== "refunded")
          .map((b) => b.slot);
        setBookedSlots(slots);
      } catch (err) {
        console.error("Error fetching booked slots:", err);
      } finally {
        setCheckingBookings(false);
      }
    };

    fetchBookedSlots();
  }, [date, turf]);

  // Determine dynamic pricing and slot availability
  const isHoliday = date ? turf.holidays?.includes(date) : false;
  const specialPrice = date ? turf.specialRates?.[date] : undefined;
  const currentHourlyPrice = specialPrice !== undefined ? specialPrice : turf.price;
  const finalPrice = Math.max(0, currentHourlyPrice - discountAmount);
  
  const ownerBlockedSlots = date ? (turf.blockedSlots?.[date] || []) : [];
  const unavailableSlots = [...ownerBlockedSlots, ...bookedSlots];
  const availableSlots = DEFAULT_TIME_SLOTS.filter((s) => !unavailableSlots.includes(s));

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);

    try {
      const q = query(
        collection(db, "coupons"),
        where("code", "==", couponCode.trim().toUpperCase())
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        showToast("Invalid coupon code", "error");
        setAppliedCoupon(null);
        setDiscountAmount(0);
        return;
      }

      const couponDoc = snapshot.docs[0];
      const couponData = couponDoc.data();

      const todayStr = new Date().toISOString().split("T")[0];
      if (couponData.expiryDate < todayStr) {
        showToast("This coupon has expired", "error");
        setAppliedCoupon(null);
        setDiscountAmount(0);
        return;
      }

      if (couponData.usageCount >= couponData.usageLimit) {
        showToast("Coupon usage limit reached", "error");
        setAppliedCoupon(null);
        setDiscountAmount(0);
        return;
      }

      setAppliedCoupon({ id: couponDoc.id, ...couponData });
      
      let discount = 0;
      if (couponData.discountType === "percentage") {
        discount = Math.round((currentHourlyPrice * couponData.discountValue) / 100);
      } else {
        discount = couponData.discountValue;
      }

      setDiscountAmount(discount);
      showToast(`Coupon applied! ₹${discount} discount added.`, "success");
    } catch (err) {
      console.error(err);
      showToast("Error validating coupon", "error");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const executeSuccessfulBooking = async (paymentId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const result = await createBooking({
      userId: user.uid,
      userEmail: user.email,
      turfId: turf.id,
      turfName: turf.name,
      ownerId: turf.ownerId || "",
      price: finalPrice,
      playerName,
      mobile,
      players,
      sport,
      notes,
      date,
      slot,
      status: "confirmed",
      paymentId,
      createdAt: new Date(),
      otp: generatedOtp,
      otpVerified: false,
    });

    if (result.success) {
      try {
        await addDoc(collection(db, "payments"), {
          bookingId: result.id,
          userId: user.uid,
          playerName,
          amount: finalPrice,
          paymentId,
          status: "success",
          createdAt: new Date(),
        });

        // Increment coupon count if applied
        if (appliedCoupon && appliedCoupon.id) {
          const couponRef = doc(db, "coupons", appliedCoupon.id);
          await updateDoc(couponRef, {
            usageCount: (appliedCoupon.usageCount || 0) + 1,
          });
        }

        await addDoc(collection(db, "notifications"), {
          userId: user.uid,
          title: "Booking Confirmed! ⚽",
          message: `Your booking for ${turf.name} on ${date} at ${slot} is confirmed! Payment Receipt ID: ${paymentId}`,
          read: false,
          createdAt: new Date(),
        });

        await addDoc(collection(db, "notifications"), {
          userId: turf.ownerId || "",
          title: "New Confirmed Booking! 🏟️",
          message: `${playerName} booked ${turf.name} on ${date} at ${slot}.`,
          read: false,
          createdAt: new Date(),
        });
      } catch (e) {
        console.error("Error creating transactional records:", e);
      }

      showToast(`Booking Confirmed! Payment ID: ${paymentId}`, "success");
      setPlayerName("");
      setMobile("");
      setPlayers(10);
      setSport("Football");
      setNotes("");
      setDate("");
      setSlot("");
      setAppliedCoupon(null);
      setCouponCode("");
      setDiscountAmount(0);
    } else {
      showToast(result.message || "Failed to create booking", "error");
    }
    setLoading(false);
  };

  const handleSimulatePayment = async (isSuccess: boolean) => {
    if (isSuccess && paymentMethod === "card") {
      if (!cardName.trim()) {
        showToast("Please enter cardholder name", "warning");
        return;
      }
      if (cardNumber.replace(/\s/g, '').length < 16) {
        showToast("Please enter a valid card number", "warning");
        return;
      }
    } else if (isSuccess && paymentMethod === "upi") {
      if (!upiId.trim() || !upiId.includes("@")) {
        showToast("Please enter a valid UPI ID (e.g. name@upi)", "warning");
        return;
      }
    }

    setPaymentProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setPaymentProcessing(false);

    if (isSuccess) {
      const mockPaymentId = `pay_mock_${Math.random().toString(36).substring(2, 9)}`;
      setCheckoutOpen(false);
      setCardName("");
      setCardNumber("");
      setCardExpiry("");
      setCardCvv("");
      setUpiId("");
      await executeSuccessfulBooking(mockPaymentId);
    } else {
      showToast("Simulated checkout: Payment authorization failed.", "error");
    }
  };

  const handleBooking = async () => {
    if (!playerName || !mobile || !date || !slot) {
      showToast("Please fill all required fields", "warning");
      return;
    }

    if (isHoliday) {
      showToast("Selected date is a holiday. Booking is unavailable.", "error");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      showToast("Please login first", "warning");
      return;
    }

    setLoading(true);

    try {
      const conflictQ = query(
        collection(db, "bookings"),
        where("turfId", "==", turf.id),
        where("date", "==", date),
        where("slot", "==", slot)
      );
      const conflictSnap = await getDocs(conflictQ);
      const conflicts = conflictSnap.docs
        .map((doc) => doc.data())
        .filter((b) => b.status !== "cancelled" && b.status !== "rejected" && b.status !== "refunded");

      if (conflicts.length > 0) {
        showToast("This slot was just booked by another player! Please select another slot.", "error");
        setLoading(false);
        return;
      }
    } catch (e) {
      console.error(e);
    }

    const isRealRazorpayConfigured =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID &&
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID !== "rzp_test_mockKeyId12345" &&
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.startsWith("rzp_");

    if (isRealRazorpayConfigured) {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        showToast("Failed to load Razorpay SDK. Please check your network connection.", "error");
        setLoading(false);
        return;
      }

      // 1. Create payment order server-side
      let orderId = "";
      try {
        const orderRes = await fetch("/api/payment/order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ turfId: turf.id, date, couponId: appliedCoupon?.id || null }),
        });
        const orderData = await orderRes.json();
        if (orderData.success) {
          orderId = orderData.orderId;
        } else {
          showToast(orderData.message || "Failed to create payment order", "error");
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Order creation failed:", err);
        showToast("Error creating payment order on server", "error");
        setLoading(false);
        return;
      }

      // 2. Configure official Razorpay Checkout options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: finalPrice * 100,
        currency: "INR",
        name: "PlaySphere",
        description: `Hourly booking for ${turf.name}`,
        order_id: orderId,
        handler: async function (response: any) {
          setLoading(true);
          try {
            // Verify payment signature server-side
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingDetails: {
                  userId: user.uid,
                  userEmail: user.email,
                  turfId: turf.id,
                  turfName: turf.name,
                  ownerId: turf.ownerId || "",
                  price: finalPrice,
                  playerName,
                  mobile,
                  players,
                  sport,
                  notes,
                  date,
                  slot,
                  appliedCouponId: appliedCoupon?.id || null,
                  appliedCouponUsageCount: appliedCoupon?.usageCount || 0,
                  otp: Math.floor(100000 + Math.random() * 900000).toString(),
                  otpVerified: false,
                },
              }),
            });

            const verifyResult = await verifyRes.json();

            if (verifyResult.success) {
              showToast(`Booking Confirmed! Payment ID: ${response.razorpay_payment_id}`, "success");
              setPlayerName("");
              setMobile("");
              setPlayers(10);
              setSport("Football");
              setNotes("");
              setDate("");
              setSlot("");
              setAppliedCoupon(null);
              setCouponCode("");
              setDiscountAmount(0);
            } else {
              showToast(verifyResult.message || "Payment verification failed", "error");
            }
          } catch (err) {
            console.error("Verification call error:", err);
            showToast("Failed to verify payment with server", "error");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: playerName,
          contact: mobile,
          email: user.email,
        },
        theme: {
          color: "#84cc16",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
      setLoading(false);
    } else {
      setCheckoutOpen(true);
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-white border-b border-zinc-800 pb-3">
        Book Slots 🏟️
      </h2>

      <div className="space-y-4">
        {/* Date Selector */}
        <div>
          <label className="block text-gray-400 text-xs font-semibold mb-2">Select Date *</label>
          <input
            type="date"
            required
            min={new Date().toISOString().split("T")[0]}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setSlot("");
            }}
            className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500"
          />
        </div>

        {/* Holiday Warning or Pricing Display */}
        {date && (
          <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 text-sm">
            {isHoliday ? (
              <p className="text-red-400 font-semibold text-center">🏖️ Closed: Selected date is marked as a Holiday.</p>
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Hourly Price:</span>
                <span className="text-lime-400 text-lg font-bold">
                  ₹{currentHourlyPrice}/hr {specialPrice !== undefined && "(Special RateApplied)"}
                </span>
              </div>
            )}
          </div>
        )}

        {!isHoliday && date && (
          <>
            {/* Slot Selector - 24 Hour Grid Cards */}
            <div>
              <label className="block text-gray-400 text-xs font-semibold mb-3">
                Select Time Slot * {checkingBookings && <span className="text-zinc-500 text-[10px] animate-pulse">(checking slots...)</span>}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[260px] overflow-y-auto pr-1">
                {DEFAULT_TIME_SLOTS.map((s) => {
                  const isBooked = unavailableSlots.includes(s);
                  const isSelected = slot === s;
                  
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={isBooked}
                      onClick={() => setSlot(s)}
                      className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center min-h-[48px] ${
                        isBooked
                          ? "bg-zinc-950/60 border-zinc-900/60 text-zinc-550 cursor-not-allowed opacity-40"
                          : isSelected
                            ? "bg-lime-500 border-lime-500 text-black font-extrabold shadow-lg shadow-lime-500/10 scale-[1.02]"
                            : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-lime-500/40 hover:text-white cursor-pointer"
                      }`}
                    >
                      <span className={`text-xs font-bold tracking-tight ${isBooked ? "line-through text-zinc-650" : ""}`}>
                        {s}
                      </span>
                      {isBooked ? (
                        <span className="text-[7px] text-red-500/80 font-bold uppercase tracking-wider mt-0.5">
                          Booked
                        </span>
                      ) : (
                        <span className={`text-[7px] uppercase tracking-wider mt-0.5 ${isSelected ? "text-black/80 font-bold" : "text-lime-400/80"}`}>
                          Available
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {availableSlots.length === 0 && !checkingBookings && (
                <p className="text-red-400 text-xs mt-2 font-semibold">❌ No slots available for this date.</p>
              )}
            </div>

            {/* Player details */}
            <div>
              <label className="block text-gray-400 text-xs font-semibold mb-2">Player Name *</label>
              <input
                type="text"
                required
                placeholder="Your Full Name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-2">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-2">Number of Players</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={players}
                  onChange={(e) => setPlayers(Number(e.target.value))}
                  className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-semibold mb-2">Select Sport</label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500"
              >
                <option>Football</option>
                <option>Cricket</option>
                <option>Badminton</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-semibold mb-2">Special Request (Optional)</label>
              <textarea
                placeholder="Let us know if you need bibs, extra water, or special gear..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500"
              />
            </div>

            {/* Coupon Code Section */}
            <div className="border-t border-zinc-800/80 pt-4 mt-2">
              <label className="block text-gray-400 text-xs font-semibold mb-2">Have a Promo Coupon?</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. MONSOON20"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 font-mono text-sm uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={validatingCoupon}
                  className="bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-lime-400 font-bold px-4 py-2.5 rounded-lg text-xs transition cursor-pointer"
                >
                  {validatingCoupon ? "Validating..." : "Apply"}
                </button>
              </div>

              {/* Display pricing updates */}
              <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-850 mt-4 space-y-2 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Hourly Slot Rate</span>
                  <span className="font-semibold text-zinc-350">₹{currentHourlyPrice}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-lime-400 font-medium">
                    <span>Coupon Discount Applied</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-white border-t border-zinc-850 pt-2">
                  <span>Final Booking Total</span>
                  <span className="text-lime-400">₹{finalPrice}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleBooking}
              disabled={loading}
              className="w-full bg-lime-500 hover:bg-lime-400 text-black py-4 rounded-xl font-bold mt-4 transition shadow-lg shadow-lime-500/10 cursor-pointer"
            >
              {loading ? "Submitting Request..." : "Request Booking"}
            </button>
          </>
        )}
      </div>

      <Dialog
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        title="PlaySphere Secure Checkout"
        maxWidth="lg"
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <div>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Amount to Pay</p>
              <p className="text-2xl font-extrabold text-lime-400 font-black">₹{finalPrice}</p>
            </div>
            <div className="text-right text-[10px] text-zinc-500 font-semibold font-mono">
              SECURE DEPOSIT
            </div>
          </div>

          {/* Method Tab selection */}
          <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-900 gap-2 text-xs font-black uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setPaymentMethod("upi")}
              className={`flex-1 py-3 rounded-xl transition duration-300 cursor-pointer ${
                paymentMethod === "upi" ? "bg-lime-400 text-black font-black" : "text-zinc-400 hover:text-white"
              }`}
            >
              📱 UPI
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("card")}
              className={`flex-1 py-3 rounded-xl transition duration-300 cursor-pointer ${
                paymentMethod === "card" ? "bg-lime-400 text-black font-black" : "text-zinc-400 hover:text-white"
              }`}
            >
              💳 Card
            </button>
          </div>

          <div className="space-y-4">
            {paymentMethod === "upi" ? (
              <div className="space-y-4 text-left">
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold mb-2">Select App</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setUpiProvider("gpay")}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition cursor-pointer text-xs font-bold ${
                        upiProvider === "gpay"
                          ? "border-lime-500 bg-lime-500/5 text-white"
                          : "border-zinc-800 hover:border-zinc-700 text-zinc-400"
                      }`}
                    >
                      <span>🔵</span> Google Pay
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpiProvider("phonepe")}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition cursor-pointer text-xs font-bold ${
                        upiProvider === "phonepe"
                          ? "border-lime-500 bg-lime-500/5 text-white"
                          : "border-zinc-800 hover:border-zinc-700 text-zinc-400"
                      }`}
                    >
                      <span>🟣</span> PhonePe
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Enter UPI ID</label>
                  <input
                    type="text"
                    placeholder="e.g. name@upi or mobile@ybl"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 text-sm font-semibold"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-left">
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Card Number</label>
                  <input
                    type="text"
                    maxLength={19}
                    placeholder="4111 1111 1111 1111"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                    className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 text-sm font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Expiry Date</label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold mb-1.5">CVV</label>
                    <input
                      type="password"
                      maxLength={3}
                      placeholder="•••"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2 border-t border-zinc-800/80">
            <button
              onClick={() => handleSimulatePayment(true)}
              disabled={paymentProcessing}
              className="flex-1 bg-lime-500 hover:bg-lime-400 text-black font-extrabold py-3.5 rounded-xl transition text-xs uppercase tracking-wider cursor-pointer"
            >
              {paymentProcessing ? "Authorizing..." : "Simulate Success"}
            </button>
            <button
              onClick={() => handleSimulatePayment(false)}
              disabled={paymentProcessing}
              className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold py-3.5 rounded-xl transition text-xs uppercase tracking-wider cursor-pointer"
            >
              Simulate Failure
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

