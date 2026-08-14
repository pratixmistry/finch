import { describe, expect, it } from "vitest";
import {
  allocationByAssetType,
  applyInvestmentTxn,
  investmentMetrics,
  portfolioSummary,
  rdMaturityValue,
  rdProgress,
} from "@/lib/calculations/investments";
import type { Investment } from "@/types";

function holding(overrides: Partial<Investment>): Investment {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    userId: "user-1",
    accountId: "account-1",
    name: "Test Holding",
    assetType: "stock",
    symbol: null,
    quantity: 0,
    averageBuyPrice: 0,
    currentPrice: 0,
    rdMonthlyAmount: null,
    rdInterestRate: null,
    rdTenureMonths: null,
    rdStartDate: null,
    isActive: true,
    ...overrides,
  };
}

describe("applyInvestmentTxn", () => {
  it("a buy adds to quantity and recomputes the weighted-average buy price", () => {
    const current = { quantity: 10, averageBuyPrice: 200 };
    const result = applyInvestmentTxn(current, { type: "buy", quantity: 5, price: 260 });
    // (10*200 + 5*260) / 15 = 3300 / 15
    expect(result).toEqual({ quantity: 15, averageBuyPrice: 220 });
  });

  it("a sell reduces quantity but leaves the average buy price unchanged", () => {
    const current = { quantity: 15, averageBuyPrice: 220 };
    const result = applyInvestmentTxn(current, { type: "sell", quantity: 5, price: 999 });
    expect(result).toEqual({ quantity: 10, averageBuyPrice: 220 });
  });

  it("selling the entire position zeroes out the average buy price too", () => {
    const current = { quantity: 10, averageBuyPrice: 220 };
    const result = applyInvestmentTxn(current, { type: "sell", quantity: 10, price: 999 });
    expect(result).toEqual({ quantity: 0, averageBuyPrice: 0 });
  });

  it("a sell never drives quantity negative", () => {
    const current = { quantity: 3, averageBuyPrice: 100 };
    const result = applyInvestmentTxn(current, { type: "sell", quantity: 10, price: 999 });
    expect(result.quantity).toBe(0);
  });

  it("buying into a zero position sets the average buy price to the trade price", () => {
    const current = { quantity: 0, averageBuyPrice: 0 };
    const result = applyInvestmentTxn(current, { type: "buy", quantity: 4, price: 150 });
    expect(result).toEqual({ quantity: 4, averageBuyPrice: 150 });
  });
});

const LUMP_SUM_FIELDS = { rdMonthlyAmount: null, rdInterestRate: null, rdTenureMonths: null, rdStartDate: null } as const;

describe("investmentMetrics", () => {
  it("computes market value, cost basis, and gain/loss", () => {
    const metrics = investmentMetrics({
      assetType: "stock",
      quantity: 10,
      averageBuyPrice: 200,
      currentPrice: 240,
      ...LUMP_SUM_FIELDS,
    });
    expect(metrics.marketValue).toBe(2400);
    expect(metrics.costBasis).toBe(2000);
    expect(metrics.gainLoss).toBe(400);
    expect(metrics.gainLossPercent).toBe(20);
  });

  it("gainLossPercent is 0 when cost basis is 0 (no position held)", () => {
    const metrics = investmentMetrics({
      assetType: "stock",
      quantity: 0,
      averageBuyPrice: 0,
      currentPrice: 240,
      ...LUMP_SUM_FIELDS,
    });
    expect(metrics.gainLossPercent).toBe(0);
  });

  it("reports a loss when current price is below the average buy price", () => {
    const metrics = investmentMetrics({
      assetType: "stock",
      quantity: 10,
      averageBuyPrice: 200,
      currentPrice: 150,
      ...LUMP_SUM_FIELDS,
    });
    expect(metrics.gainLoss).toBe(-500);
    expect(metrics.gainLossPercent).toBe(-25);
  });

  it("derives market value and cost basis from time elapsed for a recurring deposit, ignoring quantity/price", () => {
    const metrics = investmentMetrics({
      assetType: "recurring_deposit",
      quantity: 0,
      averageBuyPrice: 0,
      currentPrice: 0,
      rdMonthlyAmount: 5000,
      rdInterestRate: 7,
      rdTenureMonths: 12,
      rdStartDate: "2025-01-01",
    });
    // as of "now" (far past maturity in test time), it should be fully matured
    expect(metrics.costBasis).toBe(60000); // 5000 * 12
    expect(metrics.marketValue).toBeCloseTo(rdMaturityValue(5000, 7, 12), 6);
    expect(metrics.gainLoss).toBeGreaterThan(0);
  });
});

