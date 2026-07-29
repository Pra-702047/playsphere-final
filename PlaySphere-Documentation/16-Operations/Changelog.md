# Changelog

## [1.1.0] - 2026-07-29
### Added
- **Turf Owners Admin Module:** Comprehensive dashboard for Admins to view, edit, approve, and suspend Turf Owners.
- **KYC Tracking:** Integrated Identity Verification tracking into Turf Owner profiles.
- **Automated QA Tools:** Added backend programmatic seeding (`seed_qa.js`) and logic verification scripts.

### Fixed
- Resolved `uid` overwrite TypeScript Error in the Edit Owner page.
- Fixed an `Unterminated template` error that caused build crashes in TSX files.
- Completed End-to-End QA Audit and addressed 150+ strict TypeScript linting warnings.

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