import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-4 border-b">
      <h2 className="font-bold text-xl">MyApp</h2>
      <div className="space-x-4">
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
      </div>
    </nav>
  );
}
