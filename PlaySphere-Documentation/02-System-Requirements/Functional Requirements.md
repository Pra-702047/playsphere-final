# Functional Requirements

## 1. Authentication Module
- **FR-AUTH-01:** The system shall allow users to register and authenticate using Email/Password and Google OAuth.
- **FR-AUTH-02:** The system shall enforce Role-Based Access Control distinguishing between Players, Turf Owners, and Super Admins.
- **FR-AUTH-03:** Turf owners must be manually verified or self-onboarded before accessing the owner dashboard.

## 2. Turf Management (Owner)
- **FR-TURF-01:** Owners shall be able to create, read, update, and delete turf profiles (including name, location, pricing, sports offered, and images).
- **FR-TURF-02:** Owners shall be able to configure available time slots and operating hours.

## 3. Booking Engine
- **FR-BOOK-01:** Players shall be able to view real-time availability of turf slots.
- **FR-BOOK-02:** The system shall lock a slot once a payment session is initiated to prevent race conditions.
- **FR-BOOK-03:** Owners shall be able to manually block slots for offline (walk-in/phone) bookings.

## 4. Payment & Financials
- **FR-PAY-01:** The system shall process online payments via Razorpay.
- **FR-PAY-02:** The system shall support automated refunds for cancelled bookings based on the cancellation policy.
- **FR-PAY-03:** Owners shall view financial summaries and transaction ledgers.

## 5. Notifications
- **FR-NOTIF-01:** The system shall send instant booking confirmations and OTPs for check-in.