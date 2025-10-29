"use client";

import { useThemeStore } from "@/providers/store";
import { changeThemeAPI, deleteCustomThemeAPI } from "@/services/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getTextColor } from "@/utils/getTextColour";
import { Trash2 } from "lucide-react";

export default function ThemeBoxes() {
  const { setUser, customThemes } = useThemeStore();
  const queryClient = useQueryClient();

  const changeTheme = useMutation({
    mutationFn: changeThemeAPI,
    onSuccess: (data) => {
      setUser({ name: data.user.name, theme: data.user.theme });
      toast.success("Theme applied successfully!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteCustomTheme = useMutation({
    mutationFn: (themeName: string) => deleteCustomThemeAPI(themeName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Theme deleted successfully!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const defaultThemes = [
    { name: "light", hex: "#ffffff", isCustom: false },
    { name: "dark", hex: "#000000", isCustom: false },
    { name: "red", hex: "#fecaca", isCustom: false },
  ];

  const allThemes = [...defaultThemes, ...customThemes];

  const handleDeleteTheme = (themeName: string) => {
    deleteCustomTheme.mutate(themeName);
  };

  return (
    <div className="flex flex-wrap gap-6">
      {allThemes.map((t) => {
        const textColor = getTextColor(t.hex);
        const isCustom = customThemes.some((c) => c.name === t.name);

        return (
          <div
            key={t.name}
            className="w-48 rounded border shadow-md overflow-hidden bg-white flex flex-col justify-between transition-all hover:shadow-lg"
          >
            {/* Color preview box with border */}
            <div
              className="h-32 flex items-center justify-center border-white text-lg font-semibold border-20"
              style={{
                backgroundColor: t.hex,
                color: textColor,
              }}
            >
              {t.name}
            </div>

            {/* Buttons row */}
            <div className="flex items-center justify-between p-3 border-t border-black">
              <button
                onClick={() => changeTheme.mutate({ theme: t.hex })}
                disabled={
                  changeTheme.isPending &&
                  changeTheme.variables?.theme === t.hex
                }
                className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-60"
              >
                {changeTheme.isPending && changeTheme.variables?.theme === t.hex
                  ? "Applying..."
                  : "Apply"}
              </button>

              {isCustom && (
                <button
                  onClick={() => handleDeleteTheme(t.name)}
                  className="ml-2 p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                  title="Delete Theme"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
