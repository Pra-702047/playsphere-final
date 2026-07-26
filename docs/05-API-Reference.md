# 6. API Reference

PlaySphere utilizes Next.js App Router Serverless APIs.

## 6.1 Create Order
Initializes a Razorpay order before frontend checkout.

**Endpoint:** `POST /api/payment/order`
**Authentication:** Required (User Token Verification on Client/Server boundary)

### Request
```json
{
  "amount": 1200,
  "currency": "INR",
  "turfId": "turf_abc123",
  "date": "2026-07-30",
  "slot": "18:00 - 19:00"
}
```

### Response (200 OK)
```json
{
  "id": "order_Fdfjshdfk",
  "currency": "INR",
  "amount": 120000
}
```

---

## 6.2 Verify Payment
Verifies the Razorpay HMAC signature, locks the booking, and generates a settlement record.

**Endpoint:** `POST /api/payment/verify`
**Authentication:** Required

### Request
```json
{
  "razorpay_order_id": "order_Fdfjshdfk",
  "razorpay_payment_id": "pay_Fdjhshfjk",
  "razorpay_signature": "signature_hash",
  "bookingData": {
    "turfId": "turf_abc123",
    "userId": "user_123",
    "price": 1200
  }
}
```

### Response (200 OK)
```json
{
  "success": true,
  "bookingId": "turf_abc123_2026-07-30_18:00"
}
```

### Error Responses
- `400 Bad Request`: "Invalid Signature" (Occurs if client attempts to manipulate payment validation).
- `409 Conflict`: "Slot already booked" (Race condition prevented by Firebase Transaction).

---

## 6.3 Automated Refund
Processes a refund via Razorpay when a user cancels a booking, and reverses the settlement record.

**Endpoint:** `POST /api/payment/refund`
**Authentication:** Required (Owner or Admin)

### Request
```json
{
  "bookingId": "turf_abc123_2026-07-30_18:00"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "refundId": "rfnd_Hjskdfs"
}
```

---

## 6.4 Webhook Handler
Listens for asynchronous events from Razorpay (e.g., successful refunds, late captures).

**Endpoint:** `POST /api/webhooks/razorpay`
**Authentication:** Protected via `x-razorpay-signature` HMAC Header.

### Webhook Events Handled
- `payment.captured`
- `refund.processed`
