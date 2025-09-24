"use client"

import React, { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MessageSquare, X } from "lucide-react"
import { getMockResponse } from "./mockApi"

type Message = { id: number; text: string; from: "user" | "bot" }

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hi — I am your friendly dummy assistant. Ask me anything.", from: "bot" },
  ])
  const [input, setInput] = useState("")
  const listRef = useRef<HTMLDivElement | null>(null)
  const [loading, setLoading] = useState(false)

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

    try {
      const reply = await getMockResponse(txt)
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

        <DialogContent className="fixed left-0 right-0 bottom-0 z-50 w-full sm:left-auto sm:right-6 sm:bottom-24 sm:w-[min(420px,90vw)] p-0 overflow-hidden sm:rounded-lg">
          <div className="flex h-[60vh] sm:h-96 w-full flex-col bg-background">
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

            <div ref={listRef} className="flex-1 overflow-auto p-4 space-y-3">
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

            <div className="border-t px-3 py-2">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") send()
                  }}
                  disabled={loading}
                  className="flex-1 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                  placeholder={loading ? "Waiting for reply..." : "Type a message"}
                />
                <Button size="sm" onClick={send} className="self-end" disabled={loading}>
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
