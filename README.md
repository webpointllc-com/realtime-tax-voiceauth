# Real-Time-Tax — Voice Auth Prototype (presentation build)

Public deploy surface for the Real-Time-Tax voice-first security layer.
Vite + React + Tailwind. Particle-sphere voice orb, real browser speech recognition,
karaoke shimmer passphrase ("My Voice Is My Password"), S-PUL teaser loop.
Runs fully standalone on mock providers; endpoint-ready for the real full stack.

> Canonical source of truth lives in `workplace-technologies/realtime-tax`
> (`Prototypes/Prototype-A`). This repo is the **public Render deploy mirror** so
> teammates get a working link without private-org access.

## Live demo
- **App:** https://realtime-tax-voiceauth.onrender.com/
- Tap the mic → hear "Welcome to Workplace" → "Say your passphrase to unlock" →
  the orb drops into listening → say **"my voice is my password"** → the glyphs
  shimmer-sweep word-by-word as recognized → unlock confirmation.
- Mic + audio require **HTTPS + a click** (browser autoplay/permission rules). Works on the live URL; the in-editor Squarespace preview may not prompt until the page is published.

## Run locally
```bash
npm ci
npm run dev          # http://localhost:5173
npm run build        # production bundle -> dist/
npm run preview      # serve the built bundle
```
With no env, the app runs on **mock providers** (still fully usable).
To wire a live backend: set `VITE_API_BASE_URL=https://<your-api>` and rebuild.

## What's real vs mock (named honestly)
- **Real:** Web Speech API recognition, amplitude-reactive orb (mic RMS → spin/breathe/brightness),
  glyph shimmer-sweep, full LISTENING→passphrase→verify flow, provider seam.
- **Mock (as of now):** the verify decision + bot voice run on the local mock
  (`should_unlock` when transcript contains "voice"+"password"). The real LLM/voice
  backend drops in at `VITE_API_BASE_URL` with **zero frontend changes**.

## Architecture
- `src/components/VoiceOrbCanvas.tsx` — Fibonacci-sphere particle orb; `amplitude` prop drives spin/breathe/brightness.
- `src/components/KaraokeShimmerText.tsx` — CSS-variable shimmer band swept across active-word glyphs.
- `src/hooks/useUnlockPhrase.ts` — real `SpeechRecognition`, fuzzy word matching to the unlock phrase.
- `src/hooks/useVoiceAmplitude.ts` — `getUserMedia` → AnalyserNode RMS → EMA-smoothed amplitude.
- `src/providers/` — `mockProviders` (standalone) and `httpProviders` (live backend) behind one contract.
- `src/lib/tts.ts` + `src/config/welcomeLines.ts` — boot greeting (ElevenLabs when keyed, else Web Speech).

## Deploy (best-practice, this repo)
Static-site blueprint in `render.yaml`, hosted public under `webpointllc-com`.
1. Render → Blueprints → **New Blueprint Instance** → select this repo → **Apply** (one time).
2. Service `realtime-tax-voiceauth` builds (`npm ci && npm run build` → `dist/`).
3. `autoDeploy: true` → every push to `main` redeploys automatically.
4. Squarespace embed: `./pbcopy_iframe.sh https://realtime-tax-voiceauth.onrender.com` → paste into a 7.1 **Code Block**.

See `PRESENTATION_RUNBOOK.md` for the live-demo script.
