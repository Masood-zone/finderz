import { create } from "zustand";
import type { TenantFilters } from "@/types/tenant";

const defaultFilters: TenantFilters = {
  sort: "relevance",
  availability: "available",
  amenities: [],
};

type TenantFilterState = {
  filters: TenantFilters;
  setFilters: (filters: TenantFilters) => void;
  updateFilter: <Key extends keyof TenantFilters>(key: Key, value: TenantFilters[Key]) => void;
  resetFilters: () => void;
};

export const useTenantFilterStore = create<TenantFilterState>((set) => ({
  filters: defaultFilters,
  setFilters: (filters) => set({ filters }),
  updateFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
