# User APIs

User profiles are managed entirely via Firebase Client SDKs pointing to the `users` Firestore collection.

## Client SDK Operations

### Fetch User Profile
```javascript
const docRef = doc(db, 'users', uid);
const docSnap = await getDoc(docRef);
```

### Update User Profile
```javascript
const docRef = doc(db, 'users', uid);
await updateDoc(docRef, { name: 'New Name', phone: '1234567890' });
```
*Note: Firestore rules strictly prohibit a user from updating their `role` field.*