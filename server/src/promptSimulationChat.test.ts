import { describe, expect, it } from "vitest";
import { runPromptSimulationChat } from "./promptSimulationChat.js";

describe("runPromptSimulationChat", () => {
  it("returns null without making a request when ANTHROPIC_API_KEY isn't set", async () => {
    // Mirrors mailer.ts's own tests (or rather, lack of them) - with no API
    // key in this environment, the module takes its "feature unavailable"
    // branch for free, the same way sendVoucherEmail does with no
    // RESEND_API_KEY. This also means the test suite never makes a real,
    // billed request.
    expect(process.env.ANTHROPIC_API_KEY).toBeUndefined();
    const reply = await runPromptSimulationChat("You are a helpful assistant.", [{ role: "user", content: "Hello" }]);
    expect(reply).toBeNull();
  });
});
