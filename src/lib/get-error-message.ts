export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (!error) {
    return fallback;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object") {
    const maybeError = error as {
      error?: { message?: string };
      message?: string;
      data?: { error?: { message?: string }; message?: string };
    };

    return maybeError.error?.message ?? maybeError.data?.error?.message ?? maybeError.data?.message ?? maybeError.message ?? fallback;
  }

  return fallback;
}
