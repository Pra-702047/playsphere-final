# Restore Process

## Restoring from GCS Export
1. Authenticate with the `gcloud` CLI using an account with `Owner` privileges on the GCP project.
2. Execute the Firestore import command pointing to the specific backup timestamp bucket.

```bash
gcloud firestore import gs://playsphere-backups/2024-12-01T00:00:00Z
```

*Warning: Importing over existing documents will overwrite them. It is recommended to restore to a staging database first to verify data integrity.*