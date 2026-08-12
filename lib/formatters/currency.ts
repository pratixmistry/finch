const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(currency: string, maximumFractionDigits: number) {
  const key = `${currency}:${maximumFractionDigits}`;
  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits,
      minimumFractionDigits: 0,
    });
    formatterCache.set(key, formatter);
  }
  return formatter;
}

// Formats a plain number as currency with Indian digit grouping (₹1,25,000).
// Never store the formatted string — only the numeric amount.
export function formatCurrency(amount: number, currency = "INR"): string {
  const hasFraction = !Number.isInteger(amount);
  return getFormatter(currency, hasFraction ? 2 : 0).format(amount);
}

// Compact form for tight spaces (KPI cards on mobile): ₹1.2L instead of ₹1,25,000.
export function formatCurrencyCompact(amount: number, currency = "INR"): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  const symbol = currency === "INR" ? "₹" : `${currency} `;

  if (currency === "INR") {
    if (abs >= 1_00_00_000) return `${sign}${symbol}${(abs / 1_00_00_000).toFixed(2)}Cr`;
    if (abs >= 1_00_000) return `${sign}${symbol}${(abs / 1_00_000).toFixed(2)}L`;
    if (abs >= 1_000) return `${sign}${symbol}${(abs / 1_000).toFixed(1)}K`;
    return formatCurrency(amount, currency);
  }

  if (abs >= 1_000_000) return `${sign}${symbol}${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}${symbol}${(abs / 1_000).toFixed(1)}K`;
  return formatCurrency(amount, currency);
}

export function formatSignedCurrency(amount: number, currency = "INR"): string {
  const formatted = formatCurrency(Math.abs(amount), currency);
  if (amount > 0) return `+${formatted}`;
  if (amount < 0) return `-${formatted}`;
  return formatted;
}
