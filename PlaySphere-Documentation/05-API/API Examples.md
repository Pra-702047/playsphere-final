# API Examples

## Example: Verifying a Payment via cURL

```bash
curl -X POST https://api.playsphere.com/api/payment/verify \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id": "order_Pf7abc...",
    "razorpay_payment_id": "pay_Pf7def...",
    "razorpay_signature": "a1b2c3d4e5f6...",
    "bookingData": {
      "turfId": "turf_123",
      "date": "2024-12-01",
      "slot": "18:00"
    }
  }'
```

## Example: Fetching Owner Bookings (Client SDK)
```javascript
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

const fetchBookings = async (ownerId) => {
  const q = query(
    collection(db, 'bookings'),
    where('ownerId', '==', ownerId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```