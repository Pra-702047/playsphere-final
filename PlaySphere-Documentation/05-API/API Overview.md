# API Overview

PlaySphere uses a hybrid API architecture. The primary data interface for client applications is the Firebase Client SDK (Firestore and Auth), which handles direct reads and writes governed by Firestore Security Rules. 

For privileged operations that must bypass client rules (e.g., payments, offline booking creation), PlaySphere exposes custom Serverless API routes built on the Next.js App Router (`/api/*`). These routes leverage the Firebase Admin SDK.

## Base URL
In development: `http://localhost:3000/api`
In production: `https://your-domain.com/api`

## Global Headers
All custom API routes that mutate data expect JSON payloads.
```http
Content-Type: application/json
```