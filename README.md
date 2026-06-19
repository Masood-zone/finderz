# FinderZ - Housing Search App

A mobile-first housing search platform built with Expo SDK 55, React Native, and TypeScript. FinderZ connects tenants with landlords across Ghana, featuring role-based access for **Tenants**, **Landlords**, and **Super Admins**.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Expo SDK 55 + React Native 0.83 |
| Routing | Expo Router v55 (file-based) |
| Language | TypeScript 5.9 (strict) |
| Styling | NativeWind v5 (Tailwind CSS 4.3) |
| Database | PostgreSQL (Neon serverless) |
| ORM | Drizzle ORM 0.45 |
| Auth | Better Auth 1.6 + Expo adapter |
| State | Zustand 5 |
| Data Fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod 4 |

## Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Expo CLI (`npm install -g expo-cli`)
- A Neon PostgreSQL database
- Expo Go app on your phone (or Android/iOS emulator)

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd finderz
pnpm install
```

### 2. Set up environment variables

Create a `.env` file at the project root:

```env
DATABASE_URL=postgresql://user:pass@your-neon-host/dbname?sslmode=require
BETTER_AUTH_URL=http://localhost:8081
BETTER_AUTH_SECRET=<random-64-char-hex-string>
EXPO_PUBLIC_API_URL=http://localhost:8081
EXPO_PUBLIC_APP_ENV=development

CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>

SUPER_ADMIN_NAME="Super Admin"
SUPER_ADMIN_EMAIL="super@admin.com"
SUPER_ADMIN_PASSWORD="superadmin"
```

### 3. Set up the database

```bash
# Push the schema to your database
pnpm db:push

# Seed with default data (including the super admin account)
pnpm db:seed

# Verify the connection works
pnpm db:check
```

Optional: open Drizzle Studio to browse your data:

```bash
pnpm db:studio
```

### 4. Start the dev server

```bash
pnpm start
```

Scan the QR code with Expo Go (Android) or Camera (iOS), or press `a` for Android emulator / `i` for iOS simulator.

### 5. Useful commands

| Command | Description |
|---------|-------------|
| `pnpm start` | Start Expo dev server |
| `pnpm android` | Start on Android |
| `pnpm ios` | Start on iOS |
| `pnpm web` | Start on web |
| `pnpm typecheck` | TypeScript type check |
| `pnpm lint` | ESLint |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Run migrations |
| `pnpm db:push` | Push schema to DB |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm db:seed` | Seed database |
| `pnpm db:check` | Check DB connection |

## Application Flow

### First Launch

1. **Splash Screen** -- The FinderZ logo and tagline appear for ~1.3 seconds.
2. **Onboarding Slides** -- Three introductory screens walk through the value proposition:
   - "Find Affordable Housing" -- search verified rentals across Ghana
   - "Connect with Trusted Landlords" -- chat with verified property owners
   - "List and Manage Properties" -- publish vacancies from your phone
3. **Role Selection** -- Choose how you want to use FinderZ:
   - **Find a Home** (Tenant) -- search rentals, save favourites, contact landlords
   - **List a Property** (Landlord) -- publish listings, manage enquiries
4. **Sign Up / Sign In** -- Create an account or log in with email and password.

After sign-up, the app assigns your chosen role and redirects you to the appropriate dashboard. Returning users go straight to their role-specific home screen.

### Navigation & Guards

Each role has its own route group with a `RouteGuard` that enforces role-based access:

- `(tenant)` routes require `TENANT` role
- `(landlord)` routes require `LANDLORD` role
- `(super-admin)` routes require `SUPER_ADMIN` role
- `(public)` routes are accessible without authentication

If a user tries to access a route outside their role, they are redirected to their dashboard.

---

## Tenant Flow

Tenants use FinderZ to discover rental properties and communicate with landlords.

### Tab Navigation

| Tab | Screen | Description |
|-----|--------|-------------|
| Home | `(tabs)/index` | Personalized feed with recommended properties, popular locations, and affordable nearby listings |
| Search | `(tabs)/search` | Full-text search with suggested locations, housing categories, and recent search history |
| Saved | `(tabs)/favourites` | Properties the tenant has favourited |
| Enquiries | `(tabs)/enquiries` | Active, awaiting-reply, and closed conversations with landlords |
| Profile | `(tabs)/profile` | Account settings and profile management |

### Key Screens

