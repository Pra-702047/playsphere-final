import { collection, doc, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firestore";

export type LocationData = {
  id: string;
  name: string;
};

// Fetch all locations
export const getAllLocations = async (): Promise<LocationData[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "locations"));
    const locations: LocationData[] = [];
    querySnapshot.forEach((doc) => {
      locations.push({ id: doc.id, ...doc.data() } as LocationData);
    });
    // Sort locations alphabetically by name
    return locations.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching locations:", error);
    return [];
  }
};

// Add a new location
export const addLocation = async (name: string): Promise<{ success: boolean; id?: string }> => {
  try {
    // Generate a simple ID based on the name (lowercase, replace spaces with hyphens)
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const docRef = doc(collection(db, "locations"), id);
    await setDoc(docRef, { name });
    return { success: true, id };
  } catch (error) {
    console.error("Error adding location:", error);
    return { success: false };
  }
};

// Delete a location
export const deleteLocation = async (id: string): Promise<{ success: boolean }> => {
  try {
    await deleteDoc(doc(db, "locations", id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting location:", error);
    return { success: false };
  }
};
