# Service Workers

PlaySphere utilizes an auto-generated Service Worker (via `next-pwa`) named `sw.js`. 

## Responsibilities
- **Interception:** The Service Worker acts as a network proxy, intercepting outgoing requests from the browser.
- **Caching:** It serves static assets (HTML, CSS, JS, Images) from the local cache to drastically reduce load times on subsequent visits.
- **Update Management:** The `PWARegister` component listens for Service Worker updates. When a new version of PlaySphere is deployed, the UI prompts the user with a "New version available! Update Now" banner, which forces the Service Worker to skip waiting and reload the application.