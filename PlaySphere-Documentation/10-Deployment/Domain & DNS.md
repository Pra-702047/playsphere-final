# Domain & DNS

## Configuration
- **Registrar:** Custom domains are connected via Vercel's dashboard.
- **DNS Records:** 
  - A Record: Points to Vercel's Anycast IP (`76.76.21.21`).
  - CNAME Record: Points `www` to `cname.vercel-dns.com`.

## Propagation
Vercel automatically verifies DNS propagation and issues the SSL certificate before routing live traffic to the domain.