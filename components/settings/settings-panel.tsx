"use client";

import { KeyRound, LogOut, UserRound, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/shared/icon-tile";
import { ProfileForm } from "@/components/settings/profile-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { logout } from "@/lib/actions/auth";

// Shown as a route inside the agent shell.
export function SettingsPanel() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-2xl flex-col gap-7 px-4 py-8 sm:px-6">
        <header className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold sm:text-3xl">Settings</h1>
            <p className="text-muted-foreground text-base">Your profile, preferences, and account.</p>
          </div>
          <ThemeToggle />
        </header>

        <section className="surface p-5 sm:p-6">
          <SectionHeading
            icon={UserRound}
            title="Profile"
            description="How your name and locale preferences appear across Finch."
          />
          <ProfileForm />
        </section>

        <section className="surface flex gap-3 p-5 sm:p-6">
          <IconTile icon={KeyRound} tone="primary" size="sm" className="mt-px" />
          <div className="min-w-0 flex-1">
            <UpdatePasswordForm variant="section" />
          </div>
        </section>

        <section className="surface flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <IconTile icon={LogOut} size="sm" />
            <div>
              <h2 className="text-lg font-semibold">Sign out</h2>
              <p className="text-muted-foreground text-sm">End your session on this device.</p>
            </div>
          </div>
          <Button variant="secondary" onClick={() => logout()}>
            Sign out
          </Button>
        </section>
      </div>
    </div>
  );
}

function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5 flex gap-3">
      <IconTile icon={icon} tone="primary" size="sm" className="mt-px" />
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
}
