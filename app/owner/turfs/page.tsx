"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getOwnerTurfs, createTurf, updateTurf, deleteTurf, TurfData } from "@/services/turf.service";
import { storage } from "@/firebase/storage";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

// Compress and convert file to Base64 so we can fallback to Firestore storage if Firebase Storage has CORS or upload errors
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

        // Convert to quality 0.7 jpeg
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        resolve(dataUrl);
      };
      img.onerror = () => {
        // Fallback to raw base64 if canvas drawing fails
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
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState(1000);
  const [images, setImages] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState("");
  const [amenities, setAmenities] = useState<string>("Parking, Flood Lights, Washroom, Drinking Water");

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

      // Validate formats
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        alert(`${file.name} has an invalid format. Please upload JPG, JPEG, PNG, or WEBP.`);
        continue;
      }

      // Validate size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} exceeds the 5MB size limit.`);
        continue;
      }

      // Unique file naming
      const fileId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const storageRef = ref(storage, `owners/${user?.uid}/turfs/${editingTurf?.id || "temp"}/${fileId}`);

      const uploadTask = uploadBytesResumable(storageRef, file);

      try {
        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress((prev) => ({
                ...prev,
                [file.name]: Math.round(pct),
              }));
            },
            (err) => {
              console.warn("Firebase Storage upload error, falling back to local Base64:", err);
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
        // Fallback: Convert to Base64 (with local compression)
        try {
          const base64Data = await compressAndConvertToBase64(file);
          if (base64Data) {
            setImages((prev) => [...prev, base64Data]);
          } else {
            alert(`Failed to upload ${file.name}`);
          }
        } catch (compressError) {
          console.error("Local compression error:", compressError);
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

    // Cleanup in Firebase Storage if relevant
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
    setName("");
    setLocation("");
    setPrice(1000);
    setImages([]);
    setUploadProgress({});
    setUploading(false);
    setDescription("");
    setAmenities("Parking, Flood Lights, Washroom, Drinking Water");
    setModalOpen(true);
  };

  const handleOpenEditModal = (turf: TurfData) => {
    setEditingTurf(turf);
    setName(turf.name);
    setLocation(turf.location);
    setPrice(turf.price);
    setImages(turf.images || (turf.imageUrl ? [turf.imageUrl] : []));
    setUploadProgress({});
    setUploading(false);
    setDescription(turf.description || "");
    setAmenities(turf.amenities?.join(", ") || "Parking, Flood Lights, Washroom, Drinking Water");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!name || !location || !price || !description) {
      alert("Please fill all required fields");
      return;
    }

    const parsedAmenities = amenities
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const payload = {
      name,
      location,
      price: Number(price),
      imageUrl: images[0] || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=60",
      images,
      description,
      ownerId: user.uid,
      amenities: parsedAmenities,
    };

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
                  <p className="text-gray-400 text-sm mt-1">📍 {turf.location}</p>
                  <p className="text-lime-400 text-xl font-bold mt-2">₹{turf.price}/hour</p>
                  <p className="text-gray-400 text-sm mt-3 line-clamp-3 leading-relaxed">
                    {turf.description}
                  </p>
                </div>

                {/* Amenities pills */}
                <div className="pt-2">
                  <div className="flex flex-wrap gap-2">
                    {turf.amenities?.slice(0, 3).map((a, i) => (
                      <span
                        key={i}
                        className="bg-zinc-800 text-zinc-300 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded"
                      >
                        {a}
                      </span>
                    ))}
                    {(turf.amenities?.length || 0) > 3 && (
                      <span className="bg-zinc-800 text-zinc-400 text-[10px] font-bold px-2 py-1 rounded">
                        +{(turf.amenities?.length || 0) - 3} more
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
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-xl rounded-3xl p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white transition text-xl cursor-pointer"
            >
              ✕
            </button>

            <h2 className="text-3xl font-extrabold text-white mb-6 text-left">
              {editingTurf ? "Edit Turf Details" : "Add New Turf"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-left">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <label className="block text-gray-400 text-sm font-semibold mb-2">Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bandra West, Mumbai"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500"
                  />
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

              {/* Multi-Image Upload Section */}
              <div className="text-left space-y-3">
                <label className="block text-gray-400 text-sm font-semibold">Turf Images (Up to 5) *</label>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {images.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative h-20 rounded-xl bg-cover bg-center border border-zinc-800 group overflow-hidden"
                      style={{ backgroundImage: `url(${url})` }}
                    >
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(url)}
                        className="absolute top-1 right-1 bg-black/75 hover:bg-black text-white p-1 rounded-full text-[9px] leading-none cursor-pointer border border-zinc-800"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {/* Uploading progress placeholders */}
                  {Object.entries(uploadProgress).map(([filename, pct]) => (
                    <div
                      key={filename}
                      className="h-20 rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center p-2 text-center"
                    >
                      <span className="text-[9px] text-zinc-500 truncate w-full">{filename}</span>
                      <span className="text-xs font-black text-lime-400 font-mono mt-1">{pct}%</span>
                    </div>
                  ))}

                  {images.length < 5 && (
                    <label
                      htmlFor="turf-images-uploader"
                      className={`h-20 rounded-xl border border-dashed border-zinc-800 hover:border-lime-500/40 bg-zinc-950 flex flex-col items-center justify-center cursor-pointer transition text-zinc-550 hover:text-zinc-300 ${
                        uploading ? "pointer-events-none opacity-50" : ""
                      }`}
                    >
                      <span className="text-xl">📷</span>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold mt-1">Add Photo</span>
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
                <label className="block text-gray-400 text-sm font-semibold mb-2">Amenities (Comma separated)</label>
                <input
                  type="text"
                  placeholder="Parking, Flood Lights, Washroom, Drinking Water"
                  value={amenities}
                  onChange={(e) => setAmenities(e.target.value)}
                  className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500"
                />
              </div>

              <div className="text-left">
                <label className="block text-gray-400 text-sm font-semibold mb-2">Description *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your turf, amenities, and available facilities..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl transition cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className={`flex-1 bg-lime-500 hover:bg-lime-400 text-black font-bold py-4 rounded-xl transition shadow-lg shadow-lime-500/15 cursor-pointer text-sm ${
                    uploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {uploading ? "Uploading..." : editingTurf ? "Save Changes" : "Create Turf"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
