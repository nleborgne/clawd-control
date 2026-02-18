import { TabBar } from "@/components/tab-bar";
import { normalizeTab } from "@/lib/utils";
import { Card } from "@/components/ui/card";

const tabs = [
  { key: "overview", label: "Overview" },
  { key: "brand", label: "Brand" },
  { key: "community", label: "Community" },
  { key: "content", label: "Content" },
  { key: "legal", label: "Legal" },
  { key: "product", label: "Product" },
  { key: "website", label: "Website" },
  { key: "actions", label: "Actions" },
] as const;

export default async function EcosystemDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const route = await params;
  const query = await searchParams;
  const active = normalizeTab(query.tab ?? null, "overview", tabs.map((tab) => tab.key));

  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/ecosystem/${route.slug}`, {
    cache: "no-store",
  });
  const payload = (await response.json()) as { ok: boolean; data?: { name: string; sections: Record<string, string> } };
  const data = payload.data;

  return (
    <div className="space-y-3">
      <TabBar tabs={tabs} fallback="overview" />
      <Card className="space-y-2">
        <h1 className="text-sm font-semibold text-white">{data?.name ?? route.slug}</h1>
        <p className="text-[11px] text-zinc-300">{data?.sections?.[active] ?? "No data for this section yet."}</p>
      </Card>
    </div>
  );
}
