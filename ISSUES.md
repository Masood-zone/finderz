# FinderZ — General Screens Verification, Dashboard Layout Stabilization, Authentication Flow Fixes and Android Development Build Readiness

Continue working inside the existing FinderZ Expo SDK 55 repository.

FinderZ is already substantially implemented. The database, NeonDB connection, Drizzle ORM schema, migrations, seed data, Better Auth integration, API routes, Tenant screens, Landlord screens and Super Administrator screens may already exist.

Do not rebuild completed features unnecessarily.

Your responsibility is to:

1. Audit and verify every General screen.
2. Build only the General screens that are missing, incomplete or broken.
3. Connect the General screens to the existing Better Auth, API and navigation architecture.
4. Verify environment variables and API connectivity.
5. Fix dashboard layout and Safe Area issues across all role groups.
6. Fix authentication onboarding and post-registration routing.
7. Fix the Landlord onboarding image-upload authentication failure.
8. Prepare and create an installable Android development build.
9. Install and test the Android build on a physical device or emulator.
10. Fix runtime, route, layout and configuration issues found during verification.

Work carefully and preserve the existing FinderZ implementation.

---

# 1. Technology Stack

The project should continue using:

- Expo SDK 55
- React Native
- TypeScript
- Expo Router
- NativeWind
- Tailwind CSS version 3
- Better Auth
- Better Auth Expo integration
- Expo SecureStore
- Neon PostgreSQL
- Drizzle ORM
- Drizzle Kit
- Expo Router API routes
- Axios
- TanStack React Query
- Zustand
- React Hook Form
- Zod
- Expo Development Client
- EAS Build

Do not replace Better Auth, Drizzle ORM, NeonDB, Axios, TanStack React Query, NativeWind or Expo Router.

---

# 2. Important Safety Restrictions

The database has already been configured.

Do not:

- Drop database tables.
- Reset NeonDB.
- Delete existing migrations.
- Regenerate the complete schema without justification.
- Run destructive SQL.
- Run `drizzle-kit push` blindly.
- Re-seed data that already exists.
- Create duplicate Better Auth tables.
- Create duplicate Super Administrator accounts.
- Replace working API routes.
- Rewrite working Tenant, Landlord or Super Administrator screens unnecessarily.
- Expose server secrets to the mobile application.

You may perform read-only database and migration verification.

If a database change is genuinely required, explain the reason before applying it and generate a safe migration.

---

# 3. Initial Repository Audit

Before modifying code, inspect and report:

- `package.json`
- `app.json`, `app.config.ts` or equivalent
- `eas.json`
- `tsconfig.json`
- `babel.config.js`
- `metro.config.js`
- `tailwind.config.js`
- `global.css`
- `nativewind-env.d.ts`
- `app/_layout.tsx`
- `app/index.tsx`
- all Expo Router route groups
- General screen files
- Tenant route group
- Landlord route group
- Super Administrator route group
- Better Auth client configuration
- Better Auth server configuration
- Axios client
- React Query provider
- Zustand stores
- Drizzle database configuration
- Expo API routes
- environment-variable helpers
- `.env.example`
- FinderZ image and logo assets
- Android package and EAS project configuration

Produce a checklist showing:

- Available and working
- Available but incomplete
- Missing
- Broken
- Duplicated
- Not currently connected

Do not begin implementation until this audit is complete.

---

# 4. General Screen Inventory

Verify the following General screens:

1. `splash_screen`
2. `onboarding_find_housing`
3. `onboarding_connect`
4. `onboarding_list_properties`
5. `role_selection`
6. `sign_in`
7. `sign_up`
8. `email_verification`
9. `forgot_password`
10. `no_internet_connection`
11. `no_search_results`
12. `property_unavailable`
13. `finderz_marketplace_system`

The design files for these screens are already available in the repository.

The FinderZ logos, application icons, splash images and shared image assets are also available.

I will separately reference the exact design and asset paths if they cannot be discovered automatically.

For every screen:

- Locate its design file.
- Locate its existing implementation.
- Compare the implementation against the design.
- Verify routing.
- Verify responsive Android layout.
- Verify NativeWind styling.
- Verify safe-area handling.
- Verify loading and error states.
- Verify accessibility.
- Verify button actions.
- Verify API or authentication integration.
- Build it only when it is missing or unusable.

Do not replace an accurate existing screen with a generic design.

---

# 5. Dashboard Safe Area and Layout Stabilization

A critical issue currently exists where dashboard screens appear to overlap the device screen boundaries and status bar areas.

