"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { NavItem } from "./nav-config";

export function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;

  if (item.status === "soon") {
    return (
      <button
        type="button"
        onClick={() => toast("Coming soon", { description: `${item.label} arrives in a future update.` })}
        className="text-sidebar-foreground/50 hover:bg-sidebar-accent/50 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
      >
        <Icon className="size-4 shrink-0" strokeWidth={2} />
        <span className="flex-1 text-left">{item.label}</span>
        <span className="rounded-full border border-sidebar-border px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase">
          Soon
        </span>
      </button>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="size-4 shrink-0" strokeWidth={2} />
      {item.label}
    </Link>
  );
}
