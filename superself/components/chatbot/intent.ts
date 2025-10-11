// components/chatbot/intent.ts
// Single entrypoint to parse a user's chat message into a "job" the chatbot should perform.
export type ChatJob =
  | { type: "none" }
  | { type: "task"; text: string; essential?: boolean; frog?: boolean; due_date?: string | null }
  | { type: "navigate"; path: string }
;

export function parseChatJob(input: string): ChatJob {
  const s = (input ?? "").trim();
  if (!s) return { type: "none" };

  // Task creation patterns
  // Examples handled:
  // - "create task: buy milk"
  // - "add task buy milk"
  // - "remind me to buy milk"
  // - "create task called Buy milk"
  let m = s.match(/^(?:create|add|make)\s+(?:a\s+)?(?:task|todo|reminder)[:\-\s]+(.+)$/i);
  if (!m) m = s.match(/^(?:create|add|make)[:\-\s]+(.+)$/i);
  if (!m) m = s.match(/^(?:remind me to|remind me)\s+(.+)$/i);
  if (!m) m = s.match(/(?:task|todo|reminder)\s+(?:called|named)\s+(.+)$/i);
  if (m && m[1]) {
    const text = m[1].trim();
    // basic flags via keywords
    const essential = /\bessential\b/i.test(s);
    const frog = /\bfrog\b/i.test(s);
    // due date shorthand: "due tomorrow" or "due 2025-10-07"
    let due_date: string | null = null;
    const dd = s.match(/due\s+(tomorrow|today|\d{4}-\d{2}-\d{2})/i);
    if (dd) {
      const val = dd[1].toLowerCase();
      if (val === "today") due_date = new Date().toISOString().slice(0, 10);
      else if (val === "tomorrow") {
        const d = new Date(); d.setDate(d.getDate() + 1); due_date = d.toISOString().slice(0, 10);
      } else due_date = val;
    }
    return { type: "task", text, essential, frog, due_date };
  }

  // Navigation patterns: "go to hub", "open /journey", "take me to the hubs page"
  const navMatch = s.match(/^(?:go to|open|show|take me to)\s+(.+)$/i);
  if (navMatch && navMatch[1]) {
    const target = navMatch[1].trim().toLowerCase();
    // simple mapping of human phrases to paths
    if (/hub|hubs|productivity/.test(target)) return { type: "navigate", path: "/hubs/productivity" };
    if (/fitness/.test(target)) return { type: "navigate", path: "/hubs/fitness" };
    if (/learning/.test(target)) return { type: "navigate", path: "/hubs/learning" };
    if (/journey/.test(target)) return { type: "navigate", path: "/journey" };
    if (/tasks?/.test(target)) return { type: "navigate", path: "/hubs/productivity" };
    if (/focus|pomodoro/.test(target)) return { type: "navigate", path: "/focus" };
    if (/profile|settings?/.test(target)) return { type: "navigate", path: "/settings/profile" };
    if (/dashboard|home|start/.test(target)) return { type: "navigate", path: "/dashboard" };
    if (/search/.test(target)) return { type: "navigate", path: "/u/search" };
    // If it looks like a path already, use it
    if (target.startsWith("/")) return { type: "navigate", path: target };
    // fallback: search page
    return { type: "navigate", path: `/u/search?q=${encodeURIComponent(target)}` };
  }

  return { type: "none" };
}