Audit and fix all dashboard layouts in:

```text
app/(tenant)/
app/(landlord)/
app/(super-admin)/
```

Verify every dashboard and nested screen for:

- SafeAreaView usage
- SafeAreaProvider usage
- status bar overlap
- notch overlap
- Android top inset handling
- bottom navigation overlap
- keyboard overlap
- scroll container sizing
- header positioning
- tab navigator spacing
- drawer spacing
- content clipping
- floating action button positioning

Create or verify shared wrappers such as:

- `SafeAreaScreen`
- `DashboardScreen`
- `ScrollableDashboardScreen`

Ensure all role dashboards use a consistent layout system.

Specifically verify:

- Tenant Dashboard
- Landlord Dashboard
- Super Administrator Dashboard
- Property screens
- Profile screens
- Settings screens
- Analytics screens
- Listing-management screens

No dashboard content should render underneath:

- Android status bar
- navigation bar
- notch
- dynamic island
- tab bar

Document every screen that required correction.

---

# 6. Shared Marketplace Reference

Inspect `finderz_marketplace_system`.

Determine whether it is:

- a real screen,
- a visual design system,
- a component reference,
- an application shell,
- or a navigation reference.

Do not create duplicate routes named `finderz_marketplace_system` in every role group unless the design clearly represents separate screens.

Extract reusable patterns from it, including:

- colours,
- typography,
- headers,
- cards,
- buttons,
- bottom navigation,
- status badges,
- spacing,
- icon treatment,
- search fields,
- empty states,
- error states.

Create shared components where appropriate.

---

# 7. Recommended General Route Structure

Use the existing route structure where it is already correct.

Otherwise, organize the General routes similarly to:

```text
app/
├── _layout.tsx
├── index.tsx
│
├── (public)/
│   ├── _layout.tsx
│   ├── splash.tsx
│   ├── onboarding/
│   │   ├── _layout.tsx
│   │   ├── find-housing.tsx
│   │   ├── connect.tsx
│   │   └── list-properties.tsx
│   ├── no-internet.tsx
│   ├── no-search-results.tsx
│   └── property-unavailable.tsx
│
├── (auth)/
│   ├── _layout.tsx
│   ├── role-selection.tsx
│   ├── sign-in.tsx
│   ├── sign-up.tsx
│   ├── email-verification.tsx
│   └── forgot-password.tsx
│
├── (tenant)/
├── (landlord)/
├── (super-admin)/
└── api/
```

Avoid ambiguous duplicate routes.

Ensure route names use valid file names such as:

- `no-search-results.tsx`
- not `no search results.tsx`

---

# 8. Shared Components

Verify or create reusable components for:

- `SafeAreaScreen`
- `DashboardScreen`
- `ScrollableDashboardScreen`
- `KeyboardAwareScreen`
- `ScrollableScreen`
- `AppText`
- `AppButton`
- `AppInput`
- `PasswordInput`
- `PhoneInput`
- `Checkbox`
- `FinderzLogo`
- `AuthHeader`
- `RoleCard`
- `OnboardingSlide`
- `ProgressDots`
- `LoadingOverlay`
- `FormError`
- `ErrorAlert`
- `EmptyState`
- `NetworkErrorState`
- `PropertyUnavailableState`
- `RetryButton`

Do not create duplicate components when equivalent components already exist.

---

# 9. Splash Screen and Startup Bootstrap

Verify or implement the FinderZ splash screen using the provided FinderZ assets.

The splash/bootstrap process must wait for:

- fonts,
- required assets,
- local onboarding state,
- Better Auth session restoration,
- current user query,
- user role,
- account status,
- role onboarding status.

Use one centralized startup decision.

Required startup routing:

```text
First launch + signed out
→ onboarding

Onboarding completed + signed out
→ sign in

Signed in + role not assigned
→ role selection

TENANT
→ tenant route group

LANDLORD
→ landlord route group

SUPER_ADMIN
→ super-admin route group

Suspended account
→ restricted account screen
```

Do not:

- call `router.replace()` during render,
- create competing redirects in multiple layouts,
- redirect before loading states are resolved,
- briefly expose protected screens,
- create a maximum-update-depth loop.

Keep the native splash visible until startup state is resolved.

Verify that no infinite route or state-update loop remains.

---

# 10. Onboarding Screens

Verify or build:

## Find Housing

Use design:

`onboarding_find_housing`

Content purpose:

Help users discover affordable houses, rooms, apartments and hostels.

