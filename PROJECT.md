# FinderZ - Housing Search App

## Overview

FinderZ is a mobile-first housing search application built with Expo SDK 55, React Native, and a modern TypeScript stack. It connects tenants with landlords for property rentals, featuring role-based access (Tenant, Landlord, Super Admin), property listings, enquiries, messaging, and favourites.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Expo SDK 55 + React Native 0.83 |
| **Routing** | Expo Router v55 (file-based) |
| **Language** | TypeScript 5.9 (strict) |
| **Styling** | NativeWind v5 (Tailwind CSS 4.3) |
| **Database** | PostgreSQL (Neon serverless) |
| **ORM** | Drizzle ORM 0.45 |
| **Auth** | Better Auth 1.6 + Expo adapter |
| **State** | Zustand 5 |
| **Data Fetching** | TanStack Query v5 |
| **Forms** | React Hook Form + Zod 4 |
| **HTTP Client** | Axios |
| **UI Components** | Custom component library + lucide-react-native |
| **Fonts** | Manrope (Google Fonts) |

## Project Structure

```
finderz/
├── src/
│   ├── app/                    # Expo Router file-based routes
│   │   ├── _layout.tsx         # Root layout (providers, fonts, splash)
│   │   ├── index.tsx           # Entry point
│   │   ├── role-selection.tsx  # Role selection screen
│   │   ├── (auth)/             # Auth group (sign-in, sign-up, forgot-password)
│   │   ├── (tenant)/           # Tenant group (dashboard, search, filters, property, enquiry, gallery)
│   │   ├── (landlord)/         # Landlord group (dashboard)
│   │   ├── (super-admin)/      # Super admin group
│   │   ├── (public)/           # Public routes
│   │   └── api/                # API routes (auth, health, landlord, onboarding, super-admin, tenant, users)
│   ├── components/
│   │   ├── ui/                 # Design system components (Button, Input, Text, etc.)
│   │   ├── shared/             # Shared cross-role components
│   │   ├── general/            # General-purpose components
│   │   └── tenant/             # Tenant-specific components
│   ├── db/
│   │   ├── index.ts            # Drizzle + Neon client setup
│   │   ├── relations.ts        # All Drizzle relation definitions
│   │   ├── schema/             # Database schema files (auth, properties, amenities, enquiries, messages, etc.)
│   │   ├── seed.ts             # Database seeding script
│   │   └── seed-data.ts        # Seed data
│   ├── features/
│   │   ├── auth/               # Auth feature module
│   │   ├── tenant/             # Tenant feature module
│   │   ├── landlord/           # Landlord feature module
│   │   ├── super-admin/        # Super admin feature module
│   │   └── onboarding/         # Onboarding feature module
│   ├── lib/
│   │   ├── auth.ts             # Better Auth server config
│   │   ├── auth-client.ts      # Better Auth client config
│   │   ├── auth-guards.server.ts # Server-side auth guards
│   │   ├── env.ts              # Client env vars
│   │   ├── env.server.ts       # Server env vars
│   │   ├── api-response.ts     # API response utilities
│   │   ├── query-client.ts     # TanStack Query client
│   │   ├── get-error-message.ts # Error message helper
│   │   └── tenant/             # Tenant-specific lib utilities
│   ├── providers/
│   │   ├── app-providers.tsx    # Root providers (SafeArea + Query)
│   │   └── query-provider.tsx   # TanStack Query provider
│   ├── services/
│   │   ├── api/                # API service functions
│   │   │   ├── axios.ts        # Axios instance config
│   │   │   ├── auth-flows.ts   # Auth API flows
│   │   │   ├── tenant.ts       # Tenant API calls
│   │   │   ├── tenant-app.ts   # Tenant app API
│   │   │   ├── landlord.ts     # Landlord API calls
│   │   │   ├── super-admin.ts  # Super admin API calls
│   │   │   ├── onboarding.ts   # Onboarding API calls
│   │   │   └── users.ts        # User API calls
│   │   ├── mutations/          # TanStack Query mutations
│   │   └── queries/            # TanStack Query queries
│   ├── store/
│   │   ├── onboarding-store.ts # Onboarding state (Zustand)
│   │   ├── preferences-store.ts # User preferences state
│   │   └── tenant-filter-store.ts # Tenant search filters state
│   ├── types/
│   │   ├── api.ts              # API type definitions
│   │   ├── auth.ts             # Auth type definitions
│   │   └── tenant.ts           # Tenant type definitions
│   ├── utils/
│   └── scripts/                # Utility scripts
├── drizzle/                    # Drizzle migrations
├── assets/                     # Images, icons, splash screens
├── drizzle.config.ts           # Drizzle Kit config
├── tailwind.config.js          # Tailwind/NativeWind config
├── babel.config.js             # Babel config
├── metro.config.js             # Metro bundler config
├── postcss.config.mjs          # PostCSS config
└── app.json                    # Expo config
```

