"use client"

import React, { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import {  getResponse } from "./mockApi"
import { addTask } from "@/lib/hubs/productivity/tasks";
import { parseChatJob } from "./intent";
import { useRouter } from "next/navigation";

type Message = { id: number; text: string; from: "user" | "bot" }

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hey, how can I help you today?", from: "bot" },
  ])
  const [input, setInput] = useState("")
  const listRef = useRef<HTMLDivElement | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter();

  useEffect(() => {
    // scroll to bottom when messages change
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages, open])

  async function send() {
    const txt = input.trim()
    if (!txt || loading) return
    const mid = Date.now()
    setMessages((m) => [...m, { id: mid, text: txt, from: "user" }])
    setInput("")
    setLoading(true)
  const job = parseChatJob(txt);

    if (job.type === "task") {
      try {
        await addTask({ text: job.text, essential: job.essential, frog: job.frog, due_date: job.due_date });
        setMessages((m) => [...m, { id: mid + 1, text: `✅ Created task: ${job.text}`, from: "bot" }]);
        setLoading(false);
        return;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setMessages((m) => [...m, { id: mid + 1, text: `(error) Could not create task: ${msg}`, from: "bot" }]);
        setLoading(false);
        return;
      }
    }

    if (job.type === "navigate") {
      try {
        // navigate and post a confirmation message
        router.push(job.path);
        setMessages((m) => [...m, { id: mid + 1, text: `➡️ Navigated to ${job.path}`, from: "bot" }]);
        setLoading(false);
        return;
      } catch (err: unknown) {
        setMessages((m) => [...m, { id: mid + 1, text: `(error) Could not navigate: ${String(err)}`, from: "bot" }]);
        setLoading(false);
        return;
      }
    }

    try {
      const reply = await getResponse(txt)
      setMessages((m) => [...m, { id: mid + 1, text: reply, from: "bot" }])
    } catch (e) {
      setMessages((m) => [...m, { id: mid + 1, text: "(error) Could not get reply.", from: "bot" }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            aria-label="Open chat"
            className="fixed right-6 bottom-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <MessageSquare className="h-6 w-6" />
          </button>
        </DialogTrigger>
        <DialogTitle className="sr-only">Chat with assistant</DialogTitle>

        <DialogContent className=" inset-x-0 bottom-0 z-50 w-full sm:left-auto sm:right-6 sm:bottom-24 sm:w-[min(420px,90vw)] p-0  sm:rounded-lg right-0 left-52 max-w-[70vw] max-h-[30vh] sm:h-[30vh] top-50 sm:top-0">
          {/* Mobile bottom-sheet grabber */}
          <div className="sm:hidden flex justify-center py-2">
            <span className="w-12 h-1.5 bg-muted rounded-full" />
          </div>
          {/* Use a viewport-safe max height so the sheet never grows past the screen */}
          <div className="flex w-full flex-col bg-background rounded-t-lg sm:rounded-lg max-h-[80vh]" >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-primary" />
                <div className="text-sm font-medium">Assistant</div>
              </div>
              <div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-md p-1 hover:bg-accent"
                  aria-label="Close chat"
                >
                </button>
              </div>
            </div>

            <div ref={listRef} className="flex-1 min-h-0 overflow-auto p-4 space-y-3 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    m.from === "bot" ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground ml-auto"
                  }`}
                >
                  <div className="text-sm whitespace-pre-line">{m.text}</div>
                </div>
              ))}

              {loading && (
                <div className="max-w-[60%] rounded-lg px-3 py-2 bg-muted text-muted-foreground">
                  <div className="text-sm">Typing…</div>
                </div>
              )}
            </div>

            <div className="border-t px-3 pt-2 sm:pt-3 sm:pb-2 mb-3" style={{ paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}>
              <div className="flex gap-2 items-end">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") send()
                  }}
                  disabled={loading}
                  className="flex-1 rounded-md border px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 h-10"
                  placeholder={loading ? "Waiting for reply..." : "Type a message"}
                />
                <Button size="sm" onClick={send} className="flex-shrink-0 sm:self-end px-4 py-2" disabled={loading}>
                  {loading ? "..." : "Send"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
