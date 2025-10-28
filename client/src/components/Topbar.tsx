"use client";

import { logoutAPI } from "@/services/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useThemeStore } from "@/providers/store";

export default function Topbar() {
  const router = useRouter();
  const { name } = useThemeStore();
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: logoutAPI,
    onSuccess: (data) => {
      queryClient.clear();
      localStorage.removeItem("token");
      toast.success(data.message);
      router.push("/login");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const handleLogout = () => mutate();
  const handleProfileClick = () => router.push("/dashboard/edit-profile");

  return (
    <header className="flex justify-between items-center p-4 border-b">
      <span className="font-bold text-2xl px-2 py-1 rounded">Hi {name} 👋</span>

      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full overflow-hidden border cursor-pointer"
          onClick={handleProfileClick}
        >
          <Image src="/default-user.jpg" alt="User" width={40} height={40} />
        </div>

        <button
          onClick={handleLogout}
          disabled={isPending}
          className="px-4 hover:cursor-pointer py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: "var(--foreground)",
            color: "var(--background)",
          }}
        >
          {isPending ? "Logging out..." : "Logout"}
        </button>
      </div>
    </header>
  );
}
