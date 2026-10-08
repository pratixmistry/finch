import { generateSystemPrompt, type LibrarySpec } from "@openuidev/lang-core";
import spec from "./generated/spec.json";
import { promptOptions } from "./prompt-options";

const library = spec as unknown as LibrarySpec;

/**
 * Builds the system prompt from the generated library spec.
 *
 * Through OpenUI Gateway (`cloud: true`) this emits Gateway's managed config
 * block, which is what lets it validate and auto-fix the generated UI against
 * this library. Against any other OpenAI-compatible provider it emits the full
 * OpenUI Lang prompt locally.
 */
export function finchSystemPrompt(options: { gateway: boolean; context: string }) {
  if (options.gateway) {
    return generateSystemPrompt({
      cloud: true,
      library,
      promptOptions: {
        preamble: promptOptions.preamble,
        additionalRules: promptOptions.additionalRules,
        examples: promptOptions.examples,
      },
      instructions: options.context,
    });
  }
  return `${generateSystemPrompt({ library, promptOptions })}\n\n${options.context}`;
}
