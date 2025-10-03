// components/shared/PhotoProofUploader.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { getDayActionData, upsertDayActionData } from "@/lib/day-actions";

export default function PhotoProofUploader({ day, label = "Upload photo proof" }: { day: number; label?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dataUrl, setDataUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    const d = getDayActionData(day);
    setDataUrl(d?.photoProof);
  }, [day]);

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      setDataUrl(url);
      upsertDayActionData(day, (prev) => ({ ...(prev ?? {}), photoProof: url }));
    };
    reader.readAsDataURL(file);
  }

  function remove() {
    setDataUrl(undefined);
    upsertDayActionData(day, (prev) => {
      const next = { ...(prev ?? {}) };
      delete (next as Record<string, unknown>)["photoProof"];
      return next;
    });
  }

  return (
    <div className="space-y-2">
      {dataUrl ? (
        <div className="space-y-2">
          <img src={dataUrl} alt="Proof" className="max-h-48 rounded-md border" />
          <div className="flex gap-2">
            <button onClick={() => inputRef.current?.click()} className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-accent">
              Replace photo
            </button>
            <button onClick={remove} className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-accent">
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => inputRef.current?.click()} className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-accent">
          {label}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />
    </div>
  );
}
