# Naming Conventions

## Files and Directories
- **React Components:** PascalCase (e.g., `BookingModal.tsx`, `TurfCard.tsx`).
- **Utility/Service Files:** camelCase (e.g., `booking.service.ts`, `firebase-admin.ts`).
- **Next.js App Router:** Reserved filenames must be strictly lowercase (e.g., `page.tsx`, `layout.tsx`, `route.ts`).

## Variables and Functions
- **Variables:** camelCase (e.g., `selectedTurfId`, `isSubmitting`).
- **Booleans:** Prefix with `is`, `has`, or `should` (e.g., `isOffline`, `hasVerifiedOtp`).
- **Constants/Env Vars:** UPPER_SNAKE_CASE (e.g., `RAZORPAY_KEY_SECRET`).
- **Components:** PascalCase (e.g., `<PaymentForm />`).