"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/context/ToastContext";
import { getAdminLogs, AdminLog } from "@/services/log.service";

export default function LogsPage() {
  const { showToast } = useToast();
  
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await getAdminLogs();
      setLogs(data);
    } catch (error) {
      console.error(error);
      showToast("Failed to load audit logs", "error");
    } finally {
      setLoading(false);
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
        <h1 className="text-4xl font-extrabold text-white">Security Audit Trail Logs</h1>
        <p className="text-gray-400 mt-2">Inspect administrator operations, user promotions, list updates, and coupon creation events.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-gray-400 text-sm bg-zinc-950/40">
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6">Administrator Name</th>
                <th className="py-4 px-6">Operation Action</th>
                <th className="py-4 px-6">Audit Details Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40 text-gray-300 text-sm">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-zinc-500 italic">No admin operations logged yet.</td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-zinc-950/10">
                    <td className="py-4 px-6 font-mono text-zinc-500 text-xs">
                      {l.timestamp?.toDate 
                        ? l.timestamp.toDate().toLocaleString("en-IN")
                        : l.timestamp 
                          ? new Date(l.timestamp).toLocaleString("en-IN")
                          : "N/A"
                      }
                    </td>
                    <td className="py-4 px-6 font-semibold text-white">
                      <div>{l.adminName}</div>
                      <div className="text-[10px] text-zinc-500 font-mono font-normal">ID: {l.adminId}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-zinc-850 border border-zinc-800 text-lime-400 font-mono text-xs font-semibold px-2.5 py-1 rounded-md">
                        {l.action}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-zinc-400 max-w-md break-words leading-relaxed font-semibold">
                      {l.details}
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
