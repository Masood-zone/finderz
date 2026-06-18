import type { CurrentUserResponse } from "./api";

export type LandlordVerificationStatus = "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED" | "CHANGES_REQUESTED";
export type LandlordPropertyStatus = "all" | "draft" | "pending" | "approved" | "rejected" | "rented";
export type LandlordType = "INDIVIDUAL" | "AGENCY";
export type LandlordContactMethod = "PHONE" | "WHATSAPP" | "EMAIL" | "IN_APP";

export type UploadedAsset = {
  secureUrl: string;
  publicId?: string | null;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
};

export type LandlordProfile = {
  id: string;
  legalName: string | null;
  landlordType: LandlordType;
  agencyName: string | null;
  address: string | null;
  preferredContactMethod: LandlordContactMethod | null;
  identityDocumentType: string | null;
  identityDocumentUrl?: string | null;
  verificationStatus: LandlordVerificationStatus;
  verificationNotes: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LandlordProfileResponse = {
  user: CurrentUserResponse["user"] & {
    image?: string | null;
    emailVerified?: boolean;
  };
  profile: LandlordProfile | null;
};

export type LandlordOnboardingInput = {
  legalName: string;
  phone: string;
  profileImage?: UploadedAsset | null;
  landlordType: LandlordType;
  agencyName?: string | null;
  address: string;
  preferredContactMethod: LandlordContactMethod;
  identityDocumentType: string;
  identityDocument: UploadedAsset;
};

export type LandlordVerificationResponse = {
  status: LandlordVerificationStatus;
  notes: string | null;
  submittedAt: string | null;
  verifiedAt: string | null;
  nextAction: string;
};

export type LandlordPropertyImage = {
  id?: string;
  imageUrl: string;
  publicId?: string | null;
  position: number;
  isCover: boolean;
};

export type LandlordProperty = {
  id: string;
  title: string;
  description: string;
  propertyType: string;
  region: string;
  city: string;
  area: string;
  landmark: string | null;
  address: string;
  latitude: string | null;
  longitude: string | null;
  rentAmount: number;
  paymentPeriod: string;
  advancePeriodMonths: number;
  additionalCharges: string | null;
  bedrooms: number;
  bathrooms: number;
  furnishingStatus: string;
  isNegotiable: boolean;
  isAvailable: boolean;
  approvalStatus: Exclude<LandlordPropertyStatus, "all">;
  rejectionReason: string | null;
  contactPreferences: string | null;
  inspectionAvailability: string | null;
  houseRules: string | null;
  availableFrom: string | null;
  createdAt: string;
  updatedAt: string;
  images: LandlordPropertyImage[];
  amenities: string[];
  enquiryCount: number;
};

export type LandlordDashboardResponse = {
  user: CurrentUserResponse["user"];
  verification: LandlordVerificationResponse;
  stats: {
    totalListings: number;
    activeListings: number;
    pendingListings: number;
    rejectedListings: number;
    rentedListings: number;
    totalEnquiries: number;
  };
  recentEnquiries: LandlordEnquiry[];
  listingPerformance: {
    label: string;
    value: number;
  }[];
  portfolioHighlights: LandlordProperty[];
};

export type LandlordPropertyListResponse = {
  properties: LandlordProperty[];
  counts: Record<LandlordPropertyStatus, number>;
};

export type LandlordEnquiry = {
  id: string;
  status: string;
  preferredContactMethod: string;
  preferredInspectionDate: string | null;
  createdAt: string;
  updatedAt: string;
  tenant: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    image: string | null;
  };
  property: {
    id: string;
    title: string;
    area: string;
    city: string;
  };
};

export type LandlordPropertyDraft = {
  id?: string;
  title: string;
  propertyType: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  furnishingStatus: string;
  isAvailable: boolean;
  region: string;
  city: string;
  area: string;
  landmark?: string | null;
  address: string;
  rentAmountCedis: number;
  paymentPeriod: string;
  advancePeriodMonths: number;
  isNegotiable: boolean;
  additionalCharges?: string | null;
  availableFrom?: string | null;
  amenities: string[];
  images: LandlordPropertyImage[];
  contactPreferences?: string | null;
  inspectionAvailability?: string | null;
  houseRules?: string | null;
};

export type SaveLandlordPropertyInput = LandlordPropertyDraft & {
  submitForApproval?: boolean;
};
