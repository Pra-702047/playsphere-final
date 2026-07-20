import { collection, doc, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firestore";

export type SportData = {
  id: string;
  name: string;
  emoji: string;
};

// Fetch all sports
export const getAllSports = async (): Promise<SportData[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "sports"));
    const sports: SportData[] = [];
    querySnapshot.forEach((doc) => {
      sports.push({ id: doc.id, ...doc.data() } as SportData);
    });
    // Sort sports alphabetically by name
    return sports.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching sports:", error);
    return [];
  }
};

// Add a new sport
export const addSport = async (name: string, emoji: string): Promise<{ success: boolean; id?: string }> => {
  try {
    // Generate a simple ID based on the name (lowercase, replace spaces with hyphens)
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const docRef = doc(collection(db, "sports"), id);
    await setDoc(docRef, { name, emoji });
    return { success: true, id };
  } catch (error) {
    console.error("Error adding sport:", error);
    return { success: false };
  }
};

// Delete a sport
export const deleteSport = async (id: string): Promise<{ success: boolean }> => {
  try {
    await deleteDoc(doc(db, "sports", id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting sport:", error);
    return { success: false };
  }
};
