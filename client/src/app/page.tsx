import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 to-white flex flex-col items-center justify-center text-center px-6">
      <section className="max-w-2xl">
        {/* Hero Title */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-blue-700 mb-6 animate-fadeIn">
          Welcome to <span className="text-blue-500">User Management</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-600 mb-8 animate-fadeIn delay-100">
          Manage your users, transactions, and budgets easily, all in one place.
        </p>

        {/* Call-to-action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fadeIn delay-200">
          <Link
            href="/register"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition duration-300"
          >
            Login
          </Link>
        </div>
      </section>
    </main>
  );
}
