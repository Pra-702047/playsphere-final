"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getOwnerTurfs, createTurf, updateTurf, deleteTurf, TurfData } from "@/services/turf.service";
import { storage } from "@/firebase/storage";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

const SPORTS_OPTIONS = ["Football", "Cricket", "Box Cricket", "Badminton", "Pickleball", "Padel ball"];
const TURF_TYPES = ["Football", "Cricket", "Box Cricket", "Badminton", "Pickleball", "Padel", "Multi-Sport"];
const TURF_SIZES = ["5v5", "6v6", "7v7", "11v11", "Not Applicable"];
const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const FACILITIES_OPTIONS = ["Parking", "Washroom", "Flood Lights", "Drinking Water", "Cafeteria", "Changing Room", "First Aid", "CCTV", "Locker Room", "Seating Area", "Shower", "WiFi"];

const compressAndConvertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(event.target?.result as string);
      };
    };
    reader.onerror = () => {
      resolve("");
    };
  });
};

export default function OwnerTurfsPage() {
  const { user } = useAuth();
  const [turfs, setTurfs] = useState<TurfData[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTurf, setEditingTurf] = useState<TurfData | null>(null);

  // Form State
  const [businessName, setBusinessName] = useState("");
  const [name, setName] = useState("");
  const [turfType, setTurfType] = useState<string[]>([]);
  const [turfTypeDropdownOpen, setTurfTypeDropdownOpen] = useState(false);
  const [turfSize, setTurfSize] = useState(TURF_SIZES[0]);
  const [sports, setSports] = useState<string[]>([]);
  const [sportsDropdownOpen, setSportsDropdownOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [address, setAddress] = useState({ area: "", city: "", state: "", pinCode: "", googleMapLink: "" });
  const [openingTime, setOpeningTime] = useState("06:00");
  const [closingTime, setClosingTime] = useState("23:00");
  const [daysOpen, setDaysOpen] = useState<string[]>(DAYS_OF_WEEK);
  const [price, setPrice] = useState(1000);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [bookingRules, setBookingRules] = useState("");
  
  const [images, setImages] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!user) return;
    loadTurfs();
  }, [user]);

  const loadTurfs = async () => {
    if (!user) return;
    try {
      const data = await getOwnerTurfs(user.uid);
      setTurfs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 5) {
      alert("You can upload a maximum of 5 images per turf.");
      return;
    }

    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        alert(`${file.name} has an invalid format. Please upload JPG, JPEG, PNG, or WEBP.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} exceeds the 5MB size limit.`);
        continue;
      }

      const fileId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const storageRef = ref(storage, `owners/${user?.uid}/turfs/${editingTurf?.id || "temp"}/${fileId}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      try {
        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress((prev) => ({ ...prev, [file.name]: Math.round(pct) }));
            },
            (err) => {
              reject(err);
            },
            async () => {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              setImages((prev) => [...prev, downloadUrl]);
              setUploadProgress((prev) => {
                const updated = { ...prev };
                delete updated[file.name];
                return updated;
              });
              resolve();
            }
          );
        });
      } catch (err) {
        try {
          const base64Data = await compressAndConvertToBase64(file);
          if (base64Data) {
            setImages((prev) => [...prev, base64Data]);
          } else {
            alert(`Failed to upload ${file.name}`);
          }
        } catch (compressError) {
          alert(`Failed to upload ${file.name}`);
        } finally {
          setUploadProgress((prev) => {
            const updated = { ...prev };
            delete updated[file.name];
            return updated;
          });
        }
      }
    }
    setUploading(false);
  };

  const handleDeleteImage = async (url: string) => {
    setImages((prev) => prev.filter((img) => img !== url));
    if (url.includes("firebasestorage.googleapis.com")) {
      try {
        const storageRef = ref(storage, url);
        await deleteObject(storageRef);
      } catch (err) {
        console.warn("Storage cleanup warning:", err);
      }
    }
  };

  const handleDelete = async (turfId: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this turf? This will remove the listing entirely.");
    if (!confirmDelete) return;

    try {
      const res = await deleteTurf(turfId);
      if (res.success) {
        alert("Turf deleted successfully!");
        loadTurfs();
      } else {
        alert(res.message || "Failed to delete turf.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAddModal = () => {
    setEditingTurf(null);
    setBusinessName("");
    setName("");
    setTurfType([]);
    setTurfSize(TURF_SIZES[0]);
    setSports([]);
    setAddress({ area: "", city: "", state: "", pinCode: "", googleMapLink: "" });
    setOpeningTime("06:00");
    setClosingTime("23:00");
    setDaysOpen(DAYS_OF_WEEK);
    setPrice(1000);
    setFacilities([]);
    setBookingRules("");
    setImages([]);
    setUploadProgress({});
    setUploading(false);
    setDescription("");
    setModalOpen(true);
  };

  const handleOpenEditModal = (turf: TurfData) => {
    setEditingTurf(turf);
    setBusinessName(turf.businessName || "");
    setName(turf.name);
    setTurfType(Array.isArray(turf.turfType) ? turf.turfType : (turf.turfType ? [turf.turfType] : []));
    setTurfSize(turf.turfSize || TURF_SIZES[0]);
    setSports(turf.sports || []);
    setAddress({
      area: turf.address?.area || "",
      city: turf.address?.city || "",
      state: turf.address?.state || "",
      pinCode: turf.address?.pinCode || "",
      googleMapLink: turf.address?.googleMapLink || ""
    });
    setOpeningTime(turf.openingTime || "06:00");
    setClosingTime(turf.closingTime || "23:00");
    setDaysOpen(turf.daysOpen || DAYS_OF_WEEK);
    setPrice(turf.price);
    setFacilities(turf.facilities || turf.amenities || []);
    setBookingRules(turf.bookingRules || "");
    setImages(turf.images || (turf.imageUrl ? [turf.imageUrl] : []));
    setUploadProgress({});
    setUploading(false);
    setDescription(turf.description || "");
    setModalOpen(true);
  };

  const toggleArrayItem = (item: string, array: string[], setArray: (val: string[]) => void) => {
    if (array.includes(item)) {
      setArray(array.filter(i => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (submitting) return;

    if (!businessName || !name || turfType.length === 0 || !turfSize || sports.length === 0) {
      alert("Please fill all required business and turf details.");
      return;
    }
    if (!openingTime || !closingTime || daysOpen.length === 0) {
      alert("Please specify operating hours and days open.");
      return;
    }
    if (!address.city || !address.state || !address.pinCode) {
      alert("City, State, and PIN Code are required.");
      return;
    }
    if (facilities.length === 0 || images.length === 0 || !description) {
      alert("Please add at least one facility, one image, and a description.");
      return;
    }

    const payload = {
      businessName,
      name,
      turfType,
      turfSize,
      sports,
      address,
      openingTime,
      closingTime,
      daysOpen,
      price: Number(price),
      facilities,
      bookingRules,
      imageUrl: images[0] || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=60",
      images,
      description,
      ownerId: user.uid,
    };

    setSubmitting(true);

    try {
      if (editingTurf && editingTurf.id) {
        const res = await updateTurf(editingTurf.id, payload);
        if (res.success) {
          alert("Turf updated successfully!");
          setModalOpen(false);
          loadTurfs();
        } else {
          alert(res.message);
        }
      } else {
        const res = await createTurf(payload);
        if (res.success) {
          alert("Turf added successfully!");
          setModalOpen(false);
          loadTurfs();
        } else {
          alert(res.message);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
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
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="text-left">
          <h1 className="text-4xl font-extrabold text-white">Manage Turfs</h1>
          <p className="text-gray-400 mt-2">List new venues, update pricing, and showcase highlights.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-lime-500 hover:bg-lime-400 text-black font-bold py-3 px-6 rounded-xl transition shadow-lg shadow-lime-500/10 cursor-pointer w-full md:w-auto"
        >
          ➕ Add New Turf
        </button>
      </div>

      {/* Turf Grid */}
      {turfs.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 p-12 rounded-2xl text-center">
          <p className="text-gray-400 text-lg">No turfs listed yet. Click "Add New Turf" to list your first venue!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {turfs.map((turf) => (
            <div
              key={turf.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-lime-500/50 transition duration-300 flex flex-col justify-between shadow-lg"
            >
              {/* Turf Image */}
              <div
                className="h-48 bg-cover bg-center bg-zinc-800"
                style={{ backgroundImage: `url(${turf.imageUrl || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=60'})` }}
              />

              {/* Turf Content */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between text-left">
                <div>
                  <h2 className="text-2xl font-bold text-white leading-tight">{turf.name}</h2>
                  <p className="text-gray-400 text-sm mt-1">📍 {turf.address ? `${turf.address.area || turf.address.city}, ${turf.address.state}` : turf.location}</p>
                  <p className="text-lime-400 text-xl font-bold mt-2">₹{turf.price}/hour</p>
                  <p className="text-gray-400 text-sm mt-3 line-clamp-3 leading-relaxed">
                    {turf.description}
                  </p>
                </div>

                {/* Facilities pills */}
                <div className="pt-2">
                  <div className="flex flex-wrap gap-2">
                    {(turf.facilities || turf.amenities || []).slice(0, 3).map((a, i) => (
                      <span
                        key={i}
                        className="bg-zinc-800 text-zinc-300 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded"
                      >
                        {a}
                      </span>
                    ))}
                    {((turf.facilities || turf.amenities)?.length || 0) > 3 && (
                      <span className="bg-zinc-800 text-zinc-400 text-[10px] font-bold px-2 py-1 rounded">
                        +{((turf.facilities || turf.amenities)?.length || 0) - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-zinc-800/80 flex gap-2">
                  <button
                    onClick={() => handleOpenEditModal(turf)}
                    className="flex-1 text-center bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-2 px-4 rounded-xl border border-zinc-700 transition text-sm cursor-pointer"
                  >
                    Edit Venue
                  </button>
                  <button
                    onClick={() => turf.id && handleDelete(turf.id)}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-2 rounded-xl transition text-sm font-bold cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl rounded-3xl p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white transition text-xl cursor-pointer bg-zinc-800 hover:bg-zinc-700 w-8 h-8 rounded-full flex items-center justify-center"
            >
              ✕
            </button>

            <h2 className="text-3xl font-extrabold text-white mb-8 text-left border-b border-zinc-800 pb-4">
              {editingTurf ? "Edit Turf Details" : "Add New Turf"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Section 1: Business Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-lime-400">1. Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div>
                    <label className="block text-gray-400 text-sm font-semibold mb-2">Business Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PlayZone Sports Arena"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-semibold mb-2">Turf Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Camp Nou Turf"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Turf Details */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-lime-400">2. Turf Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div className="relative">
                    <label className="block text-gray-400 text-sm font-semibold mb-2">Turf Type *</label>
                    <div 
                      onClick={() => setTurfTypeDropdownOpen(!turfTypeDropdownOpen)}
                      className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white cursor-pointer flex justify-between items-center outline-none hover:bg-zinc-750 transition"
                    >
                      <span className={`text-sm ${turfType.length === 0 ? 'text-zinc-400' : 'text-white font-medium'}`}>
                        {turfType.length > 0 
                          ? (turfType.length <= 3 ? turfType.join(", ") : `${turfType.length} types selected`)
                          : "Select Turf Type..."}
                      </span>
                      <span className={`text-zinc-500 transition-transform duration-300 ${turfTypeDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                    </div>

                    {turfTypeDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setTurfTypeDropdownOpen(false)}></div>
                        <div className="absolute z-20 w-full mt-2 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden custom-scrollbar">
                          <div className="max-h-60 overflow-y-auto p-2">
                            {TURF_TYPES.map(t => (
                              <label key={t} className={`flex items-center gap-3 p-3 hover:bg-zinc-700 rounded-lg cursor-pointer transition ${turfType.includes(t) ? 'bg-zinc-700/50 text-lime-400' : 'text-white'}`}>
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 accent-lime-500 cursor-pointer"
                                  checked={turfType.includes(t)}
                                  onChange={() => toggleArrayItem(t, turfType, setTurfType)}
                                />
                                <span className="text-sm font-medium">{t}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-semibold mb-2">Turf Size *</label>
                    <select
                      value={turfSize}
                      onChange={(e) => setTurfSize(e.target.value)}
                      className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500"
                    >
                      {TURF_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-semibold mb-2">Hourly Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="100"
                      placeholder="e.g. 1500"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-gray-400 text-sm font-semibold mb-3 text-left">Sports Supported *</label>
                  
                  {/* Custom Dropdown Trigger */}
                  <div 
                    onClick={() => setSportsDropdownOpen(!sportsDropdownOpen)}
                    className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white cursor-pointer flex justify-between items-center outline-none focus:border-lime-500 hover:bg-zinc-750 transition"
                  >
                    <span className={`text-sm ${sports.length === 0 ? 'text-zinc-400' : 'text-white font-medium'}`}>
                      {sports.length > 0 
                        ? (sports.length <= 3 ? sports.join(", ") : `${sports.length} sports selected`)
                        : "Select Sports..."}
                    </span>
                    <span className={`text-zinc-500 transition-transform duration-300 ${sportsDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                  </div>

                  {/* Custom Dropdown Menu */}
                  {sportsDropdownOpen && (
                    <>
                      {/* Invisible overlay to close dropdown when clicking outside */}
                      <div className="fixed inset-0 z-10" onClick={() => setSportsDropdownOpen(false)}></div>
                      
                      <div className="absolute z-20 w-full mt-2 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden custom-scrollbar">
                        <div className="max-h-60 overflow-y-auto p-2">
                          {SPORTS_OPTIONS.map(sport => (
                            <label key={sport} className={`flex items-center gap-3 p-3 hover:bg-zinc-700 rounded-lg cursor-pointer transition ${sports.includes(sport) ? 'bg-zinc-700/50 text-lime-400' : 'text-white'}`}>
                              <input
                                type="checkbox"
                                className="w-4 h-4 accent-lime-500 cursor-pointer"
                                checked={sports.includes(sport)}
                                onChange={() => toggleArrayItem(sport, sports, setSports)}
                              />
                              <span className="text-sm font-medium">{sport}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Section 3: Operating Hours */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-lime-400">3. Operating Hours</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div>
                    <label className="block text-gray-400 text-sm font-semibold mb-2">Opening Time *</label>
                    <input
                      type="time"
                      required
                      value={openingTime}
                      onChange={(e) => setOpeningTime(e.target.value)}
                      className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-semibold mb-2">Closing Time *</label>
                    <input
                      type="time"
                      required
                      value={closingTime}
                      onChange={(e) => setClosingTime(e.target.value)}
                      className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-semibold mb-3 text-left">Days Open *</label>
                  <div className="flex flex-wrap gap-3 text-left">
                    {DAYS_OF_WEEK.map(day => (
                      <label key={day} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition ${daysOpen.includes(day) ? 'bg-lime-500/10 border-lime-500 text-white' : 'bg-zinc-800 border-zinc-700 text-gray-400 hover:border-zinc-500'}`}>
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-lime-500"
                          checked={daysOpen.includes(day)}
                          onChange={() => toggleArrayItem(day, daysOpen, setDaysOpen)}
                        />
                        <span className="text-sm font-medium">{day.substring(0, 3)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 4: Address */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-lime-400">4. Full Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div>
                    <label className="block text-gray-400 text-sm font-semibold mb-2">Area / Locality</label>
                    <input
                      type="text"
                      placeholder="e.g. Bandra West"
                      value={address.area}
                      onChange={(e) => setAddress({ ...address, area: e.target.value })}
                      className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-semibold mb-2">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mumbai"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-semibold mb-2">State *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maharashtra"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-semibold mb-2">PIN Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 400050"
                      value={address.pinCode}
                      onChange={(e) => setAddress({ ...address, pinCode: e.target.value })}
                      className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-400 text-sm font-semibold mb-2">Google Maps Link (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://maps.google.com/..."
                      value={address.googleMapLink}
                      onChange={(e) => setAddress({ ...address, googleMapLink: e.target.value })}
                      className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Facilities & Rules */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-lime-400">5. Facilities & Rules</h3>
                
                <div>
                  <label className="block text-gray-400 text-sm font-semibold mb-3 text-left">Facilities Available *</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
                    {FACILITIES_OPTIONS.map(facility => (
                      <label key={facility} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${facilities.includes(facility) ? 'bg-lime-500/10 border-lime-500 text-white' : 'bg-zinc-800 border-zinc-700 text-gray-400 hover:border-zinc-500'}`}>
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-lime-500"
                          checked={facilities.includes(facility)}
                          onChange={() => toggleArrayItem(facility, facilities, setFacilities)}
                        />
                        <span className="text-sm font-medium">{facility}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="text-left">
                  <label className="block text-gray-400 text-sm font-semibold mb-2">Booking Rules</label>
                  <textarea
                    rows={4}
                    placeholder="e.g. Shoes compulsory\nNo Smoking\nOutside Food Allowed"
                    value={bookingRules}
                    onChange={(e) => setBookingRules(e.target.value)}
                    className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500"
                  />
                </div>
              </div>

              {/* Section 6: Media & Description */}
              <div className="space-y-4 border-t border-zinc-800 pt-6">
                <h3 className="text-xl font-bold text-lime-400">6. Media & Description</h3>
                
                <div className="text-left space-y-3">
                  <label className="block text-gray-400 text-sm font-semibold">Turf Images (Up to 5) *</label>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {images.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative h-24 rounded-xl bg-cover bg-center border border-zinc-800 group overflow-hidden"
                        style={{ backgroundImage: `url(${url})` }}
                      >
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(url)}
                          className="absolute top-2 right-2 bg-black/75 hover:bg-black text-white p-1.5 rounded-full text-[10px] leading-none cursor-pointer border border-zinc-800"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {Object.entries(uploadProgress).map(([filename, pct]) => (
                      <div
                        key={filename}
                        className="h-24 rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center p-2 text-center"
                      >
                        <span className="text-[10px] text-zinc-500 truncate w-full">{filename}</span>
                        <span className="text-sm font-black text-lime-400 font-mono mt-1">{pct}%</span>
                      </div>
                    ))}

                    {images.length < 5 && (
                      <label
                        htmlFor="turf-images-uploader"
                        className={`h-24 rounded-xl border border-dashed border-zinc-700 hover:border-lime-500/40 bg-zinc-900 flex flex-col items-center justify-center cursor-pointer transition text-zinc-500 hover:text-zinc-300 ${
                          uploading ? "pointer-events-none opacity-50" : ""
                        }`}
                      >
                        <span className="text-2xl">📷</span>
                        <span className="text-[10px] uppercase tracking-wider font-bold mt-2">Add Photo</span>
                      </label>
                    )}
                  </div>

                  <input
                    type="file"
                    id="turf-images-uploader"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </div>

                <div className="text-left">
                  <label className="block text-gray-400 text-sm font-semibold mb-2">Turf Description *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your turf, amenities, and available facilities in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl transition cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || submitting}
                  className={`flex-1 bg-lime-500 hover:bg-lime-400 text-black font-bold py-4 rounded-xl transition shadow-lg shadow-lime-500/15 cursor-pointer text-sm ${
                    (uploading || submitting) ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {uploading ? "Uploading..." : submitting ? "Saving..." : editingTurf ? "Save Changes" : "Create Turf"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
