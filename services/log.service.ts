import { addDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase/firestore";

export type AdminLog = {
  id?: string;
  adminId: string;
  adminName: string;
  action: string;
  details: string;
  timestamp: any;
};

export const logAdminActivity = async (
  adminId: string,
  adminName: string,
  action: string,
  details: string
) => {
  try {
    await addDoc(collection(db, "logs"), {
      adminId,
      adminName,
      action,
      details,
      timestamp: new Date(),
    });
    return { success: true };
  } catch (error: any) {
    console.error("Failed to write audit log:", error);
    return { success: false, message: error.message };
  }
};

export const getAdminLogs = async (): Promise<AdminLog[]> => {
  try {
    const q = query(collection(db, "logs"));
    const snapshot = await getDocs(q);
    const logs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<AdminLog, "id">),
    }));

    // Sort in JS to avoid needing complex Firestore composite indexes
    return logs.sort((a, b) => {
      const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
      const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error("Failed to read audit logs:", error);
    return [];
  }
};
