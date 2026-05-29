# Welcome TTS (Prototype C)

Two-line boot prompt before passphrase capture. Calibrate copy and timing in [`src/config/welcomeLines.ts`](../src/config/welcomeLines.ts).

## Boot lines (production default)

| Copy | Voice |
|------|-------|
| `Welcome to real-time-tax` | Robot/neutral (ElevenLabs if configured, else browser) |
| `Say passphrase` | Female/neutral (ElevenLabs if configured, else browser) |

**Timing:** `WELCOME_PRE_VOICE_MS` **600** ms after unmute → TTS · `WELCOME_LISTENING_LABEL_MS` **120** ms → “I'm listening” · `WELCOME_FAILSAFE_MS` **5000** ms cap · mic mute → `cancelSpeech()`.

Set `WELCOME_SINGLE_LINE` to `true` only for emergency one-line fallback mode.

## Trigger (when speech plays)

**Chosen flow:** `WELCOME_TTS_TRIGGER` = **`first-mic-unmute`**

1. App loads → optional **~2s S-PUL skeleton teaser** (`SPUL_TEASER_MS` in `src/constants/spulTeaser.ts`) — **no TTS** during teaser.
2. Teaser ends or user skips (pointer down) → voice auth security screen visible.
3. User taps **Unmute** (mic button) → browser mic permission → on success, **`playBootSequence()`** runs **once** per page load.

This satisfies **autoplay policy**: audio starts only after a **user gesture** (the unmute click), not on load or teaser alone.

**Not used:** auto-play when security layer first appears without unmute (would be blocked or muted in Chrome/Safari).

## Environment

Copy [`.env.example`](../.env.example) → `.env` in `prototype-c/`:

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_ELEVENLABS_API_KEY` | No | ElevenLabs HTTP TTS; omit → Web Speech API |
| `VITE_ELEVENLABS_VOICE_ID` | No | **Line 2** female voice (default Rachel `21m00Tcm4TlvDq8ikWAM`) |
| `VITE_ELEVENLABS_VOICE_ID_ROBOT` | No | **Line 1** robot/neutral; if unset with API key, line 1 uses browser neutral TTS |
| `VITE_ELEVENLABS_MODEL_ID` | No | Model (default `eleven_turbo_v2_5`) |

Restart Vite after editing `.env`.

## Fallback

- **Line 1:** `speechSynthesis` with neutral/male hints (rate ~0.9, pitch ~0.78).
- **Line 2:** `speechSynthesis` with best en-US **female** (Samantha, Karen, Victoria, etc.).

## Test locally

```bash
cd prototype-c
cp .env.example .env
# optional: set VITE_ELEVENLABS_API_KEY and voice ids
npm ci
npm run dev
```

Open **http://127.0.0.1:5175/**

1. Wait for S-PUL teaser (~2s) or tap the screen to skip.
2. Tap **Unmute** and allow microphone.
3. Hear line 1 → **500 ms** silence → line 2.
4. Perimeter glow (`.va-perimeter-glow`) appears only while **listening** (after unmute), not during teaser.

**Without mic:** TTS still runs after unmute if permission is granted; if permission is denied, boot TTS does not run (`bootPlayedRef` resets).

## Reference UI

Production HTML layout (orb, glow, clusters): [`public/reference/voice_auth_production.html`](../public/reference/voice_auth_production.html). React uses class `va-perimeter-glow`; reference documents `.va-glow` alias — glow is **always on** in the static file for visual QA; the app ties glow to `isListening` only.
