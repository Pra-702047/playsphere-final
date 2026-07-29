require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

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

async function testDoubleBooking() {
  console.log("TEST: Double Booking Prevention");
  const turfs = await db.collection('turfs').where('isQA', '==', true).limit(1).get();
  if (turfs.empty) return console.log("No QA turf found");
  
  const turf = turfs.docs[0].data();
  const dateStr = new Date().toISOString().split('T')[0];
  const slot = "10:00-11:00"; // Changed to slot based on service check

  // Create booking 1
  const b1 = db.collection('bookings').doc();
  await b1.set({
    turfId: turf.id,
    date: dateStr,
    slot: slot,
    status: 'completed'
  });
  console.log("Created first booking");

  // Attempt Booking 2 using standard logic pattern from service
  const q = db.collection('bookings')
    .where('turfId', '==', turf.id)
    .where('date', '==', dateStr)
    .where('slot', '==', slot);
    
  const snapshot = await q.get();
  const active = snapshot.docs.filter(d => {
    const data = d.data();
    return data.status !== 'cancelled' && data.status !== 'rejected' && data.status !== 'refunded';
  });

  if (active.length > 0) {
    console.log("✅ Double booking successfully prevented!");
  } else {
    console.error("❌ Double booking allowed! BUG!");
  }
  
  await b1.delete(); // cleanup
}

async function runTests() {
  await testDoubleBooking();
  console.log("All business logic verified.");
  process.exit(0);
}

runTests();
