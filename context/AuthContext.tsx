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
  isEmailVerified: boolean;
}>({
  user: null,
  role: null,
  loading: true,
  isEmailVerified: false,
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
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (currentUser) => {
          setUser(currentUser);
          if (currentUser) {
            try {
              const docPromise = getDoc(doc(db, "users", currentUser.uid));
              
              const userDoc = await docPromise as any;
              
              let verified = !!currentUser.emailVerified;

              if (userDoc && userDoc.exists()) {
                const data = userDoc.data();
                let fetchedRole = data.role || "player";
                if (fetchedRole === "user") fetchedRole = "player";
                setRole(fetchedRole);
                if (data.isEmailVerified) verified = true;
              } else {
                setRole("player");
              }

              // Fix race condition: If backend updated status but frontend token is stale
              if (!verified) {
                try {
                  await currentUser.reload();
                  if (currentUser.emailVerified) verified = true;
                } catch (e) {
                  console.warn("Failed to reload user", e);
                }
              }

              setIsEmailVerified(verified);
            } catch (error) {
              console.error("Error fetching user role:", error);
              setRole("player");
              setIsEmailVerified(false);
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
      value={{ user, role, loading, isEmailVerified }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);