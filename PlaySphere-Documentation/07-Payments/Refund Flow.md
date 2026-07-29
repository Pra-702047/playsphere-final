# Refund Flow

PlaySphere provides a secure, server-side refund mechanism for cancelled bookings.

## Execution Flow
1. A Turf Owner (or Admin) initiates a refund via the dashboard UI.
2. A POST request is sent to `/api/payment/refund` containing the `bookingId`.
3. The server validates the requestor's authorization (must be the owner of the turf or an admin).
4. The server fetches the `paymentId` from the booking record.
5. The server issues a `razorpay.payments.refund()` API call.
6. Upon success, the server updates the booking status in Firestore to `refunded`.

*Note: Refunds typically take 5-7 business days to reflect in the customer's account depending on the payment method.*