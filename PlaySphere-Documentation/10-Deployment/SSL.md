# SSL (TLS)

## Automated Provisioning
PlaySphere does not require manual SSL certificate management. Vercel automatically provisions and renews SSL/TLS certificates via Let's Encrypt for all custom domains connected to the project.

## Security Level
- Minimum TLS Version: 1.2 (TLS 1.3 preferred).
- Cipher Suites: Modern, strong ciphers enforced by Vercel's load balancers.