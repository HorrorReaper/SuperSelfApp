// app/groups/[id]/page.tsx
import { GroupPageClient } from "./sections";

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const awaited = await params as { id: string };
  const id = Number(awaited.id);
  return (
    <>
      <main className="mx-auto max-w-screen-sm p-4 space-y-4">
        <GroupPageClient groupId={id} />
      </main>
    </>
  );
}
