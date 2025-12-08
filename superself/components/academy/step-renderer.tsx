"use client";

import { LessonStep } from "@/lib/types";
import { useState } from "react";

type Props = {
  step: LessonStep;
};

export default function StepRenderer({ step }: Props) {
  switch (step.type) {
    case "text":
      return (
        <div className="space-y-2">
          {step.title && (
            <h2 className="text-lg font-semibold">{step.title}</h2>
          )}
          <p className="leading-relaxed whitespace-pre-line">{step.content}</p>
        </div>
      );

    case "quiz_single_choice":
      return <QuizSingleChoice step={step} />;

    case "input_long_form":
      return <InputLongForm step={step} />;

    default:
      return <div>Unsupported step type</div>;
  }
}

// Quiz component
function QuizSingleChoice({ step }: { step: LessonStep & { type: "quiz_single_choice" } }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect =
    submitted && selected !== null && selected === step.correctIndex;

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">{step.question}</h2>
      <div className="space-y-2">
        {step.options.map((option: string, index: number) => {
          const isSelected = selected === index;
          const showCorrect = submitted && index === step.correctIndex;
          const showIncorrect = submitted && isSelected && !showCorrect;

          return (
            <button
              key={index}
              type="button"
              onClick={() => !submitted && setSelected(index)}
              className={`w-full text-left px-3 py-2 rounded border text-sm
                ${
                  isSelected && !submitted
                    ? "border-primary bg-primary/5"
                    : ""
                }
                ${
                  showCorrect
                    ? "border-green-500 bg-green-50"
                    : showIncorrect
                    ? "border-red-500 bg-red-50"
                    : ""
                }
              `}
            >
              {option}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={selected === null || submitted}
          onClick={() => setSubmitted(true)}
          className="px-3 py-2 text-sm rounded bg-primary text-primary-foreground disabled:opacity-50"
        >
          Check answer
        </button>
        {submitted && (
          <span className="text-sm">
            {isCorrect ? "✅ Correct!" : "❌ Not quite."}
          </span>
        )}
      </div>
      {submitted && step.explanation && (
        <p className="text-xs text-muted-foreground">{step.explanation}</p>
      )}
    </div>
  );
}

// Long-form input (for now just local; later you can persist)
function InputLongForm({ step }: { step: LessonStep & { type: "input_long_form" } }) {
  const [value, setValue] = useState("");

  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-lg">{step.prompt}</h2>
      <textarea
        className="w-full min-h-[120px] text-sm border rounded px-3 py-2"
        placeholder="Write your ideas here..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <p className="text-xs text-muted-foreground">
        This will help you refine your startup idea in later lessons.
      </p>
    </div>
  );
}
