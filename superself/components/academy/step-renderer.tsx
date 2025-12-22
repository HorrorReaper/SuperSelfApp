"use client";

import { LessonStep } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Lightbulb } from "lucide-react";
import { useState } from "react";

type Props = {
  step: LessonStep;
};

export default function StepRenderer({ step, stepIndex }: Props & { stepIndex?: number }) {
  switch (step.type) {
    case "text":
      return (
        <div className="space-y-3">
          {step.title && (
            <h2 className="text-base sm:text-lg font-semibold text-slate-50">
              {step.title}
            </h2>
          )}
          <p className="text-sm leading-relaxed text-slate-200">
            {step.content}
          </p>
          {/* Optional coach tip */}
          <div className="mt-2 flex items-start gap-2 rounded-md border border-slate-800 bg-slate-900/80 px-3 py-2">
            <Lightbulb className="h-4 w-4 text-amber-400 mt-0.5" />
            <p className="text-xs text-slate-300">
              Think of a real founder you know or admire. What specific problem did they solve first?
            </p>
          </div>
        </div>
      );

    case "quiz_single_choice":
      return <QuizSingleChoice key={stepIndex} step={step} stepIndex={stepIndex} />;

    case "input_long_form":
      return <InputLongForm step={step} />;

    default:
      return <div className="text-sm text-slate-300">Unsupported step type.</div>;
  }
}

// Quiz component
function QuizSingleChoice({ step, stepIndex = 0 }: { step: LessonStep & { type: "quiz_single_choice" }; stepIndex?: number }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (index: number) => {
    if (!submitted) {
      setSelected(index);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const isCorrect = submitted && selected === step.correctIndex;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-sky-400 mb-1">
          Quick check
        </p>
        <h2 className="font-semibold text-slate-50 text-base sm:text-lg">
          {step.question}
        </h2>
      </div>

      <div className="space-y-2">
        {step.options.map((option: string, index: number) => {
          const isSelected = selected === index;
          const showCorrect = submitted && index === step.correctIndex;
          const showIncorrect = submitted && isSelected && !showCorrect;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(index)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md border text-sm transition-all",
                "bg-slate-950/80 border-slate-800 text-slate-100 hover:border-slate-600 hover:bg-slate-900",
                isSelected &&
                  !submitted &&
                  "border-sky-400 bg-sky-500/10 shadow-sm shadow-sky-500/40",
                showCorrect &&
                  "border-emerald-400 bg-emerald-500/10 shadow-sm shadow-emerald-500/40",
                showIncorrect &&
                  "border-rose-400 bg-rose-500/10 shadow-sm shadow-rose-500/40"
              )}
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
          onClick={handleSubmit}
          className="px-3 py-1.5 text-xs rounded-md bg-sky-500 text-sky-950 hover:bg-sky-400 disabled:opacity-50"
        >
          Check answer
        </button>
        {submitted && (
          <span className="text-xs">
            {isCorrect ? (
              <span className="text-emerald-400">✅ Nice, that’s it.</span>
            ) : (
              <span className="text-rose-300">❌ Close, but not quite.</span>
            )}
          </span>
        )}
      </div>

      {submitted && step.explanation && (
        <div className="mt-2 rounded-md border border-slate-800 bg-slate-950/80 px-3 py-2">
          <p className="text-[11px] text-slate-300">
            {step.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

// Long-form input (for now just local; later you can persist)
function InputLongForm({ step }: { step: LessonStep & { type: "input_long_form" } }) {
  const [value, setValue] = useState("");

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-amber-400 mb-1">
          Founder reflection
        </p>
        <h2 className="font-semibold text-slate-50 text-base sm:text-lg">
          {step.prompt}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Don’t worry about perfection — messy is fine. You’re here to think, not to impress.
        </p>
      </div>
      <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
        <textarea
          className="w-full min-h-[140px] text-sm bg-transparent border-none outline-none text-slate-100 placeholder:text-slate-500 resize-y"
          placeholder="Write your thoughts here…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-[11px] text-slate-500">
            This will be your raw material for later modules.
          </span>
          <span className="text-[10px] text-slate-500">
            {value.length} chars
          </span>
        </div>
      </div>
    </div>
  );
}
