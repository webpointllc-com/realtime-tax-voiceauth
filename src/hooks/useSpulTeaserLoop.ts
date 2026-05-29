import { useCallback, useEffect, useRef, useState } from "react";
import {
  SPUL_SECURITY_DWELL_MS,
  SPUL_TEASER_MS,
} from "../constants/spulTeaser";

export type SpulTeaserPhase = "teaser" | "security";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Cycles: S-PUL skeleton teaser (~2s) → Proto C security front → dwell → repeat.
 * Stops permanently when `stopLoop` runs (skip or security interaction).
 */
export function useSpulTeaserLoop() {
  const [phase, setPhase] = useState<SpulTeaserPhase>(
    prefersReducedMotion() ? "security" : "teaser",
  );
  const loopActiveRef = useRef(!prefersReducedMotion());
  const [loopActive, setLoopActive] = useState(loopActiveRef.current);

  const stopLoop = useCallback(() => {
    if (!loopActiveRef.current) return;
    loopActiveRef.current = false;
    setLoopActive(false);
    setPhase("security");
  }, []);

  useEffect(() => {
    if (!loopActiveRef.current) return;

    let cancelled = false;
    const timers: number[] = [];

    const schedule = (fn: () => void, ms: number) => {
      timers.push(window.setTimeout(fn, ms));
    };

    const runCycle = () => {
      if (cancelled || !loopActiveRef.current) return;
      setPhase("teaser");
      schedule(() => {
        if (cancelled || !loopActiveRef.current) return;
        setPhase("security");
        schedule(() => {
          if (cancelled || !loopActiveRef.current) return;
          runCycle();
        }, SPUL_SECURITY_DWELL_MS);
      }, SPUL_TEASER_MS);
    };

    runCycle();

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [loopActive]);

  return {
    phase,
    showTeaser: phase === "teaser" && loopActive,
    loopActive,
    stopLoop,
  };
}
