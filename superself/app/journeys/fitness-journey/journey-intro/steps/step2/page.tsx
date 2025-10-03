import React, { Suspense } from "react";

// Render a minimal server component that defers the client-only behavior to a
// separate client component. This ensures `useSearchParams()` is used inside a
// client boundary wrapped by Suspense per Next.js guidance.
import JourneyStep2Client from "..\/step2.client";

export default function JourneyStep2() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      {/* Client component uses useSearchParams and navigation */}
      <JourneyStep2Client />
    </Suspense>
  );
}
