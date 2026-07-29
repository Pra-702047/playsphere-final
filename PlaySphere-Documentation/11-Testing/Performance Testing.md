# Performance Testing

## Lighthouse Audits
PlaySphere's frontend should be routinely audited using Google Lighthouse (available in Chrome DevTools) to monitor:
- **First Contentful Paint (FCP)**
- **Largest Contentful Paint (LCP)**
- **Cumulative Layout Shift (CLS)**
- **Time to Interactive (TTI)**

## Current Status
Recent architectural optimizations shifted heavy database queries from Client-Side rendering to Next.js Server Components, significantly improving TTI and LCP scores for the Homepage and Search views.