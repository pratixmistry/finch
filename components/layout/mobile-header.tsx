"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { NavLink } from "./nav-link";
import { UserMenu } from "./user-menu";
import { PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS } from "./nav-config";

export function MobileHeader({ name, email }: { name: string; email: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="material sticky top-0 z-30 flex h-14 items-center justify-between border-b border-foreground/[0.06] pr-2 pl-4 lg:hidden">
      <Logo />
      <div className="flex items-center">
        <ThemeToggle />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="bg-sidebar text-sidebar-foreground flex w-80 max-w-[85vw] flex-col gap-0 p-0"
          >
            <SheetHeader className="p-5 pb-3">
              <SheetTitle asChild>
                <Logo className="[&_span]:text-sidebar-foreground" />
              </SheetTitle>
            </SheetHeader>
            <nav aria-label="Main" className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-1">
              {PRIMARY_NAV_ITEMS.map((item) => (
                <NavLink key={item.href} item={item} onNavigate={() => setOpen(false)} />
              ))}
            </nav>
            <div className="flex flex-col gap-1 px-3 pb-3">
              {SECONDARY_NAV_ITEMS.map((item) => (
                <NavLink key={item.href} item={item} onNavigate={() => setOpen(false)} />
              ))}
            </div>
            <div className="border-sidebar-border border-t p-3">
              <UserMenu name={name} email={email} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
