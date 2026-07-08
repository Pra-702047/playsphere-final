import { initializeApp, getApps, getApp } from "firebase/app";

console.log("CONFIG FILE LOADED");

console.log("API KEY =", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
console.log("AUTH DOMAIN =", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC2eoGKUYYPkOSG1ZQCS9oLLrH9orS3G8Y",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "playsphere-50fc6.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "playsphere-50fc6",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "playsphere-50fc6.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "650315640010",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:650315640010:web:401cdf85f84fdd106ed833",
};

export const app =
  getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig);