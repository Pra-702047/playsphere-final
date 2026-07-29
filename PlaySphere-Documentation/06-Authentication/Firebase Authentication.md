# Firebase Authentication

PlaySphere delegates identity management completely to Google's Firebase Authentication service. This ensures enterprise-grade security for user credentials without the platform storing plain-text passwords or maintaining session cookies manually.

## Supported Providers
- **Email and Password:** Standard registration/login flow.
- **Google OAuth (SSO):** One-click sign-in leveraging Google accounts.

## Lifecycle
When a user registers, an authentication record is created in Firebase Auth. A corresponding profile document is subsequently created in the Firestore `users` collection to store metadata and application-specific roles (`player`, `owner`, `admin`).