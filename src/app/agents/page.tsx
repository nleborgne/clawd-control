import { normalizeTab } from "@/lib/utils";
import { TabBar } from "@/components/tab-bar";
import { AgentsView } from "@/components/agents-view";
import { ModelsView } from "@/components/models-view";

const tabs = [
  { key: "agents", label: "Agents" },
  { key: "models", label: "Models" },
] as const;

export default async function AgentsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams;
  const active = normalizeTab(params.tab ?? null, "agents", tabs.map((tab) => tab.key));

  return (
    <div className="space-y-3">
      <TabBar tabs={tabs} fallback="agents" />
      {active === "agents" ? <AgentsView /> : <ModelsView />}
    </div>
  );
}
