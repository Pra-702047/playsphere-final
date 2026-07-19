import { collection, getDocs, getCountFromServer, query, where } from "firebase/firestore";
import { db } from "@/firebase/firestore";

export type ProjectStats = {
  activePlayers: number;
  verifiedTurfs: number;
  citiesListed: number;
  averageRating: number;
};

export const getProjectStats = async (): Promise<ProjectStats> => {
  try {
    // 1. Fetch active players count (users with role == 'player')
    const playersQuery = query(collection(db, "users"), where("role", "==", "player"));
    const playersSnapshot = await getCountFromServer(playersQuery);
    const activePlayers = playersSnapshot.data().count;

    // 2. Fetch all turfs to compute verified turfs, cities listed, and average rating
    const turfsSnapshot = await getDocs(collection(db, "turfs"));
    
    let verifiedTurfs = 0;
    let totalRating = 0;
    let ratedTurfsCount = 0;

    turfsSnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Verified Turfs
      if (data.isVerified) {
        verifiedTurfs++;
      }

      // Average Rating (aggregate from turfs with reviews)
      if (data.avgRating && typeof data.avgRating === "number" && data.avgRating > 0) {
        totalRating += data.avgRating;
        ratedTurfsCount++;
      }
    });

    // 3. Fetch active cities count
    const locationsSnapshot = await getCountFromServer(collection(db, "locations"));
    const citiesListed = locationsSnapshot.data().count;

    const averageRating = ratedTurfsCount > 0 ? Number((totalRating / ratedTurfsCount).toFixed(1)) : 0;

    return {
      activePlayers,
      verifiedTurfs,
      citiesListed,
      averageRating,
    };
  } catch (error) {
    console.error("Failed to fetch project stats:", error);
    return {
      activePlayers: 0,
      verifiedTurfs: 0,
      citiesListed: 0,
      averageRating: 0,
    };
  }
};
