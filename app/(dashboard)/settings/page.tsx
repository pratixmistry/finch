"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/settings/profile-form";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { logout } from "@/lib/actions/auth";

export default function SettingsPage() {
  return (
    <div className="flex max-w-xl flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">Your profile, preferences, and account.</p>
      </div>

      <div className="bg-card rounded-xl border p-4 sm:p-5">
        <h2 className="text-sm font-semibold">Profile</h2>
        <p className="text-muted-foreground mb-4 text-xs">
          How your name and locale preferences appear across Finch.
        </p>
        <ProfileForm />
      </div>

      <div className="bg-card rounded-xl border p-4 sm:p-5">
        <UpdatePasswordForm variant="section" />
      </div>

      <div className="bg-card flex items-center justify-between rounded-xl border p-4 sm:p-5">
        <div>
          <h2 className="text-sm font-semibold">Sign out</h2>
          <p className="text-muted-foreground text-xs">End your session on this device.</p>
        </div>
        <Button variant="outline" onClick={() => logout()}>
          <LogOut className="size-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
