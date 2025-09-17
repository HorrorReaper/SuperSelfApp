// app/leaderboard/page.tsx
import { Suspense } from "react";
import { LeaderboardClient } from "./section";

export default function LeaderboardPage() {
  return (
    <>
      <main className="mx-auto max-w-screen-sm p-4 space-y-4">
        <Suspense>
          <LeaderboardClient />
        </Suspense>
      </main>
    </>
  );
}
