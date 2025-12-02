"use client";

import { useState } from "react";
import { LessonContent } from "@/lib/types";
import StepRenderer from "./step-renderer";

type Props = {
  lessonId: string;
  content: LessonContent;
};

export default function LessonPlayer({ lessonId, content }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
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
    }
  }

  function handlePrev() {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  }

  return (
    <div className="space-y-6">
      <StepRenderer step={step} />

      <div className="flex justify-between pt-4">
        <button
          onClick={handlePrev}
          disabled={stepIndex === 0}
          className="px-3 py-2 text-sm border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded"
        >
          {isLast ? "Finish lesson" : "Next"}
        </button>
      </div>
    </div>
  );
}
