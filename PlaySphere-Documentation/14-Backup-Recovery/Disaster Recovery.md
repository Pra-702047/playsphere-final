# Disaster Recovery (DR)

## Scenarios
1. **Accidental Data Deletion (User Error):** If an admin accidentally purges a collection, PITR (if enabled) is utilized to revert the database state.
2. **Vercel Outage:** In the rare event of a Vercel regional outage, the codebase is hosted on GitHub and can be rapidly deployed to an alternative provider (e.g., AWS Amplify or Netlify).
3. **Firebase Outage:** PlaySphere relies heavily on GCP infrastructure. In a multi-region failure, the application will display a graceful maintenance page. Offline bookings cannot be processed during this window.