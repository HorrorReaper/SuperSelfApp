// app/learning-hub/page.tsx
import { DecksList } from "@/components/hub/learning/deck-list";
import { PracticePanel } from "@/components/hub/learning/practice-panel";
import { ChallengeNavBarConnected } from "@/components/sichallenge/newUI/challenge-nav-bar-connected";


export default function LearningHubPage() {
  return (
    <>
      <main className="mx-auto max-w-screen-sm p-4 space-y-4">
        <DecksList />
        <PracticePanel />
      </main>
    </>
  );
}
