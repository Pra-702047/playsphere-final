# Folder Structure

PlaySphere adheres to the Next.js App Router conventions with a clear separation of concerns.

```text
playsphere/
├── app/                      # Next.js App Router (Pages, Layouts, API Routes)
│   ├── (auth)/               # Authentication routes (login, register)
│   ├── api/                  # Server-side API endpoints (payment, offline booking)
│   ├── owner/                # Turf Owner dashboard routes
│   ├── player/               # Player dashboard routes
│   ├── turfs/                # Public turf listing and details routes
│   ├── layout.tsx            # Root layout containing global providers
│   └── page.tsx              # Application homepage
├── components/               # Reusable UI Components
│   ├── auth/                 # Login/Signup forms
│   ├── booking/              # Booking forms, slot pickers
│   ├── dashboard/            # Admin/Owner dashboard widgets
│   ├── landing/              # Homepage sections (Hero, Features)
│   ├── turfs/                # Turf cards, lists, detail views
│   └── ui/                   # Shadcn UI primitives (buttons, dialogs)
├── context/                  # React Context Providers (AuthContext)
├── firebase/                 # Firebase Client SDK initialization
├── hooks/                    # Custom React Hooks (useDebounce, etc.)
├── lib/                      # Utility libraries (Firebase Admin initialization, utils)
├── public/                   # Static assets (images, icons, manifest.json)
├── services/                 # Business logic and database access layer
│   ├── auth.service.ts
│   ├── booking.service.ts
│   └── turf.service.ts
├── types/                    # TypeScript interfaces and type definitions
├── .env.example              # Environment variable template
├── next.config.mjs           # Next.js configuration (PWA, domains)
├── package.json              # Project dependencies and scripts
├── tailwind.config.ts        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```