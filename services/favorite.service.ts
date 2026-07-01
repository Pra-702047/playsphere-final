import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  where,
} from "firebase/firestore";
import { db } from "@/firebase/firestore";

export const toggleFavorite = async (userId: string, turfId: string, isFavorited: boolean) => {
  try {
    const favoriteId = `${userId}_${turfId}`;
    const docRef = doc(db, "favorites", favoriteId);

    if (isFavorited) {
      // Remove favorite
      await deleteDoc(docRef);
    } else {
      // Add favorite
      await setDoc(docRef, {
        userId,
        turfId,
        createdAt: new Date(),
      });
    }
    return { success: true };
  } catch (error: any) {
    console.error("Error toggling favorite:", error);
    return { success: false, message: error.message };
  }
};

export const getUserFavorites = async (userId: string): Promise<string[]> => {
  try {
    const q = query(
      collection(db, "favorites"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data().turfId as string);
  } catch (error) {
    console.error("Error fetching user favorites:", error);
    return [];
  }
};
