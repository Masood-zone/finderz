import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { PublicOnboardingRole } from "@/types/auth";

type OnboardingState = {
  hasSeenPublicOnboarding: boolean;
  selectedRole: PublicOnboardingRole | null;
  setHasSeenPublicOnboarding: (value: boolean) => void;
  setSelectedRole: (role: PublicOnboardingRole | null) => void;
  resetOnboardingDraft: () => void;
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasSeenPublicOnboarding: false,
      selectedRole: null,
      setHasSeenPublicOnboarding: (value) => set({ hasSeenPublicOnboarding: value }),
      setSelectedRole: (role) => set({ selectedRole: role }),
      resetOnboardingDraft: () => set({ selectedRole: null }),
    }),
    {
      name: "finderz-onboarding",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasSeenPublicOnboarding: state.hasSeenPublicOnboarding,
        selectedRole: state.selectedRole,
      }),
    },
  ),
);
