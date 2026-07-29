# Frequently Asked Questions (FAQ)

**Q: What happens if two people try to book the same slot at the exact same time?**
A: PlaySphere uses Firestore's transactional `create` rules and backend verification to ensure that only the first successful payment secures the slot. The second user's payment will trigger a refund, and they will be notified that the slot was taken.

**Q: How do I install the app on my phone?**
A: Open PlaySphere in Chrome or Safari. A popup will appear at the bottom asking you to "Install PlaySphere". Click it, and the app will be added to your home screen.

**Q: Are my payments secure?**
A: Yes. PlaySphere does not store credit card details. All transactions are securely processed by Razorpay, an RBI-compliant gateway.