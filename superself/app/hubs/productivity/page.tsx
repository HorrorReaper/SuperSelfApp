// app/productivity-hub/page.tsx
import { HubCalendar } from "@/components/hub/productivity/hub-calendar";
import { HubTasks } from "@/components/hub/productivity/hub-tasks";
import { HubTimer } from "@/components/hub/productivity/hub-timer";

export default function ProductivityHubPage() {
  return (
    <>
      <main className="mx-auto max-w-screen-sm p-4 space-y-4">
        <HubCalendar />
        <HubTasks />
        <HubTimer />
      </main>
    </>
  );
}
