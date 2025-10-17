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

  const themeStyles = {
    backgroundColor: "var(--bg)",
    color: "var(--text)",
    borderColor: "var(--text)",
  };

  return (
    <header
      className="flex justify-between items-center p-4 border-b"
      style={{
        backgroundColor: "var(--bg)",
        color: "var(--text)",
        borderColor: "var(--text)",
      }}
    >
      {/* Left side: Greeting */}
      <span
        style={themeStyles}
        className="font-bold text-2xl px-2 py-1 rounded"
      >
        Hi {name} 👋
      </span>

      {/* Right side: Profile image + Logout */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full overflow-hidden border cursor-pointer"
          style={themeStyles}
          onClick={handleProfileClick}
        >
          <Image
            src="/default-user.jpg" // replace with actual user image
            alt="User"
            width={40}
            height={40}
          />
        </div>

        <button
          onClick={handleLogout}
          disabled={isPending}
          className="px-4 hover:cursor-pointer py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: "var(--text)",
            color: "var(--bg)",
            opacity: isPending ? 0.6 : 1,
          }}
        >
          {isPending ? "Logging out..." : "Logout"}
        </button>
      </div>
    </header>
  );
}
