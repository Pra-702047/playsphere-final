# Git Workflow

PlaySphere follows a trunk-based development workflow.

## Branch Naming
- `feat/short-description` (e.g., `feat/whatsapp-integration`)
- `fix/short-description` (e.g., `fix/payment-signature-bug`)
- `chore/short-description` (e.g., `chore/update-dependencies`)

## Process
1. Branch off `main`.
2. Commit frequently with descriptive messages.
3. Push to GitHub to trigger a Vercel Preview Deployment.
4. Review the preview URL.
5. Merge via Pull Request into `main` to trigger the Production Deployment.