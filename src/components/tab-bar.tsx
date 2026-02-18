"use client";

import { motion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type TabBarProps = {
  tabs: ReadonlyArray<{ key: string; label: string }>;
  fallback: string;
};

export function TabBar({ tabs, fallback }: TabBarProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const active = searchParams.get("tab") ?? fallback;

  function setTab(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", key);
    window.location.assign(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="glass flex w-full gap-1 p-1">
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => setTab(tab.key)}
            className={cn(
              "relative flex-1 rounded-xl px-3 py-2 text-[10px] font-medium transition-colors",
              isActive ? "text-[var(--primary)]" : "text-zinc-400 hover:text-zinc-200",
            )}
          >
            {isActive ? (
              <motion.span
                layoutId="tab-bg"
                className="absolute inset-0 rounded-xl border border-white/[0.08] bg-white/[0.03]"
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
              />
            ) : null}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
