import { getStorage } from "firebase/storage";
import { app } from "./config";

export const storage = getStorage(app);
storage.maxUploadRetryTime = 3000; // Fail fast on uploads (3s) to allow prompt fallback
storage.maxOperationRetryTime = 3000; // Fail fast on other operations (3s)