# Error Tracking

> **Note:** Based on the current codebase analysis, a dedicated error tracking service is not yet integrated. It is documented here as a recommendation for the future roadmap.

## Recommended Implementation: Sentry
Integrating Sentry for Next.js is highly recommended for production to catch unhandled exceptions:
1. **Client-Side:** Catches React render errors and network failures.
2. **Server-Side:** Catches API route crashes, signature verification failures, and Firestore connection issues.
3. **Alerting:** Sends real-time Slack or Email alerts when spike in `500` errors occurs.