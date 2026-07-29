# Logging

PlaySphere utilizes distinct logging mechanisms for different environments.

## Client-Side Logging
- `console.log` and `console.error` are used for development debugging.
- *Recommendation:* Strip `console.log` statements in the production build via the `next.config.mjs` compiler options.

## Server-Side Logging
- Errors occurring in Next.js API routes are logged to stdout.
- These logs are accessible via the **Vercel Dashboard -> Logs** tab, which aggregates runtime logs from the serverless functions.

## Audit Logging (Database)
Critical administrative actions (e.g., Owner creating an offline booking) are permanently written to the `audit_logs` Firestore collection for security accountability.