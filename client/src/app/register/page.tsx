"use client";

import { generateCaptchaAPI, registerUserAPI } from "@/services/auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  // 🔹 Single-state form
  const [form, setForm] = useState({
    name: "",
    email: "",
    captchaAnswer: "",
  });

  // 🔹 Fetch captcha from backend
  const {
    data: captcha,
    refetch: reloadCaptcha,
    isLoading: captchaLoading,
  } = useQuery({
    queryKey: ["captcha"],
    queryFn: generateCaptchaAPI,
  });

  // 🔹 Mutation for registration
  const { isPending, mutate } = useMutation({
    mutationFn: registerUserAPI,
    onSuccess: (data) => {
      toast.success(data.message);
      setForm({ name: "", email: "", captchaAnswer: "" });
      reloadCaptcha();
    },
    onError: (err: Error) => {
      toast.error(err.message);
      reloadCaptcha(); // reload captcha on error
    },
  });

  // 🔹 Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!captcha?.captchaId) return toast.error("Captcha not loaded yet");

    mutate({
      name: form.name,
      email: form.email,
      captchaId: captcha.captchaId,
      captchaAnswer: Number(form.captchaAnswer),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Register
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="Enter your name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Captcha */}
          <div>
            {captchaLoading ? (
              <p>Loading captcha...</p>
            ) : (
              <>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  What is {captcha.num1} {captcha.operation} {captcha.num2}?
                </label>
                <input
                  type="text"
                  value={form.captchaAnswer}
                  onChange={(e) =>
                    setForm({ ...form, captchaAnswer: e.target.value })
                  }
                  required
                  placeholder="Enter captcha answer"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => reloadCaptcha()}
                  className="text-sm text-blue-500 underline mt-1"
                >
                  Reload Captcha
                </button>
              </>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-2 rounded-lg transition ${
              isPending
                ? "opacity-70 cursor-not-allowed"
                : "hover:bg-blue-700 hover:cursor-pointer"
            }`}
            disabled={isPending}
          >
            {isPending ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
