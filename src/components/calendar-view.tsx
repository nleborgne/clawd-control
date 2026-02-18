"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { useApi } from "@/hooks/use-api";

type CalendarEvent = {
  _id: string;
  title: string;
  startTime: number;
  endTime: number;
  type: string;
  color: string;
};

export function CalendarView() {
  const { data } = useApi<{ events: CalendarEvent[] }>("/api/health?scope=calendar");
  const [title, setTitle] = useState("");

  async function createEvent() {
    if (!title.trim()) {
      return;
    }
    await fetch("/api/health", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "calendarEvent",
        title,
      }),
    });
    setTitle("");
    window.location.reload();
  }

  return (
    <div className="space-y-3">
      <Card className="flex items-center gap-2">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Drag-to-create alternative: quick event title"
          className="h-9 flex-1 rounded-xl border border-white/[0.08] bg-black/30 px-3 text-[11px]"
        />
        <Button variant="primary" onClick={createEvent}>
          Create
        </Button>
      </Card>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {(data?.events ?? []).map((event) => (
          <Card key={event._id} className="space-y-2">
            <CardTitle>{event.title}</CardTitle>
            <div className="text-[11px] text-zinc-400">{new Date(event.startTime).toLocaleString()}</div>
            <div className="text-[11px]" style={{ color: event.color }}>
              {event.type}
            </div>
          </Card>
        ))}
      </div>
      {!data?.events?.length ? <Card className="text-[11px] text-zinc-500">No calendar events yet.</Card> : null}
    </div>
  );
}
