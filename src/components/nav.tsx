"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home" },
  { href: "/ops", label: "Ops" },
  { href: "/agents", label: "Agents" },
  { href: "/chat", label: "Chat" },
  { href: "/content", label: "Content" },
  { href: "/comms", label: "Comms" },
  { href: "/knowledge", label: "Knowledge" },
  { href: "/code", label: "Code" },
] as const;

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-black/40 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-[1400px] px-2 py-2 md:px-4">
        <div className="mb-2 flex items-center justify-between px-1">
          <div className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">OpenClaw Mission Control</div>
          <div className="hidden text-[10px] text-zinc-500 md:inline">Mac Mini Runtime</div>
        </div>
        <nav className="flex gap-1">
          {items.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex-1 rounded-xl px-1 py-2 text-center font-medium text-zinc-400 transition-colors",
                  "text-[clamp(0.45rem,0.75vw,0.6875rem)]",
                  active && "bg-[var(--primary-soft)] text-[var(--primary)]",
                )}
              >
                <span>{item.label}</span>
                <span className="hidden md:inline"> · Core</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
