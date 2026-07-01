import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";

import { doc, setDoc } from "firebase/firestore";

import { auth } from "../firebase/auth";
import { db } from "../firebase/firestore";

// Helper function to translate technical Firebase error codes into clean, user-friendly messages
const getFriendlyErrorMessage = (error: any): string => {
  if (!error || !error.code) return error?.message || "An unexpected error occurred.";
  
  switch (error.code) {
    case "auth/network-request-failed":
      return "Network connection error. Please check your internet connection and try again.";
    case "auth/invalid-credential":
      return "Incorrect email or password. Please try again.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    case "auth/email-already-in-use":
      return "This email is already registered. Please log in instead.";
    case "auth/weak-password":
      return "Password is too weak. Please use at least 6 characters.";
    case "auth/invalid-email":
      return "Invalid email address format.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Access to this account has been temporarily disabled. Please try again later.";
    default:
      return error.message || "An unexpected error occurred. Please try again.";
  }
};

// ======================
// REGISTER USER
// ======================

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: string = "player"
) => {
  try {
    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name,
      email,
      role,
      createdAt: new Date(),
    });

    return {
      success: true,
      user,
    };
  } catch (error: any) {
    if (error?.code !== "auth/email-already-in-use" && error?.code !== "auth/weak-password" && error?.code !== "auth/invalid-email") {
      console.error(
        "Firebase Register Error:",
        error
      );
    } else {
      console.warn("Firebase Auth Validation: register failed due to", error.code);
    }

    return {
      success: false,
      message: getFriendlyErrorMessage(error),
    };
  }
};

// ======================
// LOGIN USER
// ======================

export const loginUser = async (
  email: string,
  password: string
) => {
  try {
    console.log(
      "Trying Firebase login..."
    );

    const userCredential =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    console.log(
      "Firebase Login Success:",
      userCredential.user
    );

    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error: any) {
    // Suppress console.error stack traces for user-validation credential rejections
    if (error?.code !== "auth/invalid-credential" && error?.code !== "auth/user-not-found" && error?.code !== "auth/wrong-password") {
      console.error(
        "Firebase Login Error:",
        error
      );
    } else {
      console.warn("Firebase Auth Validation: login failed due to", error.code);
    }

    return {
      success: false,
      message: getFriendlyErrorMessage(error),
    };
  }
};

// ======================
// LOGOUT USER
// ======================

export const logoutUser = async () => {
  try {
    await signOut(auth);

    return {
      success: true,
    };
  } catch (error: any) {
    console.error(
      "Firebase Logout Error:",
      error
    );

    return {
      success: false,
      message: getFriendlyErrorMessage(error),
    };
  }
};

// ======================
// RESET PASSWORD
// ======================
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Firebase Password Reset Error:", error);
    return {
      success: false,
      message: getFriendlyErrorMessage(error),
    };
  }
};