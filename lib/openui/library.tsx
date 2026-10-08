"use client";

/**
 * Finch's OpenUI component library — the contract for what the agent may
 * render. It is OpenUI's built-in chat library plus a few Finch components.
 *
 * This file is also the entry point for the OpenUI CLI: `npm run generate`
 * reads the `library` and `promptOptions` exports and writes
 * lib/openui/generated/spec.json, which the chat route turns into the system
 * prompt. Re-run it whenever a component here changes.
 */
import { createLibrary, defineComponent } from "@openuidev/react-lang";
import { openuiChatComponentGroups, openuiChatLibrary } from "@openuidev/react-ui/genui-lib";
import { z } from "zod/v4";
import { BudgetMeter } from "./components/budget-meter";
import { CategoryBreakdown, CategoryShare } from "./components/category-breakdown";
import { ManageAction } from "./components/manage-action";
import { TransactionDraft } from "./components/transaction-draft";

export { promptOptions } from "./prompt-options";

// Components the agent can place directly in a response.
const finchBlocks = [TransactionDraft, BudgetMeter, CategoryBreakdown, ManageAction];
// Components that only appear inside another Finch component.
const finchParts = [CategoryShare];

// The built-in root Card only accepts built-in children, so Finch re-declares
// it with the same renderer and a children list widened to include its own.
const BaseCard = openuiChatLibrary.components.Card;
const baseCardShape = (BaseCard.props as z.ZodObject).shape;
const baseChildren = (baseCardShape.children as z.ZodArray<z.ZodUnion>).element.options;

const Card = defineComponent({
  name: "Card",
  description: BaseCard.description,
  props: z.object({
    children: z.array(z.union([...baseChildren, ...finchBlocks.map((block) => block.ref)])),
    sources: baseCardShape.sources,
  }),
  component: BaseCard.component,
});

export const library = createLibrary({
  root: "Card",
  components: [
    Card,
    ...Object.values(openuiChatLibrary.components).filter((component) => component.name !== "Card"),
    ...finchBlocks,
    ...finchParts,
  ],
  componentGroups: [
    ...openuiChatComponentGroups,
    {
      name: "Finch (personal finance)",
      components: [...finchBlocks, ...finchParts].map((component) => component.name),
      notes: [
        "- These render with Finch's own data-aware components. Prefer them over generic components when they fit.",
        "- All amounts are plain numbers in the user's currency — never pre-formatted strings.",
        "- TransactionDraft is the ONLY way to record a transaction. Emit one per transaction, and call list_accounts and list_categories first so the ids are real.",
        "- BudgetMeter: one per budget, from list_budgets.",
        "- CategoryBreakdown takes CategoryShare references, largest first, from get_spending_by_category.",
        "- ManageAction opens the form to add an account, budget, category or holding.",
      ],
    },
  ],
});
