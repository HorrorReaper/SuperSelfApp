// app/learning/decks/[id]/page.tsx

import { DeckEditor } from "@/components/hub/learning/deck-editor";

export default function DeckPage({ params }: { params: { id: string } }) {
  const deckId = Number(params.id);
  return (
    <>
      <main className="mx-auto max-w-screen-sm p-4 space-y-4">
        <DeckEditor deckId={deckId} />
      </main>
    </>
  );
}
