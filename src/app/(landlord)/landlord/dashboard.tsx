import { Redirect, type Href } from "expo-router";

export default function LegacyLandlordDashboardRoute() {
  return <Redirect href={"/landlord" as Href} />;
}
