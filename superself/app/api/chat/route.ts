import { NextResponse } from "next/server";

type ChatRequest = {
  prompt?: string;
};

export async function POST(req: Request) {
  try {
    const body: ChatRequest & any = await req.json();
    const prompt = (body.prompt ?? "").toString();

    // debug helpers: ?raw=1 or { debug: true } in body will return raw upstream text and errors
    const url = typeof req.url === "string" ? new URL(req.url) : null;
    const wantRaw = (url?.searchParams.get("raw") === "1") || body?.debug === true;

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // If you have a local LLM server (e.g. Ollama, TGI, or another local REST API),
    // set LOCAL_LLM_URL to its full URL (for example: http://localhost:11434/api/chat
    // or http://localhost:8080/generate). The route will POST { prompt } and try to
    // coerce a sensible text response from several common shapes.
    const localUrl = process.env.LOCAL_LLM_URL;

    if (localUrl) {
      try {
        const localModel = process.env.LOCAL_LLM_MODEL ?? "llama2";
        const localTemperature = process.env.LOCAL_LLM_TEMPERATURE
          ? Number(process.env.LOCAL_LLM_TEMPERATURE)
          : 0.5;

        // Merge the incoming request body through so callers can pass
        // generation params like max_tokens / max_new_tokens / messages etc.
        const incoming: any = body ?? {};
        const localBody: any = {
          model: localModel,
          prompt,
          input: prompt,
          ...((incoming && typeof incoming === "object") ? incoming : {}),
        };

        // If the caller didn't provide an OpenAI-style `messages` array, add one as some
        // local wrappers expect chat-style messages instead of `prompt`/`input`.
        if (!localBody.messages) {
          localBody.messages = [{ role: "user", content: prompt }];
        }

        // Respect explicit temperature provided by incoming body; otherwise fall back to env
        if (localBody.temperature == null && typeof localTemperature === "number") {
          localBody.temperature = localTemperature;
        }

        const r = await fetch(localUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(localBody),
        });
        console.log("R: ", r);

        if (!r.ok) {
          const t = await r.text().catch(() => "");
          // Return detailed upstream error when requested to help debugging
          console.warn("Local LLM returned non-OK:", r.status, t);
          if (wantRaw) {
            return NextResponse.json({ error: "Local LLM returned non-OK", status: r.status, body: t }, { status: 502 });
          }
          // otherwise fall through to OpenAI fallback or return generic error below
        } else {
          // Read response as raw text once, then attempt to parse JSON for various shapes.
          const text = await r.text().catch(() => "");
          console.log("T: ", text);
          let data: any = null;
          if (text) {
            try {
              data = JSON.parse(text);
            } catch (e) {
              // If parsing as a single JSON object failed, the server may have
              // streamed newline-delimited JSON (NDJSON). Try to parse each line
              // and stitch together any assistant message fragments.
              const pieces: string[] = [];
              for (const line of text.split(/\r?\n/)) {
                const s = line.trim();
                if (!s) continue;
                try {
                  const obj = JSON.parse(s);
                  // Common streaming shapes:
                  // { message: { role, content } }
                  if (obj?.message?.content && typeof obj.message.content === "string") {
                    pieces.push(obj.message.content);
                    continue;
                  }
                  // { choices: [{ delta: { content } }] }
                  if (Array.isArray(obj?.choices) && obj.choices[0]?.delta?.content) {
                    pieces.push(obj.choices[0].delta.content);
                    continue;
                  }
                  // { choices: [{ text }] }
                  if (Array.isArray(obj?.choices) && typeof obj.choices[0]?.text === "string") {
                    pieces.push(obj.choices[0].text);
                    continue;
                  }
                  // { generated_text }
                  if (typeof obj?.generated_text === "string") {
                    pieces.push(obj.generated_text);
                    continue;
                  }
                  // { results: [{ output }] }
                  if (Array.isArray(obj?.results) && (obj.results[0]?.output || obj.results[0]?.text)) {
                    pieces.push(obj.results[0].output ?? obj.results[0].text);
                    continue;
                  }
                } catch (e2) {
                  // ignore per-line parse errors
                }
              }
              if (pieces.length) {
                const stitched = pieces.join("");
                // expose stitched result as `text` for the normal response path
                data = { _stitched: stitched };
              }
            }
          }

          // 1) { text: "..." } or stitched NDJSON result
          if (data && (typeof data.text === "string" || typeof data._stitched === "string")) {
            return NextResponse.json({ text: data.text ?? data._stitched });
          }
          // 2) { choices: [{ text: "..." }] } (older / simple endpoints)
          if (data && Array.isArray(data.choices) && data.choices[0]) {
            const t = data.choices[0].text ?? data.choices[0].message?.content;
            if (typeof t === "string") return NextResponse.json({ text: t });
          }
          // 3) OpenAI-like chat completions: { choices: [{ message: { content } }] }
          if (data && Array.isArray(data.choices) && data.choices[0]?.message?.content) {
            return NextResponse.json({ text: data.choices[0].message.content });
          }
          // 4) Text-Generation-Inference style: { generated_text: "..." }
          if (data && typeof data.generated_text === "string") {
            return NextResponse.json({ text: data.generated_text });
          }
          // 5) Some servers return { results: [{ output: "..." }] }
          if (data && Array.isArray(data.results) && data.results[0]) {
            const out = data.results[0].output ?? data.results[0].text;
            if (typeof out === "string") return NextResponse.json({ text: out });
          }

          // 6) Some wrappers return a `message` object: { message: { role, content } }
          if (data && data.message && typeof data.message.content === "string") {
            return NextResponse.json({ text: data.message.content });
          }

          // 7) Fallback: if the response body is plain text, return it to the client to help
          // debugging the exact shape of your LLM wrapper's output.
          if (text) {
            // If debug/raw requested, return the raw text as-is so the client can inspect it
            if (wantRaw) return NextResponse.json({ raw: text });
            return NextResponse.json({ text });
          }
        }
      } catch (err) {
        console.warn("Error calling LOCAL_LLM_URL", err);
        if (wantRaw) {
          const e: any = err;
          return NextResponse.json({ error: String(e?.message ?? e), stack: String(e?.stack ?? "") }, { status: 500 });
        }
        // Fall through to OpenAI fallback if configured, otherwise return error below
      }
    }

    // Fallback to OpenAI if configured
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "No LLM configured: set LOCAL_LLM_URL or OPENAI_API_KEY" }, { status: 500 });
    }

    // Simple, non-streaming proxy to OpenAI Chat Completions
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 512,
        temperature: 0.8,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json({ error: text }, { status: resp.status });
    }

    const payload = await resp.json();
    const content = payload?.choices?.[0]?.message?.content ?? null;

    return NextResponse.json({ text: content });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}
