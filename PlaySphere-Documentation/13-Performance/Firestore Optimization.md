# Firestore Optimization

Firestore charges per document read, making query optimization a financial and performance necessity.

## Strategies Implemented
1. **Denormalization:** Frequently accessed relational data (like `turfName` in a Booking document) is duplicated to avoid secondary lookup queries.
2. **Shallow Fetching:** The UI limits queries using `limit(50)` and implements pagination via `startAfter` cursors to prevent massive data dumps on the client.
3. **Composite Indexes:** Complex queries (like sorting an owner's bookings by date) utilize pre-built composite indexes to ensure query execution time is proportional to the result set size, not the total collection size.