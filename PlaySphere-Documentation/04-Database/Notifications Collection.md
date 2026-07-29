# Notifications Collection

> **Note:** Based on the current codebase analysis, this feature is not yet implemented. It is documented here as a recommendation for the future roadmap.

**Collection Path:** `/notifications/{notificationId}`

Intended to store in-app alerts for users (e.g., booking confirmations, cancellations, promotional messages).

## Recommended Structure
```json
{
  "userId": "string",
  "title": "string",
  "body": "string",
  "type": "string (booking | system | promo)",
  "isRead": "boolean",
  "createdAt": "timestamp"
}
```