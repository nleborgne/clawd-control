"use client";

import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useApi } from "@/hooks/use-api";

type Product = {
  slug: string;
  name: string;
  status: "Active" | "Development" | "Concept";
  health: "good" | "watch" | "risk";
  metrics: string;
};

export function EcosystemView() {
  const { data } = useApi<{ products: Product[] }>("/api/ecosystem/root");

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {(data?.products ?? []).map((product) => (
        <Link key={product.slug} href={`/ecosystem/${product.slug}`}>
          <Card className="space-y-2 transition-transform hover:-translate-y-0.5">
            <CardTitle>{product.name}</CardTitle>
            <CardDescription>
              {product.status} · {product.health} · {product.metrics}
            </CardDescription>
          </Card>
        </Link>
      ))}
    </div>
  );
}
