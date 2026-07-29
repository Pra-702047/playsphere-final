# Non-Functional Requirements

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
- **NFR-SEC-03:** Firestore rules must prevent unauthorized reading of the `audit_logs` and `users` collections.

## 4. Usability
- **NFR-USE-01:** The application UI shall be fully responsive across mobile, tablet, and desktop viewports using Tailwind CSS.
- **NFR-USE-02:** The application shall conform to WCAG 2.1 AA accessibility standards where applicable.