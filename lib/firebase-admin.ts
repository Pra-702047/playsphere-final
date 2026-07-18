// Hide the require from Turbopack static analysis using dynamic array joins
const pkgApp = ["firebase", "-admin", "/app"].join("");
const pkgFirestore = ["firebase", "-admin", "/firestore"].join("");
const pkgAuth = ["firebase", "-admin", "/auth"].join("");

let adminApp: any;
let adminFirestore: any;
let adminAuth: any;

export function initAdmin() {
  if (!adminApp) {
    adminApp = require(pkgApp);
    adminFirestore = require(pkgFirestore);
    adminAuth = require(pkgAuth);
  }
  
  if (adminApp.getApps().length > 0) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin credentials missing in environment variables (.env.local). Please add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.");
  }

  adminApp.initializeApp({
    credential: adminApp.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
  console.log("Firebase Admin Initialized successfully.");
}

export function getAdminDb() {
  initAdmin();
  return adminFirestore.getFirestore();
}

export function getAdminAuth() {
  initAdmin();
  return adminAuth.getAuth();
}
