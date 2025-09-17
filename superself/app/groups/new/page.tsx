// app/groups/new/page.tsx
import { GroupCreateForm } from "@/components/groups/group-create-form";

export default function NewGroupPage() {
  return (
    <>
      <main className="mx-auto max-w-screen-sm p-4 space-y-4">
        <GroupCreateForm />
      </main>
    </>
  );
}
