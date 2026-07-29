# Firestore Rules

Firestore Security Rules act as the primary firewall for PlaySphere's data layer.

## Rule Principles
- **Default Deny:** All collections are closed by default.
- **Ownership Verification:** Users can only mutate documents where `request.auth.uid == resource.data.userId` (or `ownerId`).
- **Role Checks:** Write operations on global collections require the user's `users` document to possess `role == 'admin'`.

## Example Rule Snippet
```javascript
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Users can read/write their own profile
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /turfs/{turfId} {
      // Anyone can read active turfs, only owners can write
      allow read: if resource.data.isActive == true || 
                     (request.auth != null && request.auth.uid == resource.data.ownerId);
      allow write: if request.auth != null && request.auth.uid == request.resource.data.ownerId;
    }
  }
}
```