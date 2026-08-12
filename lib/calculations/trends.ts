export interface TrendResult {
  /** percentage change, or null when the previous period had a zero base and no meaningful percentage exists */
  percentage: number | null;
  direction: "up" | "down" | "flat";
}

// Percentage change from `previous` to `current`. Guards the zero-base case
// (division by zero) instead of returning Infinity/NaN to the UI.
export function percentChange(current: number, previous: number): TrendResult {
  if (previous === 0) {
    if (current === 0) return { percentage: 0, direction: "flat" };
    return { percentage: null, direction: current > 0 ? "up" : "down" };
  }

  const percentage = ((current - previous) / Math.abs(previous)) * 100;
  const direction = percentage > 0 ? "up" : percentage < 0 ? "down" : "flat";
  return { percentage, direction };
}
