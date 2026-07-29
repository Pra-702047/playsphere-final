# Webhooks

> **Note:** The current architecture relies primarily on synchronous client-to-server signature verification (`/api/payment/verify`). Implementing Razorpay Webhooks (e.g., `/api/webhooks/razorpay`) is recommended for the future roadmap to handle edge cases.

## Future Webhook Implementation
Webhooks should be implemented to capture asynchronous payment events, particularly:
- `payment.captured`: To confirm bookings if the user's browser closes before the client callback executes.
- `refund.processed`: To update the Firestore booking status when a refund clears through the banking network.