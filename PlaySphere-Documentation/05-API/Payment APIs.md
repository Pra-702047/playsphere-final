# Payment APIs

Payment APIs interface with Razorpay and secure the transaction flow.

## 1. Create Razorpay Order
**Endpoint:** `/api/payment/create-order`
**Method:** `POST`
**Description:** Generates a secure `razorpay_order_id` for checkout.

### Request
```json
{ "amount": 1500 }
```
### Response
```json
{ "orderId": "order_abc123" }
```

## 2. Verify Payment Signature
**Endpoint:** `/api/payment/verify`
**Method:** `POST`
**Description:** Verifies the cryptographic HMAC signature returned by Razorpay and commits the booking to Firestore.

### Request
```json
{
  "razorpay_order_id": "string",
  "razorpay_payment_id": "string",
  "razorpay_signature": "string",
  "bookingData": { /* Booking Details */ }
}
```
### Response
```json
{ "success": true, "bookingId": "string" }
```

## 3. Process Refund
**Endpoint:** `/api/payment/refund`
**Method:** `POST`
**Description:** Issues a full refund via Razorpay for a cancelled booking.

### Request
```json
{ "bookingId": "string", "adminUid": "string" }
```