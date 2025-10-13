"use client";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useThemeStore } from "@/providers/store";
import { getProfileAPI } from "@/services/auth";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, setUser } = useThemeStore();
  const router = useRouter();

  const { data, isPending, isError } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfileAPI,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });

  useEffect(() => {
    if (isError) router.replace("/login");
  }, [isError]);

  useEffect(() => {
    if (data) {
      setUser(data.name, data.theme || "light", data.email);
    }
  }, [data, setUser]);

  if (isPending || isError) {
    return (
      <div className="flex items-center justify-center h-screen bg-base-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-600 font-medium animate-pulse">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen theme-${theme} flex`}>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar name={data?.name} />
        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}