## Database Schema

### Tables

- **user** — Core user record (id, name, email, phone, role, onboardingCompleted, accountStatus, emailVerified, image, createdAt, updatedAt)
- **session** — Auth sessions (expiresAt, token, ipAddress, userAgent, userId)
- **account** — Auth accounts (accountId, providerId, userId)
- **verification** — Email verification tokens
- **landlordProfiles** — Landlord profile (userId, businessName, phone, createdAt, updatedAt)
- **properties** — Property listings (landlordId, title, description, price, bedrooms, bathrooms, address, city, state, zipCode, latitude, longitude, propertyType, status, createdAt, updatedAt)
- **propertyImages** — Property images (propertyId, url, isPrimary, createdAt)
- **amenities** — Amenity definitions (name, icon, category, createdAt)
- **propertyAmenities** — Many-to-many property-amenity join
- **favourites** — User favourites (userId, propertyId, createdAt)
- **enquiries** — Tenant-landlord enquiries (propertyId, tenantId, landlordId, message, status, createdAt, updatedAt)
- **messages** — Enquiry messages (enquiryId, senderId, content, read, createdAt)
- **propertyReports** — Property reports (propertyId, reporterId, reason, description, status, reviewedBy, reviewedAt, createdAt)
- **notifications** — User notifications (userId, type, title, message, read, link, createdAt)
- **adminAuditLogs** — Admin audit trail (administratorId, action, targetType, targetId, details, ipAddress, createdAt)

### Key Relations

- User → Sessions, Accounts, LandlordProfile, Favourites, Enquiries (as tenant & landlord), Messages, Reports, Notifications, AuditLogs
- LandlordProfile → User, Properties
- Property → LandlordProfile, Images, Amenities, Favourites, Enquiries, Reports
- Enquiry → Property, Tenant (User), Landlord (User), Messages
- Message → Enquiry, Sender (User)

## Authentication

- **Better Auth** with email/password enabled
- **Expo plugin** for native token storage via SecureStore
- **Session config**: 7-day expiry, 24-day update age, 5-min fresh age
- **User fields**: phone, role (TENANT | LANDLORD | SUPER_ADMIN), onboardingCompleted, accountStatus (ACTIVE | SUSPENDED | PENDING)
- **Trusted origins**: production URL + finderz:// scheme + dev exp:// schemes

## Routing & Navigation

- **File-based routing** via Expo Router v55
- **Route groups**:
  - `(auth)` — Sign in, sign up, forgot password
  - `(tenant)` — Tenant dashboard, search results, filters, property details, enquiry, gallery
  - `(landlord)` — Landlord dashboard
  - `(super-admin)` — Super admin panel
  - `(public)` — Public pages
  - `api/` — Server API routes
- **Typed routes** enabled via `experiments.typedRoutes`

## State Management

- **Zustand** stores for:
  - `onboarding-store` — Onboarding flow state
  - `preferences-store` — User preferences
  - `tenant-filter-store` — Tenant search filter state
- **TanStack Query** for server state (queries + mutations)

## Styling

- **NativeWind v5** with Tailwind CSS 4.3
- **PostCSS** pipeline via `@tailwindcss/postcss`
- **Design system** in `src/components/ui/design-system.ts`
- **Custom components**: AppButton, AppInput, AppText, Checkbox, FormError, PasswordInput, ProgressDots, etc.

## Key Scripts

```bash
pnpm start          # Start Expo dev server
pnpm android        # Start on Android
pnpm ios            # Start on iOS
pnpm web            # Start on web
pnpm typecheck      # TypeScript type check
pnpm lint           # ESLint
pnpm db:generate    # Generate Drizzle migrations
pnpm db:migrate     # Run migrations
pnpm db:push        # Push schema to DB
pnpm db:studio      # Open Drizzle Studio
pnpm db:seed        # Seed database
pnpm db:check       # Check DB connection
```

## Environment Variables

Required (via `.env`):
- `DATABASE_URL` — Neon PostgreSQL connection string
- `BETTER_AUTH_URL` — Better Auth base URL
- `BETTER_AUTH_SECRET` — Better Auth secret key

## Expo Config Highlights

- **Bundle ID**: `com.finderz.mobile`
- **Orientation**: Portrait
- **Theme**: Automatic (light/dark)
- **React Compiler**: Enabled
- **Typed Routes**: Enabled
- **Splash Screen**: #208AEF background
- **EAS Project**: `2406ab5d-c865-4e6d-b8c8-1519403e5e73`
