# Session Management

## Token Lifecycle
Firebase Authentication handles session persistence automatically in the browser using IndexedDB/LocalStorage. 
- The Firebase SDK refreshes the JWT ID token automatically every hour in the background.
- The `AuthContext` ensures the UI is synchronized with the session state.

## Security Context
Because Next.js Server Components (SSR) cannot directly read IndexedDB, sensitive pages relying heavily on SSR might experience a flash of unauthenticated state or require client-side data fetching. PlaySphere utilizes client-side rendering (CSR) for highly dynamic, authenticated dashboards (like the Owner Dashboard) to leverage the Firebase Client SDK's persistent session seamlessly.