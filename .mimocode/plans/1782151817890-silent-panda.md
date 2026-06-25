# Plan: Landlord Enquiry Details Screen with Messaging

## Context

The landlord enquiries tab (`src/app/(landlord)/landlord/(tabs)/enquiries.tsx`) currently shows a flat list of enquiry cards with tenant name, property, preferred contact method, and status — but tapping a card does nothing. Landlords need a detail screen to view the conversation thread and reply to tenants.

The tenant side already has a similar pattern at `src/app/(tenant)/tenant/enquiry/[enquiryId].tsx`, but it's read-only (shows messages + "Call Landlord" button, no message input). The landlord version should be full read-write: view messages and send new ones.

## What's needed

### 1. API Layer

**`src/app/api/landlord/enquiries/[enquiryId]+api.ts`** — new file
- `GET` — fetch enquiry detail + messages for the landlord (must verify `landlordId` matches the authenticated user)
- Mirrors the tenant pattern at `src/app/api/tenant/enquiries/[enquiryId]+api.ts`

**`src/app/api/landlord/enquiries/[enquiryId]/message+api.ts`** — new file
- `POST` — send a message from the landlord on an enquiry (body: `{ content: string }`)
- Verifies landlord owns the enquiry, inserts into `messages` table, updates enquiry `status` to `RESPONDED` and `updatedAt`
- Returns the new message

**`src/lib/landlord/landlord.server.ts`** — extend
- Add `getLandlordEnquiryDetail(landlordUserId, enquiryId)` — fetch enquiry + tenant + property + messages, verify ownership
- Add `sendLandlordMessage(landlordUserId, enquiryId, content)` — insert message, update enquiry status

### 2. Client API Functions

**`src/services/api/landlord.ts`** — extend
- Add `getLandlordEnquiryDetail(enquiryId: string)` → `GET /api/landlord/enquiries/${enquiryId}`
- Add `sendLandlordMessage(enquiryId: string, content: string)` → `POST /api/landlord/enquiries/${enquiryId}/message`

### 3. Types

**`src/types/landlord.ts`** — extend
- Add `LandlordEnquiryDetailResponse` (enquiry summary + messages array)
- Add `LandlordEnquiryMessage` type

### 4. Query Keys & Hooks

**`src/services/queries/keys.ts`** — extend
- Add `landlordEnquiry: (enquiryId: string) => ["landlord-enquiry", enquiryId]`

**`src/services/queries/hooks.ts`** — extend
- Add `useLandlordEnquiry(enquiryId)` query hook
- Add `useSendLandlordMessage()` mutation hook (invalidates the enquiry query on success)

### 5. UI — Enquiry Detail Screen

**`src/app/(landlord)/landlord/enquiry/[enquiryId].tsx`** — new file
- Pattern: mirrors `src/app/(tenant)/tenant/enquiry/[enquiryId].tsx` but with a message input
- **Header**: back button, tenant name, property title, phone number
- **Message thread**: ScrollView with chat bubbles (landlord messages right/primary-colored, tenant messages left/surface-colored)
- **Message input bar** at bottom: `TextInput` + Send button (`AppButton` or `Pressable` with `Send` icon from lucide)
- Loading/error/empty states using the existing `LandlordCard` and `AppText` components
- Uses `SafeAreaScreen` pattern from tenant detail

### 6. Enquiries List — Add Navigation

**`src/app/(landlord)/landlord/(tabs)/enquiries.tsx`** — modify
- Wrap each `LandlordCard` in a `Pressable` or use `Link` from `expo-router` to navigate to `/landlord/enquiry/${enquiry.id}`
- Add `MessageCircle` icon or unread indicator if there are unread messages

## Files to create
| File | Purpose |
|------|---------|
| `src/app/api/landlord/enquiries/[enquiryId]+api.ts` | GET enquiry detail + messages |
| `src/app/api/landlord/enquiries/[enquiryId]/message+api.ts` | POST send message |
| `src/app/(landlord)/landlord/enquiry/[enquiryId].tsx` | Enquiry detail screen |

## Files to modify
| File | Change |
|------|--------|
| `src/lib/landlord/landlord.server.ts` | Add enquiry detail + send message server functions |
| `src/services/api/landlord.ts` | Add client API functions |
| `src/types/landlord.ts` | Add detail response and message types |
| `src/services/queries/keys.ts` | Add `landlordEnquiry` key |
| `src/services/queries/hooks.ts` | Add `useLandlordEnquiry` + `useSendLandlordMessage` |
| `src/app/(landlord)/landlord/(tabs)/enquiries.tsx` | Add navigation to detail screen |

## Verification
1. `pnpm typecheck` — ensure no type errors
2. `pnpm lint` — ensure no lint errors
3. Manual: navigate Landlord → Enquiries tab → tap an enquiry → see detail with messages → type and send a message → verify it appears in the thread
4. Verify tenant-side still works (existing enquiry detail unchanged)
