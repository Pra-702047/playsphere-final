# Turfs Collection

**Collection Path:** `/turfs/{turfId}`

Stores the venue details, pricing, and operating configuration.

## Document Structure
```json
{
  "ownerId": "string (FK: users.uid)",
  "name": "string",
  "city": "string",
  "address": "string",
  "price": "number",
  "sports": ["string (e.g. Football, Cricket)"],
  "amenities": ["string"],
  "images": ["string (URLs)"],
  "operatingHours": {
    "open": "string (HH:MM)",
    "close": "string (HH:MM)"
  },
  "isActive": "boolean",
  "createdAt": "timestamp"
}
```

## Security Rules
- **Read:** Publicly readable if `isActive == true`. Owners can read their own regardless of status.
- **Write:** Only the authenticated user matching `ownerId` can update the document.