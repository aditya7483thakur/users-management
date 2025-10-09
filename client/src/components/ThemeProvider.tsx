"use client";
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ setTheme: (t: string) => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored) setThemeState(stored);
  }, []);

  const setTheme = (newTheme: string) => {
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ setTheme }}>
      <div>{children}</div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
