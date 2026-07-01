import {
  collection,
  doc,
  getDocs,
  query,
  addDoc,
  where,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase/firestore";

export type ReviewData = {
  id?: string;
  turfId: string;
  userId: string;
  playerName: string;
  rating: number;
  comment: string;
  createdAt: any;
};

export const getTurfReviews = async (turfId: string): Promise<ReviewData[]> => {
  try {
    const q = query(
      collection(db, "reviews"),
      where("turfId", "==", turfId)
    );
    const snapshot = await getDocs(q);
    const reviews = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<ReviewData, "id">),
    }));

    return reviews.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error("Error getting turf reviews:", error);
    return [];
  }
};

export const createReview = async (reviewData: Omit<ReviewData, "id">) => {
  try {
    // 1. Write the review doc
    const docRef = await addDoc(collection(db, "reviews"), {
      ...reviewData,
      createdAt: new Date(),
    });

    // 2. Recalculate turf ratings
    const turfRef = doc(db, "turfs", reviewData.turfId);
    const turfSnap = await getDoc(turfRef);
    
    if (turfSnap.exists()) {
      const turfInfo = turfSnap.data();
      const currentRatingCount = turfInfo.ratingCount || 0;
      const currentAvgRating = turfInfo.avgRating || 0;

      const newRatingCount = currentRatingCount + 1;
      const newAvgRating = (currentAvgRating * currentRatingCount + reviewData.rating) / newRatingCount;

      await updateDoc(turfRef, {
        ratingCount: newRatingCount,
        avgRating: Number(newAvgRating.toFixed(1)),
      });
    }

    return {
      success: true,
      id: docRef.id,
    };
  } catch (error: any) {
    console.error("Error creating review:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};
