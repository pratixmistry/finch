import { Logo } from "@/components/shared/logo";
import {
  ArrowUpRight,
  LineChart,
  PiggyBank,
  ShieldCheck,
} from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: LineChart,
    title: "See your whole financial picture",
    description: "Income, expenses, investments, and net worth in one dashboard.",
  },
  {
    icon: PiggyBank,
    title: "Budgets that keep you honest",
    description: "Category limits with real-time usage, not month-end surprises.",
  },
  {
    icon: ShieldCheck,
    title: "Your data, isolated and secure",
    description: "Row-level security means only you can ever see your numbers.",
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, var(--sidebar-foreground) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: "var(--primary)" }}
        />

        <Logo className="relative z-10 [&_span]:text-sidebar-foreground" />

        <div className="relative z-10 space-y-10">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-balance">
              Know exactly where your money goes.
            </h1>
            <p className="text-sidebar-foreground/70 text-balance">
              A calmer, clearer way to track income, spending, and net worth —
              built for people who want the full picture, not just a balance.
            </p>
          </div>

          <div className="space-y-5">
            {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent">
                  <Icon className="size-4 text-sidebar-accent-foreground" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-sidebar-foreground/60 text-sm">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sidebar-foreground/50 relative z-10 flex items-center gap-1 text-xs">
          Demo product for personal finance tracking
          <ArrowUpRight className="size-3" />
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-8 p-6 sm:p-10">
        <Logo className="lg:hidden" />
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
