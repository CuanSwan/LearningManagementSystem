import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY;
const anthropic = apiKey ? new Anthropic({ apiKey }) : null;

// Dev-only stand-in for when there's no ANTHROPIC_API_KEY yet. It lets
// someone click through the chat UI (sending messages, presets, "Apply &
// restart chat") without a real key - it does NOT react to the system
// prompt, so it's no substitute for testing the lesson's actual teaching
// point. Opt-in and separate from the real-key check so a forgotten key in
// production fails loudly (502) instead of silently serving fake replies.
const mockMode = process.env.PROMPT_SIM_MOCK === "true";
const MOCK_REPLIES = [
  "Thanks for reaching out! (mock reply - set ANTHROPIC_API_KEY to talk to the real model)",
  "Got it - anything else I can help with? (mock reply)",
  "Sure thing. (mock reply - this bot isn't reading your system prompt right now)",
];

export interface PromptSimulationTurn {
  role: "user" | "assistant";
  content: string;
}

// Keeps replies short (a chat bubble, not an essay) and cheap - `effort:
// "low"` is appropriate here since this is a short conversational reply,
// not a hard reasoning task. Server-side fallbacks are on by default per
// Anthropic's own guidance for claude-opus-5-5 requests.
const MODEL = "claude-opus-5-5";
const MAX_REPLY_TOKENS = 600;

// Mirrors mailer.ts's pattern: never throws, returns null when the feature
// is unavailable (no API key) or the request itself fails, so the route
// handler stays a thin pass-through.
export async function runPromptSimulationChat(systemPrompt: string, turns: PromptSimulationTurn[]): Promise<string | null> {
  if (mockMode) {
    const userTurnCount = turns.filter((t) => t.role === "user").length;
    return MOCK_REPLIES[(userTurnCount - 1) % MOCK_REPLIES.length];
  }
  if (!anthropic) {
    console.warn("ANTHROPIC_API_KEY not set - prompt simulation chat is unavailable.");
    return null;
  }
  try {
    const response = await anthropic.beta.messages.create({
      model: MODEL,
      max_tokens: MAX_REPLY_TOKENS,
      system: systemPrompt,
      messages: turns.map((turn) => ({ role: turn.role, content: turn.content })),
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });

    if (response.stop_reason === "refusal") {
      return "I'm not able to help with that - could you try rephrasing?";
    }

    const textBlock = response.content.find((block) => block.type === "text");
    return textBlock?.text ?? null;
  } catch (err) {
    console.error("Prompt simulation chat request failed:", err);
    return null;
  }
}
