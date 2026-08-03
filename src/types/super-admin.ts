import type { AccountStatus, AppRole } from "./auth";
import type { LandlordProfile, LandlordProperty } from "./landlord";

export type SuperAdminStats = {
  totalUsers: number;
  totalTenants: number;
  totalLandlords: number;
  verifiedLandlords: number;
  pendingLandlordVerifications: number;
  totalProperties: number;
  pendingApprovals: number;
  reportedListings: number;
  activeEnquiries: number;
};

export type SuperAdminActivity = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
  administrator: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export type SuperAdminPropertySummary = LandlordProperty & {
  landlord: {
    id: string;
    userId: string;
    legalName: string | null;
    agencyName: string | null;
    verificationStatus: LandlordProfile["verificationStatus"];
    verifiedAt: string | null;
    user: {
      id: string;
      name: string;
      email: string;
      phone: string | null;
      image: string | null;
      accountStatus: AccountStatus;
    } | null;
  };
  reportCount: number;
};

export type SuperAdminPropertyDetail = SuperAdminPropertySummary & {
  reports: SuperAdminReport[];
  submissionHistory: SuperAdminActivity[];
};

export type SuperAdminReport = {
  id: string;
  reason: string;
  description: string | null;
  status: "OPEN" | "REVIEWING" | "RESOLVED" | "DISMISSED";
  reviewedAt: string | null;
  createdAt: string;
  property: {
    id: string;
    title: string;
    area: string;
    city: string;
    approvalStatus: string;
    isAvailable: boolean;
  } | null;
  owner: {
    profileId: string;
    userId: string;
    name: string;
    email: string;
    phone: string | null;
    accountStatus: AccountStatus;
    listingCount: number;
  } | null;
  reporter: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export type SuperAdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
  role: AppRole;
  accountStatus: AccountStatus;
  onboardingCompleted: boolean;
  createdAt: string;
  landlordVerificationStatus: LandlordProfile["verificationStatus"] | null;
  listingCount: number;
};

export type SuperAdminNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  data: unknown;
  isRead: boolean;
  createdAt: string;
};

export type SuperAdminLandlordVerification = {
  id: string;
  userId: string;
  legalName: string | null;
  landlordType: LandlordProfile["landlordType"];
  agencyName: string | null;
  address: string | null;
  preferredContactMethod: LandlordProfile["preferredContactMethod"];
  identityDocumentType: string | null;
  identityDocumentUrl: string | null;
  verificationStatus: LandlordProfile["verificationStatus"];
  verificationNotes: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    image: string | null;
    accountStatus: AccountStatus;
    onboardingCompleted: boolean;
  } | null;
  listingCount: number;
};

export type SuperAdminLandlordVerificationDetail = SuperAdminLandlordVerification & {
  reviewHistory: SuperAdminActivity[];
};

export type SuperAdminDashboardResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: AppRole;
    onboardingCompleted: boolean;
    accountStatus: AccountStatus;
  };
  stats: SuperAdminStats;
  recentActivity: SuperAdminActivity[];
  recentApprovals: SuperAdminPropertySummary[];
};

export type SuperAdminListResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type PropertyModerationAction = "approve" | "reject" | "request_changes" | "suspend";
export type ReportModerationAction =
  | "start_review"
  | "resolve"
  | "dismiss"
  | "suspend_listing"
  | "suspend_owner";
export type UserModerationAction = "suspend" | "reactivate";
export type LandlordVerificationAction = "approve" | "request_changes" | "reject";
