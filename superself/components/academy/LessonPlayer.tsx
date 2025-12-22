"use client";

import { useState } from "react";
import { LessonContent } from "@/lib/types";
import StepRenderer from "./step-renderer";
import { redirect } from "next/dist/server/api-utils";
import { cn } from "@/lib/utils";

type Props = {
  lessonId: string;
  content: LessonContent;
};

export default function LessonPlayer({ lessonId, content }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const steps = content.steps;
  const step = steps[stepIndex];

  const isLast = stepIndex === steps.length - 1;

  function handleNext() {
    if (!isLast) {
      setStepIndex((prev) => prev + 1);
    } else {
      // TODO: call an API route to mark lesson as completed
      // and then maybe redirect to next lesson or dashboard
      // For now:
      alert("Lesson completed! (Wire this up to progress tracking next)");

      //sende POST request to /api/lessons/[lessonId]/complete
      
      fetch(`/api/lessons/${lessonId}/complete`, { method: "POST" }).then((res) => {
        if (!res.ok) {
          console.error("Failed to mark lesson as complete");
        }
      }).finally(() => {
        window.location.href = "/academy/founder";
      });
    }
  }

  function handlePrev() {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  }

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {steps.map((_, idx) => {
            const isActive = idx === stepIndex;
            const isDone = idx < stepIndex;
            return (
              <div key={idx} className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={!isDone && !isActive}
                  onClick={() => (isDone ? setStepIndex(idx) : null)}
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] border transition-all",
                    isActive &&
                      "bg-sky-500 text-sky-50 border-sky-400 shadow-sm shadow-sky-500/40",
                    isDone &&
                      "bg-emerald-500 text-emerald-50 border-emerald-400",
                    !isActive && !isDone &&
                      "bg-slate-900 text-slate-500 border-slate-700"
                  )}
                >
                  {idx + 1}
                </button>
                {idx < steps.length - 1 && (
                  <div className="hidden sm:block w-6 h-px bg-slate-700/70" />
                )}
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-slate-400">
          Step {stepIndex + 1} of {steps.length}
        </p>
      </div>

      {/* Main step content */}
      <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-4 sm:px-5 sm:py-5">
        <StepRenderer step={steps[stepIndex]} stepIndex={stepIndex} />
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between pt-2">
        <button
          onClick={handlePrev}
          disabled={stepIndex === 0}
          className="px-3 py-2 text-xs sm:text-sm border border-slate-700 rounded-md text-slate-200 hover:bg-slate-900 disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={isPending}
          className="px-4 py-2 text-xs sm:text-sm font-medium rounded-md bg-sky-500 text-sky-950 hover:bg-sky-400 disabled:opacity-60 shadow-sm shadow-sky-500/40"
        >
          {isLast ? (isPending ? "Finishing..." : "Finish lesson") : "Next step"}
        </button>
      </div>
    </div>
  );
}
