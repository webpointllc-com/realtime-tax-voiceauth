/**
 * Welcome boot TTS — edit here to calibrate copy and timing without touching playback code.
 * Playback: `src/lib/tts.ts` · trigger: `docs/WELCOME_TTS.md`
 */

/** Line 1 voice prompt (robot/neutral). */
export const WELCOME_LINE_1 = "Welcome to Workplace";

/** Optional second line — skipped when `WELCOME_SINGLE_LINE` is true. */
export const WELCOME_LINE_2 = "Say your passphrase to unlock";

/** Two-line mode: pause between line 1 end and line 2 start. */
export const WELCOME_PAUSE_MS = 500;

/** Two-line boot sequence for passphrase gate. */
export const WELCOME_SINGLE_LINE = false;

/** Delay after mic unmute before TTS starts. */
export const WELCOME_PRE_VOICE_MS = 600;

/** Show “I'm listening” this many ms after unmute (before/at voice start). */
export const WELCOME_LISTENING_LABEL_MS = 120;

/** Max wait for boot TTS before continuing (fail-safe). */
export const WELCOME_FAILSAFE_MS = 5000;

/**
 * When speech runs (autoplay-safe):
 * - `first-mic-unmute` — first tap on **Unmute** after mic permission succeeds (user gesture).
 * - Does **not** run on S-PUL teaser alone or on page load.
 */
export const WELCOME_TTS_TRIGGER = "first-mic-unmute" as const;

export type WelcomeTtsTrigger = typeof WELCOME_TTS_TRIGGER;
