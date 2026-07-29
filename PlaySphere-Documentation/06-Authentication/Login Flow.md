# Login Flow

## 1. Credential Submission
The user submits credentials via the login form, which are passed to the Firebase Auth SDK (`signInWithEmailAndPassword`).

## 2. Token Generation
Firebase authenticates the user and returns an ID Token containing the user's UUID (uid).

## 3. Profile Fetch
The application's React `AuthContext` listens to the `onAuthStateChanged` event. Upon detecting a login, it immediately fetches the corresponding document from the Firestore `users` collection.

## 4. Redirection
Based on the `role` defined in the fetched profile document, the user is redirected:
- **Player:** Redirected to `/` (Home/Search).
- **Owner:** Redirected to `/owner/dashboard`.
- **Admin:** Redirected to `/admin/dashboard`.