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

export const ghanaRegionsWithCities = [
  {
    id: "region-ahafo",
    name: "Ahafo",
    slug: "ahafo",
    capital: "Goaso",
    cities: ["Goaso", "Bechem", "Duayaw Nkwanta", "Kenyasi", "Hwidiem", "Mim", "Kukuom"],
  },
  {
    id: "region-ashanti",
    name: "Ashanti",
    slug: "ashanti",
    capital: "Kumasi",
    cities: ["Kumasi", "Obuasi", "Ejisu", "Mampong", "Konongo", "Bekwai", "Agogo", "Asante Akyem Agogo", "Nkawie", "Offinso", "Juaben"],
  },
  {
    id: "region-bono",
    name: "Bono",
    slug: "bono",
    capital: "Sunyani",
    cities: ["Sunyani", "Berekum", "Dormaa Ahenkro", "Wenchi", "Nsoatre", "Drobo", "Sampa"],
  },
  {
    id: "region-bono-east",
    name: "Bono East",
    slug: "bono-east",
    capital: "Techiman",
    cities: ["Techiman", "Kintampo", "Atebubu", "Nkoranza", "Yeji", "Prang", "Tuobodom"],
  },
  {
    id: "region-central",
    name: "Central",
    slug: "central",
    capital: "Cape Coast",
    cities: ["Cape Coast", "Kasoa", "Winneba", "Mankessim", "Swedru", "Elmina", "Saltpond", "Dunkwa-on-Offin", "Assin Fosu"],
  },
  {
    id: "region-eastern",
    name: "Eastern",
    slug: "eastern",
    capital: "Koforidua",
    cities: ["Koforidua", "Nkawkaw", "Akim Oda", "Somanya", "Suhum", "Nsawam", "Aburi", "Akropong", "Kibi", "Asamankese"],
  },
  {
    id: "region-greater-accra",
    name: "Greater Accra",
    slug: "greater-accra",
    capital: "Accra",
    cities: ["Accra", "Tema", "Madina", "Adenta", "Ashaiman", "Teshie", "Nungua", "Dodowa", "Amasaman", "Dome", "Kasoa", "East Legon"],
  },
  {
    id: "region-north-east",
    name: "North East",
    slug: "north-east",
    capital: "Nalerigu",
    cities: ["Nalerigu", "Walewale", "Gambaga", "Bunkpurugu", "Chereponi", "Yagaba"],
  },
  {
    id: "region-northern",
    name: "Northern",
    slug: "northern",
    capital: "Tamale",
    cities: ["Tamale", "Yendi", "Savelugu", "Bimbilla", "Karaga", "Tolon", "Gushegu", "Wulensi"],
  },
  {
    id: "region-oti",
    name: "Oti",
    slug: "oti",
    capital: "Dambai",
    cities: ["Dambai", "Kete Krachi", "Nkwanta", "Jasikan", "Kadjebi", "Chinderi", "Akan"],
  },
  {
    id: "region-savannah",
    name: "Savannah",
    slug: "savannah",
    capital: "Damongo",
    cities: ["Damongo", "Bole", "Salaga", "Sawla", "Daboya", "Buipe", "Busunu"],
  },
  {
    id: "region-upper-east",
    name: "Upper East",
    slug: "upper-east",
    capital: "Bolgatanga",
    cities: ["Bolgatanga", "Navrongo", "Bawku", "Paga", "Zebilla", "Sandema", "Tongo"],
  },
  {
    id: "region-upper-west",
    name: "Upper West",
    slug: "upper-west",
    capital: "Wa",
    cities: ["Wa", "Tumu", "Lawra", "Jirapa", "Nandom", "Nadowli", "Gwollu"],
  },
  {
    id: "region-volta",
    name: "Volta",
    slug: "volta",
    capital: "Ho",
    cities: ["Ho", "Hohoe", "Keta", "Anloga", "Sogakope", "Akatsi", "Kpando", "Aflao", "Dzodze"],
  },
  {
    id: "region-western",
    name: "Western",
    slug: "western",
    capital: "Sekondi-Takoradi",
    cities: ["Sekondi-Takoradi", "Tarkwa", "Axim", "Prestea", "Daboase", "Shama", "Agona Nkwanta", "Half Assini"],
  },
  {
    id: "region-western-north",
    name: "Western North",
    slug: "western-north",
    capital: "Sefwi Wiawso",
    cities: ["Sefwi Wiawso", "Bibiani", "Enchi", "Juaboso", "Awaso", "Asankragwa", "Akontombra"],
  },
] as const;
