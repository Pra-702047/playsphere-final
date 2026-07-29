# Bookings Collection

**Collection Path:** `/bookings/{bookingId}`

Core transactional collection representing reserved time slots.

## Document Structure
```json
{
  "turfId": "string (FK: turfs.id)",
  "turfName": "string (Denormalized)",
  "ownerId": "string (FK: users.uid)",
  "playerId": "string (FK: users.uid - Null for offline)",
  "playerName": "string",
  "date": "string (YYYY-MM-DD)",
  "slot": "string (HH:MM)",
  "status": "string (pending | confirmed | cancelled | checked_in | refunded)",
  "bookingType": "string (online | offline)",
  "price": "number",
  "otp": "string (4-digit)",
  "otpVerified": "boolean",
  "paymentId": "string (Optional)",
  "createdAt": "timestamp"
}
```

## Deterministic ID Strategy (Offline Bookings)
For offline bookings, the document ID is deterministically generated as `turfId_date_slot` to guarantee a slot cannot be booked twice simultaneously at the database level using Firestore's `create()` method constraint.