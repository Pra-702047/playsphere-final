# Booking APIs

Booking operations utilize a mix of Client SDKs (for reads and standard creation) and Serverless APIs (for privileged offline booking creation).

## Serverless Endpoint: Create Offline Booking

**Endpoint:** `/api/booking/offline`
**Method:** `POST`
**Description:** Creates a confirmed booking bypassing client security rules. Deterministically blocks overlapping slots.

### Request Payload
```json
{
  "turfId": "string",
  "date": "YYYY-MM-DD",
  "slot": "HH:MM",
  "ownerId": "string",
  "playerName": "string",
  "mobile": "string",
  "source": "string (Walk-in | Phone Call)",
  "paymentMethod": "string (Cash | UPI)"
}
```

### Response (Success 200 OK)
```json
{
  "success": true,
  "id": "string (deterministic ID)"
}
```

### Response (Conflict 409)
```json
{
  "success": false,
  "message": "This slot is already booked."
}
```