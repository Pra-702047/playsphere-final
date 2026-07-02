import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";
import { app } from "./config";

export const auth = getAuth(app);

if (typeof window !== "undefined") {
  setPersistence(auth, browserSessionPersistence).catch((err) => {
    console.warn("Failed to set Firebase Auth persistence, falling back to default:", err);
  });
}