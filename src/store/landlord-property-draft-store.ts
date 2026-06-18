import { create } from "zustand";
import type { LandlordPropertyDraft } from "@/types/landlord";

export const initialLandlordPropertyDraft: LandlordPropertyDraft = {
  title: "",
  propertyType: "APARTMENT",
  description: "",
  bedrooms: 1,
  bathrooms: 1,
  furnishingStatus: "UNFURNISHED",
  isAvailable: true,
  region: "",
  city: "",
  area: "",
  landmark: "",
  address: "",
  latitude: "",
  longitude: "",
  rentAmountCedis: 0,
  paymentPeriod: "MONTHLY",
  advancePeriodMonths: 1,
  isNegotiable: false,
  additionalCharges: "",
  availableFrom: "",
  amenities: [],
  images: [],
  contactPreferences: "PHONE",
  inspectionAvailability: "",
  houseRules: "",
};

type LandlordPropertyDraftStore = {
  draft: LandlordPropertyDraft;
  mergeDraft: (patch: Partial<LandlordPropertyDraft>) => void;
  resetDraft: () => void;
  loadDraft: (draft: LandlordPropertyDraft) => void;
};

export const useLandlordPropertyDraftStore = create<LandlordPropertyDraftStore>((set) => ({
  draft: initialLandlordPropertyDraft,
  mergeDraft: (patch) => set((state) => ({ draft: { ...state.draft, ...patch } })),
  resetDraft: () => set({ draft: initialLandlordPropertyDraft }),
  loadDraft: (draft) => set({ draft: { ...initialLandlordPropertyDraft, ...draft } }),
}));
