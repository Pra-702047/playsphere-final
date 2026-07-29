# Offline Support

## App Shell Caching
The PWA caches the application shell (the UI layout, fonts, and core JavaScript) locally. If a user opens PlaySphere without an internet connection, the UI will load immediately rather than displaying the browser's default "No Internet" dinosaur page.

## Data Resilience
Firebase Firestore provides robust offline persistence out-of-the-box. 
- If a user loses connection while navigating the app, Firestore serves previously fetched data (like their profile or recent bookings) from its local IndexedDB cache.
- *Note: Creating new bookings requires an active network connection to process the Razorpay transaction.*