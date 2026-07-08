"use client";

import RouteGuard from "@/components/auth/RouteGuard";

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={["player"]}>
      {children}
    </RouteGuard>
  );
}
