# Payment Flow

## Step-by-Step Transaction Lifecycle

1. **Initialization:** The player selects a slot and clicks "Book".
2. **Order Creation:** The client POSTs to `/api/payment/create-order`. The Next.js server calls Razorpay to generate a unique `order_id` for the specified amount.
3. **Checkout UI:** The client initializes the Razorpay Checkout modal with the returned `order_id`, Turf Name, and User details.
4. **Payment Processing:** The player completes the payment (via UPI, Card, Netbanking) inside the Razorpay UI.
5. **Callback:** Razorpay returns the `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature` to the client.
6. **Verification:** The client forwards these parameters, alongside the booking data, to `/api/payment/verify`.
7. **Confirmation:** The server verifies the HMAC SHA256 signature using the `RAZORPAY_KEY_SECRET`. If valid, it writes the booking to Firestore and responds with a success status.
8. **Check-in:** The client displays a 4-digit OTP to the user for physical venue check-in.