export const APP_ROLES = ["TENANT", "LANDLORD", "SUPER_ADMIN"] as const;
export const PUBLIC_ONBOARDING_ROLES = ["TENANT", "LANDLORD"] as const;
export const ACCOUNT_STATUSES = ["ACTIVE", "SUSPENDED", "PENDING"] as const;

export type AppRole = (typeof APP_ROLES)[number];
export type PublicOnboardingRole = (typeof PUBLIC_ONBOARDING_ROLES)[number];
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export type FinderZUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  phone: string | null;
  role: AppRole;
  onboardingCompleted: boolean;
  accountStatus: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthSessionUser = Omit<FinderZUser, "createdAt" | "updatedAt"> & {
  createdAt?: Date | string;
  updatedAt?: Date | string;
};
