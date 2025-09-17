// app/groups/page.tsx
import { GroupsListClient } from "./sections";

export default function GroupsIndexPage() {
  return (
    <>
      <main className="mx-auto max-w-screen-sm p-4 space-y-4">
        <GroupsListClient />
      </main>
    </>
  );
}
