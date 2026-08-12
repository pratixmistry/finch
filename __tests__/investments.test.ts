import { describe, expect, it } from "vitest";
import {
  allocationByAssetType,
  applyInvestmentTxn,
  investmentMetrics,
  portfolioSummary,
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

describe("investmentMetrics", () => {
  it("computes market value, cost basis, and gain/loss", () => {
    const metrics = investmentMetrics({ quantity: 10, averageBuyPrice: 200, currentPrice: 240 });
    expect(metrics.marketValue).toBe(2400);
    expect(metrics.costBasis).toBe(2000);
    expect(metrics.gainLoss).toBe(400);
    expect(metrics.gainLossPercent).toBe(20);
  });

  it("gainLossPercent is 0 when cost basis is 0 (no position held)", () => {
    const metrics = investmentMetrics({ quantity: 0, averageBuyPrice: 0, currentPrice: 240 });
    expect(metrics.gainLossPercent).toBe(0);
  });

  it("reports a loss when current price is below the average buy price", () => {
    const metrics = investmentMetrics({ quantity: 10, averageBuyPrice: 200, currentPrice: 150 });
    expect(metrics.gainLoss).toBe(-500);
    expect(metrics.gainLossPercent).toBe(-25);
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
