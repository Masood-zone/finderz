---
name: finderz
description: >
  Deep research and development skill for the FinderZ housing search app (Expo SDK 55, React Native, Drizzle ORM, Better Auth, Neon PostgreSQL, NativeWind v5, Tanstack Query, Zustand).
  Use when: (1) researching best practices or solutions for the tech stack, (2) investigating library compatibility or breaking changes, (3) exploring architectural patterns or design decisions, (4) debugging runtime errors or infinite render loops, (5) deep-diving into auth flows, state management, or data fetching patterns, or (6) any open-ended investigation requiring multi-source synthesis for this project.
  Do NOT use for: quick file lookups, simple code edits, or tasks answerable from local code alone.
---

# FinderZ Deep Research Skill

Use the `deep-research` built-in workflow for all deep research tasks. Invoke it with a clear, scoped question.

## When to Use

- **Tech stack questions**: Expo SDK 55, React Native 0.83, NativeWind v5, Drizzle ORM, Better Auth, Neon serverless PostgreSQL
- **Architecture decisions**: State management (Zustand), data fetching (Tanstack Query), routing (expo-router), auth flows
- **Bug investigation**: Runtime errors, infinite render loops, navigation issues, auth token handling
- **Library research**: Compatibility, migration guides, best practices, performance patterns
- **Domain research**: Housing/real-estate app patterns, tenant/landlord portals, Ghana-specific integrations

## How to Invoke

```
workflow({ operation: "run", name: "deep-research", args: "<your research question>" })
```

### Good Prompts

Be specific and scoped:

- "What are the best practices for handling auth token refresh with Better Auth + Expo Secure Store?"
- "How does NativeWind v5 handle platform-specific styles differently from v4?"
- "What causes Maximum update depth exceeded errors with expo-router and React Navigation?"
- "Compare Drizzle ORM vs Prisma for serverless PostgreSQL with Neon"
- "How to implement optimistic updates with Tanstack Query in React Native?"

### Avoid

- Vague questions ("Tell me about React Native")
- Questions answerable by reading a single file in the project
- Questions with a single definitive answer (use docs/grep instead)

## Project Context

| Aspect | Value |
|---|---|
| Framework | Expo SDK 55, expo-router |
| React Native | 0.83.6 |
| Styling | NativeWind v5 (Tailwind 4.3.1) |
| State | Zustand 5, Tanstack Query 5 |
| Auth | Better Auth 1.6 (expo adapter) |
| DB | Drizzle ORM 0.45, Neon PostgreSQL |
| Forms | React Hook Form 7 + Zod 4 |
| Icons | Lucide React Native |

## Architecture Overview

```
src/
├── app/              # Expo Router file-based routing
│   ├── (auth)/       # Auth screens
│   ├── (tenant)/     # Tenant portal
│   ├── (landlord)/   # Landlord portal
│   ├── (super-admin)/# Super Admin portal
│   ├── (public)/     # Public screens
│   └── api/          # API routes
├── components/       # Shared + feature components
├── db/               # Drizzle schema + relations
├── features/         # Feature modules (auth, tenant, landlord, super-admin, onboarding)
├── lib/              # Auth client, env config, API helpers
├── providers/        # Context providers
├── services/         # API clients, queries, mutations
├── store/            # Zustand stores (onboarding, preferences, tenant-filter)
├── types/            # TypeScript types
└── utils/            # Utility functions
```

## Key Patterns

- **Auth**: Better Auth with Expo Secure Store adapter, role-based routing (tenant/landlord/super-admin)
- **Data fetching**: Tanstack Query for server state, Zustand for client state
- **API**: Expo Router API routes (`src/app/api/`), Axios client with interceptors
- **DB**: Drizzle ORM with Neon serverless PostgreSQL, idempotent seed script
- **Styling**: NativeWind v5 with Tailwind 4.3.1, design tokens in `tailwind.config.js`
- **Forms**: React Hook Form with Zod validation

## Output Expectations

Research results should include:
- **Summary**: 2-3 sentence answer
- **Key findings**: Bullet points with source references
- **Recommendations**: Actionable next steps
- **Risks/gotchas**: Compatibility issues or caveats
- **References**: Links to official docs or sources consulted
