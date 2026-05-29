import { SPUL_GATE_FADE_MS } from "../constants/spulTeaser";

type Props = {
  visible: boolean;
  onSkip: () => void;
};

/** S-PUL interpreted-answer skeleton only — no tax copy, no fake URLs. */
export function SpulTeaserOverlay({ visible, onSkip }: Props) {
  return (
    <>
      <div
        className={`spul-generative-gate ${visible ? "is-active" : ""}`}
        aria-hidden={!visible}
        aria-label="S-PUL generative search preview"
        style={{ transitionDuration: `${SPUL_GATE_FADE_MS}ms` }}
        onClick={onSkip}
        onKeyDown={(e) => {
          if (e.key === "Escape") onSkip();
        }}
        role="presentation"
      >
        <div className="spul-gate-inner">
          <p className="spul-wordmark" aria-hidden={!visible}>
            S-PUL
          </p>
          <div className="spul-teaser-card" aria-hidden={!visible}>
            <span className="spul-teaser-mode font-mono text-[9px] uppercase tracking-[0.14em] text-white/35">
              display_mode · interpreted_answer
            </span>
            <span className="spul-skel spul-skel-query" aria-hidden="true" />
            <span className="spul-skel spul-skel-interp w-[90%]" aria-hidden="true" />
            <span className="spul-skel spul-skel-interp w-[78%]" aria-hidden="true" />
            <span className="spul-skel spul-skel-interp w-[64%]" aria-hidden="true" />
            <span className="spul-skel-divider" aria-hidden="true" />
            <div className="grid gap-2" aria-hidden="true">
              {[0, 1, 2].map((row) => (
                <div key={row} className="grid gap-1.5">
                  <span className="spul-skel h-[9px] w-[46%]" />
                  <span
                    className={`spul-skel h-2 ${row === 0 ? "w-[88%]" : "w-[72%] opacity-55"}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <button
        type="button"
        className={`spul-gate-skip ${visible ? "is-visible" : ""}`}
        aria-label="Skip generative preview"
        aria-hidden={!visible}
        tabIndex={visible ? 0 : -1}
        onClick={(e) => {
          e.stopPropagation();
          onSkip();
        }}
      >
        Skip
      </button>
    </>
  );
}
