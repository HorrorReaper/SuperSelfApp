// app/productivity-hub/page.tsx
import { ProductivityHubClient } from "./hub-client";

export default function ProductivityHubPage() {
  return (
    <>
      <main className="mx-auto max-w-screen-sm p-4 space-y-4">
        <ProductivityHubClient />
      </main>
    </>
  );
}
