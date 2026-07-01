"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
  User,
} from "firebase/auth";

import { doc, getDoc } from "firebase/firestore";
import { auth } from "@/firebase/auth";
import { db } from "@/firebase/firestore";

const AuthContext = createContext<{
  user: User | null;
  role: string | null;
  loading: boolean;
}>({
  user: null,
  role: null,
  loading: true,
});

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] =
    useState<User | null>(null);
  const [role, setRole] =
    useState<string | null>(null);
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (currentUser) => {
          setUser(currentUser);
          if (currentUser) {
            try {
              const userDoc = await getDoc(doc(db, "users", currentUser.uid));
              if (userDoc.exists()) {
                setRole(userDoc.data().role || "player");
              } else {
                setRole("player");
              }
            } catch (error) {
              console.error("Error fetching user role:", error);
              setRole("player");
            }
          } else {
            setRole(null);
          }
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, role, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);