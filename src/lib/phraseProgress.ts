/** In-order unlock phrase — aligned with Proto B donor. */

export const UNLOCK_PHRASE = ["my", "voice", "is", "my", "password"] as const;

export const UNLOCK_PHRASE_DISPLAY = ["My", "Voice", "Is", "My", "Password"] as const;

const ALIASES: Record<string, string[]> = {
  my: ["my", "mai", "mi", "ny", "me"],
  voice: ["voice", "voices", "voiced", "boys", "boyce"],
  is: ["is", "his", "as", "ease"],
  password: ["password", "passwords", "pass-word", "pass"],
};

function tokenize(s: string): string[] {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z\s']/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** How many of the 5 target words have been spoken in order (0..5). */
export function matchPhraseProgress(transcript: string): number {
  const toks = tokenize(transcript);
  let cursor = 0;
  for (const tok of toks) {
    if (cursor >= UNLOCK_PHRASE.length) break;
    const target = UNLOCK_PHRASE[cursor];
    const accepts = ALIASES[target] ?? [target];
    if (accepts.includes(tok)) cursor++;
  }
  return cursor;
}

export function isPhraseComplete(progress: number): boolean {
  return progress >= UNLOCK_PHRASE.length;
}
