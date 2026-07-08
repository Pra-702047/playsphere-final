"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RouteGuard({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode, 
  allowedRoles: string[] 
}) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (!allowedRoles.includes(role || "")) {
        // Fallback redirection
        router.push(role === "admin" ? "/admin" : role === "owner" ? "/owner" : "/dashboard");
      } else {
        setAuthorized(true);
      }
    }
  }, [user, role, loading, router, allowedRoles]);

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
