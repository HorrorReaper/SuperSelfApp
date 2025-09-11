// lib/overall-actions.ts
import type { DailyActionConfig } from "./types";

export const OVERALL_ACTIONS: Record<number, DailyActionConfig> = {
  1: { kind: "checklist", checklistItems: ["Write identity sentence", "List 3 matching behaviors"] },
  2: { kind: "text", requireAnswer: true }, // write & display your #1 reason
  3: { kind: "schedule", scheduleTemplate: { title: "Wake time + wind-down", durationMinutes: 5, when: "today" }, allowPhotoProof: true },
  4: { kind: "toggle" }, // morning no-scroll: simple done checkbox
  5: { kind: "timer", targetMinutes: 25, allowPhotoProof: true }, // movement 20–30m; start with 25m
  6: { kind: "checklist", checklistItems: ["3 Must Do", "3 Must Stop"] },
  7: { kind: "text", requireAnswer: true }, // weekly review answers
  8: { kind: "schedule", scheduleTemplate: { title: "Power block (Deep Work)", durationMinutes: 60, when: "tomorrow" } },
  9: { kind: "text", requireAnswer: true }, // rewrite one thought
  10:{ kind: "checklist", checklistItems: ["Split into 3–5 steps", "Complete step one"] },
  11:{ kind: "photo", allowPhotoProof: true }, // environment change photo
  12:{ kind: "text", requireAnswer: true }, // energy audit notes
  13:{ kind: "text", requireAnswer: true }, // curate inputs note
  14:{ kind: "text", requireAnswer: true }, // week 2 review
  15:{ kind: "toggle" }, // one courageous act done
  16:{ kind: "text", requireAnswer: true }, // standards
  17:{ kind: "toggle" }, // 3 compliments done
  18:{ kind: "text", requireAnswer: true }, // boundary wrote/communicated
  19:{ kind: "text", requireAnswer: true }, // learn in public link/note
  20:{ kind: "text", requireAnswer: true }, // relationship deposit note
  21:{ kind: "text", requireAnswer: true }, // week 3 review
  22:{ kind: "checklist", checklistItems: ["Choose repeating task", "Draft 3–5 step checklist"] },
  23:{ kind: "schedule", scheduleTemplate: { title: "Weekly preview planning", durationMinutes: 25, when: "today" } },
  24:{ kind: "photo", allowPhotoProof: true }, // environment v2 proof
  25:{ kind: "text", requireAnswer: true }, // teaching link/note
  26:{ kind: "timer", targetMinutes: 20 },   // recovery session
  27:{ kind: "text", requireAnswer: true },  // money mini-audit notes
  28:{ kind: "text", requireAnswer: true },  // identity update
  29:{ kind: "text", requireAnswer: true },  // 90-day plan fields (start simple: one textarea)
  30:{ kind: "text", requireAnswer: true },  // gratitude letter + rituals
};
