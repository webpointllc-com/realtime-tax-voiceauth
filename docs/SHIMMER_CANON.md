# Prototype C — shimmer canon (locked)

**Effects (two modes):**

1. **Line** (`mode` default) — Cursor agent “planning” line: one continuous band **L→R** on the full line (`Voice stream` copy).
2. **Phrase** (`mode="phrase"`) — Unlock copy under the orb: **per-glyph** white band on the **active word only**; completed words settle bright; pending = `zinc-500`. Driven by Web Speech + `matchPhraseProgress`.

## Reference captures (2026-05-27)

| File | Line shown |
|------|------------|
| `Screenshot_2026-05-27_at_7.15.00_AM-d2224713…png` | **Primary lock** — “Updating Cursor-style shimmer sweep” |
| `Screenshot_2026-05-27_at_7.14.07_AM-8cbbe5ec…png` | “Planning next move” |
| `Screenshot_2026-05-27_at_7.12.24_AM-0bf549a5…png` | “Reading Proto C layout and repo” |

## Implementation (`prototype-c/`)

| Piece | Location |
|-------|----------|
| Text sweep | `src/components/KaraokeShimmerText.tsx` — rAF drives `--shimmer-pos` |
| Gradient | `src/index.css` `.karaoke-shimmer-line` — `background-clip: text`, 90deg |
| Page load-in | `src/components/ShimmerLoadIn.tsx` + `.shimmer-load-overlay` (container wash, not text) |
| Voice-reactive | `useVoiceAmplitude` → faster sweep + narrower band when mic live |

## Colors (locked)

- Base: `zinc-500` `rgb(113 113 122)`
- Peak: `rgb(255 255 255)`
- Lead: `zinc-300` · Trail: `zinc-400`

## Do not change without new reference

Per-word karaoke, blue tint bands, or random opacity — **out of canon**.
