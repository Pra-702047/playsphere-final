"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { logAdminActivity } from "@/services/log.service";
import { db } from "@/firebase/firestore";
import { addDoc, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import Button from "@/components/ui/Button";

type TicketData = {
  id?: string;
  userId: string;
  userName: string;
  userRole: string;
  subject: string;
  message: string;
  status: "open" | "resolved";
  createdAt: any;
};

export default function TicketsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState("");

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const snap = await getDocs(collection(db, "tickets"));
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<TicketData, "id">),
      }));

      // Sort open tickets first
      setTickets(
        data.sort((a, b) => {
          if (a.status === "open" && b.status === "resolved") return -1;
          if (a.status === "resolved" && b.status === "open") return 1;
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        })
      );
    } catch (error) {
      console.error(error);
      showToast("Failed to load support tickets", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResolveTicket = async (ticket: TicketData) => {
    if (!user || !ticket.id) return;
    setResolvingId(ticket.id);

    try {
      await updateDoc(doc(db, "tickets", ticket.id), {
        status: "resolved",
      });

      // Send alert notification to the ticket owner
      await addDoc(collection(db, "notifications"), {
        userId: ticket.userId,
        title: "Support Complaint Resolved! ✅",
        message: `Your support ticket regarding "${ticket.subject}" has been reviewed and resolved by admin support.`,
        read: false,
        createdAt: new Date(),
      });

      await logAdminActivity(
        user.uid,
        user.displayName || "Admin",
        "RESOLVE_SUPPORT_TICKET",
        `Resolved ticket ID ${ticket.id} submitted by ${ticket.userName}`
      );

      showToast("Ticket marked as resolved!", "success");
      setTickets((prev) =>
        prev.map((t) => (t.id === ticket.id ? { ...t, status: "resolved" } : t))
      );
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Failed to resolve ticket", "error");
    } finally {
      setResolvingId("");
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
        <h1 className="text-4xl font-extrabold text-white">Support Desk Complaints</h1>
        <p className="text-gray-400 mt-2">Manage customer issues, player claims, and owner billing complaints.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-gray-400 text-sm bg-zinc-950/40">
                <th className="py-4 px-6">Sender Details</th>
                <th className="py-4 px-6">Subject</th>
                <th className="py-4 px-6">Complaint Message</th>
                <th className="py-4 px-6">Submitted On</th>
                <th className="py-4 px-6">Ticket Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40 text-gray-300 text-sm">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-zinc-500 italic">No tickets submitted.</td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-950/10">
                    <td className="py-4 px-6 font-semibold text-white">
                      <div>{t.userName}</div>
                      <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider pt-0.5">{t.userRole}</div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-zinc-200">{t.subject}</td>
                    <td className="py-4 px-6 text-xs text-zinc-400 max-w-xs break-words leading-relaxed">
                      "{t.message}"
                    </td>
                    <td className="py-4 px-6 text-zinc-500">
                      {t.createdAt?.toDate 
                        ? t.createdAt.toDate().toLocaleDateString("en-IN")
                        : t.createdAt 
                          ? new Date(t.createdAt).toLocaleDateString("en-IN")
                          : "N/A"
                      }
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          t.status === "open"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse"
                            : "bg-lime-500/10 text-lime-400 border border-lime-500/20"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {t.status === "open" ? (
                        <Button
                          onClick={() => handleResolveTicket(t)}
                          loading={resolvingId === t.id}
                          className="px-4 py-2 text-xs"
                        >
                          Resolve
                        </Button>
                      ) : (
                        <span className="text-zinc-500 text-xs font-semibold">✓ Resolved</span>
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
