import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type PreferencesState = {
  colorScheme: "system" | "light" | "dark";
  setColorScheme: (scheme: PreferencesState["colorScheme"]) => void;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      colorScheme: "system",
      setColorScheme: (colorScheme) => set({ colorScheme }),
    }),
    {
      name: "finderz-preferences",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
