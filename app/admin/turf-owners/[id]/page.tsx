"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firestore";
import { UserProfile, updateUserFields } from "@/services/user.service";
import { TurfData } from "@/services/turf.service";
import { getOwnerBookings } from "@/services/booking.service";
import { logAdminActivity } from "@/services/log.service";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, CheckCircle, XCircle, Info, Building, MapPin, CreditCard, Activity, UploadCloud, Copy, Star } from "lucide-react";
import Link from "next/link";

export default function TurfOwnerProfilePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useAuth();
  
  const [owner, setOwner] = useState<UserProfile | null>(null);
  const [turfs, setTurfs] = useState<TurfData[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    loadOwnerData();
  }, [id]);

  const loadOwnerData = async () => {
    try {
      setLoading(true);
      // Fetch owner
      const userDoc = await getDoc(doc(db, "users", id));
      if (userDoc.exists()) {
        const udata = userDoc.data() as UserProfile;
        if (udata.role === "owner") {
          setOwner({ ...udata, uid: userDoc.id });
        } else {
          alert("User is not an owner.");
          router.push("/admin/turf-owners");
          return;
        }
      }
      
      // Fetch turfs
      import("@/services/turf.service").then(async (m) => {
        const allTurfs = await m.getAllTurfs();
        setTurfs(allTurfs.filter(t => t.ownerId === id));
      });

      // Fetch bookings
      const ownerBookings = await getOwnerBookings(id);
      setBookings(ownerBookings);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = async (field: keyof UserProfile, value: any, actionDesc: string) => {
    if (!owner) return;
    try {
      const res = await updateUserFields(owner.uid, { [field]: value });
      if (res.success) {
        if (user) {
          await logAdminActivity(user.uid, user.displayName || "Admin", "UPDATE_OWNER", actionDesc);
        }
        setOwner({ ...owner, [field]: value });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const copyText = (text: string | undefined) => {
    if (text) {
      navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  if (!owner) return <div className="text-white p-8">Owner not found.</div>;

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition">
          <ArrowLeft className="text-white h-5 w-5" />
        </button>
        <div>
          <h1 className="text-4xl font-extrabold text-white flex items-center gap-3">
            {owner.name} 
            {owner.isFeatured && <span className="bg-amber-500/10 text-amber-500 text-xs px-2 py-1 rounded-full uppercase tracking-widest font-bold">Featured</span>}
          </h1>
          <p className="text-gray-400 mt-2">{owner.businessName || "Independent Turf Owner"} | {owner.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-zinc-800 pb-2 scrollbar-hide">
        {['profile', 'identity', 'business', 'turfs', 'analytics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold capitalize transition ${activeTab === tab ? "bg-lime-500 text-black shadow-lg shadow-lime-500/20" : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Info className="h-5 w-5 text-lime-400" /> Basic Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Full Name</label>
                    <p className="text-white mt-1">{owner.name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Business Name</label>
                    <p className="text-white mt-1">{owner.businessName || "-"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Mobile Number</label>
                    <p className="text-white mt-1">{owner.phone || "-"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Alternate Mobile</label>
                    <p className="text-white mt-1">{owner.alternateMobile || "-"}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Email</label>
                    <p className="text-white mt-1">{owner.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Activity className="h-5 w-5 text-lime-400" /> Admin Status & Commission</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Account Status</label>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => updateField('accountStatus', 'active', 'Activated account')} className={`text-xs px-3 py-1.5 rounded-lg font-bold border ${owner.accountStatus === 'active' || !owner.accountStatus ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'border-zinc-700 text-zinc-400'}`}>Active</button>
                      <button onClick={() => updateField('accountStatus', 'suspended', 'Suspended account')} className={`text-xs px-3 py-1.5 rounded-lg font-bold border ${owner.accountStatus === 'suspended' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'border-zinc-700 text-zinc-400'}`}>Suspended</button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Approval Status</label>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => updateField('adminStatus', 'approved', 'Approved owner')} className={`text-xs px-3 py-1.5 rounded-lg font-bold border ${owner.adminStatus === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'border-zinc-700 text-zinc-400'}`}>Approved</button>
                      <button onClick={() => updateField('adminStatus', 'rejected', 'Rejected owner')} className={`text-xs px-3 py-1.5 rounded-lg font-bold border ${owner.adminStatus === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'border-zinc-700 text-zinc-400'}`}>Rejected</button>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Featured Turf</label>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => updateField('isFeatured', true, 'Marked as featured')} className={`text-xs px-3 py-1.5 rounded-lg font-bold border ${owner.isFeatured ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'border-zinc-700 text-zinc-400'}`}>Mark Featured</button>
                      <button onClick={() => updateField('isFeatured', false, 'Removed featured')} className={`text-xs px-3 py-1.5 rounded-lg font-bold border ${!owner.isFeatured ? 'bg-zinc-800 text-white border-zinc-700' : 'border-zinc-700 text-zinc-400'}`}>Remove Featured</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'identity' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><CheckCircle className="h-5 w-5 text-lime-400" /> Identity Verification (KYC)</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Aadhaar Number</label>
                  <p className="text-white mt-1 text-lg tracking-widest">{owner.aadhaarNumber || "Not Provided"}</p>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Verification Status</label>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => updateField('kycStatus', 'verified', 'Verified KYC')} className={`text-xs px-3 py-1.5 rounded-lg font-bold border ${owner.kycStatus === 'verified' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'border-zinc-700 text-zinc-400'}`}>Verified</button>
                    <button onClick={() => updateField('kycStatus', 'pending', 'Pending KYC')} className={`text-xs px-3 py-1.5 rounded-lg font-bold border ${owner.kycStatus === 'pending' || !owner.kycStatus ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'border-zinc-700 text-zinc-400'}`}>Pending</button>
                    <button onClick={() => updateField('kycStatus', 'rejected', 'Rejected KYC')} className={`text-xs px-3 py-1.5 rounded-lg font-bold border ${owner.kycStatus === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'border-zinc-700 text-zinc-400'}`}>Rejected</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><UploadCloud className="h-5 w-5 text-lime-400" /> Uploaded Documents</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center bg-zinc-950">
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">Aadhaar Front</span>
                  {owner.aadhaarFrontUrl ? (
                    <a href={owner.aadhaarFrontUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg transition">View Document</a>
                  ) : (
                    <span className="text-zinc-600 text-sm">Not Uploaded</span>
                  )}
                </div>
                <div className="border border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center bg-zinc-950">
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">Aadhaar Back</span>
                  {owner.aadhaarBackUrl ? (
                    <a href={owner.aadhaarBackUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg transition">View Document</a>
                  ) : (
                    <span className="text-zinc-600 text-sm">Not Uploaded</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'business' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><CreditCard className="h-5 w-5 text-lime-400" /> Payment Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Google Pay (Req)</label>
                    <div className="flex gap-2 items-center mt-1">
                      <p className="text-white bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800 w-full">{owner.googlePayNumber || "-"}</p>
                      <button onClick={() => copyText(owner.googlePayNumber)} className="p-2 hover:bg-zinc-800 rounded-lg text-gray-400"><Copy className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">PhonePe (Req)</label>
                    <div className="flex gap-2 items-center mt-1">
                      <p className="text-white bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800 w-full">{owner.phonePeNumber || "-"}</p>
                      <button onClick={() => copyText(owner.phonePeNumber)} className="p-2 hover:bg-zinc-800 rounded-lg text-gray-400"><Copy className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Paytm (Opt)</label>
                    <div className="flex gap-2 items-center mt-1">
                      <p className="text-white bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800 w-full">{owner.paytmNumber || "-"}</p>
                      <button onClick={() => copyText(owner.paytmNumber)} className="p-2 hover:bg-zinc-800 rounded-lg text-gray-400"><Copy className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">UPI ID (Opt)</label>
                    <div className="flex gap-2 items-center mt-1">
                      <p className="text-white bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800 w-full">{owner.upiId || "-"}</p>
                      <button onClick={() => copyText(owner.upiId)} className="p-2 hover:bg-zinc-800 rounded-lg text-gray-400"><Copy className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="col-span-2 mt-4 pt-4 border-t border-zinc-800">
                    <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2 block">Bank Account (Opt)</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-zinc-600">Bank Name</span>
                        <p className="text-sm text-gray-300">{owner.bankName || "-"}</p>
                      </div>
                      <div>
                        <span className="text-xs text-zinc-600">Account Name</span>
                        <p className="text-sm text-gray-300">{owner.bankAccountName || "-"}</p>
                      </div>
                      <div>
                        <span className="text-xs text-zinc-600">Account No.</span>
                        <p className="text-sm text-gray-300">{owner.bankAccountNumber || "-"}</p>
                      </div>
                      <div>
                        <span className="text-xs text-zinc-600">IFSC Code</span>
                        <p className="text-sm text-gray-300">{owner.bankIfscCode || "-"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg flex flex-col">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><MapPin className="h-5 w-5 text-lime-400" /> Business Address</h2>
              <div className="space-y-4 flex-1">
                <div>
                  <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Full Address</label>
                  <p className="text-white mt-1 bg-zinc-950 p-3 rounded-xl border border-zinc-800">{owner.address || "No address provided"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Landmark</label>
                    <p className="text-white mt-1">{owner.landmark || "-"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">City</label>
                    <p className="text-white mt-1">{owner.city || "-"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">State</label>
                    <p className="text-white mt-1">{owner.state || "-"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Pincode</label>
                    <p className="text-white mt-1">{owner.pincode || "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'turfs' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Building className="h-6 w-6 text-lime-400" /> Registered Turfs ({turfs.length})</h2>
            {turfs.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 p-12 rounded-2xl text-center shadow-lg">
                <p className="text-zinc-500">No turfs registered by this owner.</p>
              </div>
            ) : (
              turfs.map(turf => (
                <div key={turf.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg flex flex-col lg:flex-row gap-6">
                  <div className="w-full lg:w-1/3">
                    <div className="aspect-video bg-zinc-800 rounded-xl overflow-hidden mb-4 border border-zinc-700">
                      {turf.images && turf.images.length > 0 ? (
                        <img src={turf.images[0]} alt={turf.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600 font-bold">No Image</div>
                      )}
                    </div>
                    <div className="flex justify-between items-center bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                      <div>
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Status</p>
                        <p className={`text-sm font-bold ${turf.isVerified ? 'text-lime-400' : 'text-amber-400'}`}>{turf.isVerified ? 'Verified' : 'Pending Verification'}</p>
                      </div>
                      <Link href={`/admin/turfs`} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg border border-zinc-700">Manage</Link>
                    </div>
                  </div>
                  <div className="w-full lg:w-2/3 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{turf.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">{turf.address?.area}, {turf.address?.city}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-zinc-500 font-bold uppercase">Size</p>
                        <p className="text-sm text-white">{turf.turfSize || "Unknown"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 font-bold uppercase">Type</p>
                        <p className="text-sm text-white capitalize">{Array.isArray(turf.turfType) ? turf.turfType.join(', ') : (turf.turfType || "Unknown")}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 font-bold uppercase">Base Price</p>
                        <p className="text-sm text-lime-400 font-bold">₹{turf.price}/hr</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 font-bold uppercase">Rating</p>
                        <p className="text-sm text-white flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {turf.rating || "N/A"}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-zinc-800">
                      <p className="text-xs text-zinc-500 font-bold uppercase mb-2">Sports Supported</p>
                      <div className="flex flex-wrap gap-2">
                        {turf.sports && turf.sports.map((s: string) => (
                          <span key={s} className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-md capitalize">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Activity className="h-6 w-6 text-lime-400" /> Booking Analytics Dashboard</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-lg">
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Total Bookings</p>
                <p className="text-3xl font-black text-white mt-2">{bookings.length}</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-lg">
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Total Revenue</p>
                <p className="text-3xl font-black text-lime-400 mt-2">
                  ₹{bookings.reduce((acc, b) => acc + (Number(b.price) || 0), 0).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-lg">
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Completed</p>
                <p className="text-3xl font-black text-white mt-2">{bookings.filter(b => b.status === "completed" || b.status === "accepted").length}</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-lg">
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Cancelled</p>
                <p className="text-3xl font-black text-red-400 mt-2">{bookings.filter(b => b.status === "cancelled").length}</p>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-bold text-white mb-4">Recent Bookings (Latest 10)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-950/50 text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-800">
                      <th className="p-3 font-bold">Date & Time</th>
                      <th className="p-3 font-bold">Turf</th>
                      <th className="p-3 font-bold">Price</th>
                      <th className="p-3 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 10).map((b, i) => {
                      const tName = turfs.find(t => t.id === b.turfId)?.name || "Unknown";
                      return (
                        <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                          <td className="p-3 text-sm text-gray-300">{b.date} | {b.slot}</td>
                          <td className="p-3 text-sm text-white font-bold">{tName}</td>
                          <td className="p-3 text-sm text-lime-400 font-bold">₹{b.price}</td>
                          <td className="p-3">
                            <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase ${b.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-zinc-500">No bookings recorded yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
