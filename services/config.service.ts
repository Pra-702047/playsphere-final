import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firestore";

export interface PlatformConfig {
  commissionRate: number;
  fraudThreshold: number;
  gstRate: number;
  refundWindowHours: number;
  offlineBookingLimit: number;
  settlementDelayDays: number;
}

const DEFAULT_CONFIG: PlatformConfig = {
  commissionRate: 0.10,
  fraudThreshold: 0.60,
  gstRate: 0.18,
  refundWindowHours: 24, // cannot refund if < 24 hrs to slot
  offlineBookingLimit: 50, // per day/week limit
  settlementDelayDays: 2,
};

export const getPlatformConfig = async (): Promise<PlatformConfig> => {
  try {
    const configDoc = await getDoc(doc(db, "settings", "platformConfig"));
    if (configDoc.exists()) {
      return {
        ...DEFAULT_CONFIG,
        ...configDoc.data(),
      };
    }
    return DEFAULT_CONFIG;
  } catch (error) {
    console.warn("Failed to fetch platform config, using defaults", error);
    return DEFAULT_CONFIG;
  }
};
