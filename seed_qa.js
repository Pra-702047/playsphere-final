require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    })
  });
}

const db = admin.firestore();

const DUMMY_TAG = "QA_SEED";

async function clearOldQAData() {
  console.log("Clearing old QA data...");
  const collections = ['users', 'turfs', 'bookings', 'payments', 'reviews', 'payouts'];
  for (const col of collections) {
    const snapshot = await db.collection(col).where("isQA", "==", true).get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    if (!snapshot.empty) {
      await batch.commit();
      console.log(`Deleted ${snapshot.size} QA documents from ${col}.`);
    } else {
      console.log(`No QA documents found in ${col}.`);
    }
  }
}

async function seedUsers() {
  console.log("Seeding Users...");
  const batch = db.batch();
  const owners = [];
  const players = [];

  // Seed Owners
  for (let i = 1; i <= 5; i++) {
    const ownerRef = db.collection('users').doc(`qa_owner_${i}`);
    const ownerData = {
      uid: ownerRef.id,
      name: `QA Owner ${i}`,
      email: `qa_owner${i}@test.com`,
      phone: `900000000${i}`,
      role: 'turf_owner',
      businessName: `QA Sports Arena ${i}`,
      adminStatus: i % 2 === 0 ? 'approved' : 'pending',
      kycStatus: i % 2 === 0 ? 'verified' : 'pending',
      accountStatus: 'active',
      isQA: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    batch.set(ownerRef, ownerData);
    owners.push(ownerData);
  }

  // Seed Players
  for (let i = 1; i <= 10; i++) {
    const playerRef = db.collection('users').doc(`qa_player_${i}`);
    const playerData = {
      uid: playerRef.id,
      name: `QA Player ${i}`,
      email: `qa_player${i}@test.com`,
      phone: `80000000${i.toString().padStart(2, '0')}`,
      role: 'player',
      isQA: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    batch.set(playerRef, playerData);
    players.push(playerData);
  }

  await batch.commit();
  console.log(`Created ${owners.length} owners and ${players.length} players.`);
  return { owners, players };
}

async function seedTurfs(owners) {
  console.log("Seeding Turfs...");
  const batch = db.batch();
  const turfs = [];

  const types = ["5A Side", "7A Side", "9A Side", "11A Side"];
  const sports = ["Football", "Cricket", "Tennis", "Basketball"];

  for (const owner of owners) {
    if (owner.adminStatus !== 'approved') continue; // Only approved owners get turfs
    for (let i = 1; i <= 2; i++) {
      const turfRef = db.collection('turfs').doc();
      const turfData = {
        id: turfRef.id,
        ownerId: owner.uid,
        name: `QA ${owner.businessName} Turf ${i}`,
        turfType: [types[Math.floor(Math.random() * types.length)]],
        sports: [sports[Math.floor(Math.random() * sports.length)]],
        turfSize: "Standard",
        price: 1000 + (Math.random() * 1000), // 1000 to 2000
        address: {
          area: "QA Layout",
          city: "QA City",
          state: "QA State",
          pinCode: "000000"
        },
        images: ["https://picsum.photos/seed/" + turfRef.id + "/800/600"],
        rating: 4 + Math.random(),
        isVerified: true,
        isFeatured: i === 1,
        isQA: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
      batch.set(turfRef, turfData);
      turfs.push(turfData);
    }
  }

  await batch.commit();
  console.log(`Created ${turfs.length} turfs.`);
  return turfs;
}

async function seedBookingsAndPayments(players, turfs) {
  console.log("Seeding Bookings and Payments...");
  let bookingsCreated = 0;
  
  // Need multiple batches if it exceeds 500 ops
  let batches = [db.batch()];
  let opCount = 0;

  for (const turf of turfs) {
    for (let i = 0; i < 5; i++) {
      const player = players[Math.floor(Math.random() * players.length)];
      const bookingRef = db.collection('bookings').doc();
      const amount = turf.price;
      
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      
      const bookingData = {
        id: bookingRef.id,
        turfId: turf.id,
        turfName: turf.name,
        ownerId: turf.ownerId,
        playerId: player.uid,
        playerName: player.name,
        date: dateStr,
        startTime: `1${i}:00`,
        endTime: `1${i+1}:00`,
        price: amount,
        status: i % 5 === 0 ? 'cancelled' : 'completed',
        paymentStatus: i % 5 === 0 ? 'refunded' : 'paid',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isQA: true
      };

      if (opCount >= 490) {
        batches.push(db.batch());
        opCount = 0;
      }
      
      batches[batches.length - 1].set(bookingRef, bookingData);
      opCount++;
      bookingsCreated++;

      // Create associated payment record
      const paymentRef = db.collection('payments').doc();
      const paymentData = {
        id: paymentRef.id,
        bookingId: bookingRef.id,
        amount: amount,
        currency: "INR",
        method: "UPI",
        status: bookingData.paymentStatus,
        transactionId: `QA_TXN_${Math.floor(Math.random()*1000000)}`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isQA: true
      };
      
      batches[batches.length - 1].set(paymentRef, paymentData);
      opCount++;
    }
  }

  for (const batch of batches) {
    await batch.commit();
  }
  
  console.log(`Created ${bookingsCreated} bookings and corresponding payments.`);
}

async function runSeed() {
  try {
    await clearOldQAData();
    const { owners, players } = await seedUsers();
    const turfs = await seedTurfs(owners);
    await seedBookingsAndPayments(players, turfs);
    console.log("✅ Seeding Complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Failed:", error);
    process.exit(1);
  }
}

runSeed();
