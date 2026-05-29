import { useCallback, useEffect, useRef, useState } from "react";
import {
  UNLOCK_PHRASE,
  isPhraseComplete,
  matchPhraseProgress,
} from "../lib/phraseProgress";

export const KARAOKE_FIN_MS = 550;

export function useUnlockPhrase(isListening: boolean) {
  const [progress, setProgress] = useState(0);
  const [finActive, setFinActive] = useState(false);
  const finalsRef = useRef("");
  const recRef = useRef<SpeechRecognition | null>(null);
  const wantOnRef = useRef(false);
  const finTimerRef = useRef(0);

  const evaluate = useCallback((interim: string) => {
    const full = [finalsRef.current, interim].filter(Boolean).join(" ").trim();
    const next = matchPhraseProgress(full);
    setProgress((prev) => (next > prev ? next : prev));
    if (isPhraseComplete(next)) {
      setFinActive(true);
      window.clearTimeout(finTimerRef.current);
      finTimerRef.current = window.setTimeout(() => setFinActive(false), KARAOKE_FIN_MS);
    }
  }, []);

  const stopSpeech = useCallback(() => {
    wantOnRef.current = false;
    const rec = recRef.current;
    recRef.current = null;
    if (rec) {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
    }
  }, []);

  const startSpeech = useCallback(() => {
    stopSpeech();
    finalsRef.current = "";
    setProgress(0);
    setFinActive(false);

    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    recRef.current = rec;
    wantOnRef.current = true;

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const text = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += text + " ";
        else interim += text + " ";
      }
      if (final.trim()) {
        finalsRef.current = `${finalsRef.current} ${final.trim()}`.trim();
      }
      evaluate(interim.trim());
    };

    rec.onend = () => {
      if (wantOnRef.current && recRef.current === rec) {
        try {
          rec.start();
        } catch {
          /* ignore */
        }
      }
    };

    try {
      rec.start();
    } catch {
      /* ignore */
    }
  }, [evaluate, stopSpeech]);

  useEffect(() => {
    if (isListening) startSpeech();
    else stopSpeech();
    return () => stopSpeech();
  }, [isListening, startSpeech, stopSpeech]);

  useEffect(() => () => window.clearTimeout(finTimerRef.current), []);

  const phraseComplete = isPhraseComplete(progress);
  const activeWordIndex = phraseComplete
    ? UNLOCK_PHRASE.length - 1
    : Math.min(progress, UNLOCK_PHRASE.length - 1);

  return {
    progress,
    activeWordIndex,
    phraseComplete,
    finActive,
  };
}
