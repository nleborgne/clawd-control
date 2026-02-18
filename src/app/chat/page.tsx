import { TabBar } from "@/components/tab-bar";
import { normalizeTab } from "@/lib/utils";
import { ChatCenterView } from "@/components/chat-center-view";
import { Card } from "@/components/ui/card";

const tabs = [
  { key: "chat", label: "Chat" },
  { key: "command", label: "Command" },
] as const;

export default async function ChatPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams;
  const active = normalizeTab(params.tab ?? null, "chat", tabs.map((tab) => tab.key));

  return (
    <div className="space-y-3">
      <TabBar tabs={tabs} fallback="chat" />
      {active === "chat" ? <ChatCenterView /> : null}
      {active === "command" ? (
        <Card className="text-[11px] text-zinc-300">Command quick panel: deploy, summarize, restart cron, sync memory.</Card>
      ) : null}
    </div>
  );
}
