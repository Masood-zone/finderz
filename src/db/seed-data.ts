export const propertyTypes = ["APARTMENT", "HOUSE", "ROOM", "STUDIO", "HOSTEL", "COMMERCIAL"] as const;

export const ghanaSampleLocations = [
  { region: "Greater Accra", city: "Accra", areas: ["East Legon", "Osu", "Adenta", "Madina"] },
  { region: "Ashanti", city: "Kumasi", areas: ["Asokwa", "Bantama", "Ahodwo", "Ejisu"] },
  { region: "Western", city: "Takoradi", areas: ["Airport Ridge", "Anaji", "Kwesimintsim"] },
  { region: "Northern", city: "Tamale", areas: ["Kalpohin", "Lamashegu", "Nyohini"] },
];

export const standardAmenities = [
  { id: "amenity-air-conditioning", name: "Air conditioning", slug: "air-conditioning", icon: "snowflake" },
  { id: "amenity-water-supply", name: "Reliable water supply", slug: "water-supply", icon: "droplets" },
  { id: "amenity-parking", name: "Parking", slug: "parking", icon: "car" },
  { id: "amenity-security", name: "Security", slug: "security", icon: "shield" },
  { id: "amenity-wifi", name: "Wi-Fi", slug: "wifi", icon: "wifi" },
  { id: "amenity-generator", name: "Backup generator", slug: "backup-generator", icon: "zap" },
  { id: "amenity-kitchen", name: "Kitchen", slug: "kitchen", icon: "utensils" },
  { id: "amenity-balcony", name: "Balcony", slug: "balcony", icon: "building" },
];
