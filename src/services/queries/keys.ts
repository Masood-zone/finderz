export const queryKeys = {
  currentUser: ["current-user"] as const,
  tenantDashboard: ["tenant-dashboard"] as const,
  tenantFeed: ["tenant-feed"] as const,
  tenantProperties: (filters: unknown) => ["tenant-properties", filters] as const,
  tenantProperty: (propertyId: string) => ["tenant-property", propertyId] as const,
  tenantFavourites: ["tenant-favourites"] as const,
  tenantEnquiries: (status: string) => ["tenant-enquiries", status] as const,
  tenantEnquiry: (enquiryId: string) => ["tenant-enquiry", enquiryId] as const,
  tenantProfile: ["tenant-profile"] as const,
  landlordDashboard: ["landlord-dashboard"] as const,
  superAdminDashboard: ["super-admin-dashboard"] as const,
};
