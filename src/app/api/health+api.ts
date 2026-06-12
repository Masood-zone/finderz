export function GET() {
  return Response.json({
    ok: true,
    service: "finderz",
    timestamp: new Date().toISOString(),
  });
}
