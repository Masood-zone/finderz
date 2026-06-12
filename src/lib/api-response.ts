import { ZodError } from "zod";
import type { ApiErrorBody, ApiSuccess } from "@/types/api";

export function successResponse<T>(data: T, init?: { message?: string; status?: number }) {
  const body: ApiSuccess<T> = {
    success: true,
    data,
    ...(init?.message ? { message: init.message } : {}),
  };

  return Response.json(body, { status: init?.status ?? 200 });
}

export function errorResponse(code: string, message: string, status: number, fieldErrors?: Record<string, string[]>) {
  const body: ApiErrorBody = {
    success: false,
    error: {
      code,
      message,
      ...(fieldErrors ? { fieldErrors } : {}),
    },
  };

  return Response.json(body, { status });
}

export function validationErrorResponse(error: ZodError) {
  return errorResponse("VALIDATION_ERROR", "Please check the submitted fields.", 400, error.flatten().fieldErrors);
}

export function unauthorizedResponse() {
  return errorResponse("UNAUTHORIZED", "You must be signed in to access this resource.", 401);
}

export function forbiddenResponse() {
  return errorResponse("FORBIDDEN", "You do not have permission to access this resource.", 403);
}

export function suspendedResponse() {
  return errorResponse("ACCOUNT_SUSPENDED", "This account is suspended.", 423);
}

export function notFoundResponse(message = "The requested resource was not found.") {
  return errorResponse("NOT_FOUND", message, 404);
}

export function internalServerErrorResponse() {
  return errorResponse("INTERNAL_SERVER_ERROR", "Something went wrong. Please try again.", 500);
}
