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
  // Fetch Stats securely on the server
  let activePlayers = 0;
  let verifiedTurfs = 0;
  let citiesListed = 0;
  let averageRating = 0;
  try {
    const playersSnapshot = await db.collection("users").where("role", "==", "player").count().get();
    activePlayers = playersSnapshot.data().count;

    const allTurfsSnapshot = await db.collection("turfs").get();
    let realVerifiedTurfs = 0;
    let totalRating = 0;
    let ratedTurfsCount = 0;
    allTurfsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.isVerified) realVerifiedTurfs++;
      if (data.avgRating && typeof data.avgRating === "number" && data.avgRating > 0) {
        totalRating += data.avgRating;
        ratedTurfsCount++;
      }
    });
    verifiedTurfs = realVerifiedTurfs;
    if (ratedTurfsCount > 0) averageRating = Number((totalRating / ratedTurfsCount).toFixed(1));

    const citiesSnap = await db.collection("locations").count().get();
    citiesListed = citiesSnap.data().count;
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
  }

  const statsData = { activePlayers, verifiedTurfs, citiesListed, averageRating };

  return (
    <>
      <Navbar />
      <Hero locations={locations} sports={sports} />
      <Banners />
      <Stats statsData={statsData} />
      <Featured featuredTurfs={featuredTurfs} />
      <WhyUs />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <Footer />
    </>
  );
}