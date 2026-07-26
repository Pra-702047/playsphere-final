# 5. Database Documentation

PlaySphere uses Firebase Firestore (NoSQL Document Database). The database is structured to minimize deep nesting and maximize shallow query performance using composite indexes.

## 5.1 Collection: `users`
**Purpose**: Stores authentication data, profile information, and RBAC roles.
**Indexes**: `role` (Ascending)

| Field | Type | Description |
|-------|------|-------------|
| `uid` | String (Document ID) | Firebase Auth UID |
| `name` | String | User's full name |
| `email` | String | Email address |
| `mobile` | String | E.164 formatted mobile number |
| `role` | String | `"user"`, `"owner"`, or `"admin"` |
| `createdAt` | Timestamp | Account creation date |

---

## 5.2 Collection: `turfs`
**Purpose**: Stores physical venue profiles, facilities, and dynamic pricing configurations.
**Indexes**: `ownerId` (Asc), `status` (Asc)

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (Document ID) | Unique Turf ID |
| `ownerId` | String | Reference to `users.uid` |
| `name` | String | Display name of the turf |
| `location` | String | City or region |
| `sports` | Array<String> | Supported sports (e.g., `["Football", "Cricket"]`) |
| `pricing` | Map | Contains `weekday`, `weekend`, `prime` hourly rates |
| `status` | String | `"active"`, `"inactive"`, `"pending"` |

---

## 5.3 Collection: `bookings`
**Purpose**: The central ledger for all online and offline bookings. Uses deterministic IDs to prevent double booking.
**Document ID Format**: `{turfId}_{YYYY-MM-DD}_{HH:00}`
**Indexes**: 
- `ownerId` (Asc) + `createdAt` (Desc)
- `userId` (Asc) + `date` (Asc)

| Field | Type | Description |
|-------|------|-------------|
| `turfId` | String | Reference to `turfs.id` |
| `userId` | String | Reference to `users.uid` |
| `ownerId` | String | Reference to turf owner UID |
| `date` | String | YYYY-MM-DD format |
| `slot` | String | E.g., `"10:00 - 11:00"` |
| `price` | Number | Final calculated price paid |
| `status` | String | `"pending"`, `"confirmed"`, `"cancelled"`, `"completed"` |
| `type` | String | `"online"` or `"offline"` |
| `paymentId` | String | Razorpay Payment ID |
| `orderId` | String | Razorpay Order ID |

---

## 5.4 Collection: `settlements`
**Purpose**: Financial ledger tracking money owed to turf owners.

| Field | Type | Description |
|-------|------|-------------|
| `bookingId` | String | Reference to `bookings.id` |
| `ownerId` | String | Reference to `users.uid` |
| `grossAmount` | Number | Total booking amount |
| `platformFee` | Number | Commission deducted by PlaySphere |
| `taxAmount` | Number | GST applied on the platform fee |
| `netPayout` | Number | Amount payable to the owner |
| `status` | String | `"pending"`, `"processed"`, `"refunded"` |

---

## 5.5 Collection: `webhook_events`
**Purpose**: Ensures Razorpay webhooks are idempotent (never processed twice).
**Document ID Format**: `razorpay_event_id`

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Razorpay Event ID |
| `processedAt` | Timestamp | Server timestamp when completed |
| `event` | String | E.g., `"payment.captured"` |

---

## 5.6 Firebase Security Rules
All database access is heavily restricted. Refer to `firestore.rules`.
- `users`: Can read/write their own document. Admins can read/write all.
- `turfs`: Public read. Only owners/admins can write.
- `bookings`: Users can only read/write their own bookings. Owners can read bookings for their turfs.
- `settlements`: Strict server-only writes. Owners can only read.
