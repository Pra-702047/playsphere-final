"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firestore";
import { UserProfile, updateUserFields } from "@/services/user.service";
import { logAdminActivity } from "@/services/log.service";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Save } from "lucide-react";

export default function EditTurfOwnerPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useAuth();
  
  const [owner, setOwner] = useState<Partial<UserProfile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadOwnerData();
  }, [id]);

  const loadOwnerData = async () => {
    try {
      setLoading(true);
      const userDoc = await getDoc(doc(db, "users", id));
      if (userDoc.exists()) {
        const udata = userDoc.data() as UserProfile;
        setOwner({ ...udata, uid: userDoc.id });
      } else {
        alert("Owner not found.");
        router.push("/admin/turf-owners");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof UserProfile, value: string) => {
    if (owner) {
      setOwner({ ...owner, [field]: value });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!owner || !owner.uid) return;
    
    try {
      setSaving(true);
      const res = await updateUserFields(owner.uid, owner);
      if (res.success) {
        if (user) {
          await logAdminActivity(user.uid, user.displayName || "Admin", "EDIT_OWNER_PROFILE", `Updated profile details for ${owner.name}`);
        }
        alert("Profile updated successfully!");
        router.push(`/admin/turf-owners/${owner.uid}`);
      } else {
        alert("Failed to update profile: " + res.message);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  if (!owner) return null;

  return (
    <div className="space-y-8 font-sans pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition">
            <ArrowLeft className="text-white h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Edit Profile: {owner.name}</h1>
            <p className="text-gray-400 mt-1">Update business and contact information.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-500 font-bold uppercase block mb-1">Full Name</label>
              <input type="text" value={owner.name || ''} onChange={e => handleChange('name', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-lime-500" required />
            </div>
            <div>
              <label className="text-xs text-zinc-500 font-bold uppercase block mb-1">Business Name</label>
              <input type="text" value={owner.businessName || ''} onChange={e => handleChange('businessName', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-lime-500" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 font-bold uppercase block mb-1">Mobile Number</label>
              <input type="text" value={owner.phone || ''} onChange={e => handleChange('phone', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-lime-500" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 font-bold uppercase block mb-1">Alternate Mobile</label>
              <input type="text" value={owner.alternateMobile || ''} onChange={e => handleChange('alternateMobile', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-lime-500" />
            </div>
          </div>
        </div>

        {/* KYC & Payment */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">KYC & Payment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-500 font-bold uppercase block mb-1">Aadhaar Number</label>
              <input type="text" value={owner.aadhaarNumber || ''} onChange={e => handleChange('aadhaarNumber', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-lime-500" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 font-bold uppercase block mb-1">Google Pay Number</label>
              <input type="text" value={owner.googlePayNumber || ''} onChange={e => handleChange('googlePayNumber', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-lime-500" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 font-bold uppercase block mb-1">PhonePe Number</label>
              <input type="text" value={owner.phonePeNumber || ''} onChange={e => handleChange('phonePeNumber', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-lime-500" />
            </div>
          </div>
        </div>
        
        {/* Address */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">Business Address</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-xs text-zinc-500 font-bold uppercase block mb-1">Full Address</label>
              <textarea value={owner.address || ''} onChange={e => handleChange('address', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-lime-500" rows={3}></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-500 font-bold uppercase block mb-1">City</label>
                <input type="text" value={owner.city || ''} onChange={e => handleChange('city', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-lime-500" />
              </div>
              <div>
                <label className="text-xs text-zinc-500 font-bold uppercase block mb-1">State</label>
                <input type="text" value={owner.state || ''} onChange={e => handleChange('state', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-lime-500" />
              </div>
              <div>
                <label className="text-xs text-zinc-500 font-bold uppercase block mb-1">Pincode</label>
                <input type="text" value={owner.pincode || ''} onChange={e => handleChange('pincode', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-lime-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-xl font-bold bg-zinc-800 hover:bg-zinc-700 text-white transition">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="px-6 py-3 rounded-xl font-bold bg-lime-500 hover:bg-lime-400 text-black transition flex items-center gap-2 disabled:opacity-50">
            {saving ? "Saving..." : <><Save className="w-5 h-5" /> Save Profile</>}
          </button>
        </div>
      </form>
    </div>
  );
}
