# HTTPS

PlaySphere enforces HTTPS across all endpoints.

- **Vercel Enforcement:** Vercel automatically provisions SSL/TLS certificates (via Let's Encrypt) and redirects all `http://` traffic to `https://` with a 308 Permanent Redirect.
- **Firebase APIs:** All Firebase client and Admin SDK communications natively occur over encrypted TLS connections.
- **Razorpay:** Transaction payloads and webhooks are strictly transmitted over HTTPS.