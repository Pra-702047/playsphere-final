# Performance Optimization

PlaySphere is optimized for high-speed delivery and sub-second interactions.

## Core Optimizations
1. **Server-Side Rendering (SSR):** Next.js App Router renders pages dynamically on Vercel's Edge, eliminating client-side data fetching waterfalls for public pages (e.g., the Homepage).
2. **React Server Components (RSC):** Heavy libraries are kept on the server, significantly reducing the JavaScript payload sent to the client browser.
3. **Optimistic Updates:** UI state is mutated locally before server confirmation (e.g., during booking slot selection) to ensure the interface feels immediate.