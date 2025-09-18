// components/hub/hub-calendar.tsx
"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function HubCalendar() {
  const [url, setUrl] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("hub_calendar_embed") ?? "";
  });

  function save() {
    if (typeof window === "undefined") return;
    localStorage.setItem("hub_calendar_embed", url.trim());
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
        <CardDescription>Embed your calendar (paste an iframe src or full embed HTML).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {!url ? (
          <>
            <Input
              placeholder='Paste Google Calendar embed src OR full <iframe ...>'
              value={url}
              onChange={(e)=>setUrl(e.target.value)}
            />
            <Button onClick={save}>Save</Button>
            <div className="text-xs text-muted-foreground">
              Tip: In Google Calendar → Settings → “Integrate calendar” → copy the iframe code; paste the src or full iframe here.
            </div>
          </>
        ) : url.includes("<iframe") ? (
          <div className="relative w-full overflow-hidden rounded-md border">
            <div dangerouslySetInnerHTML={{ __html: url }} />
            <div className="mt-2">
              <Button variant="secondary" size="sm" onClick={()=>{localStorage.removeItem("hub_calendar_embed"); setUrl("");}}>
                Change embed
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="relative w-full overflow-hidden rounded-md border">
              <iframe src={url} className="w-full h-[500px]" />
            </div>
            <Button variant="secondary" size="sm" onClick={()=>{localStorage.removeItem("hub_calendar_embed"); setUrl("");}}>
              Change embed
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
