// app/focus/page.tsx
import React, { Suspense } from "react";
import { FocusFullscreen } from "@/components/focus/focus-fullscreen";

export default function FocusPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <FocusFullscreen />
    </Suspense>
  );
}
