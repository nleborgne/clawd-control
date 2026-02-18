import { TabBar } from "@/components/tab-bar";
import { normalizeTab } from "@/lib/utils";
import { CommsView } from "@/components/comms-view";
import { CrmView } from "@/components/crm-view";

const tabs = [
  { key: "comms", label: "Comms" },
  { key: "crm", label: "CRM" },
] as const;

export default async function CommsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams;
  const active = normalizeTab(params.tab ?? null, "comms", tabs.map((tab) => tab.key));
  return (
    <div className="space-y-3">
      <TabBar tabs={tabs} fallback="comms" />
      {active === "comms" ? <CommsView /> : <CrmView />}
    </div>
  );
}
