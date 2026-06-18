import { Redirect, type Href } from "expo-router";

export default function LegacySuperAdminDashboardRoute() {
  return <Redirect href={"/super-admin" as Href} />;
}
