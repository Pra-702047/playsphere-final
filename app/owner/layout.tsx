"use client";

import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import RouteGuard from "@/components/auth/RouteGuard";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={["owner"]}>
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
          {children}
        </main>
        <Footer />
      </div>
    </RouteGuard>
  );
}
