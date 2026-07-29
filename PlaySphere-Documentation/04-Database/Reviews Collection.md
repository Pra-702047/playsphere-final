# Reviews Collection

> **Note:** Based on the current codebase analysis, this feature is not yet implemented. It is documented here as a recommendation for the future roadmap.

**Collection Path:** `/reviews/{reviewId}`

Intended to store player feedback and ratings for turfs.

## Recommended Structure
```json
{
  "turfId": "string",
  "playerId": "string",
  "playerName": "string",
  "rating": "number (1-5)",
  "comment": "string",
  "createdAt": "timestamp"
}
```