## Connect

Use design:

`onboarding_connect`

Content purpose:

Explain property discovery and communication with landlords.

## List Properties

Use design:

`onboarding_list_properties`

Content purpose:

Explain landlord listing and management capabilities.

The onboarding flow must include:

- Skip
- Next
- Get Started
- progress indicators
- swipe or controlled next navigation
- Android-safe spacing
- correct illustration sizing
- persistence of onboarding completion

Store the onboarding completion flag using AsyncStorage or the existing non-sensitive local-state solution.

Do not store authentication sessions or passwords in AsyncStorage.

Test both:

- first installation,
- returning user after restarting the app.

---

# 11. Role Selection

Verify or build `role_selection`.

Public options:

- Find a Home — `TENANT`
- List a Property — `LANDLORD`

Never expose `SUPER_ADMIN`.

The selected role may be stored temporarily in Zustand.

Final role assignment must happen through the authenticated server endpoint.

The mobile client must not directly update the database role.

Test:

- selecting Tenant before registration,
- selecting Landlord before registration,
- assigning a role after authentication,
- reopening the app during incomplete role onboarding,
- rejection of any attempt to assign `SUPER_ADMIN`.

---

# 12. Sign-Up and Immediate Dashboard Routing

Verify or build `sign_up`.

Use:

- React Hook Form
- Zod
- Better Auth client
- existing FinderZ components
- NativeWind

Required fields:

- full name
- email
- phone
- password
- confirm password
- selected public role
- terms and privacy acceptance

Validation:

- required values
- normalized email
- Ghana-compatible phone input
- password requirements
- matching password confirmation
- accepted terms
- role restricted to Tenant or Landlord

Flow:

1. Validate.
2. Register through Better Auth.
3. Restore or confirm the authenticated session.
4. Assign the selected role through the protected onboarding API.
5. Refresh `/api/users/me`.
6. Invalidate relevant React Query caches.
7. Refresh session state.
8. Route immediately to the correct dashboard.
9. Never redirect newly registered users to the Sign-In screen.
10. Show a recoverable error if role assignment fails.

Expected behavior:

```text
Tenant Registration
→ Tenant Dashboard

Landlord Registration
→ Landlord Dashboard
```

Do not manually create another user record after Better Auth registration.

Prevent duplicate submission.

Audit all registration flows and remove any logic that incorrectly redirects newly registered users to:

```text
/auth/sign-in
```

unless registration actually failed.

---

# 13. Sign-In

Verify or build `sign_in`.

Required features:

- email
- password
- password visibility
- Forgot Password
- Sign Up link
- loading state
- invalid credentials message
- API unavailable message
- network failure message
- account-status handling

After sign-in:

1. Refresh Better Auth session.
2. Fetch the current application user.
3. Check account status.
4. Check role.
5. Route to the appropriate role group.

Incorrect credentials must remain on the Sign-In screen.

Do not restart onboarding after failed sign-in.

Do not redirect until the sign-in result and current-user query have resolved.

---

# 14. Email Verification

Verify or build `email_verification`.

Connect it to the actual Better Auth email-verification implementation.

Include:

- email destination
- verification-code or verification-link state
- resend action
- cooldown
- loading state
- invalid code state
- expired code or link state
- success state
- change-email option

Do not fake successful verification.

If no transactional email provider has been configured, document that clearly and make the UI fail safely.

---

# 15. Forgot Password

Verify or build `forgot_password`.

Support the real flow:

1. Enter email
2. Request reset
3. Process reset token or code
4. Set a new password
5. Display success
6. Return to Sign In

Use Better Auth’s configured password-reset behavior.

Do not report that email delivery works unless it has been tested.

---

# 16. No Internet Connection

Verify or build `no_internet_connection`.

Integrate with:

- Expo Network
- TanStack Query `onlineManager`
- Axios network failures

Include:

- FinderZ offline illustration
- clear explanation
- Retry
- automatic network recheck
- restoration of previous navigation when safe

Do not redirect repeatedly between the current screen and the offline screen.

Prefer a centralized network-state boundary where appropriate.

---

# 17. No Search Results

Verify or build `no_search_results`.

This should be reusable by Tenant search.

Include:

- current search term where available
- current filter summary
- Reset Filters
- Modify Search
- Return to Discovery

Do not hard-code one search query.

---

# 18. Property Unavailable

Verify or build `property_unavailable`.

Support these conditions:

- rented,
- removed,
- rejected,
- suspended,
- no longer approved,
- deleted,
- inaccessible.

