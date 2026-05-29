type Props = {
  amplitude: number;
  isListening: boolean;
  error: string | null;
};

function bar(level: number) {
  const n = Math.round(level * 12);
  return "▁▂▃▄▅▆▇█"[Math.min(7, Math.max(0, n))] ?? "▁";
}

export function TelemetrySidebar({ amplitude, isListening, error }: Props) {
  const level = Math.round(amplitude * 100);
  const stream = Array.from({ length: 8 }, (_, i) =>
    bar(Math.max(0.05, amplitude * (0.6 + Math.sin(i * 1.1) * 0.4))),
  ).join(" ");

  return (
    <aside className="flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-black/20 p-4 font-mono text-[11px] leading-relaxed text-white/55">
      <div className="text-[10px] uppercase tracking-[0.18em] text-webpoint-accent-soft/80">
        Telemetry
      </div>
      <dl className="space-y-2">
        <div className="flex justify-between gap-4">
          <dt>mic_state</dt>
          <dd className={isListening ? "text-emerald-300" : "text-amber-200"}>
            {isListening ? "live" : "idle"}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>amp_rms</dt>
          <dd>{level.toString().padStart(3, "0")}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>fft_size</dt>
          <dd>512</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>proto_slot</dt>
          <dd>C</dd>
        </div>
      </dl>
      <div className="rounded-lg border border-white/[0.06] bg-black/30 p-3">
        <div className="mb-1 text-[10px] text-white/35">voice_stream</div>
        <div className="text-webpoint-accent-soft">{stream}</div>
      </div>
      {error ? (
        <p className="text-amber-200/90">mic_err: {error.slice(0, 48)}</p>
      ) : null}
    </aside>
  );
}
