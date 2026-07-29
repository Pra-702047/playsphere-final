# Image Optimization

PlaySphere strictly utilizes the Next.js `<Image />` component for all graphical assets.

## Implementation Details
- **WebP/AVIF Conversion:** Images uploaded to Firebase Storage or served locally are automatically converted to modern, highly compressed formats by the Next.js image optimization API.
- **Lazy Loading:** Images below the fold are natively lazy-loaded by default.
- **Responsive Sizing:** `sizes` props are utilized to ensure the browser only downloads the resolution necessary for the current viewport (e.g., downloading a 300px image for mobile instead of the 1200px original).