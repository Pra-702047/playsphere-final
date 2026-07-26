# 10. DevOps & Deployment

PlaySphere is architected for zero-downtime, Vercel Edge/Serverless deployment.

## 10.1 Vercel Deployment
Vercel automatically provisions a CDN, Edge network, and HTTPS certificate for the application.
1. Connect the GitHub repository.
2. The `main` branch acts as the production trigger.
3. Every pull request generates an isolated Preview Deployment.

## 10.2 CI/CD Pipeline
- **Continuous Integration**: Next.js `npm run build` performs strict TypeScript checking and linting. If the build fails (e.g., TS errors in `fraud/page.tsx`), the deployment is halted.
- **Continuous Deployment**: Vercel handles the hot-swap to the new build with zero downtime.

## 10.3 Domain & HTTPS
Vercel automatically generates an SSL/TLS certificate (Let's Encrypt) and handles auto-renewal. HSTS (Strict Transport Security) is enabled by default.

## 10.4 Rollback Strategy
If a production incident occurs:
1. Navigate to Vercel Dashboard -> Deployments.
2. Select the previous stable deployment.
3. Click "Promote to Production".
4. Rollback completes in < 5 seconds.

## 10.5 Environment Variables Management
Environment variables must be securely stored in the Vercel dashboard.

**Variables:**
- `NEXT_PUBLIC_FIREBASE_*`: Safe to expose to the client. Used by `lib/firebase.ts`.
- `FIREBASE_ADMIN_*`: **CRITICAL SECRET**. Service account JSON required for `firebaseAdmin.ts`.
- `RAZORPAY_KEY_ID`: Public-facing Razorpay ID.
- `RAZORPAY_KEY_SECRET`: **CRITICAL SECRET**. Used for HMAC verification.
- `RAZORPAY_WEBHOOK_SECRET`: **CRITICAL SECRET**. Used to verify webhook origins.
