"use client";

import { useState } from "react";

export default function EditProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saved:", { name, email });
  };

  const handleChangePassword = () => {
    console.log("Change Password clicked");
  };

  const handleDeleteAccount = () => {
    console.log("Delete Account clicked");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6 text-center">
          Edit Profile
        </h1>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
        </form>

        <div className="mt-6 space-y-3">
          <button
            onClick={handleChangePassword}
            className="w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            Change Password
          </button>

          <button
            onClick={handleDeleteAccount}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
