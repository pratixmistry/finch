"use client";

import "@openuidev/react-ui/styles/index.css";

import * as React from "react";
import {
  AgentInterface,
  fetchLLM,
  vercelAIAdapter,
  vercelAIMessageFormat,
} from "@openuidev/react-ui";
import { Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { library } from "@/lib/openui/library";

// The chat route returns the AI SDK's native UIMessage stream, so the browser
// decodes it with the matching adapter and message format.
const llm = fetchLLM({
  url: "/api/chat",
  streamAdapter: vercelAIAdapter(),
  messageFormat: vercelAIMessageFormat,
});

const STARTERS = [
  { displayText: "How am I doing this month?", prompt: "How am I doing this month?" },
  {
    displayText: "Where did my money go?",
    prompt: "Break down my spending by category this month.",
  },
  { displayText: "Am I within my budgets?", prompt: "Show my budgets and how much is left in each." },
  {
    displayText: "Income vs expenses this year",
    prompt: "Chart my income and expenses month by month this year.",
  },
  { displayText: "Add an expense", prompt: "I want to add an expense." },
];

// Brand accent and type, so OpenUI's shell and built-in components sit with
// Finch's own components.
const ACCENT = { interactiveAccentDefault: "#4f39f6", interactiveAccentHover: "#4330d6" };
// Same stack as --font-sans in globals.css (that token is inlined by Tailwind,
// so it is not available as a CSS variable here).
const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", var(--font-geist-sans), system-ui, "Segoe UI", sans-serif';
const FONT = { fontBody: FONT_STACK, fontHeading: FONT_STACK };

function greeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function useMounted() {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function FinchAgent({ firstName }: { firstName: string }) {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  // The theme and the greeting both depend on the browser, so render them
  // only after hydration.
  if (!mounted) return <div className="h-svh" />;

  return (
    <div className="h-svh w-full overflow-hidden">
      <AgentInterface
        llm={llm}
        componentLibrary={library}
        agentName="Finch"
        logoUrl="/icon.svg"
        starters={STARTERS}
        starterVariant="short"
        theme={{
          mode: resolvedTheme === "dark" ? "dark" : "light",
          lightTheme: { ...ACCENT, ...FONT },
          darkTheme: { interactiveAccentDefault: "#7c6cff", interactiveAccentHover: "#9186ff", ...FONT },
        }}
      >
        <AgentInterface.Welcome
          title={`${greeting(new Date().getHours())}${firstName ? `, ${firstName}` : ""}`}
          description="Ask about your accounts, spending, budgets or investments — or tell me what to record."
        />

        <AgentInterface.Sidebar>
          <AgentInterface.SidebarHeader />
          <AgentInterface.SidebarContent>
            <AgentInterface.NewChatButton />
            <AgentInterface.ThreadList />
            <AgentInterface.SidebarSeparator />
            <AgentInterface.SidebarItem icon={<Settings size={14} />} path="settings">
              Settings
            </AgentInterface.SidebarItem>
          </AgentInterface.SidebarContent>
        </AgentInterface.Sidebar>

        <AgentInterface.Route path="settings">
          <SettingsPanel />
        </AgentInterface.Route>
      </AgentInterface>
    </div>
  );
}
