// app/u/[username]/page.tsx
import { PublicProfileClient } from "./sections";

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  // Next.js provides `params` as a thenable in the app router; await it.
  const { username } = await params as { username: string };
  return (
    <>
      <main className="mx-auto max-w-screen-sm p-4 space-y-4">
        <PublicProfileClient username={username} />
      </main>
    </>
  );
}
