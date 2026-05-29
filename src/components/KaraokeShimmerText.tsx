import { useEffect, useRef } from "react";
import { UNLOCK_PHRASE_DISPLAY } from "../lib/phraseProgress";

/** Slow L→R white band through glyphs on the active unlock word (~2s). */
export const KARAOKE_SWEEP_MS_PER_WORD = 2000;

export const KARAOKE_FIN_MS = 550;

type LineProps = {
  mode?: "line";
  text: string;
  amplitude: number;
  isListening: boolean;
  className?: string;
  /** stream = voice-stream panel; header = faster sweep for brand chrome */
  variant?: "stream" | "header";
};

type PhraseProps = {
  mode: "phrase";
  words?: readonly string[];
  activeWordIndex: number;
  phraseComplete: boolean;
  finActive: boolean;
  isListening: boolean;
  className?: string;
  amplitude?: number;
  text?: never;
};

type Props = LineProps | PhraseProps;

const SHIMMER_LINE = {
  posMin: -28,
  posMax: 128,
  idle: { speed: 0.11, tail: 22, soft: 4 },
  live: { speedBase: 0.38, speedAmp: 0.72, tailBase: 12, tailAmp: 14, softBase: 2.5, softAmp: 3.5 },
} as const;

/** Header brand shimmer — same technique, faster idle sweep + slightly tighter band */
const SHIMMER_HEADER = {
  posMin: -28,
  posMax: 128,
  idle: { speed: 0.2, tail: 18, soft: 3 },
  live: { speedBase: 0.42, speedAmp: 0.65, tailBase: 10, tailAmp: 12, softBase: 2, softAmp: 3 },
} as const;

const SHIMMER_GLYPH = {
  posMin: -32,
  posMax: 132,
  tail: 18,
  soft: 3.5,
} as const;

function LineShimmer({
  text,
  amplitude,
  isListening,
  className = "",
  variant = "stream",
}: LineProps) {
  const preset = variant === "header" ? SHIMMER_HEADER : SHIMMER_LINE;
  const lineRef = useRef<HTMLParagraphElement>(null);
  const posRef = useRef(preset.posMin);
  const rafRef = useRef(0);

  useEffect(() => {
    const tick = () => {
      const tail = isListening
        ? preset.live.tailBase + amplitude * preset.live.tailAmp
        : preset.idle.tail;
      const soft = isListening
        ? preset.live.softBase + amplitude * preset.live.softAmp
        : preset.idle.soft;
      const speed = isListening
        ? preset.live.speedBase + amplitude * preset.live.speedAmp
        : preset.idle.speed;

      posRef.current += speed;
      if (posRef.current > preset.posMax) posRef.current = preset.posMin;

      const el = lineRef.current;
      if (el) {
        el.style.setProperty("--shimmer-pos", `${posRef.current}%`);
        el.style.setProperty("--band-tail", `${tail}%`);
        el.style.setProperty("--band-soft", `${soft}%`);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [amplitude, isListening, preset]);

  return (
    <p
      ref={lineRef}
      className={`karaoke-shimmer-line font-normal leading-relaxed ${className}`}
      aria-live="polite"
    >
      {text}
    </p>
  );
}

function PhraseShimmer({
  words = UNLOCK_PHRASE_DISPLAY,
  activeWordIndex,
  phraseComplete,
  finActive,
  isListening,
  className = "",
}: PhraseProps) {
  const glyphRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const rafRef = useRef(0);
  const startRef = useRef(0);
  const wordRef = useRef(activeWordIndex);

  const paintActiveGlyphs = (pos: number) => {
    glyphRefs.current.forEach((el) => {
      if (!el) return;
      el.style.setProperty("--shimmer-pos", `${pos}%`);
      el.style.setProperty("--band-tail", `${SHIMMER_GLYPH.tail}%`);
      el.style.setProperty("--band-soft", `${SHIMMER_GLYPH.soft}%`);
    });
  };

  useEffect(() => {
    if (wordRef.current !== activeWordIndex) {
      wordRef.current = activeWordIndex;
      startRef.current = 0;
    }
  }, [activeWordIndex]);

  useEffect(() => {
    glyphRefs.current = [];
    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const elapsed = now - startRef.current;
      const span = SHIMMER_GLYPH.posMax - SHIMMER_GLYPH.posMin;
      let t = elapsed / KARAOKE_SWEEP_MS_PER_WORD;
      if (t >= 1 && !phraseComplete) {
        startRef.current = now;
        t = 0;
      }
      const clamped = Math.min(1, t);
      paintActiveGlyphs(SHIMMER_GLYPH.posMin + span * clamped);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [activeWordIndex, isListening, phraseComplete]);

  return (
    <p
      className={`karaoke-phrase text-center text-[15px] font-normal leading-relaxed ${finActive ? "karaoke-phrase-fin" : ""} ${className}`}
      aria-live="polite"
    >
      {words.map((word, wi) => {
        const done = phraseComplete || wi < activeWordIndex;
        const active = !phraseComplete && wi === activeWordIndex;
        const pending = !done && !active;

        return (
          <span key={`${word}-${wi}`} className="karaoke-word">
            {word.split("").map((ch, ci) => (
              <span
                key={`${wi}-${ci}`}
                ref={(el) => {
                  if (active) glyphRefs.current[ci] = el;
                }}
                className={[
                  "karaoke-glyph",
                  done ? "karaoke-glyph-done" : "",
                  active ? "karaoke-glyph-active" : "",
                  pending ? "karaoke-glyph-pending" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {ch}
              </span>
            ))}
            {wi < words.length - 1 ? "\u00a0" : null}
          </span>
        );
      })}
    </p>
  );
}

export function KaraokeShimmerText(props: Props) {
  if (props.mode === "phrase") {
    return <PhraseShimmer {...props} />;
  }
  return <LineShimmer {...props} />;
}
