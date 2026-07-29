# Settlements Collection

> **Note:** Based on the current codebase analysis, this feature is not yet implemented. It is documented here as a recommendation for the future roadmap.

**Collection Path:** `/settlements/{settlementId}`

Intended to track financial payouts from the platform to the turf owners.

## Recommended Structure
```json
{
  "ownerId": "string",
  "amount": "number",
  "periodStart": "timestamp",
  "periodEnd": "timestamp",
  "status": "string (pending | processing | completed)",
  "transactionRef": "string",
  "createdAt": "timestamp"
}
```