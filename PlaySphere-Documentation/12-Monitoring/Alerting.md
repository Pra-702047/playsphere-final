# Alerting

> **Note:** Automated alerting is not currently configured. It is documented here as a recommendation for the future roadmap.

## Recommended Configuration
- **Vercel Checks:** Configure Slack integrations in Vercel to alert the engineering team of failed deployments.
- **Firebase Budget Alerts:** Crucial for NoSQL databases. Configure Google Cloud Billing alerts to trigger an email if Firestore read operations spike unexpectedly (preventing billing attacks/runaways).
- **Uptime Monitoring:** Utilize a service like UptimeRobot or BetterStack to ping the homepage every 5 minutes and alert the team if the site goes down.