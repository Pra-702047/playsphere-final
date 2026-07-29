# Users Collection

**Collection Path:** `/users/{uid}`

Stores user profiles, roles, and contact information. The `uid` matches the Firebase Authentication UUID.

## Document Structure
```json
{
  "uid": "string",
  "email": "string",
  "name": "string",
  "role": "string (player | owner | admin)",
  "phone": "string (optional)",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## Security Rules
- **Read:** A user can only read their own document. Super Admins can read all.
- **Write:** Users can update their own non-privileged fields (name, phone). Only Super Admins can change the `role` field.