- **Home Feed** (`tenant/(tabs)/index`) -- Shows a greeting, location-aware recommended properties, popular cities (Accra, Kumasi, Cape Coast), affordable nearby listings, and recently added properties. Tap the search bar to jump to search.
- **Search** (`tenant/(tabs)/search`) -- Type a query or tap a suggested location. Results open in `tenant/results`.
- **Filters** (`tenant/filters`) -- Refine by region, city, area, price range, payment period, property type, bedrooms/bathrooms, furnishing, availability, amenities (A/C, parking, WiFi, security, generator), and verified-only toggle.
- **Results** (`tenant/results`) -- Filtered list of matching properties.
- **Property Detail** (`tenant/property/[propertyId]`) -- Full listing with images, pricing (GHS/month), description, amenities, and a "Send Enquiry" button.
- **Enquiry Chat** (`tenant/enquiry/[enquiryId]`) -- Real-time messaging thread with the landlord.
- **Gallery** (`tenant/gallery/[propertyId]`) -- Full-screen image viewer for a property.
- **Edit Profile** (`tenant/edit-profile`) -- Update name, phone, and other personal details.

### Typical Tenant Journey

```
Splash → Onboarding → Role Selection → Sign Up → Home Feed
                                                      ↓
Search ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← Search Bar
  ↓
Filters (optional)
  ↓
Results
  ↓
Property Detail
  ↓
Send Enquiry
  ↓
Enquiry Chat (messages with landlord)
```

---

## Landlord Flow

Landlords use FinderZ to list properties, manage enquiries, and track their portfolio.

### Tab Navigation

| Tab | Screen | Description |
|-----|--------|-------------|
| Dashboard | `(tabs)/index` | Overview of listings, stats, recent enquiries, and portfolio highlights |
| Properties | `(tabs)/properties` | All property listings with status filters |
| Add | `(tabs)/add-property` | Start the property creation wizard |
| Enquiries | `(tabs)/enquiries` | Incoming tenant messages across all listings |
| Profile | `(tabs)/profile` | Account settings and profile management |

### Key Screens

