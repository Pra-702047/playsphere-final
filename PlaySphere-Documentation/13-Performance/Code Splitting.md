# Code Splitting

Code splitting is achieved natively via Webpack/Turbopack under the Next.js build step.

## Third-Party Libraries
Heavy third-party libraries (e.g., `xlsx`, `framer-motion`) are isolated. If they are only used on specific routes (like the Admin Dashboard for exporting Excel files), they are NOT included in the global `_app` or `layout` bundles, ensuring the public-facing booking flow remains lightweight.