# API Testing

> **Note:** Recommended implementation for future roadmap.

## Strategy
API testing ensures the Next.js serverless functions return expected status codes and payloads.

## Key Test Cases
1. **POST `/api/booking/offline`**: Provide an already booked slot -> Expect `409 Conflict`.
2. **POST `/api/payment/verify`**: Provide an invalid signature -> Expect `500` or `400` error and ensure booking is NOT written to DB.