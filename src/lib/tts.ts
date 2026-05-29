/** Proto C boot + line TTS — ElevenLabs when keyed, else Web Speech API. */

import {
  WELCOME_FAILSAFE_MS,
  WELCOME_LINE_1,
  WELCOME_LINE_2,
  WELCOME_PAUSE_MS,
  WELCOME_PRE_VOICE_MS,
  WELCOME_SINGLE_LINE,
} from "../config/welcomeLines";

let activeAudio: HTMLAudioElement | null = null;

const ELEVEN_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY?.trim() ?? "";
const ELEVEN_VOICE_FEMALE =
  import.meta.env.VITE_ELEVENLABS_VOICE_ID?.trim() || "21m00Tcm4TlvDq8ikWAM";
const ELEVEN_VOICE_ROBOT =
  import.meta.env.VITE_ELEVENLABS_VOICE_ID_ROBOT?.trim() ?? "";
const ELEVEN_MODEL =
  import.meta.env.VITE_ELEVENLABS_MODEL_ID?.trim() || "eleven_turbo_v2_5";

export function hasElevenLabsKey(): boolean {
  return ELEVEN_KEY.length > 0;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function pickBrowserVoice(preferFemale: boolean): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const femaleHints = [
    "samantha",
    "karen",
    "victoria",
    "moira",
    "fiona",
    "female",
    "zira",
    "google uk english female",
    "microsoft zira",
  ];
  const neutralHints = ["daniel", "alex", "fred", "male", "english"];

  const hints = preferFemale ? femaleHints : neutralHints;
  for (const hint of hints) {
    const hit = voices.find((v) => v.name.toLowerCase().includes(hint));
    if (hit) return hit;
  }
  if (preferFemale) {
    return voices.find((v) => /female|woman/i.test(v.name)) ?? voices[0];
  }
  return voices.find((v) => !/female|woman/i.test(v.name)) ?? voices[0];
}

export function speakBrowser(
  text: string,
  opts: { female?: boolean; rate?: number; pitch?: number } = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!("speechSynthesis" in window)) {
      reject(new Error("Speech synthesis not supported"));
      return;
    }

    const run = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = opts.rate ?? (opts.female ? 0.98 : 0.92);
      utterance.pitch = opts.pitch ?? (opts.female ? 1.05 : 0.82);
      utterance.volume = 0.92;
      const voice = pickBrowserVoice(Boolean(opts.female));
      if (voice) utterance.voice = voice;
      utterance.onend = () => resolve();
      utterance.onerror = (ev) =>
        reject(
          new Error(
            (ev as SpeechSynthesisErrorEvent).error ?? "speechSynthesis failed",
          ),
        );
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      run();
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      run();
    };
    window.setTimeout(run, 120);
  });
}

export async function speakElevenLabs(
  text: string,
  voiceId = ELEVEN_VOICE_FEMALE,
  opts: { femaleFallback?: boolean } = {},
): Promise<void> {
  if (!ELEVEN_KEY) {
    await speakBrowser(text, { female: opts.femaleFallback ?? true });
    return;
  }

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVEN_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: ELEVEN_MODEL,
        voice_settings: { stability: 0.42, similarity_boost: 0.78 },
      }),
    },
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `ElevenLabs TTS failed (${res.status})${detail ? `: ${detail.slice(0, 120)}` : ""}`,
    );
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  try {
    await new Promise<void>((resolve, reject) => {
      const audio = new Audio(url);
      activeAudio = audio;
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error("Audio playback failed"));
      void audio.play().catch(reject);
    });
  } finally {
    if (activeAudio) activeAudio = null;
    URL.revokeObjectURL(url);
  }
}

async function speakWelcomeLine1(): Promise<void> {
  try {
    if (hasElevenLabsKey() && ELEVEN_VOICE_ROBOT) {
      await speakElevenLabs(WELCOME_LINE_1, ELEVEN_VOICE_ROBOT, {
        femaleFallback: false,
      });
    } else if (hasElevenLabsKey()) {
      await speakBrowser(WELCOME_LINE_1, {
        female: false,
        rate: 0.9,
        pitch: 0.78,
      });
    } else {
      await speakBrowser(WELCOME_LINE_1, {
        female: false,
        rate: 0.9,
        pitch: 0.78,
      });
    }
  } catch {
    await speakBrowser(WELCOME_LINE_1, { female: false }).catch(() => {});
  }
}

async function speakWelcomeLine2(): Promise<void> {
  try {
    await speakElevenLabs(WELCOME_LINE_2, ELEVEN_VOICE_FEMALE, {
      femaleFallback: true,
    });
  } catch {
    await speakBrowser(WELCOME_LINE_2, { female: true }).catch(() => {});
  }
}

async function speakWelcomeSingleLine(): Promise<void> {
  try {
    await speakElevenLabs(WELCOME_LINE_1, ELEVEN_VOICE_FEMALE, {
      femaleFallback: true,
    });
  } catch {
    await speakBrowser(WELCOME_LINE_1, { female: true }).catch(() => {});
  }
}

/** Boot: pre-voice delay → single welcome line (or two-line legacy). */
export async function playBootSequence(signal?: AbortSignal): Promise<void> {
  await delay(WELCOME_PRE_VOICE_MS);
  if (signal?.aborted) return;

  const speakTask = (async () => {
    if (WELCOME_SINGLE_LINE) {
      await speakWelcomeSingleLine();
      return;
    }
    await speakWelcomeLine1();
    if (signal?.aborted) return;
    await delay(WELCOME_PAUSE_MS);
    if (signal?.aborted) return;
    await speakWelcomeLine2();
  })();

  const failsafe = delay(WELCOME_FAILSAFE_MS);
  await Promise.race([speakTask, failsafe]);
}

export function cancelSpeech(): void {
  window.speechSynthesis?.cancel();
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.src = "";
    activeAudio = null;
  }
}
