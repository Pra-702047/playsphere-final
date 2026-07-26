import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  limit,
  orderBy,
  startAfter,
} from "firebase/firestore";

import { db } from "@/firebase/firestore";

export const createBooking = async (
  bookingData: any
) => {
  try {
    const q = query(
      collection(db, "bookings"),
      where("turfId", "==", bookingData.turfId),
      where("date", "==", bookingData.date),
      where("slot", "==", bookingData.slot)
    );

    const snapshot = await getDocs(q);
    const activeBookings = snapshot.docs.filter((doc) => {
      const data = doc.data();
      return data.status !== "cancelled" && data.status !== "rejected" && data.status !== "refunded";
    });

    if (activeBookings.length > 0) {
      return {
        success: false,
        message:
          "This slot is already booked. Please select another slot.",
      };
    }

    const docRef = await addDoc(
      collection(db, "bookings"),
      {
        ...bookingData,
        bookingType: "online",
      }
    );

    return {
      success: true,
      id: docRef.id,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};


export const cancelBooking = async (
  bookingId: string
) => {
  try {
    await updateDoc(
      doc(db, "bookings", bookingId),
      {
        status: "cancelled",
      }
    );

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};
export const getUserBookings = async (
  userId: string
) => {
  try {
    const q = query(
      collection(db, "bookings"),
      where("userId", "==", userId)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getOwnerBookings = async (ownerId: string) => {
  try {
    const q = query(
      collection(db, "bookings"),
      where("ownerId", "==", ownerId),
      orderBy("createdAt", "desc"),
      limit(500) // SAFETY LIMIT
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting owner bookings:", error);
    return [];
  }
};

export const getOwnerBookingsPaginated = async (ownerId: string, lastVisibleDoc: any = null, pageSize: number = 50) => {
  try {
    let q = query(
      collection(db, "bookings"),
      where("ownerId", "==", ownerId),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );

    if (lastVisibleDoc) {
      q = query(q, startAfter(lastVisibleDoc));
    }

    const snapshot = await getDocs(q);
    return {
      bookings: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      lastVisible: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === pageSize
    };
  } catch (error) {
    console.error("Error getting paginated owner bookings:", error);
    return { bookings: [], lastVisible: null, hasMore: false };
  }
};

export const updateBookingStatus = async (bookingId: string, status: string) => {
  try {
    await updateDoc(doc(db, "bookings", bookingId), {
      status,
    });
    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Error updating booking status:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getAllBookings = async () => {
  try {
    const snapshot = await getDocs(collection(db, "bookings"));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting all bookings:", error);
    return [];
  }
};

export const rescheduleBooking = async (
  bookingId: string,
  turfId: string,
  newDate: string,
  newSlot: string
) => {
  try {
    const bookingDocRef = doc(db, "bookings", bookingId);
    const bookingSnap = await getDoc(bookingDocRef);
    if (!bookingSnap.exists()) {
      return { success: false, message: "Booking not found" };
    }
    
    if (bookingSnap.data().turfId !== turfId) {
      return { success: false, message: "Security Error: Cannot change turf during reschedule." };
    }

    const q = query(
      collection(db, "bookings"),
      where("turfId", "==", turfId),
      where("date", "==", newDate),
      where("slot", "==", newSlot)
    );
    const snapshot = await getDocs(q);
    const activeBookings = snapshot.docs.filter((doc) => {
      const data = doc.data();
      return data.status !== "cancelled" && data.status !== "rejected" && data.status !== "refunded";
    });

    if (activeBookings.length > 0) {
      return {
        success: false,
        message: "This slot is already booked on the selected date. Please choose another slot.",
      };
    }

    await updateDoc(doc(db, "bookings", bookingId), {
      date: newDate,
      slot: newSlot,
      status: "pending",
    });

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Error rescheduling booking:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

export const verifyBookingOTP = async (bookingId: string) => {
  try {
    await updateDoc(doc(db, "bookings", bookingId), {
      otpVerified: true,
      status: "checked_in",
    });
    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getBookingByOTP = async (ownerId: string, otp: string): Promise<any> => {
  try {
    const q = query(
      collection(db, "bookings"),
      where("ownerId", "==", ownerId),
      where("otp", "==", otp),
      where("status", "==", "confirmed")
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }
    if (snapshot.docs.length > 1) {
      console.warn("OTP Collision detected for owner:", ownerId);
      throw new Error("Multiple active bookings found with this OTP. Please verify manually.");
    }
    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    };
  } catch (error) {
    console.error("Error getting booking by OTP:", error);
    return null;
  }
};

export const createOfflineBooking = async (bookingData: any) => {
  try {
    const response = await fetch("/api/booking/offline", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};