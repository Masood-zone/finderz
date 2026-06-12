import { RouteGuard } from "@/components/shared/route-guard";

export default function LandlordLayout() {
  return <RouteGuard roles={["LANDLORD"]} />;
}
