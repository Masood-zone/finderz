Stop feature development and fix Expo API route handler patterns immediately.

The current FinderZ app has multiple Expo Router API routes that were written using the Next.js route-handler pattern:

```ts
export async function GET(
  request: Request,
  { params }: { params: { propertyId: string } },
) {
  // params.propertyId
}
```

This is wrong for Expo Router API routes.

In Expo Router API routes, dynamic route params are passed directly in the second argument:

```ts
export async function GET(
  request: Request,
  { propertyId }: { propertyId: string },
) {
  // propertyId
}
```

Your task is to audit and fix every API route file in the project.

---

## 1. Scope

Inspect every file matching:

```txt
app/api/**/+api.ts
app/api/**/*+api.ts
```

Also inspect any route-like API files outside `app/api` if they exist.

Find all handlers using the wrong Next.js-style pattern:

```ts
{
  params;
}
params.id;
params.propertyId;
params.userId;
params.reportId;
params.notificationId;
params.enquiryId;
params.landlordId;
params.tenantId;
```

Replace them with the Expo Router API route pattern.

---

## 2. Correct Expo API Route Pattern

For a route like:

```txt
app/api/properties/[propertyId]/+api.ts
```

or:

```txt
app/api/properties/[propertyId]+api.ts
```

Use:

```ts
type RouteParams = {
  propertyId: string;
};

export async function GET(request: Request, { propertyId }: RouteParams) {
  // use propertyId directly
}
```

Do not use:

```ts
export async function GET(
  request: Request,
  { params }: { params: RouteParams },
) {
  // wrong for Expo API routes
}
```

---

## 3. Fix All HTTP Methods

Apply the fix to every handler method:

```ts
GET;
POST;
PUT;
PATCH;
DELETE;
OPTIONS;
HEAD;
```

For example, change this:

```ts
export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } },
) {
  const user = await getUser(params.userId);
}
```

To this:

```ts
type RouteParams = {
  userId: string;
};

export async function PATCH(request: Request, { userId }: RouteParams) {
  const user = await getUser(userId);
}
```

---

## 4. Validate Route Parameter Names

For every dynamic API route, confirm that the parameter name matches the folder or file name.

Examples:

```txt
app/api/properties/[propertyId]/+api.ts
→ { propertyId }

app/api/enquiries/[enquiryId]/+api.ts
→ { enquiryId }

app/api/reports/[reportId]/+api.ts
→ { reportId }

app/api/notifications/[notificationId]/read/+api.ts
→ { notificationId }

app/api/super-admin/users/[userId]/suspend/+api.ts
→ { userId }
```

If a file is named:

```txt
[id]/+api.ts
```

then the handler must use:

```ts
{
  id;
}
```

not:

```ts
{
  propertyId;
}
```

Rename the route folder/file if necessary so the dynamic param names are meaningful and consistent.

---

## 5. Add Defensive Param Validation

For every dynamic route, add a guard before using the param:

```ts
if (!propertyId) {
  return badRequestResponse("Property ID is required.");
}
```

If `badRequestResponse` does not exist, create a reusable helper in the existing API response helper file.

Suggested helper:

```ts
export function badRequestResponse(message = "Bad request.") {
  return Response.json(
    {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message,
      },
    },
    { status: 400 },
  );
}
```

Use specific messages:

```txt
Property ID is required.
User ID is required.
Report ID is required.
Notification ID is required.
Enquiry ID is required.
```

Do not let missing params produce `500`.

---

## 6. Preserve Existing Business Logic

Do not rewrite the business logic unless required.

Only update:

- handler signatures,
- param access,
- missing-param validation,
- route naming where necessary,
- tests or service URLs affected by route naming.

Do not change:

- database schema,
- migrations,
- Better Auth setup,
- authorization logic,
- Drizzle queries,
- notification logic,
- UI screens,
- app navigation,
- environment variables.

---

## 7. Check Client API Calls Too

After fixing server routes, inspect the matching client service files:

```txt
services/api/**
features/**/services/**
features/**/hooks/**
```

Ensure no client calls are using literal placeholder URLs like:

```ts
api.get("/api/properties/[propertyId]");
api.get(`/api/properties/${undefined}`);
api.get(`/api/approvals/${propertyId}`); // only okay if propertyId is valid
```

Correct pattern:

```ts
if (!propertyId) {
  throw new Error("Property ID is required.");
}

return api.get(`/api/properties/${propertyId}`);
```

React Query hooks must not call dynamic API routes when the ID is missing.

Use:

```ts
enabled: Boolean(propertyId);
```

for detail queries.

---

## 8. Check These Likely FinderZ Routes

Audit at least these routes if they exist:

```txt
app/api/properties/[propertyId]/+api.ts
app/api/properties/[propertyId]+api.ts
app/api/approvals/[propertyId]/+api.ts
app/api/approvals/[propertyId]+api.ts
app/api/enquiries/[enquiryId]/+api.ts
app/api/favourites/[propertyId]/+api.ts
app/api/notifications/[notificationId]/read/+api.ts
app/api/super-admin/reports/[reportId]/+api.ts
app/api/super-admin/users/[userId]/suspend/+api.ts
app/api/super-admin/users/[userId]/reactivate/+api.ts
app/api/landlord/properties/[propertyId]/+api.ts
app/api/tenant/properties/[propertyId]/+api.ts
```

If some of them do not exist, simply report them as not found.

---

## 9. Logging and Error Handling

For each fixed route, make sure unexpected errors are logged server-side with a route label.

Example:

```ts
console.error("GET /api/properties/[propertyId] failed:", error);
return internalServerErrorResponse();
```

Do not expose stack traces to the mobile app.

Authorization errors should still go through the existing guard response helpers.

---

## 10. Test Every Fixed Route

After fixing, run:

```bash
pnpm typecheck
pnpm lint
```

Then test the affected endpoints.

For authenticated endpoints, expected unauthenticated results may be:

```txt
401 Unauthorized
403 Forbidden
```

Those are acceptable.

Unacceptable results:

```txt
500 Internal Server Error
Cannot read properties of undefined
Cannot read properties of undefined (reading 'propertyId')
Cannot read properties of undefined (reading 'params')
```

Test with curl or the app’s API client.

---

## 11. Final Report

At the end, provide:

1. Every API file inspected
2. Every route using the wrong Next.js-style `{ params }` pattern
3. Every file changed
4. Old handler signature
5. New Expo handler signature
6. Any route folder/file renamed
7. Client API calls fixed
8. React Query hooks fixed
9. Commands executed
10. TypeScript result
11. Lint result
12. Endpoint test results
13. Remaining issues

Stop after fixing Expo API route handler patterns.
