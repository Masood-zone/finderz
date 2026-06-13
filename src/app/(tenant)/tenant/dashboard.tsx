import { useEffect } from "react";
import { router } from "expo-router";
import { LoadingScreen } from "@/components/shared/loading-screen";

export default function TenantDashboardRedirect() {
  useEffect(() => {
    router.replace("/tenant");
  }, []);

  return <LoadingScreen />;
}
