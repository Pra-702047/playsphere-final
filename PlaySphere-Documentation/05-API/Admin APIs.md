# Admin APIs

Currently, administrative dashboards read global collections using the Firebase Client SDK under elevated Firebase Security Rules (where `role == 'admin'`).

Global statistics (e.g., total users, total revenue) are calculated using client-side aggregations, though future roadmap items suggest moving these to dedicated Next.js Server Components or Cloud Functions to reduce document read costs.