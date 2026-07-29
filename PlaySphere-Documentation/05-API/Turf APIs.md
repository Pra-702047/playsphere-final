# Turf APIs

Turf data is accessed via the Firebase Client SDK against the `turfs` collection.

## Client SDK Operations

### Fetch All Turfs (Players)
```javascript
const q = query(collection(db, 'turfs'), where('isActive', '==', true));
const snapshot = await getDocs(q);
```

### Fetch Owner Turfs (Owners)
```javascript
const q = query(collection(db, 'turfs'), where('ownerId', '==', currentUser.uid));
const snapshot = await getDocs(q);
```