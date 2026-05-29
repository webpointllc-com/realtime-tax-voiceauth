type Props = {
  label: string;
  tone?: "ok" | "warn" | "idle";
};

const tones = {
  ok: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  warn: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  idle: "border-white/10 bg-white/[0.04] text-white/50",
};

export function StatusPill({ label, tone = "idle" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${tones[tone]}`}
    >
      {label}
    </span>
  );
}
