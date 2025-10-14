import { create } from "zustand";

interface ThemeState {
  name: string;
  theme: string;
  email: string;
  setUser: (data: Partial<ThemeState>) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  name: "",
  theme: "light",
  email: "",
  setUser: (data) => set((state) => ({ ...state, ...data })),
}));
