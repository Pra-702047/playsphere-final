import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/firebase/firestore";

export type TurfData = {
  id?: string;
  businessName?: string;
  name: string;
  turfType?: string;
  turfSize?: string;
  sports?: string[];
  location?: string; // Legacy
  address?: {
    area: string;
    city: string;
    state: string;
    pinCode: string;
    googleMapLink?: string;
  };
  price: number;
  imageUrl: string;
  images?: string[]; // Multiple images array support (up to 5)
  description: string;
  ownerId: string;
  isVerified?: boolean;
  avgRating?: number;
  ratingCount?: number;
  amenities?: string[]; // Legacy
  facilities?: string[];
  bookingRules?: string;
  openingTime?: string;
  closingTime?: string;
  daysOpen?: string[];
  blockedSlots?: Record<string, string[]>; // e.g. { "2026-06-28": ["06:00"] }
  holidays?: string[]; // e.g. ["2026-06-29"]
  specialRates?: Record<string, number>; // e.g. { "2026-06-28": 1800 }
  slotDuration?: number; // e.g., 60
  bufferTime?: number; // e.g., 0 or 15 minutes
};

// ======================
// CREATE TURF
// ======================
export const createTurf = async (turfData: Omit<TurfData, "id" | "isVerified">) => {
  try {
    const docRef = await addDoc(collection(db, "turfs"), {
      ...turfData,
      isVerified: false,
      facilities: turfData.facilities || turfData.amenities || [],
      sports: turfData.sports || [],
      daysOpen: turfData.daysOpen || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      openingTime: turfData.openingTime || "06:00",
      closingTime: turfData.closingTime || "23:00",
      slotDuration: turfData.slotDuration || 60,
      bufferTime: turfData.bufferTime || 0,
      blockedSlots: turfData.blockedSlots || {},
      holidays: turfData.holidays || [],
      specialRates: turfData.specialRates || {},
      createdAt: new Date(),
    });

    return {
      success: true,
      id: docRef.id,
    };
  } catch (error: any) {
    console.error("Error creating turf:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

// ======================
// UPDATE TURF
// ======================
export const updateTurf = async (turfId: string, turfData: Partial<TurfData>) => {
  try {
    const docRef = doc(db, "turfs", turfId);
    await updateDoc(docRef, turfData);
    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Error updating turf:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

// ======================
// GET OWNER TURFS
// ======================
export const getOwnerTurfs = async (ownerId: string): Promise<TurfData[]> => {
  try {
    const q = query(
      collection(db, "turfs"),
      where("ownerId", "==", ownerId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<TurfData, "id">),
    }));
  } catch (error) {
    console.error("Error fetching owner turfs:", error);
    return [];
  }
};

// ======================
// GET TURF BY ID
// ======================
export const getTurfById = async (turfId: string): Promise<TurfData | null> => {
  try {
    const docRef = doc(db, "turfs", turfId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...(docSnap.data() as Omit<TurfData, "id">),
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching turf details:", error);
    return null;
  }
};

// ======================
// GET ALL TURFS (ADMIN)
// ======================
export const getAllTurfs = async (): Promise<TurfData[]> => {
  try {
    const snapshot = await getDocs(collection(db, "turfs"));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<TurfData, "id">),
    }));
  } catch (error) {
    console.error("Error fetching all turfs:", error);
    return [];
  }
};

// ======================
// VERIFY TURF (ADMIN)
// ======================
export const verifyTurf = async (turfId: string, status: boolean) => {
  try {
    await updateDoc(doc(db, "turfs", turfId), {
      isVerified: status,
    });
    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Error verifying turf:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

// ======================
// DELETE TURF
// ======================
export const deleteTurf = async (turfId: string) => {
  try {
    await deleteDoc(doc(db, "turfs", turfId));
    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Error deleting turf:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};
