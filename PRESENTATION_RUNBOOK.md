# Presentation Runbook — Real-Time-Tax Voice Auth

A tight, reliable live-demo script. ~90 seconds.

## Before you present
- Open the live URL in **Chrome or Edge** (best Web Speech support): https://realtime-tax-voiceauth.onrender.com/
- Free Render tier cold-starts: **load the page ~60s early** so the first paint isn't a spinner.
- Allow the **microphone** when prompted (one time). Use a quiet room or a headset mic.
- Audio on. The greeting speaks aloud on the first mic tap.

## The demo (what to say / do)
1. **Set the frame:** "This is the security layer — voice-first. The orb is the system's face."
2. **Tap the mic.** It greets: *"Welcome to Workplace … Say your passphrase to unlock."*
   The orb drops into the listening state (perimeter glow breathes).
3. **Speak slowly:** "my voice is my password."
   - Point out: the orb **reacts to your voice** — swells and brightens as you talk.
   - Point out: each word **shimmers** as the system recognizes it (real speech recognition, not a script).
4. **Unlock:** on the final word it confirms — *"Voice recognized. Access granted."*
5. **Close the loop:** "From here it hands to the S-PUL search layer — the same orb, now your tax-intelligence assistant."

## If something misbehaves (recovery)
- **No greeting audio:** browser blocked autoplay — tap the mic once more; it fires on the user gesture.
- **Mic not recognized:** check the address bar mic permission; reload; speak closer/slower.
- **Spinner / slow first load:** Render free-tier cold start — wait ~30–60s, it wakes.
- **Worst case fallback:** click **"Enter PIN"** to show the graceful non-voice path.

## Honest framing for technical viewers
- The **interaction, reactivity, and recognition are real.** The **verify decision + bot replies** are the
  mock today; the production LLM/voice backend drops in at `VITE_API_BASE_URL` with no frontend change.
- This is the same code as `workplace-technologies/realtime-tax` `Prototypes/Prototype-A` — this repo is just the public deploy mirror.
