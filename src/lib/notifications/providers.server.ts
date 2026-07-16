import nodemailer from "nodemailer";

export type ProviderResult = { reference?: string };

export function normalizeGhanaPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (/^0\d{9}$/.test(digits)) return `+233${digits.slice(1)}`;
  if (/^233\d{9}$/.test(digits)) return `+${digits}`;
  if (/^\d{9}$/.test(digits)) return `+233${digits}`;
  if (/^\+233\d{9}$/.test(value.replace(/\s/g, ""))) return value.replace(/\s/g, "");
  throw new Error("Invalid Ghana phone number");
}

export async function sendNotificationEmail(to: string, subject: string, message: string): Promise<ProviderResult> {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) throw new Error("SMTP is not configured");
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  const result = await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text: message,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>${escapeHtml(subject)}</h2><p>${escapeHtml(message)}</p><p style="color:#667085">FinderZ Housing</p></div>`,
  });
  return { reference: result.messageId };
}

export async function sendNotificationSms(to: string, message: string): Promise<ProviderResult> {
  const url = process.env.UELLOSEND_API_URL;
  if (!url || !process.env.UELLOSEND_API_KEY || !process.env.UELLOSEND_API_SECRET || !process.env.UELLOSEND_SENDER_ID) throw new Error("UelloSend is not configured");
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": process.env.UELLOSEND_API_KEY, "x-api-secret": process.env.UELLOSEND_API_SECRET },
    body: JSON.stringify({ recipient: normalizeGhanaPhone(to), senderId: process.env.UELLOSEND_SENDER_ID, message }),
  });
  if (!response.ok) throw new Error(`UelloSend rejected the request (${response.status})`);
  const body = await response.json().catch(() => ({})) as { id?: string; reference?: string };
  return { reference: body.id ?? body.reference };
}

export async function sendExpoPush(tokens: string[], title: string, body: string, deepLink?: string | null): Promise<ProviderResult> {
  if (!tokens.length) throw new Error("No active push token");
  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(process.env.EXPO_ACCESS_TOKEN ? { Authorization: `Bearer ${process.env.EXPO_ACCESS_TOKEN}` } : {}) },
    body: JSON.stringify(tokens.map((to) => ({ to, title, body, sound: "default", data: deepLink ? { deepLink } : {} }))),
  });
  if (!response.ok) throw new Error(`Expo Push rejected the request (${response.status})`);
  return {};
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]!);
}
