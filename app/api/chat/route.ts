import { createOpenAI } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { finchSystemPrompt } from "@/lib/openui/system-prompt";
import { createFinchTools } from "@/lib/openui/tools";
import { getProfile } from "@/lib/queries/profiles";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const GATEWAY_URL = "https://api.thesys.dev/v1/embed";

// OpenUI Gateway is the recommended route (it validates and repairs generated
// UI in the stream). Any OpenAI-compatible provider works as the alternative.
function resolveModel() {
  if (process.env.THESYS_API_KEY) {
    const gateway = createOpenAI({ baseURL: GATEWAY_URL, apiKey: process.env.THESYS_API_KEY });
    return {
      gateway: true,
      model: gateway.chat(process.env.FINCH_AGENT_MODEL ?? "google/gemini-3.6-flash-free"),
    };
  }
  if (process.env.OPENAI_API_KEY) {
    const openai = createOpenAI({
      baseURL: process.env.OPENAI_BASE_URL,
      apiKey: process.env.OPENAI_API_KEY,
    });
    return { gateway: false, model: openai.chat(process.env.FINCH_AGENT_MODEL ?? "gpt-5.2") };
  }
  return null;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }

  const resolved = resolveModel();
  if (!resolved) {
    return Response.json(
      { error: "No model key configured. Set THESYS_API_KEY or OPENAI_API_KEY in .env.local." },
      { status: 503 }
    );
  }

  const payload = (await req.json()) as { messages?: UIMessage[] };
  if (!Array.isArray(payload.messages)) {
    return Response.json({ error: "messages must be an array" }, { status: 400 });
  }

  const profile = await getProfile(supabase, user.id).catch(() => null);
  const currency = profile?.currency ?? "INR";
  const firstName = profile?.fullName?.split(" ")[0];

  const result = streamText({
    model: resolved.model,
    system: finchSystemPrompt({
      gateway: resolved.gateway,
      context: [
        `Today is ${new Date().toISOString().slice(0, 10)}.`,
        `The user's currency is ${currency}.`,
        firstName ? `The user's first name is ${firstName}.` : "",
      ]
        .filter(Boolean)
        .join(" "),
    }),
    messages: await convertToModelMessages(payload.messages),
    tools: createFinchTools(supabase, { currency }),
    stopWhen: stepCountIs(6),
    abortSignal: req.signal,
  });

  // Keep the AI SDK's native UIMessage stream; the browser decodes it with
  // OpenUI's vercelAIAdapter().
  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
