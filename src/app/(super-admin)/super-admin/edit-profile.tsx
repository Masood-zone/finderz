import { AccountEditorForm } from "@/components/profile/account-editor-form";
import { SuperAdminShell } from "@/components/super-admin/super-admin-shell";

export default function SuperAdminEditProfileScreen() {
  return (
    <SuperAdminShell title="Edit Profile" subtitle="Manage your administrator identity and password.">
      <AccountEditorForm fallbackHref="/super-admin/profile" />
    </SuperAdminShell>
  );
}
