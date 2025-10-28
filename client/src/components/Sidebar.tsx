"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Home", path: "/dashboard" },
    { name: "Users", path: "/dashboard/users" },
  ];

  return (
    <aside className="w-64 min-h-screen p-5 border-r shadow-md transition-colors">
      <h2 className="text-2xl font-semibold mb-6 text-[var(--primary, #2679f3)]">
        Dashboard
      </h2>

      <nav className="space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.path;

          return (
            <Link
              key={link.path}
              href={link.path}
              className="block px-4 py-2 rounded-lg font-medium transition-all hover:bg-[var(--primary-light,#e8f1ff)] hover:text-[var(--primary,#2679f3)]"
              style={{
                backgroundColor: isActive ? "var(--foreground)" : "transparent",
                color: isActive ? "var(--background)" : "var(--foreground)",
              }}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
