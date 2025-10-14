"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { setPasswordAPI } from "@/services/auth";
import PasswordInput from "@/components/PasswordInput";

export default function SetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const { isPending, mutate } = useMutation({
    mutationFn: setPasswordAPI,
    onSuccess: (data) => {
      toast.success(data.message);
      setPassword("");
      setConfirmPassword("");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return toast.error("Invalid or missing token");
    if (password !== confirmPassword)
      return toast.error("Passwords do not match");
    mutate({ token, password, confirmPassword });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Set New Password
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordInput
            label="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
            name="newPassword"
          />

          <PasswordInput
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            name="confirmPassword"
          />

          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-2 rounded-lg transition ${
              isPending ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
            disabled={isPending}
          >
            {isPending ? "Submitting..." : "Set Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
