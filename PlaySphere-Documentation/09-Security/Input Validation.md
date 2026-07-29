# Input Validation

PlaySphere validates input at both the client and server levels to prevent malformed data injection.

## Client-Side Validation
- Handled via controlled React components and HTML5 form constraints.
- Prevents basic UI errors and reduces unnecessary API calls.

## Server-Side Validation
- All custom `/api/*` routes strictly parse and validate incoming JSON payloads.
- If a required field (e.g., `turfId`, `date`, `slot`) is missing or malformed, the API immediately returns a `400 Bad Request`.

> **Roadmap Recommendation:** Implement Zod or Yup schema validation in Next.js API routes for stricter type casting and automated error messaging.