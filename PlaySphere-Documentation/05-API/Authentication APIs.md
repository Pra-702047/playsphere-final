# Authentication APIs

PlaySphere primarily uses the Firebase Authentication Client SDK for user management. There are no custom `/api/auth` Next.js endpoints exposed, as session states and tokens are managed directly between the browser and Google's Firebase servers.

## Client Operations
- **Login:** `signInWithEmailAndPassword`, `signInWithPopup` (Google)
- **Logout:** `signOut`
- **Token:** `getIdToken` (used if calling secure custom endpoints in the future)

## Server Validation
In the Next.js Server Components, authentication state is evaluated based on Firebase constraints, although currently, most access control is managed client-side via React Context and Route Guards.