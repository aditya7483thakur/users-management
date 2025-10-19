"use client";

import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { verifyEmailAPI } from "@/services/auth";
import toast from "react-hot-toast";

export default function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: verifyEmailAPI,
    onSuccess: (data) =>
      toast.success(data.message || "Email verified successfully!"),
    onError: (err: Error) =>
      toast.error(err.message || "Verification failed. Try again."),
  });

  const handleVerify = () => {
    if (!token) {
      toast.error("Invalid verification link.");
      return;
    }
    mutate(token);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-2xl p-10 text-center w-[380px]">
        {!isSuccess ? (
          <>
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">
              Verify Your Email
            </h1>
            <p className="text-gray-600 mb-6">
              Click the button below to verify your new email address.
            </p>

            <button
              onClick={handleVerify}
              disabled={isPending}
              className={`px-6 py-3 rounded-lg text-white font-medium transition ${
                isPending ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isPending ? "Verifying..." : "Verify Email"}
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative flex items-center justify-center">
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                <div className="absolute h-10 w-10 border-4 border-green-500 rounded-full animate-ping"></div>
                <svg
                  className="w-10 h-10 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-green-600">
              Email Verified Successfully 🎉
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}
