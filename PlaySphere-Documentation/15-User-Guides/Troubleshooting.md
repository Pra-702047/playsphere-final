# Troubleshooting

**Issue: The booking slot is spinning and not loading.**
*Fix:* Check your internet connection. If the issue persists, perform a hard refresh (Ctrl+Shift+R) to clear your browser cache.

**Issue: I am a Turf Owner but my dashboard says "0 Bookings" even though I have reservations.**
*Fix:* If you recently deployed the app, ensure the Firebase Composite Indexes have finished building in the Firebase Console. The dashboard cannot load data until the index is enabled.

**Issue: Payment was deducted but booking failed.**
*Fix:* The system will automatically reconcile this within 24 hours via Razorpay webhooks and issue an auto-refund. Contact support if the refund is not initiated.