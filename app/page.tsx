import Navbar from "@/components/navbar/Navbar";
import Hero from "@/components/landing/Hero";
import Banners from "@/components/landing/Banners";
import Stats from "@/components/landing/Stats";
import Featured from "@/components/landing/Featured";
import WhyUs from "@/components/landing/WhyUs";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/footer/Footer";
import { getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export default async function Home() {
  const db = getAdminDb();
  
  // Fetch Locations
  const locationsSnapshot = await db.collection("locations").get();
  const locations = locationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as any);
  locations.sort((a: any, b: any) => a.name.localeCompare(b.name));

  // Fetch Sports
  const sportsSnapshot = await db.collection("sports").get();
  const sports = sportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as any);
  sports.sort((a: any, b: any) => a.name.localeCompare(b.name));

  // Fetch Featured Turfs (Verified, max 3)
  const turfsSnapshot = await db.collection("turfs").where("isVerified", "==", true).limit(3).get();
  const featuredTurfs = turfsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as any);

  return (
    <>
      <Navbar />
      <Hero locations={locations} sports={sports} />
      <Banners />
      <Stats />
      <Featured featuredTurfs={featuredTurfs} />
      <WhyUs />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <Footer />
    </>
  );
}