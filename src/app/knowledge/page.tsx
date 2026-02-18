import { TabBar } from "@/components/tab-bar";
import { normalizeTab } from "@/lib/utils";
import { KnowledgeBase } from "@/components/knowledge-base";
import { EcosystemView } from "@/components/ecosystem-view";

const tabs = [
  { key: "knowledge", label: "Knowledge" },
  { key: "ecosystem", label: "Ecosystem" },
] as const;

export default async function KnowledgePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams;
  const active = normalizeTab(params.tab ?? null, "knowledge", tabs.map((tab) => tab.key));

  return (
    <div className="space-y-3">
      <TabBar tabs={tabs} fallback="knowledge" />
      {active === "knowledge" ? <KnowledgeBase /> : <EcosystemView />}
    </div>
  );
}
