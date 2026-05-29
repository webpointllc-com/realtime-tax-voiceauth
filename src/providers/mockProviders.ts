import type { LlmProvider, VoiceAuthProvider, VoiceSession, VoiceUnlockResult } from "./contracts";

const DEFAULT_PHRASE = "my voice is my password";

function normalize(input: string): string {
  return input.toLowerCase().replace(/\s+/g, " ").trim();
}

export class MockLlmProvider implements LlmProvider {
  async converse(input: string): Promise<VoiceUnlockResult> {
    const normalized = normalize(input);
    const shouldUnlock = normalized.includes("voice") && normalized.includes("password");
    return {
      shouldUnlock,
      intent: shouldUnlock ? "unlock" : "echo",
      reply: shouldUnlock
        ? "Voice recognized. Access granted."
        : `[mock] received passphrase candidate: "${input.slice(0, 80)}"`,
      model: "mock-llm-v1",
    };
  }
}

export class MockVoiceAuthProvider implements VoiceAuthProvider {
  constructor(private readonly llm: LlmProvider) {}

  async warm(): Promise<void> {
    return;
  }

  async startSession(): Promise<VoiceSession> {
    return {
      sessionId: `mock-${crypto.randomUUID()}`,
      challengePhrase: DEFAULT_PHRASE,
      startedAt: new Date().toISOString(),
    };
  }

  async verifyPassphrase(input: string): Promise<VoiceUnlockResult> {
    return this.llm.converse(input, "mock-session");
  }
}
