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
    <header className="bg-background/80 sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 backdrop-blur-sm lg:hidden">
      <Logo />
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="bg-sidebar text-sidebar-foreground border-sidebar-border flex w-72 flex-col p-0"
          >
            <SheetHeader className="px-4 pt-5 pb-2">
              <SheetTitle asChild>
                <Logo className="[&_span]:text-sidebar-foreground" />
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3">
              {PRIMARY_NAV_ITEMS.map((item) => (
                <NavLink key={item.href} item={item} onNavigate={() => setOpen(false)} />
              ))}
            </nav>
            <div className="space-y-0.5 px-3 pb-2">
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
