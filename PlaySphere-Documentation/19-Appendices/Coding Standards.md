# Coding Standards

## TypeScript
- `any` types are heavily discouraged. Strict interfaces must be defined in the `types/` directory for all Firestore data models.
- Functional components with React Hooks are the standard; Class components are prohibited.

## Styling
- All styling must use Tailwind CSS utility classes.
- Complex conditional class merging must use the `cn()` utility function (combining `clsx` and `tailwind-merge`) located in `lib/utils.ts`.

## Data Fetching
- Public data (Homepage, Search) must be fetched Server-Side inside `page.tsx` components.
- Private data (Dashboards) should be fetched Client-Side utilizing `useEffect` or SWR/React Query for persistent sessions.