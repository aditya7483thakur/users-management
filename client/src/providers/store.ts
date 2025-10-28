import { create } from "zustand";

interface CustomTheme {
  _id: string;
  name: string;
  hex: string;
}

interface ThemeState {
  name: string;
  theme: string;
  email: string;
  customThemes: CustomTheme[];
  setUser: (data: Partial<ThemeState>) => void;
  setCustomThemes: (themes: CustomTheme[]) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  name: "",
  theme: "light",
  email: "",
  customThemes: [],
  setUser: (data) => set((state) => ({ ...state, ...data })),
  setCustomThemes: (themes) => set({ customThemes: themes }),
}));
