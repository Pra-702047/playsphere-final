# Security Architecture

PlaySphere employs a defense-in-depth security architecture designed to protect sensitive user data, financial transactions, and internal administrative functions.

## Core Security Pillars
1. **Authentication & Identity:** Handled entirely by Google Firebase Auth (JWT-based).
2. **Authorization (Data Level):** Enforced by Firestore Security Rules ensuring users can only read/write their authorized datasets.
3. **Privileged Execution:** Serverless APIs (Next.js Edge/Node) utilizing the Firebase Admin SDK to bypass client rules securely.
4. **Transport Layer:** 100% forced HTTPS/TLS 1.2+ for all data in transit.
5. **Secret Management:** Hardened environment variables via Vercel preventing key leakage to the frontend bundle.