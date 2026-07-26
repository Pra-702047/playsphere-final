import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import TurfList from "@/components/turfs/TurfList";
import { getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export default async function TurfsPage() {
  const db = getAdminDb();
  const turfsSnapshot = await db.collection("turfs").get();
  const rawTurfs = turfsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data()),
  }) as any);
  const turfs = JSON.parse(JSON.stringify(rawTurfs));

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-black text-white px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold text-center mb-4">
            Available Turfs ⚽
          </h1>

          <p className="text-center text-gray-400 mb-12">
            Discover and book sports turfs near you.
          </p>

          <TurfList initialTurfs={turfs} />
        </div>
      </main>

      <Footer />
    </>
  );
}