# Admin Manual

## Super Admin Dashboard
The Admin Dashboard provides platform-wide oversight. Access is restricted to users with the `admin` role.

### Turf Owners Management 🏟️
The `Operations Shortcuts > Turf Owners` module allows admins to comprehensively manage all turf owners on the platform.

- **Tabbed Profiles:** View detailed owner profiles separated into Basic Info, Identity Verification (KYC), Payment Details, and Business Address.
- **Verification & Approval:** Admins can manually verify KYC documents and approve/reject Turf Owners. Only approved owners can list turfs.
- **Associated Turfs:** View and manage all turfs belonging to a specific owner directly from their profile.
- **Account Actions:** Suspend, Warn, or flag owners for fraudulent activity.
- **Audit Logging:** Every administrative action taken on an owner (e.g., approving KYC, suspending account) is automatically tracked in the `auditLogs` collection with a timestamp and the admin's ID.

### Bookings & Disputes
- **Disputes:** Admins have global read access to the `audit_logs` and `payments` collections to investigate disputed charges or double-booking claims.
- **Double-Bookings:** The system automatically prevents double bookings at the Firestore query level, but admins can manually override or refund if edge cases arise.

### General Metrics
- View global GMV (Gross Merchandise Value).
- Track total user acquisition metrics.
- Monitor active turfs vs pending turfs.