import { formatCurrency } from "@/lib/formatters/currency";

interface TooltipPayloadEntry {
  dataKey: string;
  name?: string;
  value?: number;
  color?: string;
}

// Values/labels stay in text tokens (never colored text) — only the small
// swatch dot carries the series color, per the dataviz mark spec.
export function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-popover text-popover-foreground min-w-36 rounded-lg border px-3 py-2 text-xs shadow-md">
      {label && <p className="text-muted-foreground mb-1.5 font-medium">{label}</p>}
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto font-medium tabular-nums">
              {formatCurrency(entry.value ?? 0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
