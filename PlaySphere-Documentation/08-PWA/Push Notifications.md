# Push Notifications

> **Note:** Based on the current codebase analysis, Web Push Notifications are not yet fully implemented. It is documented here as a recommendation for the future roadmap.

## Future Implementation Strategy
1. **FCM Integration:** Utilize Firebase Cloud Messaging (FCM) to request notification permissions from the user via the browser API.
2. **Token Storage:** Save the FCM device token to the user's profile in Firestore.
3. **Server Triggers:** Configure Cloud Functions or Next.js APIs to trigger FCM payloads (e.g., "Booking Confirmed", "Slot Reminder") to the specific device token.
4. **Service Worker Handling:** The `sw.js` file will capture incoming push events and display native OS-level notifications to the user.