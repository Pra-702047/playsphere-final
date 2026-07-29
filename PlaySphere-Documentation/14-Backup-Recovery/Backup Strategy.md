# Backup Strategy

> **Note:** Documenting standard Google Cloud Backup procedures for Firestore.

## Automated Backups
Firestore data is highly durable. For disaster recovery, Google Cloud Platform (GCP) Point-in-Time Recovery (PITR) should be enabled on the database, allowing recovery to any microsecond within the past 7 days.

## Scheduled Exports
A Cloud Function (or GCP Cloud Scheduler job) should be configured to run daily, exporting the entire `turfs`, `users`, and `bookings` collections to a secure Google Cloud Storage (GCS) Coldline bucket for long-term retention.