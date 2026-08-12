import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { NavLink } from "./nav-link";
import { UserMenu } from "./user-menu";
import { PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS } from "./nav-config";

export function AppSidebar({ name, email }: { name: string; email: string }) {
  return (
    <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border fixed inset-y-0 left-0 hidden w-64 flex-col border-r lg:flex">
      <div className="flex items-center justify-between px-4 py-5">
        <Logo className="[&_span]:text-sidebar-foreground" />
        <ThemeToggle />
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3">
        {PRIMARY_NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      <div className="space-y-0.5 px-3 pb-2">
        {SECONDARY_NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </div>

      <div className="border-sidebar-border border-t p-3">
        <UserMenu name={name} email={email} />
      </div>
    </aside>
  );
}
