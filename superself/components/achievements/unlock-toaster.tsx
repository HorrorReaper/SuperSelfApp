// components/achievements/unlock-toaster.tsx
"use client";
import { useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { fetchAchievementCatalog } from "@/lib/achievements/achievements-client";

export function AchievementUnlockToaster() {
  useEffect(() => {
    let catalog: Record<string, { title: string }> = {};

    const loadCatalog = async () => {
      const { data } = await fetchAchievementCatalog();
      catalog = Object.fromEntries((data ?? []).map((a) => [a.key, a]));
    };
    loadCatalog();

    const channel = supabase
      .channel("achievements-unlocks")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "achievement_unlocks" }, (payload) => {
        const newRow = (payload.new as unknown) as { key?: string } | undefined;
        const key = newRow?.key ?? "";
        const title = catalog[key]?.title ?? "Achievement unlocked";
        toast(`🏆 ${title}`, { description: "Nice work!" });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return null;
}
