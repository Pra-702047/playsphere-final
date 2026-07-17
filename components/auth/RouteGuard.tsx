"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { signOut } from "firebase/auth";
import { auth } from "@/firebase/auth";

export default function RouteGuard({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode, 
  allowedRoles: string[] 
}) {
  const { user, role, loading, isEmailVerified } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log("RouteGuard: No user, redirecting to /login");
        router.push("/login");
      } else if (!isEmailVerified) {
        console.warn("RouteGuard: User not verified! Revoking session.");
        signOut(auth).then(() => router.push("/login"));
      } else if (!allowedRoles.includes(role || "")) {
        console.log("RouteGuard: Role not allowed. Role:", role, "Allowed:", allowedRoles);
        // Fallback redirection
        const target = role === "admin" ? "/admin" : role === "owner" ? "/owner" : "/dashboard";
        console.log("RouteGuard: Redirecting to", target);
        router.push(target);
      } else {
        console.log("RouteGuard: Authorized!");
        setAuthorized(true);
      }
    }
  }, [user, role, loading, isEmailVerified, router, allowedRoles, authorized]);

  if (loading || !authorized) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-500"></div>
          <p className="text-gray-400">Verifying secure access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
