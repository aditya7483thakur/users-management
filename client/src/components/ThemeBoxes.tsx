"use client";
import { useState } from "react";

export default function ThemeBoxes() {
  const [theme, setThemeState] = useState("light");
  // const { setTheme } = useTheme();

  const themes = ["light", "dark", "red"];

  const setTheme = (newTheme: string) => {
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    setThemeState(newTheme);
  };

  return (
    <div className="flex gap-4">
      {themes.map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          className={`w-20 h-20 rounded-lg border hover:opacity-80 ${
            t === "light"
              ? "bg-white text-black"
              : t === "dark"
              ? "bg-black text-white"
              : "bg-red-200 text-red-800"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
