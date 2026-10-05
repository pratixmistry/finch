"use client";

import * as React from "react";
import { LineChart, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/empty-state";
import { PortfolioSummary } from "@/components/investments/portfolio-summary";
import { AllocationChart } from "@/components/investments/allocation-chart";
import { InvestmentCard } from "@/components/investments/investment-card";
import { InvestmentFormDialog } from "@/components/investments/investment-form-dialog";
import { InvestmentTxnDialog } from "@/components/investments/investment-txn-dialog";
import { useInvestments, useSetInvestmentActive } from "@/hooks/use-investments";
import { toast } from "sonner";
import type { Investment, InvestmentTxnType } from "@/types";

export default function InvestmentsPage() {
  const [showArchived, setShowArchived] = React.useState(false);
  const [editing, setEditing] = React.useState<Investment | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const [txnTarget, setTxnTarget] = React.useState<{ investment: Investment; type: InvestmentTxnType } | null>(
    null
  );

  const { data: investments, isLoading } = useInvestments({ includeArchived: showArchived });
  const setActive = useSetInvestmentActive();

  async function handleToggleActive(investment: Investment) {
    try {
      await setActive.mutateAsync({ id: investment.id, isActive: !investment.isActive });
      toast.success(investment.isActive ? "Holding archived" : "Holding unarchived");
    } catch {
      toast.error("Couldn't update this holding");
    }
  }

  const list = investments ?? [];

  return (
    <div className="flex flex-col gap-7">
      <PageHeader title="Investments" description="Your holdings, valued at their current price.">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <div className="flex items-center gap-2.5">
            <Switch id="show-archived" checked={showArchived} onCheckedChange={setShowArchived} />
            <Label htmlFor="show-archived" className="text-muted-foreground text-sm font-normal">
              Show archived
            </Label>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <Plus />
            Add holding
          </Button>
        </div>
      </PageHeader>

      <PortfolioSummary investments={list} loading={isLoading} />
      <AllocationChart investments={list} isLoading={isLoading} />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={LineChart}
          title="No holdings yet"
          description="Add a stock, fund, or other asset to start tracking your portfolio."
          className="surface"
          action={<Button onClick={() => setAddOpen(true)}>Add holding</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((investment) => (
            <InvestmentCard
              key={investment.id}
              investment={investment}
              onEdit={() => setEditing(investment)}
              onLogBuy={() => setTxnTarget({ investment, type: "buy" })}
              onLogSell={() => setTxnTarget({ investment, type: "sell" })}
              onToggleActive={() => handleToggleActive(investment)}
            />
          ))}
        </div>
      )}

      <InvestmentFormDialog open={addOpen} onOpenChange={setAddOpen} />
      <InvestmentFormDialog
        investment={editing ?? undefined}
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
      />
      <InvestmentTxnDialog
        investment={txnTarget?.investment ?? null}
        type={txnTarget?.type ?? "buy"}
        open={!!txnTarget}
        onOpenChange={(open) => !open && setTxnTarget(null)}
      />
    </div>
  );
}
