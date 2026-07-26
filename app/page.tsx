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
  const rawLocations = locationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as any);
  const locations = JSON.parse(JSON.stringify(rawLocations));
  locations.sort((a: any, b: any) => a.name.localeCompare(b.name));

  // Fetch Sports
  const sportsSnapshot = await db.collection("sports").get();
  const rawSports = sportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as any);
  const sports = JSON.parse(JSON.stringify(rawSports));
  sports.sort((a: any, b: any) => a.name.localeCompare(b.name));

  // Fetch Featured Turfs (Verified, max 3)
  const turfsSnapshot = await db.collection("turfs").where("isVerified", "==", true).limit(3).get();
  const rawFeaturedTurfs = turfsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as any);
  const featuredTurfs = JSON.parse(JSON.stringify(rawFeaturedTurfs));

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