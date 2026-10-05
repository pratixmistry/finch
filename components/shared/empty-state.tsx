import type { LucideIcon } from "lucide-react";
import { IconTile } from "@/components/shared/icon-tile";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  illustration,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  // Artwork shown instead of the icon tile, for first-run screens.
  illustration?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-6 py-16 text-center",
        className
      )}
    >
      {illustration ?? <IconTile icon={icon} size="xl" />}
      <div className="space-y-1">
        <p className="text-lg font-semibold">{title}</p>
        {description && (
          <p className="text-muted-foreground mx-auto max-w-xs text-base text-pretty">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