- **Dashboard** (`landlord/(tabs)/index`) -- Shows total/active/pending/rejected/rented listings, enquiry count, listing performance bars, recent enquiries, and portfolio highlights. If verification is incomplete, a banner prompts action.
- **Verification Status** (`landlord/verification-status`) -- Displays the current verification state: Not Submitted, Pending, Approved, Rejected, or Changes Requested. Shows review notes if applicable.
- **Onboarding** (`landlord/onboarding`) -- Collects legal name, phone, profile image, landlord type (Individual or Agency), agency name (if applicable), address, preferred contact method, identity document type (Ghana Card, NHIS, Voter ID, Driver's License), and document upload. Submitting sends the profile for admin review.
- **Add Property -- Step 1: Basics** (`landlord/properties/create/basics`) -- Title, property type (Apartment, House, Room, Studio), description, bedroom/bathroom counters, furnishing status, and availability toggle.
- **Add Property -- Step 2: Location & Pricing** (`landlord/properties/create/location-pricing`) -- Address, city, area, coordinates, rent amount (in pesewas), payment period, and amenities.
- **Add Property -- Step 3: Review & Submit** (`landlord/properties/create/review-submit`) -- Review all details and submit for admin approval.
- **Property Edit** (`landlord/properties/[propertyId]/edit`) -- Edit an existing listing.
- **Property Submitted** (`landlord/property-submitted`) -- Confirmation screen after submission.
- **Edit Profile** (`landlord/edit-profile`) -- Update landlord profile details.

### Typical Landlord Journey

```
Sign Up → Role Selection (Landlord) → Verification Status
                                            ↓
                                    Start Onboarding
                                            ↓
                                    Submit Details (name, ID, documents)
                                            ↓
                                    Wait for Admin Approval
                                            ↓
                              ┌─── Approved ──→ Dashboard
                              │                        ↓
                              │              Add Property (3-step wizard)
                              │                        ↓
                              │              Submit for Review
                              │                        ↓
                              │              Admin Approves Listing
                              │                        ↓
                              │              Tenant Sends Enquiry
                              │                        ↓
                              │              Respond in Enquiries Tab
                              │
                              ├─── Changes Requested → Update Details → Resubmit
                              │
                              └─── Rejected → Review Notes → Update Details
```

### Property Approval Statuses

| Status | Meaning |
|--------|---------|
| PENDING | Awaiting admin review |
| APPROVED | Live and visible to tenants |
| REJECTED | Not approved (admin provides reason) |
| CHANGES_REQUESTED | Admin needs specific edits before approval |

---

## Super Admin Flow

Super Admins manage the entire FinderZ marketplace: approving listings, moderating reports, managing users, and monitoring platform activity.

### Dashboard

The admin dashboard (`super-admin`) shows:

- **Platform Stats** -- Total users, tenants, verified landlords, properties, pending approvals, reported listings, active enquiries
- **Quick Actions** -- Approve Listings, User Management, Moderation, Notifications
- **Recent Submission Requests** -- Latest property submissions awaiting review
- **Recent Administrative Activity** -- Audit log of admin actions

### Key Screens

- **Approvals** (`super-admin/approvals`) -- Searchable list of pending property submissions. Each card shows property image, title, location, rent, submission date, and landlord verification status. Tap "Review" to open the detail view.
- **Property Review** (`super-admin/approvals/[propertyId]`) -- Full property inspection: image gallery, title, address, pricing, bedrooms/bathrooms, description, amenities, landlord profile with verification status, report history, and submission history. Moderation actions:
  - **Approve** -- Makes the listing live
  - **Request Changes** -- Sends back to landlord with notes
  - **Reject** -- Denies the listing
  - **Suspend** -- Takes down an active listing
- **User Management** (`super-admin/users`) -- Searchable, filterable user list (All, Tenants, Landlords, Super Admins, Suspended). Shows name, email, role, account status, landlord verification status, and listing count. Actions: View Account, Suspend (with required reason), Reactivate.
- **Reported Listings** (`super-admin/reports`) -- Moderation queue for user-reported properties. Shows report reason, description, reporter, and status. Actions: Review Details, Resolve, Dismiss, Suspend Listing.
- **Notification Centre** (`super-admin/notifications`) -- Administrative alerts for approvals, reports, verifications, and account issues. Actions: Mark as Read, Mark All as Read, Open Related Entity.
- **Profile** (`super-admin/profile`) -- Admin account settings.

### Typical Super Admin Journey

```
Sign In (super@admin.com / superadmin)
        ↓
Dashboard (platform overview)
        ↓
  ┌─────────────────────────────────────┐
  │                                     │
  ▼                                     ▼
Approvals                          User Management
  │                                     │
  ▼                                     ▼
Review Property                    Search/Filter Users
  │                                     │
  ├→ Approve                           ├→ Suspend
  ├→ Request Changes                   └→ Reactivate
  ├→ Reject
  └→ Suspend
        │
        ▼
Reports → Moderate flagged listings
        │
        ▼
Notifications → Monitor platform activity
```

---

## Project Structure

```
finderz/
├── src/
│   ├── app/                    # Expo Router file-based routes
│   │   ├── _layout.tsx         # Root layout (providers, fonts, splash)
│   │   ├── index.tsx           # Entry point (role-based redirect)
│   │   ├── role-selection.tsx  # Choose Tenant or Landlord
│   │   ├── (auth)/             # Sign in, sign up, forgot password
│   │   ├── (tenant)/           # Tenant dashboard, search, filters, property, enquiry
│   │   ├── (landlord)/         # Landlord dashboard, property creation, onboarding
│   │   ├── (super-admin)/      # Admin dashboard, approvals, users, reports
│   │   ├── (public)/           # Onboarding slides, splash, utility screens
│   │   └── api/                # Server API routes
│   ├── components/
│   │   ├── ui/                 # Design system (Button, Input, Text, etc.)
│   │   ├── shared/             # Shared components (RouteGuard, LoadingScreen)
│   │   ├── general/            # General-purpose components
│   │   ├── tenant/             # Tenant-specific components
│   │   ├── landlord/           # Landlord-specific components
│   │   └── super-admin/        # Admin-specific components
│   ├── db/
│   │   ├── index.ts            # Drizzle + Neon client
│   │   ├── schema/             # Database tables
│   │   ├── relations.ts        # Drizzle relation definitions
│   │   ├── seed.ts             # Database seeding
│   │   └── seed-data.ts        # Seed data
│   ├── features/               # Feature modules (auth, tenant, landlord, super-admin, onboarding)
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Auth config, API utilities, env vars
│   ├── providers/              # App-level providers (Query, SafeArea)
│   ├── services/
│   │   ├── api/                # API service functions
│   │   ├── mutations/          # TanStack Query mutations
│   │   └── queries/            # TanStack Query queries
│   ├── store/                  # Zustand stores (onboarding, preferences, filters)
│   ├── types/                  # TypeScript type definitions
│   └── utils/                  # Utility functions
├── drizzle/                    # Drizzle migrations
├── assets/                     # Images, icons, splash screens
├── app.json                    # Expo configuration
├── drizzle.config.ts           # Drizzle Kit config
├── tailwind.config.js          # Tailwind/NativeWind config
├── babel.config.js             # Babel config
├── metro.config.js             # Metro bundler config
└── postcss.config.mjs          # PostCSS config
```

## Database

Key tables: `user`, `session`, `account`, `verification`, `landlordProfiles`, `properties`, `propertyImages`, `amenities`, `propertyAmenities`, `favourites`, `enquiries`, `messages`, `propertyReports`, `notifications`, `adminAuditLogs`.

User roles: `TENANT`, `LANDLORD`, `SUPER_ADMIN`.

Account statuses: `ACTIVE`, `SUSPENDED`, `PENDING`.

Landlord verification statuses: `NOT_SUBMITTED`, `PENDING`, `APPROVED`, `REJECTED`, `CHANGES_REQUESTED`.

Property approval statuses: `PENDING`, `APPROVED`, `REJECTED`.

## License

Private project. All rights reserved.
