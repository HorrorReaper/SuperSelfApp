// app/learning/decks/[id]/page.tsx

import { DeckEditor } from "@/components/hub/learning/deck-editor";

export default async function DeckPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params as { id: string };
  const deckId = Number(id);
  return (
    <>
      <main className="mx-auto max-w-screen-sm p-4 space-y-4">
        <DeckEditor deckId={deckId} />
      </main>
    </>
  );
}
