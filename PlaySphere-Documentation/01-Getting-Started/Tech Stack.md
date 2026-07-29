# Tech Stack

PlaySphere is built on a modern, high-performance JavaScript stack.

## Frontend
- **Framework:** [Next.js 15](https://nextjs.org/) (App Router) - For Server-Side Rendering (SSR) and routing.
- **Library:** [React 18/19](https://react.dev/) - Core UI library.
- **Language:** [TypeScript](https://www.typescriptlang.org/) - For strict type safety and developer productivity.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework.
- **Components:** [Shadcn UI](https://ui.shadcn.com/) - Accessible, customizable UI primitives (Radix UI).
- **Icons:** [Lucide React](https://lucide.dev/) - Consistent iconography.

## Backend & Database (BaaS)
- **Authentication:** [Firebase Auth](https://firebase.google.com/docs/auth) - Secure email/password and OAuth providers.
- **Database:** [Firebase Firestore](https://firebase.google.com/docs/firestore) - NoSQL document database with real-time listeners.
- **Storage:** [Firebase Storage](https://firebase.google.com/docs/storage) - For turf images and user avatars.
- **Admin SDK:** [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup) - For secure server-side operations bypassing client security rules.

## Payments
- **Gateway:** [Razorpay](https://razorpay.com/) - Secure payment processing, order creation, and webhooks.

## Infrastructure & DevOps
- **Hosting:** [Vercel](https://vercel.com/) - Edge network deployment, CI/CD, and serverless functions execution.
- **PWA:** [next-pwa](https://www.npmjs.com/package/next-pwa) - Service worker generation for offline support and installability.
- **Package Manager:** npm - Dependency management.