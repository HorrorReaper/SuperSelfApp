// app/u/[username]/page.tsx
import { PublicProfileClient } from "./sections";

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  // Next.js may provide `params` as a thenable in some setups; await it to follow
  // the sync-dynamic-apis guidance and avoid using `.username` directly.
  const { username } = await params as { username: string };
  return (
    <>
      <main className="mx-auto max-w-screen-sm p-4 space-y-4">
        <PublicProfileClient username={username} />
      </main>
    </>
  );
}
