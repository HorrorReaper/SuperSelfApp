// app/learning-hub/page.tsx
import DailyArticle from "@/components/hub/learning/daily-article";
import { DecksList } from "@/components/hub/learning/deck-list";
import { PracticePanel } from "@/components/hub/learning/practice-panel";


export default function LearningHubPage() {
  return (
    <>
      <main className="mx-auto max-w-screen-sm p-4 space-y-4">
        <DecksList />
        <PracticePanel />
        <DailyArticle />
      </main>
    </>
  );
}

