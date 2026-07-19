import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import MobileBottomNav from "@/components/navbar/MobileBottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PlaySphere - Best Sports Turf Booking Platform",
  description: "Book sports turfs online instantly. Find the best football, box cricket, and badminton grounds near you. Premium turf booking experience.",
  keywords: ["turf booking", "sports turf booking", "book turf online", "football turf near me", "box cricket booking", "badminton court", "PlaySphere", "turf booking app", "Nanded turf"],
  authors: [{ name: "PlaySphere" }],
  openGraph: {
    title: "PlaySphere - Book Sports Turfs Instantly",
    description: "Book sports turfs online instantly. Find the best football, box cricket, and badminton grounds near you.",
    url: "https://playsphere.space",
    siteName: "PlaySphere",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PlaySphere - Premium Sports Turf Booking",
    description: "Book football, cricket, badminton and box cricket grounds instantly.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white">
        <AuthProvider>
          <ToastProvider>
            {children}
            <MobileBottomNav />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}