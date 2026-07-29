# Prerequisites

Before deploying or contributing to PlaySphere, ensure the following tools and accounts are configured:

## System Requirements
- **Node.js:** v18.17.0 or higher (v20+ recommended).
- **Package Manager:** npm (v9 or higher).
- **Git:** v2.30.0 or higher.
- **OS:** Linux, macOS, or Windows (WSL2 recommended).

## Required Accounts & API Keys
1. **Google Firebase Account:**
   - Active Firebase Project.
   - Firestore Database (Native Mode) enabled.
   - Firebase Storage enabled.
   - Firebase Authentication (Email/Password & Google OAuth) enabled.
   - Firebase Admin Service Account JSON key.

2. **Razorpay Account:**
   - Active Merchant Account.
   - Test/Live API Key ID and Key Secret.
   - Webhook configured for `payment.captured`, `refund.processed`.

3. **Vercel Account:**
   - Account linked to the project's GitHub/GitLab repository for CI/CD deployments.