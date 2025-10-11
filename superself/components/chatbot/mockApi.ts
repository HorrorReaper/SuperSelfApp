// A tiny mock API for the dummy chatbot — returns canned responses with a small delay.
// A tiny mock API for the dummy chatbot — returns canned responses with a small delay.
export async function getMockResponse(prompt: string) {
  // simulate network latency
  await new Promise((r) => setTimeout(r, 500 + Math.random() * 700));

  const q = prompt.trim().toLowerCase();

  if (!q) return "Can you type something? I'm listening.";

  if (q.includes("joke")) {
    return "Why did the developer go broke? Because he used up all his cache. 😂";
  }

  if (q.includes("help") || q.includes("how") || q.includes("what")) {
    return (
      "I can help with quick tips, step-by-step guidance, or point you to app features.\nTry: 'How do I start a fitness journey?' or 'Give me a 3-step plan.'"
    );
  }

  if (q.includes("thanks") || q.includes("thank")) {
    return "You're welcome! If you want, ask me for tips or examples.";
  }

  // Generic friendly reply with minor enhancements
  const suggestions = [
    "Try asking for a step-by-step plan.",
    "Ask for a short checklist or resources.",
    "You can ask me to summarize or make a quick plan.",
  ];

  return `I heard: "${prompt}". ${suggestions[Math.floor(Math.random() * suggestions.length)]}`;
}

// Try to get a live response from the app API (which will proxy to an LLM when configured)
export async function getLiveResponse(prompt: string, timeoutMs = 20000) {
  try {
    console.log("getLiveResponse", { prompt, timeoutMs });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const resp = await fetch(`/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({ prompt }),
    });

    clearTimeout(timer);

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(text || `Request failed ${resp.status}`);
    }

    const data = await resp.json();
    if (data?.text) return data.text as string;

    throw new Error("No text returned from chat API");
  } catch (err) {
    // Let caller decide to fallback to mock
    throw err;
  }
}

// Unified helper: prefer live LLM but fall back to the local mock if network or config isn't available
export async function getResponse(prompt: string) {
  try {
    return await getLiveResponse(prompt);
  } catch (err) {
    return await getMockResponse(prompt);
  }
}
