import { useState } from "react";
import type { PromptSimulationLesson as PromptSimulationLessonType } from "../types.js";
import { runPromptSimulationChat } from "../api.js";
import { RichTextView } from "./RichTextView.js";

interface ChatMessage {
  role: "user" | "assistant" | "error";
  text: string;
}

export function PromptSimulationLesson({
  content,
  isComplete = false,
  onComplete = () => {},
}: {
  content: PromptSimulationLessonType["content"];
  isComplete?: boolean;
  onComplete?: () => void;
}) {
  const [activePreset, setActivePreset] = useState(0);
  const [systemPrompt, setSystemPrompt] = useState(content.presets[0]?.systemPrompt ?? "");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  function applyPreset(index: number) {
    setActivePreset(index);
    setSystemPrompt(content.presets[index]?.systemPrompt ?? "");
  }

  async function sendMessage(rawText: string) {
    const text = rawText.trim();
    if (!text || sending) return;
    const nextMessages: ChatMessage[] = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);
    try {
      // Only user/assistant turns are sent - a prior error bubble is a
      // client-side artifact, not something the model ever said or should
      // see echoed back to it.
      const turns = nextMessages
        .filter((m): m is ChatMessage & { role: "user" | "assistant" } => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.text }));
      const { reply } = await runPromptSimulationChat(systemPrompt, turns);
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "error", text: err instanceof Error ? err.message : "Something went wrong - try again." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="prompt-sim">
      {content.lede && <RichTextView className="prompt-sim-lede" html={content.lede} />}

      <div className="prompt-sim-stage">
        <section className="prompt-sim-editor">
          <div className="prompt-sim-editor-head">
            <p className="prompt-sim-editor-title">SYSTEM_PROMPT.txt</p>
            <p className="field-hint">This is what the bot is told before every conversation - its system prompt.</p>
          </div>

          {content.presets.length > 1 && (
            <div className="prompt-sim-presets">
              {content.presets.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  className={`prompt-sim-preset-btn${i === activePreset ? " active" : ""}`}
                  onClick={() => applyPreset(i)}
                >
                  {preset.label}
                  {preset.note && <span className="prompt-sim-preset-note">{preset.note}</span>}
                </button>
              ))}
            </div>
          )}

          <div className="prompt-sim-editor-body">
            <textarea
              className="prompt-sim-textarea"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              spellCheck={false}
            />
            <div className="prompt-sim-apply-row">
              <button type="button" onClick={() => setMessages([])}>
                Apply &amp; restart chat
              </button>
            </div>
          </div>
        </section>

        <section className="prompt-sim-chat">
          <div className="prompt-sim-chat-head">
            {content.botAvatar && <span className="prompt-sim-avatar">{content.botAvatar}</span>}
            <span className="prompt-sim-bot-name">{content.botName || "Support bot"}</span>
          </div>

          <div className="prompt-sim-log">
            {messages.length === 0 && <p className="prompt-sim-log-empty">Try a message below, or type your own.</p>}
            {messages.map((m, i) => (
              <div key={i} className={`prompt-sim-bubble prompt-sim-bubble-${m.role}`}>
                {m.text}
              </div>
            ))}
            {sending && <div className="prompt-sim-bubble prompt-sim-bubble-assistant prompt-sim-bubble-thinking">Thinking…</div>}
          </div>

          {content.quickReplies.length > 0 && (
            <div className="prompt-sim-quick-row">
              {content.quickReplies.map((q, i) => (
                <button key={i} type="button" className="prompt-sim-chip" onClick={() => sendMessage(q)} disabled={sending}>
                  {q}
                </button>
              ))}
            </div>
          )}

          <form
            className="prompt-sim-composer"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message as the customer…"
              disabled={sending}
            />
            <button type="submit" disabled={sending || !input.trim()}>
              Send
            </button>
          </form>
        </section>
      </div>

      {!isComplete && (
        <button type="button" className="prompt-sim-complete-btn" onClick={onComplete}>
          Mark as complete
        </button>
      )}
    </div>
  );
}
