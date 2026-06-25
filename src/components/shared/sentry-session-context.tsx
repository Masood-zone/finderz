import { setMonitoringUserId } from "@/lib/monitoring";
import { useTypedSession } from "@/lib/auth-client";
import { useEffect } from "react";

export function SentrySessionContext() {
  const session = useTypedSession();
  const userId = session.data?.user?.id;

  useEffect(() => {
    setMonitoringUserId(userId);
  }, [userId]);

  return null;
}
