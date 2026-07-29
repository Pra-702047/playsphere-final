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
  phone?: string;
  
  // Owner specific fields
  businessName?: string;
  alternateMobile?: string;
  profilePhoto?: string;
  lastLogin?: any;
  
  // KYC
  aadhaarNumber?: string;
  kycStatus?: 'pending' | 'verified' | 'rejected';
  kycVerifiedBy?: string;
  kycVerificationDate?: any;
  aadhaarFrontUrl?: string;
  aadhaarBackUrl?: string;
  
  // Payment Details
  googlePayNumber?: string;
  phonePeNumber?: string;
  paytmNumber?: string;
  upiId?: string;
  bankAccountName?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;

  // Business Address
  address?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  mapLocation?: string;

  // Commission & Settings (Admin controlled)
  commissionType?: 'percentage' | 'fixed';
  commissionValue?: number;
  settlementCycle?: 'daily' | 'weekly' | 'monthly';
  
  // Admin Status
  adminStatus?: 'pending' | 'approved' | 'rejected';
  accountStatus?: 'active' | 'suspended';
  isFeatured?: boolean;
  remarks?: string;
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
// ======================
// UPDATE USER FIELDS (ADMIN)
// ======================
export const updateUserFields = async (userId: string, fields: Partial<UserProfile>) => {
  try {
    await updateDoc(doc(db, "users", userId), fields);
    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Error updating user fields:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};
