# Database Indexes

Firestore requires explicit composite indexes for queries involving multiple fields, or queries combining equality filters with range/sorting filters on different fields.

## Required Composite Indexes

The following indexes must be manually created in the Firebase Console to ensure proper functionality of the application:

### Collection: `bookings`
Used primarily by the Turf Owner Dashboard to fetch their bookings in chronological order.
- **Field 1:** `ownerId` (Ascending)
- **Field 2:** `createdAt` (Descending)
- **Query Scope:** Collection

### Collection: `bookings`
Used by the checking algorithm to detect overlapping bookings for a specific slot.
- **Field 1:** `turfId` (Ascending)
- **Field 2:** `date` (Ascending)
- **Field 3:** `slot` (Ascending)
- **Query Scope:** Collection

## Management
These indexes can be deployed automatically if a `firestore.indexes.json` file is created and deployed via the Firebase CLI (`firebase deploy --only firestore:indexes`).