"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { NavItem } from "./nav-config";

const ROW =
  "flex h-11 w-full items-center gap-3 rounded-xl px-3 text-base font-medium outline-none transition-[background-color,color,scale] duration-150 ease-out focus-visible:ring-4 focus-visible:ring-sidebar-ring active:scale-[0.98]";

export function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;

  if (item.status === "soon") {
    return (
      <button
        type="button"
        onClick={() => toast("Coming soon", { description: `${item.label} arrives in a future update.` })}
        className={cn(ROW, "text-sidebar-foreground/45 hover:bg-sidebar-accent/60")}
      >
        <Icon className="size-6 shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        <Badge variant="outline" className="border-sidebar-border text-sidebar-foreground/60">
          Soon
        </Badge>
      </button>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        ROW,
        isActive
          ? "bg-sidebar-accent text-sidebar-foreground"
          : "text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
      )}
    >
      <Icon className={cn("size-6 shrink-0", isActive && "text-sidebar-primary stroke-2")} />
      {item.label}
    </Link>
  );
}
