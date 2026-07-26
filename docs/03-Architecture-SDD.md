# 4. Software Design Document (SDD)

## 4.1 System Architecture

PlaySphere uses a decoupled, serverless architecture leveraging modern Edge and Serverless computing.

### 4.1.1 High-Level Architecture Diagram
```mermaid
graph TD
    subgraph Frontend
        A[Next.js App Router] --> B[React Server Components]
        A --> C[Client Components]
        C --> D[PWA Service Worker]
    end

    subgraph Backend
        E[Next.js API Routes]
        F[Razorpay Webhooks]
    end

    subgraph External Services
        G[Firebase Auth]
        H[Firebase Firestore]
        I[Razorpay Gateway]
    end

    A <--> G
    A <--> H
    B <--> H
    C <--> E
    E <--> I
    E <--> H
    F <--> E
```

---

## 4.2 Component Diagram

```mermaid
graph LR
    UI[User Interface] --> AuthContext[Auth Provider]
    UI --> ToastContext[Notification Provider]
    
    AuthContext --> AuthSvc[Auth Service]
    UI --> BookingSvc[Booking Service]
    UI --> TurfSvc[Turf Service]
    
    BookingSvc --> Firestore[(Database)]
    TurfSvc --> Firestore
```

---

## 4.3 Sequence Diagram: Booking Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API Route
    participant R as Razorpay
    participant DB as Firestore

    U->>F: Select Slot & Click Book
    F->>DB: Check Availability
    DB-->>F: Slot Available
    F->>A: POST /api/payment/order
    A->>R: Create Order
    R-->>A: order_id
    A-->>F: return order_id
    F->>U: Show Razorpay Checkout
    U->>R: Enter Payment Details
    R-->>F: Payment Success (handler)
    F->>A: POST /api/payment/verify
    A->>A: Verify HMAC Signature
    A->>DB: Create Booking Transaction
    A->>DB: Create Settlement Record
    A-->>F: Success Status
    F->>U: Show Confirmation Ticket
```

---

## 4.4 Design Patterns Used
1. **Service Repository Pattern**: All Firestore interactions are abstracted into `services/` (e.g., `turf.service.ts`, `booking.service.ts`). The UI never executes raw Firebase queries directly.
2. **Context API Pattern**: Global state for Authentication and Notifications is handled via React Context (`AuthContext.tsx`).
3. **Serverless Pattern**: Backend logic is broken down into stateless API routes (`app/api/*`).
4. **Idempotency Pattern**: Razorpay webhooks use a `webhook_events` collection to ensure a webhook processed twice due to network retries does not credit an account twice.

---

## 4.5 System Modules

### 4.5.1 Frontend (Presentation Layer)
Contains Next.js App Router pages. Separated into `(auth)`, `user`, `owner`, and `admin` route groups for layout isolation.

### 4.5.2 Service Layer
Acts as the intermediary between the Frontend and the Database Layer. Enforces data typing using TypeScript interfaces before sending payloads to Firestore.

### 4.5.3 Authentication Layer
Managed entirely by Firebase Auth. Tokens are verified on the client using `onAuthStateChanged`. For API routes, server-side validation is performed before executing sensitive mutations.
