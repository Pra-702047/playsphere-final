# Analytics Collection

**Collection Path:** `/audit_logs/{logId}` (Used for analytical and security tracking)

Stores immutable system events for administrative oversight.

## Document Structure
```json
{
  "action": "string (e.g. OFFLINE_BOOKING_CREATED)",
  "turfId": "string",
  "ownerId": "string",
  "details": "string",
  "timestamp": "timestamp"
}
```

## Security Rules
- **Read/Write:** Client access is strictly denied. All writes to this collection occur via the Firebase Admin SDK on the server (e.g., inside Next.js API routes).