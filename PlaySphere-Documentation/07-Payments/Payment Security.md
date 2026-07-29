# Payment Security

## Signature Verification
PlaySphere strictly adheres to Razorpay's security guidelines. No booking is created in Firestore until the payment signature is cryptographically verified on the server.

```javascript
// Verification Logic Representation
const crypto = require('crypto');
const expectedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(razorpay_order_id + '|' + razorpay_payment_id)
  .digest('hex');

if (expectedSignature === razorpay_signature) {
  // Payment is authentic
}
```

## Protection Against Forgery
Because the `RAZORPAY_KEY_SECRET` is stored securely in Vercel environment variables and never exposed to the client, it is computationally impossible for a malicious actor to forge a valid signature to bypass payment and create a free booking.