import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { forbiddenResponse, suspendedResponse, unauthorizedResponse } from "@/lib/api-response";
import type { AppRole, FinderZUser } from "@/types/auth";

export type AuthenticatedContext = {
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;
  user: FinderZUser;
};

export class ApiGuardError extends Error {
  constructor(public response: Response) {
    super("API guard failed");
  }
}

export async function getAuthenticatedUser(request: Request): Promise<AuthenticatedContext | null> {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user?.id) {
    return null;
  }

  const currentUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  if (!currentUser) {
    return null;
  }

  return {
    session,
    user: currentUser,
  };
}

export async function requireSession(request: Request) {
  const context = await getAuthenticatedUser(request);

  if (!context) {
    throw new ApiGuardError(unauthorizedResponse());
  }

  if (context.user.accountStatus === "SUSPENDED") {
    throw new ApiGuardError(suspendedResponse());
  }

  return context;
}

export async function requireRole(request: Request, roles: readonly AppRole[]) {
  const context = await requireSession(request);

  if (!roles.includes(context.user.role)) {
    throw new ApiGuardError(forbiddenResponse());
  }

  return context;
}

export function guardErrorResponse(error: unknown) {
  if (error instanceof ApiGuardError) {
    return error.response;
  }

  throw error;
}

export function requireTenant(request: Request) {
  return requireRole(request, ["TENANT"]);
}

export function requireLandlord(request: Request) {
  return requireRole(request, ["LANDLORD"]);
}

export function requireSuperAdmin(request: Request) {
  return requireRole(request, ["SUPER_ADMIN"]);
}
