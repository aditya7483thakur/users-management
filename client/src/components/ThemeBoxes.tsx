"use client";

import { useThemeStore } from "@/providers/store";
import { changeThemeAPI } from "@/services/auth";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function ThemeBoxes() {
  const { setUser } = useThemeStore();

  const { isPending, mutate, variables } = useMutation({
    mutationFn: changeThemeAPI,
    onSuccess: (data) => {
      {
        console.log(data);
      }
      setUser({ name: data.user.name, theme: data.user.theme });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
  const themes = ["light", "dark", "red"];

  return (
    <div className="flex gap-4">
      {themes.map((t) => (
        <button
          key={t}
          onClick={() => mutate({ theme: t })}
          disabled={isPending}
          className={`w-48 h-48 rounded-lg border hover:cursor-pointer hover:opacity-80 transition-colors ${
            t === "light"
              ? "bg-white text-black"
              : t === "dark"
              ? "bg-black text-white"
              : "bg-red-200 text-red-800"
          } `}
        >
          {isPending && variables?.theme === t ? "Updating" : t}
        </button>
      ))}
    </div>
  );
}
