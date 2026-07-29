# Firestore Schema

PlaySphere utilizes Google Cloud Firestore, a flexible, scalable NoSQL cloud database. Data is stored in documents, which are organized into collections.

## Root Collections
1. `users`: Platform user profiles and RBAC definitions.
2. `turfs`: Sports venue profiles and configuration.
3. `bookings`: Core transactional reservation data.
4. `payments`: Payment ledger for reconciliation.
5. `audit_logs`: Secure, append-only logs for administrative actions.

## Design Philosophy
- **Denormalization:** Some data (like `turfName` or `playerName`) is duplicated within the `bookings` collection to avoid heavy client-side joins and reduce document read counts.
- **Shallow Queries:** Collections are kept flat. Subcollections are avoided for core transactional data to allow global querying via standard indexes.