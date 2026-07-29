# Payments Collection

**Collection Path:** `/payments/{paymentId}`

Financial ledger storing metadata returned from the payment gateway (Razorpay).

## Document Structure
```json
{
  "bookingId": "string (FK: bookings.id)",
  "playerId": "string (FK: users.uid)",
  "razorpayOrderId": "string",
  "razorpayPaymentId": "string",
  "razorpaySignature": "string",
  "amount": "number",
  "currency": "string",
  "status": "string (captured | failed | refunded)",
  "createdAt": "timestamp"
}
```

## Security Rules
- **Read:** Accessible only by the respective `playerId` or Super Admin.
- **Write:** STRICTLY written by the Server (Admin SDK) during the webhook/verification flow. Client writes are explicitly denied.