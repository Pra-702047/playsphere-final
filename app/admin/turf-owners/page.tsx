"use client";

import { useEffect, useState } from "react";
import { getAllUsers, updateUserFields, UserProfile } from "@/services/user.service";
import { getAllTurfs, TurfData } from "@/services/turf.service";
import { useAuth } from "@/context/AuthContext";
import { logAdminActivity } from "@/services/log.service";
import Link from "next/link";
import { Search } from "lucide-react";

export default function TurfOwnersPage() {
  const { user } = useAuth();
  const [owners, setOwners] = useState<UserProfile[]>([]);
  const [turfs, setTurfs] = useState<TurfData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filters
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [kycFilter, setKycFilter] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allUsers, allTurfs] = await Promise.all([
        getAllUsers(),
        getAllTurfs()
      ]);
      const ownerUsers = allUsers.filter(u => u.role === "owner");
      setOwners(ownerUsers);
      setTurfs(allTurfs);
    } catch (error) {
      console.error("Error loading owners data", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (ownerId: string, field: keyof UserProfile, value: any, actionName: string) => {
    const confirmChange = confirm(`Are you sure you want to update this owner's status?`);
    if (!confirmChange) return;

    try {
      const res = await updateUserFields(ownerId, { [field]: value });
      if (res.success) {
        if (user) {
          const targetOwner = owners.find(o => o.uid === ownerId);
          await logAdminActivity(
            user.uid,
            user.displayName || "Admin",
            actionName,
            `Updated owner ${targetOwner?.name} (${field}: ${value})`
          );
        }
        setOwners(prev => prev.map(o => o.uid === ownerId ? { ...o, [field]: value } : o));
      } else {
        alert("Failed to update owner: " + res.message);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    }
  };

  const filteredOwners = owners.filter((owner) => {
    // 1. Filter checks
    if (approvalFilter !== "all" && (owner.adminStatus || "pending") !== approvalFilter) return false;
    if (kycFilter !== "all" && (owner.kycStatus || "pending") !== kycFilter) return false;
    if (accountFilter !== "all" && (owner.accountStatus || "active") !== accountFilter) return false;
    if (featuredFilter === "featured" && !owner.isFeatured) return false;

    // 2. Search check (Name, Business, Mobile, Email, City, Turf Name)
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const ownerTurfs = turfs.filter(t => t.ownerId === owner.uid);
      const matchName = owner.name?.toLowerCase().includes(q);
      const matchBusiness = owner.businessName?.toLowerCase().includes(q);
      const matchEmail = owner.email?.toLowerCase().includes(q);
      const matchPhone = owner.phone?.toLowerCase().includes(q) || owner.alternateMobile?.toLowerCase().includes(q);
      const matchCity = owner.city?.toLowerCase().includes(q);
      const matchTurf = ownerTurfs.some(t => t.name.toLowerCase().includes(q) || t.address?.city?.toLowerCase().includes(q));

      if (!matchName && !matchBusiness && !matchEmail && !matchPhone && !matchCity && !matchTurf) {
        return false;
      }
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-white">Turf Owners</h1>
        <p className="text-gray-400 mt-2">Manage partner profiles, verifications, statuses, and performance analytics.</p>
      </div>

      {/* Toolbar */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
        {/* Search */}
        <div className="relative w-full xl:w-96">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, business, phone, turf..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-lime-500 transition"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 w-full xl:w-auto">
          <select 
            value={approvalFilter} onChange={e => setApprovalFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-lime-500"
          >
            <option value="all">Approval: All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select 
            value={kycFilter} onChange={e => setKycFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-lime-500"
          >
            <option value="all">KYC: All</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>

          <select 
            value={accountFilter} onChange={e => setAccountFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-lime-500"
          >
            <option value="all">Status: All</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          <select 
            value={featuredFilter} onChange={e => setFeaturedFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-lime-500"
          >
            <option value="all">Featured: All</option>
            <option value="featured">Featured Only</option>
          </select>
        </div>
      </div>

      {/* Owners Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-950/50 text-zinc-400 text-xs uppercase tracking-wider">
              <th className="p-4 border-b border-zinc-800">Owner / Business</th>
              <th className="p-4 border-b border-zinc-800">Contact</th>
              <th className="p-4 border-b border-zinc-800">Turfs</th>
              <th className="p-4 border-b border-zinc-800">Status</th>
              <th className="p-4 border-b border-zinc-800 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOwners.map((owner) => {
              const ownerTurfs = turfs.filter(t => t.ownerId === owner.uid);
              const approval = owner.adminStatus || "pending";
              const accStatus = owner.accountStatus || "active";
              
              return (
                <tr key={owner.uid} className="hover:bg-zinc-800/30 transition border-b border-zinc-800/50 last:border-0">
                  <td className="p-4">
                    <p className="text-white font-bold">{owner.name}</p>
                    <p className="text-gray-400 text-sm">{owner.businessName || "No Business Name"}</p>
                    {owner.isFeatured && <span className="inline-block mt-1 bg-amber-500/10 text-amber-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Featured</span>}
                  </td>
                  <td className="p-4">
                    <p className="text-gray-300 text-sm">{owner.email}</p>
                    <p className="text-gray-500 text-xs">{owner.phone || "No Phone"}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-lime-400 font-bold text-sm">{ownerTurfs.length}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        approval === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                        approval === 'rejected' ? 'bg-red-500/10 text-red-500' :
                        'bg-amber-500/10 text-amber-500'
                      }`}>
                        App: {approval}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        accStatus === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        Acc: {accStatus}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {approval !== 'approved' && (
                        <button onClick={() => updateStatus(owner.uid, 'adminStatus', 'approved', 'APPROVE_OWNER')} className="text-xs bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-3 py-1.5 rounded-lg font-bold transition">Approve</button>
                      )}
                      {approval !== 'rejected' && (
                        <button onClick={() => updateStatus(owner.uid, 'adminStatus', 'rejected', 'REJECT_OWNER')} className="text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-1.5 rounded-lg font-bold transition">Reject</button>
                      )}
                      {accStatus === 'active' ? (
                        <button onClick={() => updateStatus(owner.uid, 'accountStatus', 'suspended', 'SUSPEND_OWNER')} className="text-xs bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 px-3 py-1.5 rounded-lg font-bold transition">Suspend</button>
                      ) : (
                        <button onClick={() => updateStatus(owner.uid, 'accountStatus', 'active', 'ACTIVATE_OWNER')} className="text-xs bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-3 py-1.5 rounded-lg font-bold transition">Activate</button>
                      )}
                      <Link href={`/admin/turf-owners/${owner.uid}/edit`} className="text-xs bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white px-3 py-1.5 rounded-lg font-bold transition border border-zinc-700">
                        Edit
                      </Link>
                      <Link href={`/admin/turf-owners/${owner.uid}`} className="text-xs bg-lime-500/20 text-lime-400 hover:bg-lime-500/30 px-3 py-1.5 rounded-lg font-bold transition border border-lime-500/50">
                        View Profile
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            
            {filteredOwners.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-zinc-500">
                  No owners found matching the criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
