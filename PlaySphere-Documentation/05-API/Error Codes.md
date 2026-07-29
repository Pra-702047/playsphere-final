# Error Codes

PlaySphere APIs use standard HTTP status codes combined with JSON error messages.

## HTTP Status Codes
- **200 OK:** Request succeeded.
- **400 Bad Request:** Missing or malformed parameters (e.g., missing `turfId`).
- **401 Unauthorized:** Missing or invalid authentication.
- **403 Forbidden:** Authenticated user lacks privileges (e.g., non-owner attempting refund).
- **409 Conflict:** Resource state conflict (e.g., Slot already booked).
- **500 Internal Server Error:** Unexpected backend exception.

## Standard Error Response Format
```json
{
  "success": false,
  "message": "Human-readable error description"
}
```