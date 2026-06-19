import type { CurrentUserResponse } from "./api";

export type TenantPropertySort = "relevance" | "newest" | "lowest-price" | "highest-price";
export type TenantEnquiryStatusFilter = "active" | "awaiting-reply" | "closed";

export type TenantLandlordSummary = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
  verified: boolean;
  activeListings: number;
  memberSince: string;
};

export type TenantProperty = {
  id: string;
  title: string;
  description: string;
  propertyType: string;
  region: string;
  city: string;
  area: string;
  address: string;
  latitude: string | null;
  longitude: string | null;
  distanceKm?: number | null;
  landmark: string | null;
  rentAmount: number;
  paymentPeriod: string;
  bedrooms: number;
  bathrooms: number;
  furnishingStatus: string;
  isNegotiable: boolean;
  isAvailable: boolean;
  approvalStatus: string;
  availableFrom: string | null;
  createdAt: string;
  coverImage: string | null;
  images: {
    id: string;
    url: string;
    isCover: boolean;
    position: number;
  }[];
  amenities: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
  }[];
  landlord: TenantLandlordSummary | null;
  isFavourite: boolean;
};

export type TenantFeedResponse = {
  user: CurrentUserResponse["user"];
  location: string;
  categories: string[];
  recommended: TenantProperty[];
  affordableNearby: TenantProperty[];
  recentlyAdded: TenantProperty[];
  popularLocations: {
    region: string;
    city: string;
    count: number;
  }[];
};

export type TenantPropertySearchResponse = {
  query: {
    q: string | null;
    sort: TenantPropertySort;
    page: number;
    pageSize: number;
  };
  total: number;
  hasMore: boolean;
  properties: TenantProperty[];
};

export type TenantPropertyDetailResponse = {
  property: TenantProperty;
};

export type TenantFavouriteListResponse = {
  favourites: TenantProperty[];
};

export type TenantEnquiry = {
  id: string;
  status: string;
  preferredContactMethod: string;
  preferredInspectionDate: string | null;
  createdAt: string;
  updatedAt: string;
  landlord: Pick<TenantLandlordSummary, "id" | "name" | "email" | "phone" | "image">;
  property: TenantProperty;
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
    isRead: boolean;
  } | null;
  unreadCount: number;
};

export type TenantEnquiryListResponse = {
  enquiries: TenantEnquiry[];
  counts: Record<TenantEnquiryStatusFilter, number>;
};

export type TenantEnquiryDetailResponse = {
  enquiry: TenantEnquiry;
  messages: {
    id: string;
    senderId: string;
    content: string;
    isRead: boolean;
    createdAt: string;
  }[];
};

export type TenantProfileResponse = {
  user: CurrentUserResponse["user"] & {
    image?: string | null;
    emailVerified?: boolean;
  };
  stats: {
    savedProperties: number;
    enquiries: number;
    unreadMessages: number;
  };
};

export type TenantFilters = {
  q?: string;
  region?: string;
  city?: string;
  area?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  minRent?: number;
  maxRent?: number;
  paymentPeriod?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  furnishingStatus?: string;
  availability?: "available" | "unavailable" | "any";
  verifiedOnly?: boolean;
  amenities?: string[];
  sort?: TenantPropertySort;
  page?: number;
};
