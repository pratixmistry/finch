"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTransactionSheet } from "@/components/transactions/transaction-sheet-context";
import { MOBILE_PRIMARY_NAV_ITEMS } from "./nav-config";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { openCreate } = useTransactionSheet();

  const [first, second, third] = MOBILE_PRIMARY_NAV_ITEMS;

  return (
    <nav className="bg-background/95 fixed inset-x-0 bottom-0 z-30 border-t backdrop-blur-sm lg:hidden">
      <div className="relative grid grid-cols-5 items-center px-2">
        <BottomNavLink item={first} pathname={pathname} />
        <BottomNavLink item={second} pathname={pathname} />

        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={() => openCreate()}
            aria-label="Add transaction"
            className="bg-primary text-primary-foreground shadow-primary/30 -mt-6 flex size-13 items-center justify-center rounded-full shadow-lg transition-transform active:scale-95"
          >
            <Plus className="size-6" strokeWidth={2.5} />
          </button>
        </div>

        <BottomNavLink item={third} pathname={pathname} />
        <MoreLink pathname={pathname} />
      </div>
    </nav>
  );
}

function BottomNavLink({
  item,
  pathname,
}: {
  item: (typeof MOBILE_PRIMARY_NAV_ITEMS)[number];
  pathname: string;
}) {
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
        isActive ? "text-primary" : "text-muted-foreground"
      )}
    >
      <Icon className="size-5" strokeWidth={isActive ? 2.5 : 2} />
      {item.label}
    </Link>
  );
}

function MoreLink({ pathname }: { pathname: string }) {
  const isActive = ["/categories", "/settings", "/budgets", "/investments", "/reports", "/calendar"].some(
    (href) => pathname.startsWith(href)
  );
  return (
    <Link
      href="/categories"
      className={cn(
        "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
        isActive ? "text-primary" : "text-muted-foreground"
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-5">
        <circle cx="5" cy="12" r="1.5" fill="currentColor" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        <circle cx="19" cy="12" r="1.5" fill="currentColor" />
      </svg>
      More
    </Link>
  );
}
