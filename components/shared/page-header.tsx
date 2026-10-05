import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  children,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-wrap items-end justify-between gap-x-6 gap-y-4", className)}>
      <div className="min-w-0 space-y-1">
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {description && (
          <p className="text-muted-foreground max-w-prose text-base text-pretty">{description}</p>
        )}
      </div>
      {children && <div className="flex flex-wrap items-center gap-x-4 gap-y-3">{children}</div>}
    </header>
  );
}
