
"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

import { db } from "@/firebase/firestore";
import { auth } from "@/firebase/auth";

import {
  cancelBooking,
} from "@/services/booking.service";

export default function MyBookingsPage() {
  const [bookings, setBookings] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const handleCancelBooking = async (
    bookingId: string
  ) => {
    const confirmCancel = confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmCancel) return;

    const result =
      await cancelBooking(bookingId);

    if (result.success) {
      alert("Booking Cancelled");

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                status: "cancelled",
              }
            : booking
        )
      );
    } else {
      alert(result.message);
    }
  };

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {
          if (!user) {
            setLoading(false);
            return;
          }

          try {
            const q = query(
              collection(
                db,
                "bookings"
              ),
              where(
                "userId",
                "==",
                user.uid
              )
            );

            const snapshot =
              await getDocs(q);

            const data =
              snapshot.docs.map(
                (doc) => ({
                  id: doc.id,
                  ...doc.data(),
                })
              );

            setBookings(data);
          } catch (error) {
            console.error(
              "Error fetching bookings:",
              error
            );
          } finally {
            setLoading(false);
          }
        }
      );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading Bookings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-8">
        My Bookings
      </h1>

      {bookings.length === 0 ? (
        <div className="bg-zinc-900 p-6 rounded-xl">
          No bookings found.
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(
            (booking) => (
              <div
                key={booking.id}
                className="bg-zinc-900 p-5 rounded-xl"
              >
                <p>
                  <strong>
                    Date:
                  </strong>{" "}
                  {booking.date}
                </p>

                <p>
                  <strong>
                    Slot:
                  </strong>{" "}
                  {booking.slot}
                </p>

                <p>
                  <strong>
                    Status:
                  </strong>{" "}
                  <span
                    className={
                      booking.status ===
                      "cancelled"
                        ? "text-red-400"
                        : "text-lime-400"
                    }
                  >
                    {booking.status}
                  </span>
                </p>

                {booking.status !==
                  "cancelled" && (
                  <button
                    onClick={() =>
                      handleCancelBooking(
                        booking.id
                      )
                    }
                    className="mt-4 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
