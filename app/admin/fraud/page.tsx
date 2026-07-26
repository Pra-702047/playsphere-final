"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/firebase/firestore";
import { getPlatformConfig } from "@/services/config.service";

interface AuditLog {
  id: string;
  action: string;
  turfId?: string;
  ownerId?: string;
  paymentId?: string;
  details: string;
  timestamp: any;
}

interface FraudFlag {
  ownerId: string;
  ownerName?: string;
  offlineCount: number;
  onlineCount: number;
  refundCount: number;
  total: number;
  offlineRatio: number;
  refundRatio: number;
  fraudScore: number;
}

interface MobileFlag {
  mobile: string;
  count: number;
  userIds: Set<string>;
}

export default function FraudDashboard() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [flags, setFlags] = useState<FraudFlag[]>([]);
  const [mobileFlags, setMobileFlags] = useState<MobileFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(0.60);

  useEffect(() => {
    const fetchFraudData = async () => {
      try {
        const config = await getPlatformConfig();
        setThreshold(config.fraudThreshold);

        // Fetch recent audit logs
        const logsQuery = query(
          collection(db, "audit_logs"),
          orderBy("timestamp", "desc"),
          limit(50)
        );
        const logsSnap = await getDocs(logsQuery);
        const fetchedLogs = logsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AuditLog[];
        setLogs(fetchedLogs);

        // Fetch bookings to detect abuse
        const bookingsSnap = await getDocs(collection(db, "bookings"));
        const bookings = bookingsSnap.docs.map((doc) => doc.data());

        const ownerStats: Record<string, { offline: number; online: number; refunds: number; name?: string }> = {};
        const mobileStats: Record<string, { count: number; userIds: Set<string> }> = {};

        bookings.forEach((b: any) => {
          // Track Owner Patterns
          if (b.ownerId) {
            if (!ownerStats[b.ownerId]) {
              ownerStats[b.ownerId] = { offline: 0, online: 0, refunds: 0, name: b.turfName };
            }
            if (b.isOffline || b.bookingType === "offline") {
              ownerStats[b.ownerId].offline += 1;
            } else {
              ownerStats[b.ownerId].online += 1;
            }
            if (b.status === "refunded" || b.status === "cancelled") {
              ownerStats[b.ownerId].refunds += 1;
            }
          }

          // Track Customer Farms (Duplicate Mobile Numbers across User IDs)
          if (b.mobile && b.userId) {
            if (!mobileStats[b.mobile]) {
              mobileStats[b.mobile] = { count: 0, userIds: new Set() };
            }
            mobileStats[b.mobile].count += 1;
            mobileStats[b.mobile].userIds.add(b.userId);
          }
        });

        const calculatedFlags = Object.keys(ownerStats).map((ownerId) => {
          const stat = ownerStats[ownerId];
          const total = stat.offline + stat.online;
          const offlineRatio = total === 0 ? 0 : stat.offline / total;
          const refundRatio = total === 0 ? 0 : stat.refunds / total;
          
          // Composite Fraud Score (0-100)
          let fraudScore = 0;
          if (offlineRatio > config.fraudThreshold) fraudScore += 50 * (offlineRatio / 1.0);
          if (refundRatio > 0.3) fraudScore += 50 * (refundRatio / 1.0);
          
          return {
            ownerId,
            ownerName: stat.name,
            offlineCount: stat.offline,
            onlineCount: stat.online,
            refundCount: stat.refunds,
            total,
            offlineRatio,
            refundRatio,
            fraudScore: Math.min(100, Math.round(fraudScore)),
          };
        });

        const suspiciousOwners = calculatedFlags
          .filter((f) => f.total >= 5 && f.fraudScore >= 40)
          .sort((a, b) => b.fraudScore - a.fraudScore);
          
        const suspiciousMobiles = Object.keys(mobileStats)
          .map(m => ({ mobile: m, ...mobileStats[m] }))
          .filter(m => m.userIds.size > 2) // Mobile used by more than 2 distinct accounts
          .sort((a, b) => b.userIds.size - a.userIds.size);

        setFlags(suspiciousOwners);
        setMobileFlags(suspiciousMobiles);
      } catch (error) {
        console.error("Error fetching fraud data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFraudData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          🚨 Advanced Fraud Monitor
        </h1>
        <p className="text-gray-400 mt-2">
          Composite scoring for offline abuse, excessive refunds, and customer clone farms.
        </p>
      </div>

      {/* Owner Flags Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Suspicious Owner Activity</h2>
        <p className="text-sm text-zinc-400 mb-6">
          Owners with Fraud Score &ge; 40. Current Offline Config Threshold: {(threshold * 100).toFixed(0)}%.
        </p>

        {flags.length === 0 ? (
          <div className="p-8 text-center text-emerald-400 font-semibold bg-emerald-950/20 rounded-xl border border-emerald-900/50">
            No suspicious owner activity detected.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="text-xs text-zinc-400 uppercase bg-zinc-800/50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl">Turf Name</th>
                  <th className="px-4 py-3">Owner ID</th>
                  <th className="px-4 py-3">Offline %</th>
                  <th className="px-4 py-3">Refund %</th>
                  <th className="px-4 py-3 rounded-tr-xl">Fraud Score</th>
                </tr>
              </thead>
              <tbody>
                {flags.map((flag) => (
                  <tr key={flag.ownerId} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="px-4 py-4 font-bold text-white">{flag.ownerName || "Unknown"}</td>
                    <td className="px-4 py-4 font-mono text-xs text-zinc-500">{flag.ownerId}</td>
                    <td className="px-4 py-4 text-red-400 font-bold">{(flag.offlineRatio * 100).toFixed(1)}%</td>
                    <td className="px-4 py-4 text-orange-400 font-bold">{(flag.refundRatio * 100).toFixed(1)}%</td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full font-bold ${flag.fraudScore >= 80 ? 'bg-red-950 text-red-400' : 'bg-orange-950 text-orange-400'}`}>
                        {flag.fraudScore} / 100
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Customer Clone Farms Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Customer Clone Farms (Duplicate Mobiles)</h2>
        <p className="text-sm text-zinc-400 mb-6">
          Mobile numbers used by more than 2 distinct PlaySphere user accounts (indicates promo abuse).
        </p>

        {mobileFlags.length === 0 ? (
          <div className="p-8 text-center text-emerald-400 font-semibold bg-emerald-950/20 rounded-xl border border-emerald-900/50">
            No customer clone farms detected.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="text-xs text-zinc-400 uppercase bg-zinc-800/50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl">Mobile Number</th>
                  <th className="px-4 py-3">Total Bookings</th>
                  <th className="px-4 py-3 rounded-tr-xl">Distinct User Accounts</th>
                </tr>
              </thead>
              <tbody>
                {mobileFlags.map((flag) => (
                  <tr key={flag.mobile} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="px-4 py-4 font-bold text-white">{flag.mobile}</td>
                    <td className="px-4 py-4 text-zinc-400">{flag.count}</td>
                    <td className="px-4 py-4 text-red-400 font-bold">{flag.userIds.size} Accounts</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Logs Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">System Security Audit Logs</h2>

        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-start gap-4">
              <div className="mt-1 text-red-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-bold text-white">{log.action}</h3>
                  <span className="text-xs text-zinc-500">
                    {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : "Recent"}
                  </span>
                </div>
                <p className="text-sm text-zinc-400 mt-1">{log.details}</p>
                <div className="flex gap-4 mt-2 text-xs font-mono text-zinc-600">
                  {log.turfId && <span>Turf: {log.turfId}</span>}
                  {log.ownerId && <span>Owner: {log.ownerId}</span>}
                  {log.paymentId && <span>Payment: {log.paymentId}</span>}
                </div>
              </div>
            </div>
          ))}

          {logs.length === 0 && (
            <p className="text-center text-zinc-500 py-4">No audit logs found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
