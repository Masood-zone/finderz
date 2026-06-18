import { relations } from "drizzle-orm";
import {
  account,
  adminAuditLogs,
  amenities,
  enquiries,
  favourites,
  ghanaCities,
  ghanaRegions,
  landlordProfiles,
  messages,
  notifications,
  properties,
  propertyAmenities,
  propertyImages,
  propertyReports,
  session,
  user,
  verification,
} from "./schema";

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  landlordProfile: one(landlordProfiles),
  favourites: many(favourites),
  tenantEnquiries: many(enquiries, { relationName: "tenant_enquiries" }),
  landlordEnquiries: many(enquiries, { relationName: "landlord_enquiries" }),
  messages: many(messages),
  reports: many(propertyReports, { relationName: "reporter_reports" }),
  reviewedReports: many(propertyReports, { relationName: "reviewed_reports" }),
  notifications: many(notifications),
  auditLogs: many(adminAuditLogs),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const verificationRelations = relations(verification, () => ({}));

export const landlordProfileRelations = relations(landlordProfiles, ({ many, one }) => ({
  user: one(user, { fields: [landlordProfiles.userId], references: [user.id] }),
  properties: many(properties),
}));

export const propertyRelations = relations(properties, ({ many, one }) => ({
  landlord: one(landlordProfiles, { fields: [properties.landlordId], references: [landlordProfiles.id] }),
  images: many(propertyImages),
  amenities: many(propertyAmenities),
  favourites: many(favourites),
  enquiries: many(enquiries),
  reports: many(propertyReports),
}));

export const propertyImageRelations = relations(propertyImages, ({ one }) => ({
  property: one(properties, { fields: [propertyImages.propertyId], references: [properties.id] }),
}));

export const amenityRelations = relations(amenities, ({ many }) => ({
  properties: many(propertyAmenities),
}));

export const propertyAmenityRelations = relations(propertyAmenities, ({ one }) => ({
  property: one(properties, { fields: [propertyAmenities.propertyId], references: [properties.id] }),
  amenity: one(amenities, { fields: [propertyAmenities.amenityId], references: [amenities.id] }),
}));

export const favouriteRelations = relations(favourites, ({ one }) => ({
  user: one(user, { fields: [favourites.userId], references: [user.id] }),
  property: one(properties, { fields: [favourites.propertyId], references: [properties.id] }),
}));

export const enquiryRelations = relations(enquiries, ({ many, one }) => ({
  property: one(properties, { fields: [enquiries.propertyId], references: [properties.id] }),
  tenant: one(user, { fields: [enquiries.tenantId], references: [user.id], relationName: "tenant_enquiries" }),
  landlord: one(user, { fields: [enquiries.landlordId], references: [user.id], relationName: "landlord_enquiries" }),
  messages: many(messages),
}));

export const messageRelations = relations(messages, ({ one }) => ({
  enquiry: one(enquiries, { fields: [messages.enquiryId], references: [enquiries.id] }),
  sender: one(user, { fields: [messages.senderId], references: [user.id] }),
}));

export const propertyReportRelations = relations(propertyReports, ({ one }) => ({
  property: one(properties, { fields: [propertyReports.propertyId], references: [properties.id] }),
  reporter: one(user, { fields: [propertyReports.reporterId], references: [user.id], relationName: "reporter_reports" }),
  reviewer: one(user, { fields: [propertyReports.reviewedBy], references: [user.id], relationName: "reviewed_reports" }),
}));

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(user, { fields: [notifications.userId], references: [user.id] }),
}));

export const adminAuditLogRelations = relations(adminAuditLogs, ({ one }) => ({
  administrator: one(user, { fields: [adminAuditLogs.administratorId], references: [user.id] }),
}));

export const ghanaRegionRelations = relations(ghanaRegions, ({ many }) => ({
  cities: many(ghanaCities),
}));

export const ghanaCityRelations = relations(ghanaCities, ({ one }) => ({
  region: one(ghanaRegions, { fields: [ghanaCities.regionId], references: [ghanaRegions.id] }),
}));
