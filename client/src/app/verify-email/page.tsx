"use client";

import VerifyEmailContent from "@/components/VerifyEmailContent";
import { Suspense } from "react";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
