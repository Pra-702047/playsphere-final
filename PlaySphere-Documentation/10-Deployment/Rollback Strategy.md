# Rollback Strategy

In the event of a critical production failure, PlaySphere leverages Vercel's instant rollback capabilities.

## Execution
1. Navigate to the **Deployments** tab in the Vercel Dashboard.
2. Locate the previous stable production deployment.
3. Click the vertical ellipsis (three dots) and select **"Promote to Production"** or **"Revert"**.
4. The routing layer will instantly switch traffic to the stable build without requiring a full recompilation.

## Database Rollbacks
Firestore does not support one-click rollbacks. If a bad deployment corrupted database state, point-in-time recovery (if enabled in GCP) or manual data patching scripts must be executed.