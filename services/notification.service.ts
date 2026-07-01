import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase/firestore";

export type NotificationData = {
  id?: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: any;
};

export const createNotification = async (userId: string, title: string, message: string) => {
  try {
    await addDoc(collection(db, "notifications"), {
      userId,
      title,
      message,
      read: false,
      createdAt: new Date(),
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error creating notification:", error);
    return { success: false, message: error.message };
  }
};

export const getUserNotifications = async (userId: string): Promise<NotificationData[]> => {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<NotificationData, "id">),
    }));
    
    // Sort in JS to avoid needing complex Firestore single-field composite indexes at build-time
    return data.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    await updateDoc(doc(db, "notifications", notificationId), {
      read: true,
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error updating notification:", error);
    return { success: false, message: error.message };
  }
};
