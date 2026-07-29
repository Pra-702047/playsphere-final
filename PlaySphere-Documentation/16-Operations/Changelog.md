# Changelog

## [1.0.0] - 2026-07-27
### Added
- Next.js 15 App Router architecture.
- Firebase Authentication (Google/Email).
- Razorpay Payment Gateway integration.
- Progressive Web App (PWA) manifest and Service Worker.
- Role-Based Access Control (RBAC).

### Changed
- Shifted `getAllLocations` and `getSports` queries to execute on the server for faster initial page loads.
- Updated `createOfflineBooking` to utilize a deterministic document ID strategy (`turfId_date_slot`) to guarantee collision prevention.