# CI-CD Pipeline

PlaySphere utilizes Vercel's built-in Continuous Integration and Continuous Deployment (CI/CD) pipeline.

## Pipeline Stages
1. **Code Commit:** Developer pushes code to GitHub.
2. **Build Trigger:** Vercel intercepts the webhook and provisions a build container.
3. **Dependency Installation:** `npm install` is executed with cache utilization.
4. **Build Compilation:** `npm run build` generates the Next.js optimized production bundle.
5. **Deployment:** The bundle is distributed across the Edge network.
6. **Verification:** The deployment is assigned a unique, immutable URL (for previews) or mapped to the production domain.