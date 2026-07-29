# Environment Variables (Deployment)

## Vercel Dashboard Configuration
All environment variables must be configured in the Vercel Dashboard under **Project Settings > Environment Variables**.

## Multiline Variables
> **CRITICAL:** The `FIREBASE_PRIVATE_KEY` contains multiline `\n` characters. When pasting this into Vercel, it must be enclosed in double quotes or properly formatted to ensure the Node.js environment parses the line breaks correctly. Failure to do so will result in a `500 Internal Server Error` during Admin SDK initialization.