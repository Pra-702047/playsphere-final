# Protected Routes

PlaySphere implements Route Guards using React Higher-Order Components or layout wrappers to restrict access to sensitive pages.

## Implementation Mechanism
The `AuthContext` provides the current user's state and role. If a user navigates to a protected route (e.g., `/owner/dashboard`) without the `owner` role, the client-side router immediately intercepts the request and redirects them to the login page or a "Forbidden" page.

## Route Mappings
- `/owner/*` -> Requires Authentication + `role == 'owner'`
- `/admin/*` -> Requires Authentication + `role == 'admin'`
- `/profile` -> Requires Authentication (Any role)