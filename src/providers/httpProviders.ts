import { API_BASE_URL, hasApiBaseUrl } from "../config/env";
import type { LlmProvider, VoiceAuthProvider, VoiceSession, VoiceUnlockResult } from "./contracts";
import { MockLlmProvider, MockVoiceAuthProvider } from "./mockProviders";

type HealthResponse = {
  status: string;
};

type StartSessionResponse = {
  session_id: string;
  challenge_phrase: string;
  started_at: string;
};

type ConverseResponse = {
  reply: string;
  intent: string;
  should_unlock: boolean;
  model: string;
};

function toUnlockResult(payload: ConverseResponse): VoiceUnlockResult {
  return {
    shouldUnlock: payload.should_unlock,
    intent: payload.intent,
    reply: payload.reply,
    model: payload.model,
  };
}

export class HttpLlmProvider implements LlmProvider {
  async converse(input: string, sessionId: string): Promise<VoiceUnlockResult> {
    const res = await fetch(`${API_BASE_URL}/api/converse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, text: input }),
    });
    if (!res.ok) {
      throw new Error(`Converse failed (${res.status})`);
    }
    const payload = (await res.json()) as ConverseResponse;
    return toUnlockResult(payload);
  }
}

export class HttpVoiceAuthProvider implements VoiceAuthProvider {
  constructor(private readonly llm: LlmProvider) {}

  async warm(): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    if (!res.ok) {
      throw new Error(`Health check failed (${res.status})`);
    }
    await res.json().catch(() => ({} as HealthResponse));
  }

  async startSession(): Promise<VoiceSession> {
    const res = await fetch(`${API_BASE_URL}/api/session/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      throw new Error(`Session start failed (${res.status})`);
    }
    const payload = (await res.json()) as StartSessionResponse;
    return {
      sessionId: payload.session_id,
      challengePhrase: payload.challenge_phrase,
      startedAt: payload.started_at,
    };
  }

  async verifyPassphrase(input: string, sessionId: string): Promise<VoiceUnlockResult> {
    return this.llm.converse(input, sessionId);
  }
}

export function createVoiceProviders(): { authProvider: VoiceAuthProvider; llmProvider: LlmProvider } {
  if (!hasApiBaseUrl) {
    const llmProvider = new MockLlmProvider();
    return {
      llmProvider,
      authProvider: new MockVoiceAuthProvider(llmProvider),
    };
  }
  const llmProvider = new HttpLlmProvider();
  return {
    llmProvider,
    authProvider: new HttpVoiceAuthProvider(llmProvider),
  };
}
