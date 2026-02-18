import { Card, CardTitle } from "@/components/ui/card";

const rows = [
  { model: "gpt-5.3-codex", route: "implementation, code-gen", cost: "$0.00x", failover: "claude-opus-4.1" },
  { model: "claude-opus-4.1", route: "deep review, architecture", cost: "$0.00x", failover: "gpt-5.3" },
  { model: "gemini-2.5-pro", route: "parallel search, synthesis", cost: "$0.00x", failover: "gpt-5.3" },
];

export function ModelsView() {
  return (
    <Card className="space-y-3">
      <CardTitle>Model Inventory</CardTitle>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-separate border-spacing-y-1 text-[11px]">
          <thead>
            <tr className="text-zinc-500">
              <th className="px-2 py-1 text-left">Model</th>
              <th className="px-2 py-1 text-left">Routing</th>
              <th className="px-2 py-1 text-left">Cost</th>
              <th className="px-2 py-1 text-left">Failover</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.model} className="rounded-xl border border-white/[0.06] bg-white/[0.02] text-zinc-300">
                <td className="px-2 py-2">{row.model}</td>
                <td className="px-2 py-2">{row.route}</td>
                <td className="px-2 py-2">{row.cost}</td>
                <td className="px-2 py-2">{row.failover}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
