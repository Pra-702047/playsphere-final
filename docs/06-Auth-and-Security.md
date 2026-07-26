# 7. Authentication & Security

## 7.1 Authentication Architecture
PlaySphere uses **Firebase Authentication** for Identity and Access Management (IAM). 

### Token Flow
1. User logs in on the client via `firebase/auth`.
2. Firebase issues a JWT (JSON Web Token).
3. The token is attached automatically to Firebase Firestore queries via the client SDK.
4. For Next.js API calls, security relies on Firebase Security Rules blocking direct unauthorized database manipulation, and server-side HMAC validation for payments.

---

## 7.2 Role-Based Access Control (RBAC)
User roles are stored in the `users` Firestore collection. 

| Role | Permissions |
|------|-------------|
| **User** | Read turfs, Create online bookings, Cancel own bookings, Read own profile. |
| **Owner** | Read/Update own turfs, Create offline bookings for own turfs, Read settlements for own turfs. |
| **Admin** | Unrestricted Read/Write access across the platform. Access to fraud dashboard and global config. |

---

## 7.3 Security Rules (`firestore.rules`)
All database access is heavily gated. 
- **Deterministic ID Locking**: The `bookings` collection uses IDs like `turfId_date_slot`. Firebase inherently rejects `create` operations if a document with the exact ID already exists. This completely prevents race conditions and double bookings.
- **Server-Only Mutations**: Collections like `settlements`, `webhook_events`, and `audit_logs` are locked to `allow write: if false;`. Only the Next.js API via `firebase-admin` (which bypasses rules) can write to them.

---

## 7.4 Attack Vectors Mitigated

### 1. Price Manipulation
**Mitigation**: Client sends `turfId` and `slot`. The server (`/api/payment/order`) fetches the price directly from the database and creates the Razorpay order. The client cannot modify the final payable amount.

### 2. Fake Payment Callbacks
**Mitigation**: `/api/payment/verify` requires `razorpay_signature`. The server uses crypto `sha256` HMAC validation against the `RAZORPAY_KEY_SECRET`.

### 3. Duplicate Webhook Processing
**Mitigation**: Razorpay may fire the same webhook twice. The system writes the `event_id` to the `webhook_events` collection. If the write fails (document exists), the webhook is gracefully ignored as a duplicate.

### 4. Cross-Site Scripting (XSS)
**Mitigation**: Handled natively by React/Next.js output encoding. All data from Firestore is sanitized before rendering.
