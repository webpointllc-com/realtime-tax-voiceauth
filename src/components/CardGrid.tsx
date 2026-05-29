const ROWS: string[][] = [
  ["Match", "Liveness", "Status", "Session"],
  ["Microphone", "Simulate", "Reset", "Enter Application"],
];

export function CardGrid() {
  return (
    <div className="grid gap-3">
      {ROWS.map((row, ri) => (
        <div key={ri} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {row.map((label) => (
            <button
              key={label}
              type="button"
              className="card-hover rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-4 text-left text-sm font-medium text-white/70"
            >
              {label}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
