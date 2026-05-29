import { KaraokeShimmerText } from "./KaraokeShimmerText";
import { VoiceOrbCanvas } from "./VoiceOrbCanvas";

type Props = {
  amplitude: number;
  isListening: boolean;
  onMicToggle: () => void;
  activeWordIndex: number;
  phraseComplete: boolean;
  finActive: boolean;
};

export function PhoneMockup({
  amplitude,
  isListening,
  onMicToggle,
  activeWordIndex,
  phraseComplete,
  finActive,
}: Props) {
  return (
    <div className="flex justify-center rounded-2xl bg-[var(--color-background-secondary,#12151c)] p-5">
      <div className="rounded-[34px] bg-webpoint-panel p-[7px] shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        <div
          className="relative h-[566px] w-[306px] overflow-hidden rounded-[28px] bg-webpoint-bg font-sans"
          role="region"
          aria-label="Voice authentication preview"
        >
          <div className="absolute left-[18px] top-4 text-[11px] font-normal text-white/20">
            ©2026 Workplace Technologies, LLC
          </div>

          <div className="absolute left-0 top-[125px] flex w-full flex-col items-center">
            <div className="relative h-[220px] w-[220px]">
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 h-[252px] w-[252px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle,rgba(86,150,232,0.17) 0%,rgba(86,150,232,0.05) 44%,transparent 70%)",
                }}
              />
              <VoiceOrbCanvas amplitude={amplitude} />
            </div>

            <div className="mt-0.5 animate-orb-breathe">
              <KaraokeShimmerText
                mode="phrase"
                activeWordIndex={activeWordIndex}
                phraseComplete={phraseComplete}
                finActive={finActive}
                isListening={isListening}
              />
            </div>

            <button
              type="button"
              onClick={onMicToggle}
              className={`listening-ring mt-[26px] flex h-[58px] w-[58px] items-center justify-center rounded-full border border-webpoint-accent/40 bg-webpoint-accent/[0.07] transition-colors ${
                isListening ? "active" : ""
              }`}
              aria-label={isListening ? "Stop listening" : "Start listening"}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="text-webpoint-accent-soft"
              >
                <path
                  d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z"
                  fill="currentColor"
                />
                <path
                  d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V21H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-3.08A7 7 0 0 0 19 11Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>

          <div className="absolute bottom-[66px] left-0 w-full text-center text-[11px] font-normal tracking-[0.14em] text-white/30">
            My voice is my password
          </div>

          <div className="absolute bottom-[22px] left-0 w-full text-center">
            <div className="text-[11px] font-normal text-white/30">Enter PIN instead</div>
            <div className="mt-[3px] text-[13px] font-normal text-white/[0.58] underline underline-offset-[3px]">
              Enter PIN
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
