import { DashboardOverview } from "@/components/dashboard-overview";
import { ActivityFeed } from "@/components/activity-feed";

export default function HomePage() {
  return (
    <div className="space-y-3">
      <DashboardOverview />
      <ActivityFeed />
    </div>
  );
}
