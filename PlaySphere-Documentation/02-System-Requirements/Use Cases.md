# Use Cases

## UC-01: Online Turf Booking
- **Actor:** Player
- **Precondition:** Player is authenticated and logged in.
- **Main Flow:**
  1. Player selects a turf, date, and sport.
  2. Player selects an available time slot.
  3. System initiates a Razorpay checkout session.
  4. Player completes the payment.
  5. System verifies the payment signature server-side.
  6. System creates a confirmed booking document in Firestore.
  7. System presents an OTP to the player for check-in.
- **Alternate Flow:** Payment fails or is cancelled; the system aborts the booking creation.

## UC-02: Offline Booking Creation
- **Actor:** Turf Owner
- **Precondition:** Owner is authenticated and owns the selected turf.
- **Main Flow:**
  1. Owner navigates to the Offline Bookings dashboard.
  2. Owner inputs customer details, selects date, and time slot.
  3. System triggers the secure `/api/booking/offline` server route.
  4. Server validates availability, bypassing client security rules via Admin SDK.
  5. Server creates a confirmed offline booking document.
  6. Dashboard refreshes to display the newly blocked slot.

## UC-03: OTP Check-in Verification
- **Actor:** Turf Owner
- **Precondition:** Player arrives at the venue with a valid OTP.
- **Main Flow:**
  1. Owner enters the OTP into the dashboard.
  2. System validates the OTP against active bookings for that owner.
  3. System marks the booking status as `checked_in`.