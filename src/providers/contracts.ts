export type VoiceSession = {
  sessionId: string;
  challengePhrase: string;
  startedAt: string;
};

export type VoiceUnlockResult = {
  shouldUnlock: boolean;
  intent: string;
  reply: string;
  model: string;
};

export interface VoiceAuthProvider {
  warm(): Promise<void>;
  startSession(): Promise<VoiceSession>;
  verifyPassphrase(input: string, sessionId: string): Promise<VoiceUnlockResult>;
}

export interface LlmProvider {
  converse(input: string, sessionId: string): Promise<VoiceUnlockResult>;
}
