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
    <aside
      className="w-60 p-4 shadow-lg border-r-2 "
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <nav className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.path}
            href={link.path}
            className={`block px-3 py-2 rounded ${
              pathname === link.path
                ? "bg-[var(--foreground)] text-[var(--background)] "
                : ""
            }`}
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
