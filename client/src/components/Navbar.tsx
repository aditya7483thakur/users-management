"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathName = usePathname() ?? "/";
  if (pathName.startsWith("/dashboard")) {
    return null;
  }
  return (
    <nav
      className="flex justify-between items-center px-8 py-4 border-b shadow-sm sticky top-0 z-10 transition-colors"
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <h2 className="text-2xl font-semibold text-[var(--primary,#2679f3)]">
        MyApp
      </h2>

      <div className="space-x-6 font-medium">
        <Link
          href="/login"
          className="hover:text-[var(--primary,#2679f3)] transition-colors"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="hover:text-[var(--primary,#2679f3)] transition-colors"
        >
          Register
        </Link>
      </div>
    </nav>
  );
}
