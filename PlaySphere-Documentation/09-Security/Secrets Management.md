# Secrets Management

Proper handling of secrets is critical to preventing infrastructure compromise.

## Exposed (Public) Keys
Variables prefixed with `NEXT_PUBLIC_` are bundled into the client-side JavaScript. These are inherently safe to expose:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`

## Confidential (Private) Keys
These variables are NEVER prefixed with `NEXT_PUBLIC_` and exist only in the Node.js server environment:
- `FIREBASE_PRIVATE_KEY`
- `RAZORPAY_KEY_SECRET`

## Injection
In production, all secrets are securely injected into the Vercel Build and Runtime environments via the Vercel Dashboard. They are never committed to the Git repository.