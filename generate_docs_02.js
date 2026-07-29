const fs = require('fs');
const path = require('path');

const rootDir = 'c:/Users/Lenovo/Downloads/playsphere-main-main/playsphere-main-main/PlaySphere-Documentation/02-System-Requirements';

const docs = {
  'Software Requirements Specification (SRS).md': `# Software Requirements Specification (SRS)

## 1. Introduction
This document defines the Software Requirements Specification (SRS) for PlaySphere, an enterprise-grade sports turf booking and management platform.

## 2. Overall Description
PlaySphere is a B2B2C SaaS platform connecting sports facility owners with players. The platform enables players to discover venues and book slots via a mobile-first PWA, while owners manage inventory, bookings, and revenue via a comprehensive administrative dashboard.

## 3. System Features
- **Authentication & Authorization:** Firebase-powered secure login with Role-Based Access Control (RBAC) (Player, Owner, Admin).
- **Turf Discovery:** Geolocation and parameter-based search for venues.
- **Inventory Management:** Real-time slot management preventing double booking.
- **Payment Processing:** Integrated Razorpay checkout with secure server-side signature validation.
- **Analytics Engine:** Automated generation of utilization and revenue reports for owners.

## 4. Operating Environment
- **Client Side:** Modern web browsers (Chrome, Safari, Firefox, Edge) with Service Worker support for PWA features.
- **Server Side:** Next.js Server Components running on Vercel's Edge network, communicating with Firebase Firestore and Auth via the Firebase Admin SDK.

## 5. Security Requirements
- PCI-DSS compliant payment processing (offloaded to Razorpay).
- Secure, encrypted data transmission via HTTPS.
- Firestore Security Rules restricting unauthorized document access.`,

  'Functional Requirements.md': `# Functional Requirements

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
- **FR-NOTIF-01:** The system shall send instant booking confirmations and OTPs for check-in.`,

  'Non-Functional Requirements.md': `# Non-Functional Requirements

## 1. Performance & Scalability
- **NFR-PERF-01:** The application shall achieve a Time To Interactive (TTI) of less than 2 seconds on 4G networks.
- **NFR-PERF-02:** The system architecture shall support concurrent handling of at least 10,000 active users.
- **NFR-PERF-03:** Firestore queries must be optimized using compound indexes to ensure sub-100ms response times for large datasets.

## 2. Availability & Reliability
- **NFR-AVAIL-01:** The system shall target an uptime of 99.9% (excluding scheduled maintenance).
- **NFR-AVAIL-02:** The PWA must support offline caching of static assets to ensure the app shell loads without network connectivity.

## 3. Security
- **NFR-SEC-01:** All API communications must be encrypted using TLS 1.2 or higher.
- **NFR-SEC-02:** Sensitive configuration keys (e.g., Firebase Admin Private Key, Razorpay Secret) must never be exposed to the client bundle.
- **NFR-SEC-03:** Firestore rules must prevent unauthorized reading of the \`audit_logs\` and \`users\` collections.

## 4. Usability
- **NFR-USE-01:** The application UI shall be fully responsive across mobile, tablet, and desktop viewports using Tailwind CSS.
- **NFR-USE-02:** The application shall conform to WCAG 2.1 AA accessibility standards where applicable.`,

  'User Stories.md': `# User Stories

## As a Player
- **US-P1:** As a player, I want to search for turfs by city and sport so that I can find a suitable venue near me.
- **US-P2:** As a player, I want to see the real-time availability of slots so that I don't book a slot that is already taken.
- **US-P3:** As a player, I want to pay online securely via UPI or Card so that my booking is confirmed immediately.
- **US-P4:** As a player, I want to receive an OTP upon booking so that I can securely check in at the venue.

## As a Turf Owner
- **US-O1:** As a turf owner, I want to add my turf's details and photos so that players can view my facilities.
- **US-O2:** As a turf owner, I want to view a centralized calendar of all online and offline bookings so that I can manage my daily operations.
- **US-O3:** As a turf owner, I want to manually block out slots for offline bookings so that I can prevent online double bookings.
- **US-O4:** As a turf owner, I want to view a dashboard with total revenue and booking counts so that I can track my business performance.

## As a Super Admin
- **US-A1:** As an admin, I want to view all registered users and turfs so that I can monitor platform growth.
- **US-A2:** As an admin, I want to suspend or approve turfs so that I can maintain quality control on the platform.`,

  'Use Cases.md': `# Use Cases

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
  3. System triggers the secure \`/api/booking/offline\` server route.
  4. Server validates availability, bypassing client security rules via Admin SDK.
  5. Server creates a confirmed offline booking document.
  6. Dashboard refreshes to display the newly blocked slot.

## UC-03: OTP Check-in Verification
- **Actor:** Turf Owner
- **Precondition:** Player arrives at the venue with a valid OTP.
- **Main Flow:**
  1. Owner enters the OTP into the dashboard.
  2. System validates the OTP against active bookings for that owner.
  3. System marks the booking status as \`checked_in\`.`
};

for (const [filename, content] of Object.entries(docs)) {
  fs.writeFileSync(path.join(rootDir, filename), content, 'utf8');
}
console.log('Successfully generated batch 1 (part 2).');
