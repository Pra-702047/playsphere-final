# Known Limitations

1. **Razorpay Webhooks:** While signature verification is robust, asynchronous webhooks for `payment.captured` are not yet implemented, meaning users who close their browser prematurely during checkout might face manual reconciliation.
2. **Dynamic Slot Generation:** The booking form currently relies on a static array of time slots (e.g., 06:00 to 22:00) rather than dynamically reading the specific turf's `operatingHours`.
3. **Pagination:** The Turf Search page fetches all active turfs at once. While acceptable for the current scale, cursor-based pagination is required as the database grows to thousands of venues.