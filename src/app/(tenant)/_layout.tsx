import { RouteGuard } from "@/components/shared/route-guard";

export default function TenantLayout() {
  return <RouteGuard roles={["TENANT"]} />;
}
