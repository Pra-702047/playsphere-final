# Environment Setup

PlaySphere relies on secure environment variables to manage third-party integrations. These must be configured in `.env.local` for development and securely injected into the Vercel dashboard for production.

## Required Variables

```env
# Firebase Client Configuration (Safe to expose)
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="playsphere-xyz.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="playsphere-xyz"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="playsphere-xyz.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="1234567890"
NEXT_PUBLIC_FIREBASE_APP_ID="1:1234567890:web:abcdef"

# Firebase Admin Configuration (STRICTLY CONFIDENTIAL)
# Ensure the private key is properly formatted with \n newlines in production
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-abc@playsphere-xyz.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBAD...\n-----END PRIVATE KEY-----\n"

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_1234567890"
RAZORPAY_KEY_SECRET="your_razorpay_secret_key"
```

## Security Notes
- Never commit `.env.local` to version control.
- Ensure `.gitignore` includes `*.env*`.
- For Vercel deployment, the `FIREBASE_PRIVATE_KEY` must be enclosed in quotes if it contains multiline string representations.