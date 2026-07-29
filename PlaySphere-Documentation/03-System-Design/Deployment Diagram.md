# Deployment Diagram

The deployment architecture highlights the cloud-native, serverless distribution of PlaySphere.

```mermaid
graph TD
    subgraph User Devices
        Mobile[Mobile Device (PWA)]
        Desktop[Desktop Browser]
    end

    subgraph Vercel Edge Network
        CDN[Global CDN]
        SSR[Next.js Serverless Functions]
    end

    subgraph Google Cloud Platform
        Auth[Firebase Authentication]
        DB[(Firestore Database)]
        Storage[Firebase Cloud Storage]
    end

    subgraph Third-Party Services
        Razorpay[Razorpay Payment Gateway]
    end

    Mobile -->|HTTPS| CDN
    Desktop -->|HTTPS| CDN
    CDN -->|Dynamic Routes| SSR
    
    SSR -->|Admin SDK| DB
    Mobile -->|Client SDK| DB
    Desktop -->|Client SDK| Auth
    
    SSR <-->|API| Razorpay
```