import {
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/firebase/firestore";

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  role: string;
  createdAt: any;
};

// ======================
// GET ALL USERS (ADMIN)
// ======================
export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const snapshot = await getDocs(collection(db, "users"));
    return snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...(doc.data() as Omit<UserProfile, "uid">),
    }));
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
};

// ======================
// UPDATE USER ROLE (ADMIN)
// ======================
export const updateUserRole = async (userId: string, role: string) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      role,
    });
    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Error updating user role:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

// ======================
// DELETE USER DOC (ADMIN)
// ======================
export const deleteUserDoc = async (userId: string) => {
  try {
    await deleteDoc(doc(db, "users", userId));
    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Error deleting user doc:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};
