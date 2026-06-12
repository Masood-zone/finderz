import { RouteGuard } from "@/components/shared/route-guard";

export default function SuperAdminLayout() {
  return <RouteGuard roles={["SUPER_ADMIN"]} />;
}
