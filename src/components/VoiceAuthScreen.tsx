import { KaraokeShimmerText } from "./KaraokeShimmerText";
import { VoiceOrbCanvas } from "./VoiceOrbCanvas";

type Props = {
  amplitude: number;
  isListening: boolean;
  showListeningLabel: boolean;
  orbLoadIn: boolean;
  micError: string | null;
  onMicToggle: () => void;
  activeWordIndex: number;
  phraseComplete: boolean;
  finActive: boolean;
  statusNote: string | null;
};

export function VoiceAuthScreen({
  amplitude,
  isListening,
  showListeningLabel,
  orbLoadIn,
  micError,
  onMicToggle,
  activeWordIndex,
  phraseComplete,
  finActive,
  statusNote,
}: Props) {
  return (
    <main
      className="relative flex min-h-0 flex-1 flex-col"
      role="region"
      aria-label="Voice authentication"
    >
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-8 pt-4">
        <div
          className="flex w-full max-w-md flex-col items-center"
          style={{ marginTop: "clamp(0px, 4vh, 32px)" }}
        >
          <div className="relative h-[220px] w-[220px] shrink-0">
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background:
                  "radial-gradient(circle,rgba(86,150,232,0.18) 0%,rgba(86,150,232,0.05) 44%,transparent 70%)",
              }}
            />
            <VoiceOrbCanvas amplitude={amplitude} loadIn={orbLoadIn} />
          </div>

          <div className="mt-3.5 w-full animate-orb-breathe text-center">
            {showListeningLabel ? (
              <p
                className="mb-2 text-[17px] font-normal text-white/[0.92]"
                aria-live="polite"
              >
                I&apos;m listening
              </p>
            ) : null}
            <KaraokeShimmerText
              mode="phrase"
              activeWordIndex={activeWordIndex}
              phraseComplete={phraseComplete}
              finActive={finActive}
              isListening={isListening}
            />
          </div>

          {micError ? (
            <p
              className="mt-4 max-w-xs text-center text-[12px] leading-snug text-red-300/90"
              role="alert"
            >
              {micError}
            </p>
          ) : null}
          {!micError && statusNote ? (
            <p
              className="mt-4 max-w-xs text-center text-[12px] leading-snug text-webpoint-accent-soft/85"
              aria-live="polite"
            >
              {statusNote}
            </p>
          ) : null}

          <button
            type="button"
            onClick={onMicToggle}
            className={`listening-ring mt-7 flex h-[60px] w-[60px] items-center justify-center rounded-full border border-webpoint-accent/45 bg-webpoint-accent/[0.07] transition-colors ${
              isListening ? "active" : ""
            }`}
            aria-label={isListening ? "Mute microphone" : "Unmute microphone"}
            aria-pressed={isListening}
          >
            <svg
              viewBox="0 0 24 24"
              width="26"
              height="26"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="text-webpoint-accent-soft"
            >
              <rect x="9" y="2.5" width="6" height="11" rx="3" />
              <path d="M19 10.5v1.5a7 7 0 0 1-14 0v-1.5" />
              <path d="M12 19v2.5" />
              <path d="M8.5 21.5h7" />
            </svg>
          </button>
          <span className="mt-2 text-[10px] tracking-[0.14em] text-white/28">
            {isListening ? "LISTENING" : "TAP TO UNMUTE"}
          </span>
        </div>
      </div>

      <div className="pointer-events-none shrink-0 pb-[70px] text-center text-[11px] font-normal tracking-[0.16em] text-white/30">
        My voice is my password
      </div>

      <div className="absolute bottom-6 left-0 w-full text-center">
        <div className="text-[11px] font-normal tracking-[0.01em] text-white/32">
          Enter PIN instead
        </div>
        <button
          type="button"
          className="mt-1 text-[13px] font-normal text-white/[0.62] underline underline-offset-[3px]"
        >
          Enter PIN
        </button>
      </div>
    </main>
  );
}
