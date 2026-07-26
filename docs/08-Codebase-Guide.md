# 9. Codebase Guide (Folder Structure)

PlaySphere follows a strict domain-driven architecture utilizing the Next.js 15 App Router.

## 9.1 Root Directories

### `/app`
Contains all Next.js pages and API routes.
- `/app/api/`: Serverless functions (Auth, Payments, Webhooks).
- `/app/(auth)/`: Unauthenticated login/register pages.
- `/app/user/`: Protected routes for Players.
- `/app/owner/`: Protected routes for Turf Owners.
- `/app/admin/`: Protected routes for Platform Admins.

### `/components`
Reusable React UI components.
- `/components/ui/`: Base Shadcn components (Buttons, Inputs, Dialogs).
- `/components/landing/`: Homepage-specific marketing components.
- `/components/navbar/`: Navigation headers.

### `/services`
The most critical layer. All business logic and Firebase interactions.
- `auth.service.ts`: Firebase Authentication wrappers.
- `booking.service.ts`: Transactional Firestore booking logic.
- `config.service.ts`: Dynamic platform configuration cache.

### `/context`
React Context Providers for global state.
- `AuthContext.tsx`: Manages current user session.

### `/lib`
Utility libraries and initialization.
- `firebase.ts`: Client-side Firebase init.
- `firebaseAdmin.ts`: Server-side Firebase Admin SDK init.

### `/types`
TypeScript interface definitions to ensure type safety across the database boundary.

### `/public`
Static assets, videos (`hero-vedioo.mp4`), PWA icons, `manifest.json`, and the Service Worker (`sw.js`).
