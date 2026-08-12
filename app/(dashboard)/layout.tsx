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
          <main className="flex-1 px-4 pt-5 pb-24 lg:px-8 lg:pt-8 lg:pb-10">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
        <MobileBottomNav />
      </div>
      <TransactionSheet />
    </TransactionSheetProvider>
  );
}
