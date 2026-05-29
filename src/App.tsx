import { useCallback, useEffect, useRef, useState } from "react";
import { KaraokeShimmerText } from "./components/KaraokeShimmerText";
import { ShimmerLoadIn } from "./components/ShimmerLoadIn";
import { SpulTeaserOverlay } from "./components/SpulTeaserOverlay";
import { VoiceAuthScreen } from "./components/VoiceAuthScreen";
import { useSpulTeaserLoop } from "./hooks/useSpulTeaserLoop";
import { useUnlockPhrase } from "./hooks/useUnlockPhrase";
import { useVoiceAmplitude } from "./hooks/useVoiceAmplitude";
import { FRONTEND_RUNTIME } from "./config/env";
import {
  WELCOME_LISTENING_LABEL_MS,
} from "./config/welcomeLines";
import { cancelSpeech, playBootSequence } from "./lib/tts";
import { createVoiceProviders } from "./providers/httpProviders";

const HEADER_COPY = "© WORKPLACE TECHNOLOGIES, LLC";
const ORB_LOAD_IN_MS = 1400;

export default function App() {
  const providersRef = useRef(createVoiceProviders());
  const { showTeaser, stopLoop } = useSpulTeaserLoop();
  const { amplitude, isListening, error, startListening, stopListening } =
    useVoiceAmplitude(false);
  const { activeWordIndex, phraseComplete, finActive } =
    useUnlockPhrase(isListening);
  const [orbLoadIn, setOrbLoadIn] = useState(true);
  const [showListeningLabel, setShowListeningLabel] = useState(false);
  const bootPlayedRef = useRef(false);
  const bootRunningRef = useRef(false);
  const bootAbortRef = useRef<AbortController | null>(null);
  const labelTimerRef = useRef<number>(0);
  const sessionIdRef = useRef<string | null>(null);
  const unlockTriggeredRef = useRef(false);
  const [statusNote, setStatusNote] = useState<string | null>(
    FRONTEND_RUNTIME.apiBaseUrl
      ? "Connected · ready when you are"
      : "Tap to begin · then say your passphrase",
  );

  useEffect(() => {
    const t = window.setTimeout(() => setOrbLoadIn(false), ORB_LOAD_IN_MS);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("listening-active", isListening);
    return () => {
      document.body.classList.remove("listening-active");
    };
  }, [isListening]);

  useEffect(() => {
    void (async () => {
      try {
        await providersRef.current.authProvider.warm();
      } catch {
        // Keep UI usable even if backend warm-up fails or is sleeping.
      }
      try {
        const session = await providersRef.current.authProvider.startSession();
        sessionIdRef.current = session.sessionId;
      } catch {
        sessionIdRef.current = "fallback-session";
      }
    })();
  }, []);

  useEffect(() => {
    if (!phraseComplete || unlockTriggeredRef.current) return;
    unlockTriggeredRef.current = true;
    void (async () => {
      const sessionId = sessionIdRef.current ?? "fallback-session";
      try {
        const result = await providersRef.current.authProvider.verifyPassphrase(
          "my voice is my password",
          sessionId,
        );
        setStatusNote(result.reply);
      } catch {
        setStatusNote("Passphrase captured. Awaiting backend verification.");
      }
    })();
  }, [phraseComplete]);

  const clearListeningLabelTimer = useCallback(() => {
    window.clearTimeout(labelTimerRef.current);
    labelTimerRef.current = 0;
  }, []);

  const onMicToggle = useCallback(() => {
    stopLoop();
    if (isListening) {
      bootAbortRef.current?.abort();
      bootAbortRef.current = null;
      clearListeningLabelTimer();
      setShowListeningLabel(false);
      cancelSpeech();
      stopListening();
      return;
    }

    // Fire the welcome greeting immediately on tap (the tap is the user gesture browsers
    // require for audio). Do NOT gate it behind mic permission — speak first, listen in parallel.
    if (!bootPlayedRef.current && !bootRunningRef.current) {
      bootRunningRef.current = true;
      bootPlayedRef.current = true;
      const ac = new AbortController();
      bootAbortRef.current = ac;
      void (async () => {
        try {
          await playBootSequence(ac.signal);
        } finally {
          bootRunningRef.current = false;
          if (bootAbortRef.current === ac) bootAbortRef.current = null;
        }
      })();
    }

    void (async () => {
      const ok = await startListening();
      if (!ok) {
        // Mic denied/unavailable: greeting still plays; just no live amplitude.
        return;
      }
      clearListeningLabelTimer();
      labelTimerRef.current = window.setTimeout(() => {
        setShowListeningLabel(true);
      }, WELCOME_LISTENING_LABEL_MS);
    })();
  }, [
    isListening,
    startListening,
    stopListening,
    stopLoop,
    clearListeningLabelTimer,
  ]);

  return (
    <ShimmerLoadIn>
      <div className="relative flex min-h-dvh min-h-screen flex-col bg-transparent font-sans text-webpoint-muted">
        <div className="va-perimeter-glow va-glow" aria-hidden="true" />

        <div
          className={`relative flex min-h-dvh min-h-screen flex-1 flex-col transition-opacity duration-300 ${
            showTeaser ? "pointer-events-none opacity-40" : "opacity-100"
          }`}
          aria-hidden={showTeaser}
          onPointerDown={() => stopLoop()}
        >
          <header className="relative z-10 shrink-0 px-5 pt-5 sm:px-6 sm:pt-6">
            <KaraokeShimmerText
              text={HEADER_COPY}
              amplitude={amplitude}
              isListening={isListening}
              variant="header"
              className="text-[11px] font-normal uppercase tracking-[0.06em] sm:text-xs"
            />
          </header>

          <VoiceAuthScreen
            amplitude={amplitude}
            isListening={isListening}
            showListeningLabel={showListeningLabel}
            orbLoadIn={orbLoadIn}
            micError={error}
            onMicToggle={onMicToggle}
            activeWordIndex={activeWordIndex}
            phraseComplete={phraseComplete}
            finActive={finActive}
            statusNote={statusNote}
          />
        </div>

        <SpulTeaserOverlay visible={showTeaser} onSkip={stopLoop} />
      </div>
    </ShimmerLoadIn>
  );
}