Display the correct message based on the reason when the API provides one.

Actions:

- Return to Search
- View Similar Properties
- Remove from Favourites where appropriate

Do not expose private moderation details to normal users.

---

# 19. Landlord Onboarding Image Upload Authentication Fix

A critical bug currently exists during Landlord onboarding.

Current behavior:

```text
User is authenticated
→ User opens Landlord onboarding
→ User selects image
→ Upload request sent
→ Upload Failed
→ "You must be signed in to upload an image"
```

Even though the user is already logged in.

Investigate and fix the root cause.

Audit:

- `upload.+api.ts`
- upload route middleware
- Better Auth session retrieval
- Better Auth server helpers
- request cookies
- authorization headers
- multipart form handling
- Axios upload client
- fetch upload client
- Expo Router API route authentication
- trusted origins
- Better Auth session validation
- role onboarding endpoints

Determine exactly why the upload endpoint believes the user is unauthenticated.

Potential causes to verify:

- session cookie not forwarded
- Better Auth server helper misconfigured
- upload route using incorrect auth context
- multipart request stripping credentials
- Axios upload request missing credentials
- Expo Router API route not reading session correctly
- incorrect Better Auth base URL
- invalid trusted origin configuration
- upload route using stale session logic

Do not bypass authentication.

Do not disable authorization checks.

Fix the actual authentication flow.

After fixing:

Test:

```text
Landlord Sign Up
→ Immediate Dashboard Redirect
→ Landlord Onboarding
→ Upload Property Image
→ Upload Success
→ Continue Onboarding
```

Verify uploads work after:

- fresh registration
- app restart
- session restoration
- Android development build

Document the exact root cause and fix.

---

# 20. NativeWind and Android UI Verification

Verify:

- `global.css` is imported exactly once.
- Tailwind content paths include all application folders.
- NativeWind Babel configuration is correct.
- Metro is wrapped correctly.
- Tailwind CSS remains version 3.
- Reanimated is configured properly.
- NativeWind TypeScript declarations exist.
- `className` styling works on Android.
- images use correct resize modes.
- screens respect Android safe areas.
- dashboard screens respect Android safe areas.
- keyboard avoidance works.
- forms scroll on smaller devices.
- status-bar colours match the screen.
- touch targets are practical.
- there are no overlapping elements.
- onboarding is arranged correctly.

Create a temporary NativeWind visual verification screen only if necessary, then remove it after the configuration is confirmed.

---

# 21. Environment Variable Audit

Create or verify `.env.example`.

Separate public mobile variables from server-only secrets.

## Mobile-public variables

Examples:

```env
EXPO_PUBLIC_API_URL=
EXPO_PUBLIC_APP_ENV=
```

Only values safe to expose in the Android application may use the `EXPO_PUBLIC_` prefix.

## Server-only variables

Examples:

```env
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
EMAIL_FROM=
RESEND_API_KEY=
SUPER_ADMIN_EMAIL=
SUPER_ADMIN_PASSWORD=
```

Never expose these using `EXPO_PUBLIC_`.

Verify the project does not import server-only environment variables into mobile code.

Create typed environment validation.

Fail startup with a useful development error when required environment variables are missing.

Do not include real secrets in committed files.

---

# 22. Production API URL

The installed Android application must not use:

```text
localhost
127.0.0.1
10.0.2.2
```

as its final production API URL.

The application must use a deployed HTTPS API base URL.

Verify:

- `EXPO_PUBLIC_API_URL`
- Better Auth client `baseURL`
- Axios `baseURL`
- Better Auth server `baseURL`
- trusted origins
- FinderZ deep-link scheme
- authentication callback URLs
- CORS or origin handling where required

Use scheme:

```text
finderz://
```

Do not add unsafe wildcard production origins.

The deployed API must expose a working health endpoint before the Android build is created.

---

# 23. Expo Router API Route Deployment

Audit all files ending in:

```text
+api.ts
```

Verify that they:

- use server-compatible APIs,
- do not import React Native modules,
- do not import Expo SecureStore,
- do not import client-side Better Auth,
- do not import UI components,
- do not expose secrets,
- connect to NeonDB correctly,
- return structured errors,
- enforce authentication and roles.

Ensure:

```json
{
  "expo": {
    "web": {
      "output": "server"
    }
  }
}
```

or the equivalent application configuration exists where required.

Deploy the Expo Router server/API output using the project’s selected server host, preferably EAS Hosting when compatible with all dependencies.

After deployment
