import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/profiles";
import { GreetingHeader } from "@/components/dashboard/greeting-header";
import { DateRangeSelector } from "@/components/dashboard/date-range-selector";
import { KpiSection } from "@/components/dashboard/kpi-section";
import { IncomeExpenseChart } from "@/components/charts/income-expense-chart";
import { ExpenseDonutChart } from "@/components/charts/expense-donut-chart";
import { SpendingTrendChart } from "@/components/charts/spending-trend-chart";
import { TopCategoriesChart } from "@/components/charts/top-categories-chart";

export const metadata: Metadata = { title: "Overview — Finch" };

export default async function OverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = user ? await getProfile(supabase, user.id).catch(() => null) : null;

  return (
    <Suspense>
      <div className="flex flex-col gap-6">
        <GreetingHeader name={profile?.fullName ?? ""} />

        <div className="flex items-center justify-between gap-3">
          <h2 className="text-muted-foreground text-sm font-medium">Period</h2>
          <DateRangeSelector />
        </div>

        <KpiSection />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <IncomeExpenseChart />
          </div>
          <ExpenseDonutChart />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SpendingTrendChart />
          <TopCategoriesChart />
        </div>
      </div>
    </Suspense>
  );
}
