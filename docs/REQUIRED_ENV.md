# Prototype C — required environment

Local dev: copy `.env.example` → `.env` in `prototype-c/` (never commit `.env`).

## Vite (browser)

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_API_BASE_URL` | No | Preferred backend origin for `/api/*` provider calls. |
| `VITE_API_BASE` | No | Legacy fallback alias; keep for backward compatibility only. |
| `VITE_ELEVENLABS_API_KEY` | No | ElevenLabs TTS for boot lines. Free tier ~10k chars/mo. |
| `VITE_ELEVENLABS_VOICE_ID` | No | **Line 2** female voice (default `21m00Tcm4TlvDq8ikWAM` — Rachel). |
| `VITE_ELEVENLABS_VOICE_ID_ROBOT` | No | **Line 1** robot/neutral; if omitted with API key, line 1 uses browser neutral TTS. |
| `VITE_ELEVENLABS_MODEL_ID` | No | Model (default `eleven_turbo_v2_5`). |

Without `VITE_API_BASE_URL`/`VITE_API_BASE`, the app runs in clean mock mode via `src/providers/mockProviders.ts`.

Without `VITE_ELEVENLABS_API_KEY`, boot TTS uses **Web Speech API** (`speechSynthesis`): neutral line 1, best-effort female for line 2.

Calibration: [`WELCOME_TTS.md`](WELCOME_TTS.md) · [`src/config/welcomeLines.ts`](../src/config/welcomeLines.ts).

## Mic (browser permission)

No env var. User must click **Unmute** and allow microphone in the browser chrome. Denied → inline error on the voice screen.

## Dev server

```bash
cd prototype-c
npm install
npm run dev   # http://127.0.0.1:5175
```

Restart Vite after changing `.env`.

## Security note

Prototype keys in `VITE_*` are bundled to the client. Use a dedicated ElevenLabs key with low quota for demos only; proxy through a backend before production.
