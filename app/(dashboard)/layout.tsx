import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/profiles";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileHeader } from "@/components/layout/mobile-header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { TransactionSheetProvider } from "@/components/transactions/transaction-sheet-context";
import { TransactionSheet } from "@/components/transactions/transaction-sheet";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfile(supabase, user.id).catch(() => null);
  const name = profile?.fullName ?? "";
  const email = user.email ?? "";

  return (
    <TransactionSheetProvider>
      <div className="min-h-svh">
        <AppSidebar name={name} email={email} />
        <MobileHeader name={name} email={email} />
        <div className="flex min-h-svh flex-col lg:pl-64">
          <main className="flex-1 px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:pt-10 lg:pb-14">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
        <MobileBottomNav />
      </div>
      <TransactionSheet />
    </TransactionSheetProvider>
  );
}
