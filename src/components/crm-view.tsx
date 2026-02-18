"use client";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useApi } from "@/hooks/use-api";

type ClientItem = {
  id: string;
  name: string;
  status: "Prospect" | "Contacted" | "Meeting" | "Proposal" | "Active";
  contacts: string[];
  lastInteraction: string;
  nextAction: string;
};

const lanes: ClientItem["status"][] = ["Prospect", "Contacted", "Meeting", "Proposal", "Active"];

export function CrmView() {
  const { data } = useApi<{ clients: ClientItem[] }>("/api/clients");

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
      {lanes.map((lane) => (
        <Card key={lane} className="space-y-2">
          <CardTitle>{lane}</CardTitle>
          {(data?.clients ?? [])
            .filter((client) => client.status === lane)
            .map((client) => (
              <div key={client.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-2">
                <p className="text-[11px] text-zinc-200">{client.name}</p>
                <CardDescription>{client.contacts.join(", ")}</CardDescription>
              </div>
            ))}
        </Card>
      ))}
    </div>
  );
}
