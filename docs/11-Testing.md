# 12. Quality Assurance & Testing

## 12.1 Testing Strategy
As a financial transaction platform, testing prioritizes payment integrity and race condition prevention.

## 12.2 Manual Test Cases (Smoke Testing)

### TC01: Double Booking Race Condition
- **Action**: Open two separate browsers, login as different users, and attempt to book the *exact same slot* simultaneously.
- **Expected**: One transaction succeeds. The other fails with a `409 Conflict` and the user is gracefully informed.

### TC02: Payment Signature Tampering
- **Action**: Intercept the Razorpay success callback and alter the `razorpay_payment_id` before it reaches `/api/payment/verify`.
- **Expected**: API throws a `400 Invalid Signature` error. Booking is NOT confirmed.

### TC03: PWA Installation
- **Action**: Open Android Chrome, browse the site for 30 seconds.
- **Expected**: The "Add to Home Screen" mini-infobar appears. Or, clicking the manual "Install App" button prompts the native install popup.

### TC04: Offline Booking Abuse
- **Action**: A turf owner attempts to create an offline booking for a slot that a user just booked online.
- **Expected**: The system rejects the offline booking creation.

## 12.3 Automated Testing
Currently, the primary automated safety net is **TypeScript's static analysis** during the Next.js build step. Any breaking changes to Database models (e.g., `AuditLog` interface changes) will prevent deployment.

Future Roadmap: Implement Cypress E2E tests for the booking flow and Jest unit tests for the Commission Engine math.
