import { create } from "zustand";

interface ThemeState {
  name: string;
  theme: string;
  email: string;
  setUser: (name: string, theme: string, email: string) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  name: "",
  theme: "light",
  email: "",
  setUser: (name, theme, email) => set({ name, theme, email }),
}));
