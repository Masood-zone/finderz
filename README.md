# FinderZ Mobile

FinderZ is an Expo SDK 55 housing-search app for tenants, landlords, and Super Administrators in Ghana.

## Phase 1 Setup

Install dependencies with pnpm:

```bash
pnpm install
```

Start the app:

```bash
pnpm start
```

Useful scripts:

```bash
pnpm typecheck
pnpm lint
pnpm db:auth-generate
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm db:check
```

## Environment

Copy `.env.example` to `.env` and fill in real values locally:

```bash
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
EXPO_PUBLIC_API_URL=
SUPER_ADMIN_NAME=
SUPER_ADMIN_EMAIL=
SUPER_ADMIN_PASSWORD=
```

Only `EXPO_PUBLIC_API_URL` is safe for mobile client code. `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and Super Administrator credentials are server-only and must stay out of Expo public variables.

When running Expo Go on a physical phone, the phone cannot reach your computer through `localhost`. Use a reachable LAN address such as `http://192.168.x.x:8081` or a deployed API URL for `EXPO_PUBLIC_API_URL` and `BETTER_AUTH_URL`.

## NativeWind

This project uses NativeWind v5 preview. The v5 package requires Tailwind CSS greater than `4.1.11`, so Tailwind `4.3.1` is installed even though the initial Phase 1 brief mentioned Tailwind 3. NativeWind v4 is the compatible line for Tailwind 3.

FinderZ design tokens are mapped in `tailwind.config.js`, and `src/components/ui/nativewind-smoke-test.tsx` confirms className styling without replacing completed UI.

## Database

Drizzle schema lives under `src/db/schema`, with relations in `src/db/relations.ts`.

The seed script is idempotent. It inserts standard amenities and creates the Super Administrator through Better Auth before assigning the `SUPER_ADMIN` role on the server.
