import { successResponse } from "@/lib/api-response";

export function GET() {
  return successResponse({
    service: "finderz",
    timestamp: new Date().toISOString(),
  });
}
