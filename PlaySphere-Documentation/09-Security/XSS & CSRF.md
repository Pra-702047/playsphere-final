# XSS & CSRF

## Cross-Site Scripting (XSS)
- **React Safeguards:** React inherently protects against XSS by automatically escaping string variables in JSX before rendering them to the DOM.
- **Dangerous HTML:** The `dangerouslySetInnerHTML` attribute is strictly avoided across the codebase.

## Cross-Site Request Forgery (CSRF)
- **Stateless APIs:** PlaySphere uses stateless JWTs (via Firebase Auth) instead of cookie-based sessions for custom API routes, inherently mitigating standard CSRF attack vectors.
- **Next.js Protections:** Next.js Server Actions and API routes deployed on Vercel incorporate built-in origin checking.