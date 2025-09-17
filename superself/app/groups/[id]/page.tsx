// app/groups/[id]/page.tsx
import { GroupPageClient } from "./sections";

export default function GroupPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  return (
    <>
      <main className="mx-auto max-w-screen-sm p-4 space-y-4">
        <GroupPageClient groupId={id} />
      </main>
    </>
  );
}
