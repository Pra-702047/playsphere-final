# Security Testing

## Manual Auditing
- **Firestore Rules:** Routinely tested in the Firebase Console Rules Playground to ensure simulated unauthorized reads/writes are denied.
- **Dependency Scanning:** Execution of `npm audit` during the build pipeline to catch vulnerable third-party packages.

> **Roadmap Recommendation:** Integrate automated security scanning tools (e.g., Snyk) into the GitHub Actions pipeline.