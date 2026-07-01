"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { getAllBookings } from "@/services/booking.service";
import { getAllUsers, UserProfile } from "@/services/user.service";
import { logAdminActivity } from "@/services/log.service";
import { db } from "@/firebase/firestore";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import Button from "@/components/ui/Button";

type OwnerPayoutData = {
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  totalBookings: number;
  totalEarnings: number;
  commission: number;
  amountToTransfer: number;
  isPaid: boolean;
};

export default function PayoutsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [payoutsList, setPayoutsList] = useState<OwnerPayoutData[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState("");

  useEffect(() => {
    loadPayouts();
  }, []);

  const loadPayouts = async () => {
    try {
      const bookings = (await getAllBookings()) as any[];
      const users = await getAllUsers();
      const confirmedBookings = bookings.filter((b) => b.status === "confirmed" || b.status === "accepted");
      const ownersList = users.filter((u) => u.role === "owner");

      // Load paid payouts docs
      const payoutsSnap = await getDocs(collection(db, "payouts"));
      const paidOwners = payoutsSnap.docs.map((d) => d.data().ownerId as string);

      // Group bookings by owner
      const groupedData: OwnerPayoutData[] = ownersList.map((owner) => {
        const ownerBookings = confirmedBookings.filter((b) => b.ownerId === owner.uid);
        const totalEarnings = ownerBookings.reduce((sum, b) => sum + (typeof b.price === "number" ? b.price : Number(b.price || 0)), 0);
        
        const commission = Math.round(totalEarnings * 0.1); // 10% commission
        const amountToTransfer = totalEarnings - commission;

        return {
          ownerId: owner.uid,
          ownerName: owner.name || "Owner",
          ownerEmail: owner.email,
          totalBookings: ownerBookings.length,
          totalEarnings,
          commission,
          amountToTransfer,
          isPaid: paidOwners.includes(owner.uid),
        };
      });

      setPayoutsList(groupedData);
    } catch (error) {
      console.error(error);
      showToast("Failed to load payouts summaries", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (payout: OwnerPayoutData) => {
    if (!user) return;
    const confirmPay = confirm(`Are you sure you want to mark payout of ₹${payout.amountToTransfer} for ${payout.ownerName} as paid?`);
    if (!confirmPay) return;

    setProcessingId(payout.ownerId);
    try {
      // 1. Log payout in Firestore
      await addDoc(collection(db, "payouts"), {
        ownerId: payout.ownerId,
        ownerName: payout.ownerName,
        totalEarnings: payout.totalEarnings,
        commission: payout.commission,
        amountToTransfer: payout.amountToTransfer,
        status: "paid",
        paidAt: new Date(),
      });

      // 2. Alert notification for Owner
      await addDoc(collection(db, "notifications"), {
        userId: payout.ownerId,
        title: "Payout Received! 💰",
        message: `Your monthly payout of ₹${payout.amountToTransfer} (net of 10% platform fee) has been marked as paid by PlaySphere Finance.`,
        read: false,
        createdAt: new Date(),
      });

      // 3. Security audit log
      await logAdminActivity(
        user.uid,
        user.displayName || "Admin",
        "MARK_PAYOUT_PAID",
        `Marked payout of ₹${payout.amountToTransfer} to Owner ${payout.ownerName} (${payout.ownerId}) as paid`
      );

      showToast(`Payout marked as paid!`, "success");
      
      // Update in-memory state
      setPayoutsList((prev) =>
        prev.map((p) => (p.ownerId === payout.ownerId ? { ...p, isPaid: true } : p))
      );
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Failed to mark payout paid", "error");
    } finally {
      setProcessingId("");
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
      <div>
        <h1 className="text-4xl font-extrabold text-white">Payouts Management</h1>
        <p className="text-gray-400 mt-2">Manage monthly turf owners payout, commission distributions, and transfer logs.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-gray-400 text-sm bg-zinc-950/40">
                <th className="py-4 px-6">Owner Name</th>
                <th className="py-4 px-6">Bookings</th>
                <th className="py-4 px-6">Total Earnings</th>
                <th className="py-4 px-6">PlaySphere Commission (10%)</th>
                <th className="py-4 px-6">Pay Owner (90%)</th>
                <th className="py-4 px-6">Payout Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40 text-gray-300 text-sm">
              {payoutsList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-zinc-500 italic">No owners registered yet.</td>
                </tr>
              ) : (
                payoutsList.map((p) => (
                  <tr key={p.ownerId} className="hover:bg-zinc-950/10">
                    <td className="py-4 px-6 font-semibold text-white">
                      <div>{p.ownerName}</div>
                      <div className="text-xs text-zinc-500 font-normal">{p.ownerEmail}</div>
                    </td>
                    <td className="py-4 px-6">{p.totalBookings} matches</td>
                    <td className="py-4 px-6 font-semibold">₹{p.totalEarnings.toLocaleString("en-IN")}</td>
                    <td className="py-4 px-6 text-lime-400">₹{p.commission.toLocaleString("en-IN")}</td>
                    <td className="py-4 px-6 font-bold text-white">₹{p.amountToTransfer.toLocaleString("en-IN")}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          p.isPaid
                            ? "bg-lime-500/10 text-lime-400 border border-lime-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                        }`}
                      >
                        {p.isPaid ? "Paid" : "Pending"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {!p.isPaid ? (
                        <Button
                          onClick={() => handleMarkAsPaid(p)}
                          loading={processingId === p.ownerId}
                          className="px-4 py-2 text-xs"
                        >
                          Mark as Paid
                        </Button>
                      ) : (
                        <span className="text-zinc-500 text-xs font-semibold">✓ Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
