"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathName = usePathname() ?? "/";
  if (pathName.startsWith("/dashboard")) {
    return null;
  }

  return (
    <nav className="flex justify-between items-center px-8 py-4 shadow-md sticky top-0 z-10 bg-white transition-colors">
      <h2 className="text-2xl font-semibold text-[var(--primary,#2679f3)]">
        MyApp
      </h2>

      <div className="space-x-4 font-medium flex">
        <Link
          href="/login"
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
        >
          Register
        </Link>
      </div>
    </nav>
  );
}
