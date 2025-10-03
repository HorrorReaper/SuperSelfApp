"use client";
import * as React from "react";
import { useSearchParams } from "next/navigation";

export default function JourneyStep2Client() {
  const searchParams = useSearchParams();
  const foo = searchParams.get("foo") ?? "";

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-6 bg-white rounded shadow">Step 2 client: param foo = {String(foo)}</div>
    </div>
  );
}
