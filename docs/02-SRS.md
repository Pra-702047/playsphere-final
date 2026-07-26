# 3. Software Requirements Specification (SRS)

## 3.1 Introduction
### 3.1.1 Purpose
This document specifies the software requirements for the PlaySphere platform. It serves as a guide for developers, QA engineers, and stakeholders to understand the system's expected behavior, constraints, and operational environment.

### 3.1.2 Scope
PlaySphere is a web-based, PWA-enabled SaaS application connecting sports turf owners with players. The scope includes user management, venue discovery, real-time booking, payment processing, owner dashboard, and admin oversight.

### 3.1.3 Definitions
- **Turf**: A sports facility/ground available for booking.
- **Slot**: A 60-minute time block representing a booking interval.
- **Settlement**: The process of transferring net revenue to the Turf Owner after deducting platform commissions and GST.

---

## 3.2 Overall Description
### 3.2.1 Actors
- **Player (User)**: Browses and books turfs.
- **Owner (Turf Owner)**: Manages turf inventory, pricing, and bookings.
- **Admin**: Manages the platform, resolves disputes, and monitors fraud.
- **System**: Background tasks handling webhooks, OTPs, and automated refunds.

---

## 3.3 User Stories
- *As a Player*, I want to search for turfs by sport and location so that I can find a place to play nearby.
- *As a Player*, I want to see real-time slot availability so that I don't double-book a ground.
- *As an Owner*, I want to manually block slots for offline customers so my online calendar is accurate.
- *As an Owner*, I want to see my daily earnings and pending settlements to track my revenue.
- *As an Admin*, I want to view a fraud dashboard to identify fake bookings or malicious behavior.

---

## 3.4 Functional Requirements

### 3.4.1 Player Features
- **Authentication**: Sign up / Log in using Email/Password. Password reset capability.
- **Discovery**: View a list of turfs. View turf details (images, amenities, rules, map location).
- **Booking Management**: View past and upcoming bookings. Cancel eligible bookings.

### 3.4.2 Owner Features
- **Turf Management**: Add, edit, or remove turf profiles (Name, Location, Sports, Pricing).
- **Slot Configuration**: Set opening and closing hours. Define dynamic pricing (weekend vs weekday).
- **Dashboard**: View key metrics (Total Bookings, Revenue, Upcoming Slots).

### 3.4.3 Admin Features
- **User Management**: Ban/Suspend malicious users. Elevate user roles.
- **Turf Approval**: Review and approve new turf listings.
- **Global Config**: Modify platform commission rates dynamically without code deployment.

### 3.4.4 Booking System
- **Real-time Locking**: The system must prevent two users from booking the same slot simultaneously using a composite unique ID (`turfId_date_slot`).
- **Status Lifecycle**: Bookings must transition through `pending`, `confirmed`, `cancelled`, and `completed`.

### 3.4.5 Offline Booking
- Owners must be able to create `offline` bookings bypassing the payment gateway.
- Offline bookings must instantly block the slot in the global database.

### 3.4.6 Payment Integration
- Integration with Razorpay.
- System must capture payments and reconcile via secure Webhooks.
- Automated refund generation upon player cancellation.

### 3.4.7 Search & Filters
- **Location-based search**: Dropdown/Input based city selection.
- **Sport-based filtering**: Filter by Football, Cricket, Badminton, etc.

---

## 3.5 Non-Functional Requirements

### 3.5.1 Security
- **RBAC**: API and UI routes must strictly enforce Role-Based Access Control (Admin, Owner, User).
- **Data Protection**: Firebase Security Rules must prevent unauthorized read/writes.
- **Integrity**: Payment amounts must be calculated server-side, never trusting client input.

### 3.5.2 Performance
- **Load Time**: Core Web Vitals must score 90+ on Lighthouse.
- **Database**: Firestore queries must utilize composite indexes for fast retrieval.

### 3.5.3 Scalability
- The serverless Next.js architecture must automatically scale to handle up to 10,000 concurrent booking requests.

### 3.5.4 Availability & Reliability
- The platform should target 99.9% uptime.
- Idempotent webhook processing to ensure network retries do not result in duplicate transactions.

### 3.5.5 Portability
- Platform must be fully responsive across Mobile, Tablet, and Desktop.
- Must be installable as a Progressive Web App (PWA) on iOS and Android.
