"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ellipsis, Plus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTransactionSheet } from "@/components/transactions/transaction-sheet-context";
import { MOBILE_PRIMARY_NAV_ITEMS } from "./nav-config";

const MORE_PATHS = ["/categories", "/settings", "/budgets", "/investments", "/reports", "/calendar"];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { openCreate } = useTransactionSheet();

  const [first, second, third] = MOBILE_PRIMARY_NAV_ITEMS;
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      aria-label="Primary"
      className="material fixed inset-x-0 bottom-0 z-30 border-t border-foreground/[0.06] pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-5 items-center px-2">
        <TabLink href={first.href} label={first.label} icon={first.icon} active={isActive(first.href)} />
        <TabLink href={second.href} label={second.label} icon={second.icon} active={isActive(second.href)} />

        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={() => openCreate()}
            aria-label="Add transaction"
            className="bg-primary text-primary-foreground focus-visible:ring-ring flex size-12 items-center justify-center rounded-full shadow-[0_6px_16px_-4px_color-mix(in_oklab,var(--primary)_55%,transparent)] transition-[scale] duration-150 ease-out outline-none focus-visible:ring-4 active:scale-[0.94]"
          >
            <Plus className="size-6 stroke-[2.25]" />
          </button>
        </div>

        <TabLink href={third.href} label={third.label} icon={third.icon} active={isActive(third.href)} />
        <TabLink
          href="/categories"
          label="More"
          icon={Ellipsis}
          active={MORE_PATHS.some((href) => pathname.startsWith(href))}
        />
      </div>
    </nav>
  );
}

function TabLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "focus-visible:ring-ring flex h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] leading-none font-medium transition-[color,scale] duration-150 ease-out outline-none focus-visible:ring-4 active:scale-[0.96]",
        active ? "text-primary" : "text-muted-foreground"
      )}
    >
      <Icon className={cn("size-6", active && "stroke-2")} />
      {label}
    </Link>
  );
}
