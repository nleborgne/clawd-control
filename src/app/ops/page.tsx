import { normalizeTab } from "@/lib/utils";
import { TabBar } from "@/components/tab-bar";
import { OpsView } from "@/components/ops-view";
import { SuggestedTasksView } from "@/components/suggested-tasks-view";
import { CalendarView } from "@/components/calendar-view";

const tabs = [
  { key: "operations", label: "Operations" },
  { key: "tasks", label: "Tasks" },
  { key: "calendar", label: "Calendar" },
] as const;

export default async function OpsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const active = normalizeTab(params.tab ?? null, "operations", tabs.map((tab) => tab.key));

  return (
    <div className="space-y-3">
      <TabBar tabs={tabs} fallback="operations" />
      {active === "operations" ? <OpsView /> : null}
      {active === "tasks" ? <SuggestedTasksView /> : null}
      {active === "calendar" ? <CalendarView /> : null}
    </div>
  );
}
