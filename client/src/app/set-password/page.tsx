"use client";

import SetPasswordContent from "@/components/SetPasswordContent";
import { Suspense } from "react";

// 🧠 Parent only handles Suspense (does not use hooks)
export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20">Loading...</div>}>
      <SetPasswordContent />
    </Suspense>
  );
}
