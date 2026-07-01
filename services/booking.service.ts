import { doc, updateDoc } from "firebase/firestore";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/firebase/firestore";

export const createBooking = async (
  bookingData: any
) => {
  try {
    const q = query(
      collection(db, "bookings"),
      where("date", "==", bookingData.date),
      where("slot", "==", bookingData.slot)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return {
        success: false,
        message:
          "This slot is already booked. Please select another slot.",
      };
    }

    const docRef = await addDoc(
      collection(db, "bookings"),
      bookingData
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
      where("ownerId", "==", ownerId)
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