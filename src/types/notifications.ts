export type NotificationCategory = "GENERAL" | "PROPERTY" | "VERIFICATION" | "ENQUIRY" | "REPORT" | "ACCOUNT";
export type AppNotification = {
  id: string; type: string; category: NotificationCategory; eventKey: string;
  priority: "NORMAL" | "HIGH" | "CRITICAL"; title: string; message: string;
  deepLink: string | null; relatedEntityType: string | null; relatedEntityId: string | null;
  data: unknown; isRead: boolean; readAt: string | null; createdAt: string;
};
export type NotificationPreference = { category: NotificationCategory; emailEnabled: boolean; smsEnabled: boolean; pushEnabled: boolean };