describe("portfolioSummary", () => {
  it("aggregates market value and cost basis across holdings", () => {
    const holdings = [
      holding({ quantity: 10, averageBuyPrice: 200, currentPrice: 240 }),
      holding({ quantity: 5, averageBuyPrice: 100, currentPrice: 90 }),
    ];
    const summary = portfolioSummary(holdings);
    expect(summary.marketValue).toBe(2850); // 2400 + 450
    expect(summary.costBasis).toBe(2500); // 2000 + 500
    expect(summary.gainLoss).toBe(350);
  });

  it("is all zeros for an empty portfolio", () => {
    expect(portfolioSummary([])).toEqual({
      marketValue: 0,
      costBasis: 0,
      gainLoss: 0,
      gainLossPercent: 0,
    });
  });
});

describe("rdMaturityValue", () => {
  it("matches the standard quarterly-compounding RD formula for a known case", () => {
    // 5000/mo for 12 months at 7% p.a. -> ~62,310 (verified against standard RD calculators)
    expect(rdMaturityValue(5000, 7, 12)).toBeCloseTo(62310, -1);
  });

  it("falls back to simple total deposited when the interest rate is 0", () => {
    expect(rdMaturityValue(1000, 0, 6)).toBe(6000);
  });

  it("is 0 for a non-positive monthly amount or tenure", () => {
    expect(rdMaturityValue(0, 7, 12)).toBe(0);
    expect(rdMaturityValue(1000, 7, 0)).toBe(0);
  });

  it("grows with a higher interest rate, all else equal", () => {
    const low = rdMaturityValue(2000, 5, 24);
    const high = rdMaturityValue(2000, 9, 24);
    expect(high).toBeGreaterThan(low);
  });
});

describe("rdProgress", () => {
  it("reports zero elapsed and zero value on the start date itself", () => {
    const today = new Date("2026-01-15T00:00:00");
    const progress = rdProgress(
      { monthlyAmount: 2000, annualRatePercent: 6, tenureMonths: 12, startDate: "2026-01-15" },
      today
    );
    expect(progress.elapsedMonths).toBe(0);
    expect(progress.depositedAmount).toBe(0);
    expect(progress.currentValue).toBe(0);
    expect(progress.isMatured).toBe(false);
  });

  it("counts completed months and grows current value toward the maturity value mid-tenure", () => {
    const asOf = new Date("2026-07-15T00:00:00");
    const progress = rdProgress(
      { monthlyAmount: 2000, annualRatePercent: 6, tenureMonths: 12, startDate: "2026-01-15" },
      asOf
    );
    expect(progress.elapsedMonths).toBe(6);
    expect(progress.remainingMonths).toBe(6);
    expect(progress.depositedAmount).toBe(12000);
    expect(progress.currentValue).toBeGreaterThanOrEqual(progress.depositedAmount);
    expect(progress.currentValue).toBeLessThan(progress.maturityValue);
    expect(progress.isMatured).toBe(false);
  });

  it("caps elapsed months at the tenure and marks the deposit matured once past the end date", () => {
    const asOf = new Date("2027-06-01T00:00:00");
    const progress = rdProgress(
      { monthlyAmount: 2000, annualRatePercent: 6, tenureMonths: 12, startDate: "2026-01-15" },
      asOf
    );
    expect(progress.elapsedMonths).toBe(12);
    expect(progress.remainingMonths).toBe(0);
    expect(progress.currentValue).toBeCloseTo(progress.maturityValue, 6);
    expect(progress.isMatured).toBe(true);
  });

  it("never reports elapsed months before 0 when the start date is in the future", () => {
    const asOf = new Date("2026-01-01T00:00:00");
    const progress = rdProgress(
      { monthlyAmount: 2000, annualRatePercent: 6, tenureMonths: 12, startDate: "2026-06-01" },
      asOf
    );
    expect(progress.elapsedMonths).toBe(0);
    expect(progress.depositedAmount).toBe(0);
  });

  it("computes the maturity date as tenure months after the start date", () => {
    const progress = rdProgress({
      monthlyAmount: 1000,
      annualRatePercent: 5,
      tenureMonths: 24,
      startDate: "2026-03-10",
    });
    expect(progress.maturityDate).toBe("2028-03-10");
  });
});

describe("allocationByAssetType", () => {
  it("groups market value by asset type and sorts descending", () => {
    const holdings = [
      holding({ assetType: "stock", quantity: 10, currentPrice: 100 }), // 1000
      holding({ assetType: "crypto", quantity: 1, currentPrice: 3000 }), // 3000
      holding({ assetType: "stock", quantity: 5, currentPrice: 100 }), // 500 -> stock total 1500
    ];
    const allocation = allocationByAssetType(holdings);
    expect(allocation).toEqual([
      { assetType: "crypto", value: 3000, percentage: (3000 / 4500) * 100 },
      { assetType: "stock", value: 1500, percentage: (1500 / 4500) * 100 },
    ]);
  });

  it("returns an empty array for no holdings", () => {
    expect(allocationByAssetType([])).toEqual([]);
  });
});
