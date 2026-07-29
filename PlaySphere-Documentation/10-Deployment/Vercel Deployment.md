# Vercel Deployment

PlaySphere is optimized for deployment on Vercel, the native hosting platform for Next.js applications.

## Architecture
- **Static Pages:** Pre-rendered at build time and served via Vercel's Global Edge CDN.
- **Dynamic Routes:** Executed on-demand via Vercel Serverless Functions (Node.js/Edge).
- **Assets:** Images and static files are automatically optimized and cached at the Edge.

## Deployment Process
Deployments are automated through a GitHub integration. Pushing to the `main` branch triggers a production build, while pushing to feature branches creates isolated Preview Deployments.