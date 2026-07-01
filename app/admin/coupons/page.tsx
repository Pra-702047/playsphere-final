"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { logAdminActivity } from "@/services/log.service";
import { db } from "@/firebase/firestore";
import { addDoc, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import Button from "@/components/ui/Button";

type CouponData = {
  id?: string;
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  expiryDate: string;
  usageLimit: number;
  usageCount: number;
};

export default function CouponsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "flat">("percentage");
  const [discountValue, setDiscountValue] = useState(10);
  const [expiryDate, setExpiryDate] = useState("");
  const [usageLimit, setUsageLimit] = useState(100);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const snap = await getDocs(collection(db, "coupons"));
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<CouponData, "id">),
      }));
      setCoupons(data);
    } catch (error) {
      console.error(error);
      showToast("Failed to load coupons", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !code.trim() || !expiryDate || !discountValue) return;

    setSubmitting(true);
    try {
      const codeUpper = code.trim().toUpperCase();

      // Check if already exists in memory to avoid simple duplicates
      if (coupons.some((c) => c.code === codeUpper)) {
        showToast("Coupon code already exists", "warning");
        setSubmitting(false);
        return;
      }

      const payload = {
        code: codeUpper,
        discountType,
        discountValue: Number(discountValue),
        expiryDate,
        usageLimit: Number(usageLimit),
        usageCount: 0,
      };

      const docRef = await addDoc(collection(db, "coupons"), payload);

      await logAdminActivity(
        user.uid,
        user.displayName || "Admin",
        "CREATE_COUPON",
        `Created coupon code ${codeUpper} (${discountType}: ${discountValue})`
      );

      showToast("Coupon created successfully!", "success");
      setCoupons((prev) => [...prev, { id: docRef.id, ...payload }]);
      setModalOpen(false);
      
      // Clear form
      setCode("");
      setDiscountType("percentage");
      setDiscountValue(10);
      setExpiryDate("");
      setUsageLimit(100);
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Failed to create coupon", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (couponId: string, couponCode: string) => {
    if (!user) return;
    const confirmDelete = confirm(`Are you sure you want to delete coupon ${couponCode}?`);
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "coupons", couponId));
      await logAdminActivity(
        user.uid,
        user.displayName || "Admin",
        "DELETE_COUPON",
        `Deleted coupon code ${couponCode}`
      );

      showToast("Coupon deleted successfully!", "success");
      setCoupons((prev) => prev.filter((c) => c.id !== couponId));
    } catch (error) {
      console.error(error);
      showToast("Failed to delete coupon", "error");
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
          <h1 className="text-4xl font-extrabold text-white">Coupons Engine</h1>
          <p className="text-gray-400 mt-2">Create promotional campaign discounts, set limits, and track usage logs.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-lime-500 hover:bg-lime-400 text-black font-bold py-3 px-6 rounded-xl transition shadow-lg shadow-lime-500/10 cursor-pointer"
        >
          ➕ Create Coupon
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-gray-400 text-sm bg-zinc-950/40">
                <th className="py-4 px-6">Coupon Code</th>
                <th className="py-4 px-6">Discount Type</th>
                <th className="py-4 px-6">Value</th>
                <th className="py-4 px-6">Expiry Date</th>
                <th className="py-4 px-6">Usage Count / Limit</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40 text-gray-300 text-sm">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-zinc-500 italic">No coupons created yet.</td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-950/10">
                    <td className="py-4 px-6 font-mono font-bold text-lime-400 text-base">{c.code}</td>
                    <td className="py-4 px-6 uppercase font-bold text-xs tracking-wider">{c.discountType}</td>
                    <td className="py-4 px-6 font-semibold">
                      {c.discountType === "percentage" ? `${c.discountValue}% Off` : `₹${c.discountValue} Off`}
                    </td>
                    <td className="py-4 px-6 font-semibold">{c.expiryDate}</td>
                    <td className="py-4 px-6">
                      <span className="text-white font-bold">{c.usageCount}</span> / <span className="text-zinc-500">{c.usageLimit} times</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => c.id && handleDeleteCoupon(c.id, c.code)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl p-8 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white transition text-xl cursor-pointer"
            >
              ✕
            </button>

            <h2 className="text-2xl font-extrabold text-white mb-6">Create Discount Coupon</h2>

            <form onSubmit={handleCreateCoupon} className="space-y-5">
              <div>
                <label className="block text-zinc-400 text-xs font-semibold mb-2">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MONSOON20"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 text-sm font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold mb-2">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 text-sm font-semibold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Price (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs font-semibold mb-2">Value *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold mb-2">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs font-semibold mb-2">Usage Limit</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 text-sm"
                  />
                </div>
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
                  Create Coupon
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
