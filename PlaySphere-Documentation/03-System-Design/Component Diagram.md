# Component Diagram

This diagram outlines the logical component structure of the PlaySphere application.

```mermaid
componentDiagram
    package "Frontend (Next.js Client)" {
        [App Context Providers] 
        [UI Components (Shadcn)]
        [Page Routing]
        [PWA Service Worker]
    }

    package "Backend (Next.js Server)" {
        [API Route Controllers]
        [Firebase Admin Services]
        [Payment Verifier]
    }

    package "External Services" {
        [Firebase Auth API]
        [Firestore Database]
        [Razorpay Gateway]
    }

    [App Context Providers] --> [Page Routing]
    [Page Routing] --> [UI Components (Shadcn)]
    [UI Components (Shadcn)] --> [API Route Controllers]: HTTPS Requests
    [UI Components (Shadcn)] --> [Firebase Auth API]: Authentication
    [UI Components (Shadcn)] --> [Firestore Database]: Client Reads
    
    [API Route Controllers] --> [Firebase Admin Services]
    [API Route Controllers] --> [Payment Verifier]
    [Firebase Admin Services] --> [Firestore Database]: Admin Writes
    [Payment Verifier] --> [Razorpay Gateway]: Signature Validation
```