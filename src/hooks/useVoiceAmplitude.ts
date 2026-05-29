import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceAmplitudeState = {
  amplitude: number;
  isListening: boolean;
  isIdle: boolean;
  error: string | null;
};

const IDLE_BASE = 0.14;
const IDLE_WAVE = 0.12;
const LISTEN_FLOOR = 0.1;
/** Display EMA — smooth membrane, not frame-jittery RMS. */
const AMP_SMOOTH = 0.07;

function friendlyMicError(err: unknown): string {
  const name =
    err && typeof err === "object" && "name" in err
      ? String((err as { name: string }).name)
      : "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "Microphone blocked — allow mic in browser settings, then tap Unmute again.";
  }
  if (name === "NotFoundError") {
    return "No microphone found on this device.";
  }
  if (err instanceof Error && err.message) return err.message;
  return "Could not access microphone.";
}

export function useVoiceAmplitude(autoStart = false): VoiceAmplitudeState & {
  startListening: () => Promise<boolean>;
  stopListening: () => void;
} {
  const [amplitude, setAmplitude] = useState(IDLE_BASE);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleRef = useRef<{ stop: () => void } | null>(null);
  const rafRef = useRef<number>(0);
  const idleRef = useRef(0);
  const smoothRef = useRef(IDLE_BASE);

  const stopListening = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    handleRef.current?.stop();
    handleRef.current = null;
    setIsListening(false);
    smoothRef.current = IDLE_BASE;
    setAmplitude(IDLE_BASE);
  }, []);

  const tick = useCallback((analyser: AnalyserNode) => {
    const buf = new Uint8Array(analyser.fftSize);
    const sample = () => {
      analyser.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i += 1) {
        const v = (buf[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / buf.length);
      const target = Math.min(1, Math.max(LISTEN_FLOOR, rms * 3.6));
      smoothRef.current +=
        (target - smoothRef.current) * AMP_SMOOTH;
      setAmplitude(smoothRef.current);
      rafRef.current = requestAnimationFrame(sample);
    };
    rafRef.current = requestAnimationFrame(sample);
  }, []);

  const startListening = useCallback(async (): Promise<boolean> => {
    stopListening();
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Microphone API not available in this browser.");
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AC();
      await ctx.resume?.();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.88;
      src.connect(analyser);
      handleRef.current = {
        stop: () => {
          stream.getTracks().forEach((t) => t.stop());
          void ctx.close().catch(() => {});
        },
      };
      smoothRef.current = LISTEN_FLOOR;
      setAmplitude(LISTEN_FLOOR);
      setIsListening(true);
      tick(analyser);
      return true;
    } catch (e) {
      setError(friendlyMicError(e));
      setIsListening(false);
      return false;
    }
  }, [stopListening, tick]);

  useEffect(() => {
    if (!autoStart) return;
    void startListening();
    return () => stopListening();
  }, [autoStart, startListening, stopListening]);

  useEffect(() => {
    if (isListening) return;
    const idleLoop = () => {
      idleRef.current += 0.016;
      const wave = IDLE_BASE + Math.sin(idleRef.current * 1.9) * IDLE_WAVE;
      smoothRef.current += (wave - smoothRef.current) * 0.12;
      setAmplitude(smoothRef.current);
      rafRef.current = requestAnimationFrame(idleLoop);
    };
    rafRef.current = requestAnimationFrame(idleLoop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isListening]);

  return {
    amplitude,
    isListening,
    isIdle: !isListening,
    error,
    startListening,
    stopListening,
  };
}
