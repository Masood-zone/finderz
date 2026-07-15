# FinderZ — System Presentation

A comprehensive guide for presenting the FinderZ Housing Search App to group members.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [System Architecture](#3-system-architecture)
4. [Database Schema & ORM](#4-database-schema--orm)
5. [User Roles & Activities](#5-user-roles--activities)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [System Flows](#7-system-flows)
8. [API Architecture](#8-api-architecture)
9. [File Uploads (Cloudinary)](#9-file-uploads-cloudinary)
10. [Design System](#10-design-system)
11. [State Management](#11-state-management)
12. [Deployment](#12-deployment)

---

## 1. Project Overview

**FinderZ** is a mobile-first housing search application that connects tenants with landlords for property rentals in Ghana. Built with Expo SDK 55 and React Native, it provides a cross-platform experience (Android, iOS, Web) with role-based access for tenants, landlords, and a super admin who oversees the platform.

**Core Problem Solved:**
Finding rental housing in Ghana is fragmented — tenants rely on word-of-mouth, social media posts, and physical visits with no centralized, verified platform. FinderZ digitizes the entire housing search lifecycle — from property discovery and favourites to landlord verification and enquiry-based communication.

**Key Capabilities:**
- Multi-role platform: Tenant, Landlord, Super Admin
- Property listings with images, amenities, and location data (Ghana regions/cities)
- Tenant feed with recommended, affordable, and recently added properties
- Search and filter by property type, location, price range, bedrooms, furnishing
- Favourites system for saving properties
- Enquiry-based messaging between tenants and landlords
- Landlord identity verification with admin review
- Property approval workflow (DRAFT → PENDING → APPROVED/REJECTED)
- Property reporting and moderation
- User account suspension and audit logging

---

## 2. Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Expo SDK | 55 | Cross-platform mobile framework (Android, iOS, Web) |
| **UI Library** | React Native | 0.83.6 | Native mobile UI rendering |
| **Routing** | Expo Router | 55 | File-based routing for Expo apps |
| **Language** | TypeScript | 5.9 | Type-safe development (strict mode) |
| **Styling** | NativeWind | 5.0 (preview.4) | Tailwind CSS for React Native |
| **CSS Framework** | Tailwind CSS | 4.3 | Utility-first CSS via PostCSS pipeline |
| **Database** | PostgreSQL (Neon) | — | Serverless PostgreSQL |
| **ORM** | Drizzle ORM | 0.45 | Database access, schema management, migrations |
| **Auth** | Better Auth | 1.6.16 | Session-based auth with Expo adapter |
| **State Management** | Zustand | 5.0 | Client-side global state |
| **Data Fetching** | TanStack Query | 5.x | Server state caching and synchronization |
| **Forms** | React Hook Form + Zod | 7.78 / 4.4 | Form handling and validation |
| **HTTP Client** | Axios | 1.17 | API requests with interceptors |
| **Icons** | lucide-react-native | 1.17 | Icon library |
| **Fonts** | Manrope (Google Fonts) | 0.4.2 | Typography (400, 600, 700, 800 weights) |
| **Animations** | react-native-reanimated | 4.2.1 | Smooth animations and gestures |
| **Image Handling** | expo-image | 55.0 | Optimized image loading and caching |
| **File Uploads** | Cloudinary | — | Image upload, storage, and transformation |
| **Location** | expo-location | 55.1 | Device location for nearby property search |
| **Package Manager** | pnpm | — | Fast, disk-efficient dependency management |
| **Build & Deploy** | EAS (Expo Application Services) | — | Build, update, and deploy mobile apps |

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   CLIENT (Mobile/Web)                    │
│  ┌───────────┐  ┌────────────┐  ┌───────────────────┐  │
│  │  Tenant   │  │  Landlord  │  │   Super Admin     │  │
│  │  Portal   │  │  Portal    │  │   Console         │  │
│  └─────┬─────┘  └─────┬──────┘  └────────┬──────────┘  │
│        │               │                  │              │
│        └───────────────┼──────────────────┘              │
│                        │                                 │
│           TanStack Query + Zustand                       │
│                        │                                 │
└────────────────────────┼─────────────────────────────────┘
                         │ HTTP (JSON via Axios)
┌────────────────────────┼─────────────────────────────────┐
│                  API LAYER (Expo Router Server)           │
│  ┌──────────────────────────────────────────────────┐    │
│  │              API Routes (src/app/api/)            │    │
│  │                                                    │    │
│  │  ┌────────┐  ┌──────────┐  ┌─────────────────┐  │    │
│  │  │ Tenant │  │ Landlord │  │   Super Admin   │  │    │
│  │  │ API    │  │ API      │  │   API           │  │    │
│  │  └───┬────┘  └────┬─────┘  └───────┬─────────┘  │    │
│  │      │             │                │             │    │
│  │  ┌───┴─────────────┴────────────────┴─────────┐  │    │
│  │  │         Auth Guards (auth-guards.server.ts) │  │    │
│  │  └─────────────────────────────────────────────┘  │    │
│  └──────────────────────────────────────────────────┘    │
│                        │                                 │
│              ┌─────────┴─────────┐                       │
│              │   Lib Layer       │                       │
│              │  (Infrastructure) │                       │
│              └─────────┬─────────┘                       │
│                        │                                 │
│  ┌─────────────────────┼─────────────────────────────┐   │
│  │          Lib Layer (Infrastructure)                │   │
│  │  Auth │ Drizzle │ Cloudinary │ Response │ Env     │   │
│  └─────────────────────┼─────────────────────────────┘   │
│                        │                                 │
└────────────────────────┼─────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
   ┌──────┴──────┐ ┌────┴────┐ ┌───────┴──────┐
   │  PostgreSQL │ │Cloudinary│ │  Expo EAS   │
   │  (Neon)     │ │(Uploads) │ │  (Builds)   │
   └─────────────┘ └─────────┘ └──────────────┘
```

### 3.2 Architectural Pattern: Layered Architecture with Feature Modules

The system follows a clean **layered architecture** with feature-based organization:

| Layer | Directory | Responsibility |
|-------|-----------|----------------|
| **Route Layer** | `src/app/` | File-based routes, layouts, API endpoints |
| **Component Layer** | `src/components/` | UI screens, shared components, role-specific UI |
| **Feature Layer** | `src/features/` | Feature modules (auth, tenant, landlord, super-admin, onboarding) |
| **Service Layer** | `src/services/` | API request functions, TanStack Query hooks & mutations |
| **Store Layer** | `src/store/` | Zustand stores for client-side state |
| **Hook Layer** | `src/hooks/` | Custom React hooks (location, app updates) |
| **Lib Layer** | `src/lib/` | Cross-cutting infrastructure (auth, API response, env) |
| **Type Layer** | `src/types/` | TypeScript type definitions (API, auth, tenant, landlord, super-admin) |
| **DB Layer** | `src/db/` | Drizzle schema, relations, seed scripts |

### 3.3 Route-Based Role Separation

Each role has its own isolated route group with a dedicated layout that enforces access via the `RouteGuard` component:

```
src/app/
├── (auth)/                    # Public: Sign In, Sign Up, Forgot Password
│   ├── sign-in.tsx
│   ├── sign-up.tsx
│   └── forgot-password.tsx
├── (tenant)/                  # Protected: TENANT role only
│   ├── _layout.tsx            # RouteGuard with roles=["TENANT"]
│   └── tenant/
│       ├── index.tsx          # Tenant feed/home
│       ├── search/            # Property search & filters
│       ├── property/          # Property details
│       ├── favourites/        # Saved properties
│       ├── enquiries/         # Enquiry list & chat
│       └── profile/           # Tenant profile
├── (landlord)/                # Protected: LANDLORD role only
│   ├── _layout.tsx            # RouteGuard with roles=["LANDLORD"]
│   └── landlord/
│       ├── index.tsx          # Landlord dashboard
│       ├── verification-status/ # Verification status
│       ├── properties/        # Property management
│       ├── add-property/      # Add/edit property
│       └── enquiries/         # Enquiry management
├── (super-admin)/             # Protected: SUPER_ADMIN role only
│   ├── _layout.tsx            # RouteGuard with roles=["SUPER_ADMIN"]
│   └── super-admin/
│       ├── dashboard/         # Admin dashboard
│       ├── approvals/         # Property approval queue
│       ├── verifications/     # Landlord verification queue
│       ├── reports/           # Reported listings
│       ├── users/             # User management
│       └── notifications/     # Admin notifications
├── (public)/                  # Public routes
├── api/                       # Server API routes (role-gated)
├── index.tsx                  # App entry/splash
└── role-selection.tsx         # Role selection (TENANT/LANDLORD)
```

---

## 4. Database Schema & ORM

### 4.1 ORM: Drizzle ORM 0.45

- **Schema files:** `src/db/schema/*.ts` (modular per entity)
- **Relations file:** `src/db/relations.ts`
- **Database:** PostgreSQL (Neon serverless)
- **Driver:** `@neondatabase/serverless`
- **Migration output:** `drizzle/` directory
- **Features used:** Enums, relations, composite primary keys, strategic indexing, foreign key constraints with cascading deletes

### 4.2 Entity Relationship Diagram

```
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│      User        │       │  LandlordProfile  │       │    Property      │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK)          │──┐    │ id (PK)          │   ┌──│ id (PK)          │
│ name             │  │    │ userId (FK)      │───┘  │ landlordId (FK)  │
│ email (unique)   │  │    │ legalName        │      │ title            │
│ phone            │  │    │ landlordType     │      │ description      │
│ role (enum)      │  │    │ agencyName       │      │ propertyType     │
│ onboarding...    │  │    │ address          │      │ region/city/area │
│ accountStatus    │  │    │ verification...  │      │ rentAmount       │
│ emailVerified    │  │    │ identityDoc...   │      │ paymentPeriod    │
│ image            │  │    │ createdAt        │      │ bedrooms/baths   │
│ createdAt        │  │    │ updatedAt        │      │ furnishingStatus │
│ updatedAt        │  │    └──────────────────┘      │ approvalStatus   │
└──────────────────┘  │                              │ isAvailable      │
                      │    ┌──────────────────┐      │ createdAt        │
                      │    │   PropertyImage   │      └────────┬─────────┘
                      │    ├──────────────────┤               │
                      │    │ id (PK)          │               │
                      │    │ propertyId (FK)  │───────────────┘
                      │    │ imageUrl         │
                      │    │ publicId         │
                      │    │ position         │
                      │    │ isCover          │
                      │    └──────────────────┘
                      │
                      │    ┌──────────────────┐    ┌──────────────────┐
                      │    │    Amenity        │    │PropertyAmenity   │
                      │    ├──────────────────┤    ├──────────────────┤
                      │    │ id (PK)          │───>│ propertyId (FK)  │
                      │    │ name             │    │ amenityId (FK)   │
                      │    │ slug (unique)    │    └──────────────────┘
                      │    │ icon             │
                      │    └──────────────────┘
                      │
                      │    ┌──────────────────┐    ┌──────────────────┐
                      │    │    Favourite      │    │    Enquiry       │
                      │    ├──────────────────┤    ├──────────────────┤
                      │    │ id (PK)          │    │ id (PK)          │
                      │    │ userId (FK)      │    │ propertyId (FK)  │
                      │    │ propertyId (FK)  │    │ tenantId (FK)    │
                      │    │ createdAt        │    │ landlordId (FK)  │
                      │    └──────────────────┘    │ status (enum)    │
                      │                            │ preferredContact │
                      │    ┌──────────────────┐    │ preferredDate    │
                      │    │    Message        │    │ createdAt        │
                      │    ├──────────────────┤    └──────────────────┘
                      │    │ id (PK)          │
                      │    │ enquiryId (FK)   │
                      │    │ senderId (FK)    │
                      │    │ content          │
                      │    │ isRead           │
                      │    │ createdAt        │
                      │    └──────────────────┘
                      │
                      │    ┌──────────────────┐    ┌──────────────────┐
                      │    │ PropertyReport   │    │  Notification    │
                      │    ├──────────────────┤    ├──────────────────┤
                      │    │ id (PK)          │    │ id (PK)          │
                      │    │ propertyId (FK)  │    │ userId (FK)      │
                      │    │ reporterId (FK)  │    │ type             │
                      │    │ reason           │    │ title            │
                      │    │ description      │    │ message          │
                      │    │ status (enum)    │    │ data (JSONB)     │
                      │    │ reviewedBy (FK)  │    │ isRead           │
                      │    │ reviewedAt       │    │ createdAt        │
                      │    └──────────────────┘    └──────────────────┘
                      │
                      │    ┌──────────────────┐
                      │    │  AdminAuditLog   │
                      │    ├──────────────────┤
                      │    │ id (PK)          │
                      │    │ administratorId  │
                      │    │ action           │
                      │    │ entityType       │
                      │    │ entityId         │
                      │    │ metadata (JSONB) │
                      │    │ createdAt        │
                      │    └──────────────────┘
                      │
          ┌───────────┴──────────────────────────────────────┐
          │          Better Auth Tables                       │
          │  Session │ Account │ Verification                 │
          └──────────────────────────────────────────────────┘

          ┌──────────────────┐    ┌──────────────────┐
          │  GhanaRegion     │    │  GhanaCity       │
          ├──────────────────┤    ├──────────────────┤
          │ id (PK)          │───>│ id (PK)          │
          │ name             │    │ regionId (FK)    │
          │ slug (unique)    │    │ name             │
          │ capital          │    │ slug             │
          └──────────────────┘    └──────────────────┘
```

### 4.3 Key Enums

| Enum | Values | Used In |
|------|--------|---------|
| `user_role` | `TENANT`, `LANDLORD`, `SUPER_ADMIN` | User |
| `account_status` | `ACTIVE`, `SUSPENDED`, `PENDING` | User |
| `property_type` | `APARTMENT`, `HOUSE`, `ROOM`, `STUDIO`, `HOSTEL`, `COMMERCIAL` | Property |
| `payment_period` | `MONTHLY`, `QUARTERLY`, `BIANNUALLY`, `YEARLY` | Property |
| `furnishing_status` | `FURNISHED`, `SEMI_FURNISHED`, `UNFURNISHED` | Property |
| `approval_status` | `DRAFT`, `PENDING`, `APPROVED`, `REJECTED`, `RENTED` | Property |
| `landlord_type` | `INDIVIDUAL`, `AGENCY` | LandlordProfile |
| `verification_status` | `NOT_SUBMITTED`, `PENDING`, `APPROVED`, `REJECTED`, `CHANGES_REQUESTED` | LandlordProfile |
| `enquiry_status` | `OPEN`, `RESPONDED`, `CLOSED`, `CANCELLED` | Enquiry |
| `contact_method` | `PHONE`, `WHATSAPP`, `EMAIL`, `IN_APP` | Enquiry |
| `report_status` | `OPEN`, `REVIEWING`, `RESOLVED`, `DISMISSED` | PropertyReport |

### 4.4 Schema Conventions

- **UUID primary keys:** All tables use `text` type with `crypto.randomUUID()` for IDs
- **Foreign key cascading:** Most relationships use `onDelete: "cascade"` for automatic cleanup
- **Timestamped records:** All tables have `created_at` and `updated_at` with timezone support
- **Strategic indexing:** Every foreign key and frequently queried field has an explicit index via `@@index`
- **JSONB metadata:** Notifications and audit logs use JSONB for flexible structured data
- **Composite primary key:** `propertyAmenities` uses `[propertyId, amenityId]` as its primary key
- **Unique constraints:** `favourites` has a unique constraint on `[userId, propertyId]` to prevent duplicates
- **Seed data:** Amenities, Ghana regions/cities, and the super admin account are seeded via `db:seed`

---

## 5. User Roles & Activities

### 5.1 Role Hierarchy

```
┌──────────────────┐
│   SUPER_ADMIN     │  ← Platform operator. Manages everything.
├──────────────────┤
│    LANDLORD       │  ← Property owner/manager. Lists properties.
├──────────────────┤
│     TENANT        │  ← End user. Searches and enquires about properties.
└──────────────────┘
```

### 5.2 Role Capabilities

#### SUPER_ADMIN (Platform Operator)

| Area | Activities |
|------|-----------|
| **Dashboard** | View platform-wide analytics: total users, properties, enquiries, reports |
| **Approvals** | Review, approve, or reject property listings submitted by landlords |
| **Verifications** | Review landlord identity verification documents, approve/reject/request changes |
| **Reports** | Review reported property listings, take action (resolve/dismiss) |
| **Users** | View all users, suspend/activate user accounts |
| **Notifications** | View admin notifications, mark as read |

#### LANDLORD (Property Owner/Manager)

| Area | Activities |
|------|-----------|
| **Dashboard** | View property stats: total listings, active, pending, enquiries received |
| **Verification** | Submit identity documents for verification, view verification status |
| **Properties** | Create, edit, duplicate, delete, and mark properties as rented |
| **Property Listings** | Set title, description, type, location, rent, payment period, bedrooms, bathrooms, furnishing, amenities, images |
| **Enquiries** | View and respond to tenant enquiries with in-app messaging |
| **Profile** | Manage business name, contact preferences, address |

#### TENANT (End User)

| Area | Activities |
|------|-----------|
| **Feed** | Browse recommended, affordable, and recently added properties |
| **Search** | Search and filter properties by type, location, price, bedrooms, furnishing |
| **Property Details** | View property details, images, amenities, landlord info |
| **Favourites** | Save and unsave properties |
| **Enquiries** | Send enquiries to landlords, view conversation history, reply to messages |
| **Profile** | View and update personal profile |

---

## 6. Authentication & Authorization

### 6.1 Authentication: Better Auth with Expo Adapter

The system uses **Better Auth v1.6** with the Expo adapter for native-friendly session management.

**Server Configuration** (`src/lib/auth.ts`):
- Email + password authentication enabled
- Custom user fields: `phone`, `role`, `onboardingCompleted`, `accountStatus`
- Session config: 7-day expiry, 24-day update age, 5-minute fresh age
- Trusted origins: production URL, `finderz://` scheme, and dev `exp://` schemes
- Drizzle adapter for PostgreSQL
- Bearer token plugin for native auth

**Client Configuration** (`src/lib/auth-client.ts`):
- Expo client plugin for SecureStore token storage
- Custom `finderzBearerClient` plugin for Bearer token injection
- Automatic token persistence and refresh
- Cookie forwarding via `x-finderz-auth-cookie` header for server API routes

**Auth Flow:**
1. User selects role (Tenant/Landlord) on role-selection screen
2. User signs up or signs in via email + password
3. Better Auth creates a session and returns a bearer token
4. Token is stored in Expo SecureStore
5. Every subsequent API request includes the Bearer token
6. Server validates session and retrieves user from database

### 6.2 Authorization: Multi-Level Guards

Access control is enforced at **two levels**:

#### Level 1: Client-Side Route Guard

The `RouteGuard` component (`src/components/shared/route-guard.tsx`) protects route groups:

```tsx
// src/app/(tenant)/_layout.tsx
export default function TenantLayout() {
  return <RouteGuard roles={["TENANT"]} />;
}
```

The guard checks:
- Is the user signed in? (redirect to `/sign-in` if not)
- Is the account suspended? (redirect to `/account-status`)
- Has onboarding been completed? (redirect to `/role-selection`)
- Does the user have the required role? (redirect to their home)

#### Level 2: Server-Side API Guards

Each API namespace has a guard function (`src/lib/auth-guards.server.ts`) that validates the session:

| Guard | Function | Checks |
|-------|----------|--------|
| `requireTenant(request)` | `requireRole(request, ["TENANT"])` | Session exists, role is TENANT, account not suspended |
| `requireLandlord(request)` | `requireRole(request, ["LANDLORD"])` | Session exists, role is LANDLORD, account not suspended |
| `requireSuperAdmin(request)` | `requireRole(request, ["SUPER_ADMIN"])` | Session exists, role is SUPER_ADMIN, account not suspended |
| `requireSession(request)` | `getAuthenticatedUser` + status check | Session exists, account not suspended (any role) |

The guard extracts the session from either the `Cookie` header or the `x-finderz-auth-cookie` header (for native clients).

---

## 7. System Flows

### 7.1 User Onboarding Flow

```
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌────────────┐
│   User   │    │    Role      │    │   Auth API   │    │  Database  │
│          │    │  Selection   │    │              │    │            │
└────┬─────┘    └──────┬───────┘    └──────┬───────┘    └─────┬──────┘
     │                 │                   │                   │
     │  1. Open app   │                   │                   │
     │  ─────────────>│                   │                   │
     │                 │                   │                   │
     │  2. Select role (TENANT or LANDLORD)│                   │
     │  ─────────────>│                   │                   │
     │                 │                   │                   │
     │  3. "Continue"  │                   │                   │
     │  ─────────────>│                   │                   │
     │                 │                   │                   │
     │                 │  4. POST /api/onboarding/role        │
     │                 │  ─────────────────>│                   │
     │                 │                   │                   │
     │                 │  5. Validate role  │                   │
     │                 │  6. Update user.role + onboardingCompleted
     │                 │                   │  ────────────────>│
     │                 │                   │                   │
     │  7. Redirect to role home          │                   │
     │  <──────────────│                   │                   │
     │                 │                   │                   │
```

### 7.2 Tenant Property Search & Feed Flow

```
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌────────────┐
│  Tenant  │    │  Tenant UI   │    │  Tenant API  │    │  Database  │
│          │    │              │    │              │    │            │
└────┬─────┘    └──────┬───────┘    └──────┬───────┘    └─────┬──────┘
     │                 │                   │                   │
     │  1. Open feed   │                   │                   │
     │  ─────────────>│                   │                   │
     │                 │  2. GET /api/tenant/feed              │
     │                 │  ─────────────────────────────────────>│
     │                 │                   │                   │
     │                 │  3. Fetch in parallel:                │
     │                 │     - Recommended properties (top 6)  │
     │                 │     - Affordable properties (top 6)   │
     │                 │     - Recent properties (top 4)       │
     │                 │     - Popular locations                │
     │                 │     - User's saved count               │
     │                 │     - User's open enquiries count      │
     │                 │                   │                   │
     │                 │  4. Return feed data                  │
     │                 │  <─────────────────────────────────────│
     │                 │                   │                   │
     │  5. View feed   │                   │                   │
     │  <──────────────│                   │                   │
     │                 │                   │                   │
     │  6. Apply search filters           │                   │
     │  ─────────────>│                   │                   │
     │                 │  7. GET /api/tenant/properties?...    │
     │                 │  ─────────────────────────────────────>│
     │                 │                   │                   │
     │                 │  8. Query with filters: type, location│
     │                 │     price, bedrooms, furnishing       │
     │                 │  9. Return filtered results           │
     │                 │  <─────────────────────────────────────│
     │                 │                   │                   │
     │  10. View results                  │                   │
     │  <──────────────│                   │                   │
```

### 7.3 Property Enquiry & Messaging Flow

```
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌────────────┐
│  Tenant  │    │  Enquiry API │    │   Landlord   │    │  Database  │
│          │    │              │    │   API        │    │            │
└────┬─────┘    └──────┬───────┘    └──────┬───────┘    └─────┬──────┘
     │                 │                   │                   │
     │  1. View property                   │                   │
     │  2. Tap "Enquire"                   │                   │
     │  ─────────────>│                   │                   │
     │                 │                   │                   │
     │  3. Fill: message, contact method,  │                   │
     │     preferred inspection date       │                   │
     │  ─────────────>│                   │                   │
     │                 │                   │                   │
     │                 │  4. POST /api/tenant/enquiries        │
     │                 │  ─────────────────────────────────────>│
     │                 │                   │                   │
     │                 │  5. Validate with Zod                 │
     │                 │  6. Check property exists + available  │
     │                 │  7. Check no duplicate enquiry         │
     │                 │  8. Create Enquiry (OPEN)             │
     │                 │  9. Create first Message              │
     │                 │  ─────────────────────────────────────>│
     │                 │                   │                   │
     │  10. "Enquiry sent!"               │                   │
     │  <──────────────│                   │                   │
     │                 │                   │                   │
     │                 │      LANDLORD SIDE                    │
     │                 │                   │                   │
     │                 │  11. GET /api/landlord/enquiries      │
     │                 │  <────────────────────────────────────│
     │                 │                   │                   │
     │                 │  12. View enquiry + reply             │
     │                 │  ─────────────────>│                   │
     │                 │                   │                   │
     │                 │  13. POST /api/landlord/enquiries/:id │
     │                 │  ─────────────────────────────────────>│
     │                 │                   │                   │
     │                 │  14. Create reply Message             │
     │                 │  15. Update enquiry status → RESPONDED│
     │                 │  ─────────────────────────────────────>│
     │                 │                   │                   │
     │  16. Tenant sees reply              │                   │
     │  <──────────────│                   │                   │
```

### 7.4 Landlord Property Listing Flow

```
Landlord creates/edits property
    │
    ├─> Fill property details:
    │     title, description, type, location (region/city/area),
    │     rent amount, payment period, bedrooms, bathrooms,
    │     furnishing, amenities, images
    │
    ├─> Save as DRAFT or submit for APPROVAL
    │
    ├─> POST /api/landlord/properties (create)
    │   or PATCH /api/landlord/properties/:id (update)
    │
    ├─> Server validates with Zod
    │
    ├─> Server checks landlord is verified
    │
    ├─> Property saved with approval_status = DRAFT or PENDING
    │
    └─> If PENDING → Super Admin reviews in approval queue
         │
         ├─> APPROVED → Property visible to tenants
         ├─> REJECTED → Property hidden, rejection reason provided
         └─> RENTED → Property marked as rented by landlord
```

### 7.5 Landlord Verification Flow

```
Landlord submits identity documents
    │
    ├─> Upload identity document via Cloudinary
    │
    ├─> POST /api/landlord/profile (onboarding)
    │
    ├─> Server creates/updates LandlordProfile
    │     - legalName, landlordType, agencyName, address
    │     - identityDocumentType, identityDocumentUrl
    │     - verificationStatus → PENDING
    │
    └─> Super Admin reviews in verification queue
         │
         ├─> APPROVED → Landlord can create PENDING properties
         ├─> REJECTED → Landlord cannot list properties
         └─> CHANGES_REQUESTED → Landlord must resubmit
```

---

## 8. API Architecture

### 8.1 API Route Structure

All backend endpoints live under `src/app/api/` using Expo Router's API routes:

```
src/app/api/
├── auth/[...all]+api.ts          # Better Auth catch-all handler
├── health+api.ts                 # Health check endpoint
├── uploads+api.ts                # File upload proxy (Cloudinary)
├── onboarding/
│   └── role+api.ts               # POST assign user role
├── tenant/
│   ├── dashboard+api.ts          # GET tenant dashboard stats
│   ├── feed+api.ts               # GET property feed (recommended/affordable/recent)
│   ├── properties+api.ts         # GET search properties with filters
│   ├── properties/
│   │   └── [id]+api.ts           # GET property detail
│   ├── favourites+api.ts         # GET/POST/DELETE favourites
│   ├── enquiries+api.ts          # GET/POST enquiries
│   ├── enquiries/
│   │   └── [id]+api.ts           # GET/POST enquiry detail + reply
│   └── profile+api.ts            # GET/PATCH tenant profile
├── landlord/
│   ├── dashboard+api.ts          # GET landlord dashboard stats
│   ├── profile+api.ts            # GET/POST landlord profile + onboarding
│   ├── verification+api.ts       # GET verification status
│   ├── properties+api.ts         # GET/POST properties
│   ├── properties/
│   │   └── [id]+api.ts           # GET/PATCH/DELETE property
│   ├── enquiries+api.ts          # GET landlord enquiries
│   └── enquiries/
│       └── [id]+api.ts           # GET/POST enquiry detail + reply
├── super-admin/
│   ├── dashboard+api.ts          # GET platform analytics
│   ├── approvals+api.ts          # GET pending property approvals
│   ├── approvals/
│   │   └── [id]+api.ts           # GET/PATCH property moderation
│   ├── verifications+api.ts      # GET pending landlord verifications
│   ├── verifications/
│   │   └── [id]+api.ts           # GET/PATCH verification moderation
│   ├── reports+api.ts            # GET reported listings
│   ├── reports/
│   │   └── [id]+api.ts           # GET/PATCH report moderation
│   ├── users+api.ts              # GET all users
│   ├── users/
│   │   └── [id]+api.ts           # PATCH user moderation (suspend/activate)
│   └── notifications+api.ts      # GET/PATCH admin notifications
├── users/
│   ├── me+api.ts                 # GET current user
│   ├── profile+api.ts            # PATCH update profile
│   └── password+api.ts           # POST change password
└── locations/
    └── ghana+api.ts              # GET Ghana regions and cities
```

### 8.2 Standard API Response Envelope

Every API endpoint returns a consistent JSON structure:

```typescript
// Success
interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

// Error
interface ApiErrorBody {
  success: false;
  error: {
    code: string;           // Machine-readable error code
    message: string;        // Human-readable message
    fieldErrors?: Record<string, string[]>;  // Field-level validation errors
  };
}
```

**Success example:**
```json
{
  "success": true,
  "data": {
    "recommended": [...],
    "affordableNearby": [...],
    "recentlyAdded": [...]
  }
}
```

**Error example:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please check the submitted fields.",
    "fieldErrors": {
      "title": ["Title is required"],
      "rentAmount": ["Must be a positive number"]
    }
  }
}
```

### 8.3 API Route Pattern

Every protected API route follows the same structure:

```typescript
export async function GET(request: Request) {
  try {
    // 1. Role guard (throws ApiGuardError if unauthorized)
    const context = await requireTenant(request);  // or requireLandlord, requireSuperAdmin

    // 2. Parse query params / validate input with Zod
    const parsed = schema.safeParse(await request.json());

    // 3. Query Drizzle with user scoping
    const data = await db.query.properties.findMany({
      where: eq(properties.landlordId, context.user.id),
    });

    // 4. Return consistent envelope
    return successResponse(data);
  } catch (error) {
    // 5. Handle guard errors or return 500
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
```

---

## 9. File Uploads (Cloudinary)

### 9.1 Overview

File uploads are handled via a unified upload API endpoint that proxies to **Cloudinary** for storage and transformation.

### 9.2 Upload Flow

```
Client selects file
    │
    ├─> POST /api/uploads (FormData with file + purpose)
    │
    ├─> Server validates session (requireSession)
    │
    ├─> Server validates purpose enum:
    │     - "userProfile"      → folder: finderz/users/profiles
    │     - "landlordIdentity" → folder: finderz/landlords/identity-documents
    │     - "propertyImage"    → folder: finderz/properties/images
    │
    ├─> Upload to Cloudinary via uploadBuffer()
    │
    └─> Return upload metadata:
          url, secure_url, public_id, width, height, format, bytes
```

### 9.3 Upload Purposes

| Purpose | Folder | Resource Type | Use Case |
|---------|--------|---------------|----------|
| `userProfile` | `finderz/users/profiles` | image | User profile pictures |
| `landlordIdentity` | `finderz/landlords/identity-documents` | auto | ID cards, passports, licenses |
| `propertyImage` | `finderz/properties/images` | image | Property listing photos |

---

## 10. Design System

### 10.1 Design Philosophy: "Clean & Professional"

> A modern, clean design with a blue primary color, soft surfaces, and clear hierarchy. Professional yet approachable.

### 10.2 Color Palette

| Token | Color | Hex | Usage |
|-------|-------|-----|-------|
| **Primary** | Deep Blue | `#075e8f` | Actions, navigation, interactive states |
| **Primary Pressed** | Darker Blue | `#064d77` | Button pressed states |
| **Primary Container** | Darkest Blue | `#07324f` | Container backgrounds |
| **Primary Muted** | Light Blue | `#8ac0dd` | Muted accents |
| **Gold** | Warm Gold | `#f4c542` | Highlights, ratings, badges |
| **Teal** | Teal | `#0f766e` | Success states, secondary accents |
| **Background** | Light Gray | `#f6f8fb` | Page backgrounds |
| **Surface** | White | `#ffffff` | Card backgrounds |
| **Surface Soft** | Soft Blue-Gray | `#eef3f7` | Subtle backgrounds |
| **Surface Blue** | Light Blue | `#e7f2ff` | Info backgrounds |
| **Text** | Dark Gray | `#111827` | Primary text |
| **Muted** | Medium Gray | `#5f6b7a` | Secondary text |
| **Error** | Red | `#b42318` | Error states |
| **Success** | Green | `#159455` | Success states |
| **Warning** | Amber | `#b7791f` | Warning states |

### 10.3 Typography

| Element | Font | Weights | Rationale |
|---------|------|---------|-----------|
| **All text** | Manrope | 400, 600, 700, 800 | Geometric sans-serif with excellent readability on mobile |

### 10.4 Component Principles

- **Buttons:** Blue primary, rounded, with loading states. Variants: primary, secondary, outline, ghost.
- **Cards:** White surface, soft shadows (`shadow-sm`/`shadow-md`), rounded corners (8-12px).
- **Inputs:** White background, rounded, blue focus ring, with label and error states.
- **Shadows:** Soft only — `shadow-sm` (elevation 1) and `shadow-md` (elevation 3).
- **Spacing:** Generous padding and gaps for mobile touch targets.

### 10.5 UI Component Library

Custom components in `src/components/ui/`:

| Component | Purpose |
|-----------|---------|
| `AppButton` | Primary button with loading, variant, and size props |
| `AppInput` | Text input with label, error state, and icon support |
| `AppText` | Typography component with variant and color props |
| `Checkbox` | Styled checkbox with label |
| `PasswordInput` | Password field with show/hide toggle |
| `FormError` | Error message display |
| `ProgressDots` | Step progress indicator |
| `FinderzLogo` | Logo component (icon, text, or combined variants) |
| `SafeAreaScreen` | Safe area wrapper with optional scroll |
| `KeyboardAwareScreen` | Keyboard-aware scroll wrapper |
| `ScreenShell` | Standard screen layout shell |
| `AuthHeader` | Authentication screen header |

---

## 11. State Management

### 11.1 Client State: Zustand

Three Zustand stores for ephemeral client-side state:

| Store | File | Purpose |
|-------|------|---------|
| `onboarding-store` | `src/store/onboarding-store.ts` | Onboarding flow state (selected role, step progress) |
| `preferences-store` | `src/store/preferences-store.ts` | User preferences |
| `tenant-filter-store` | `src/store/tenant-filter-store.ts` | Tenant search filter state (type, location, price, etc.) |
| `landlord-property-draft-store` | `src/store/landlord-property-draft-store.ts` | Landlord property creation draft state |

### 11.2 Server State: TanStack Query

All server data is managed through TanStack Query with a centralized query key system:

**Query Keys** (`src/services/queries/keys.ts`):
- `currentUser` — Current authenticated user
- `tenantDashboard`, `tenantFeed`, `tenantProperties`, `tenantProperty(id)`, `tenantFavourites`, `tenantEnquiries`, `tenantEnquiry(id)`, `tenantProfile`
- `landlordDashboard`, `landlordProfile`, `landlordVerification`, `landlordProperties(status)`, `landlordProperty(id)`, `landlordEnquiries`, `landlordEnquiry(id)`
- `superAdminDashboard`, `superAdminApprovals`, `superAdminProperty(id)`, `superAdminLandlordVerifications`, `superAdminReports`, `superAdminUsers`, `superAdminNotifications`
- `ghanaLocations`

**Automatic Cache Invalidation:**
Every mutation automatically invalidates related queries to keep the UI in sync. For example, toggling a favourite invalidates the feed, favourites list, property detail, and search results.

### 11.3 Axios Interceptors

The Axios instance (`src/services/api/axios.ts`) handles:
- **Request interceptor:** Attaches Bearer token and cookies to every request
- **Response interceptor:** Normalizes errors into a consistent `ApiErrorBody` format

---

## 12. Deployment

### 12.1 Platform: Expo Application Services (EAS)

- **Build profiles:** Development (dev client), Preview (internal APK), Production (app bundle)
- **Channels:** `development`, `preview`, `production`
- **Web output:** Server mode via `expo export --platform web`
- **Staging deploy:** `eas deploy --alias staging`

### 12.2 Build Profiles

| Profile | Distribution | Channel | Build Type | Use Case |
|---------|-------------|---------|------------|----------|
| `development` | Internal | development | APK | Local dev with dev client |
| `preview` | Internal | preview | APK | Testing with staging API |
| `production` | Store | production | AAB | Play Store / App Store |

### 12.3 Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `BETTER_AUTH_URL` | Better Auth base URL |
| `BETTER_AUTH_SECRET` | Better Auth secret key |
| `SUPER_ADMIN_NAME` | Seed super admin name |
| `SUPER_ADMIN_EMAIL` | Seed super admin email |
| `SUPER_ADMIN_PASSWORD` | Seed super admin password |
| `EXPO_PUBLIC_API_URL` | Client-facing API URL |
| `EXPO_PUBLIC_APP_ENV` | Environment indicator (development/preview/production) |
| `CLOUDINARY_*` | Cloudinary upload configuration |

### 12.4 Build & Develop

```bash
# Install dependencies
pnpm install

# Start Expo dev server
pnpm start

# Run on specific platform
pnpm android
pnpm ios
pnpm web

# Database management
pnpm db:generate    # Generate Drizzle migrations
pnpm db:migrate     # Run migrations
pnpm db:push        # Push schema directly to DB
pnpm db:studio      # Open Drizzle Studio (visual DB editor)
pnpm db:seed        # Seed amenities, Ghana locations, super admin
pnpm db:check       # Verify DB connection

# Type checking & linting
pnpm typecheck
pnpm lint

# Build for preview
pnpm build:preview:android

# Deploy to staging
pnpm deploy:staging
pnpm deploy:staging:web
```

---

## Summary

The **FinderZ Housing Search App** is a well-structured, cross-platform mobile application for the Ghanaian rental housing market. Its key architectural strengths are:

1. **Role-based isolation** — Three separate portals (Tenant, Landlord, Super Admin) with both client-side route guards and server-side API guards
2. **Clean layered architecture** — Routes, components, features, services, stores, and lib are clearly separated with consistent patterns
3. **Drizzle + PostgreSQL** — Strong typing, migrations, and relational integrity with modular schema files per entity
4. **Cross-platform by default** — Expo SDK 55 delivers Android, iOS, and Web from a single codebase
5. **Verified landlord ecosystem** — Identity verification workflow ensures tenants interact with verified landlords
6. **Property approval pipeline** — All listings go through admin review before becoming visible to tenants
7. **Real-time enquiry messaging** — Tenants and landlords communicate through structured enquiry threads
8. **Consistent API design** — Every endpoint follows the same guard → validate → query → respond pattern
9. **Modern mobile UX** — NativeWind styling, Manrope typography, and smooth Reanimated animations
