import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "danger" | "primary" | "warning";
  className?: string;
};

const toneStyles: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "bg-white/[0.06] text-zinc-300 border-white/[0.09]",
  success: "bg-emerald-500/10 text-emerald-300 border-emerald-400/30",
  danger: "bg-red-500/10 text-red-300 border-red-400/30",
  primary: "bg-blue-500/10 text-blue-300 border-blue-400/30",
  warning: "bg-amber-500/10 text-amber-300 border-amber-400/30",
};

export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", toneStyles[tone], className)}>
      {children}
    </span>
  );
}
