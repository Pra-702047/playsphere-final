# Role-Based Access Control (RBAC)

PlaySphere enforces authorization via three core roles defined in the Firestore `users` collection.

## Roles
1. **Player (Default):** 
   - Can browse active turfs.
   - Can create online bookings.
   - Can view only their own bookings.
2. **Owner:**
   - Can create, edit, and manage their own turfs.
   - Can view bookings associated with their `ownerId`.
   - Can create offline bookings for their turfs.
3. **Admin (Super Admin):**
   - Can view all users, turfs, and bookings platform-wide.
   - Can suspend/approve turfs and resolve disputes.

## Enforcement
- **Client Side:** React Route Guards prevent UI access to unauthorized pages.
- **Database Side:** Firestore Security Rules actively block read/write operations if the user's role does not match the required privileges.