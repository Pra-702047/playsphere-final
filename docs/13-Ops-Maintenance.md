# 14. Operations, Maintenance & Performance

## 14.1 Backup & Recovery
- **Firestore Backups**: Scheduled daily exports via Google Cloud Storage using standard Firebase Admin cron jobs.
- **Data Retention**: Cancelled bookings are retained for 7 years for financial compliance.
- **Disaster Recovery**: In the event of a region failure, Google Cloud automatically replicates Firestore data multi-regionally.

## 14.2 Performance Optimization Strategies

### Frontend
- **Image Optimization**: All user-uploaded images and static assets utilize `next/image` for automatic WebP conversion and responsive sizing.
- **Lazy Loading**: Heavy components (like the Owner Dashboard charts) use Next.js dynamic imports (`next/dynamic`).
- **Font Optimization**: Google Fonts (Inter) are self-hosted via `next/font` to eliminate layout shift (CLS).

### Backend & Database
- **Firestore Query Optimization**: 
  - Implementation of composite indexes prevents full collection scans. 
  - E.g., The query `where("turfId", "==", id).where("date", "==", date)` requires a specific index defined in `firestore.indexes.json`.
- **Edge Caching**: Static pages (like the Homepage and About Us) are cached globally on Vercel's Edge Network using ISR (Incremental Static Regeneration).
