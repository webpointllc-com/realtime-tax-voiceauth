import { useEffect, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function ShimmerLoadIn({ children }: Props) {
  const [ready, setReady] = useState(false);
  const [overlay, setOverlay] = useState(true);

  useEffect(() => {
    const t1 = window.setTimeout(() => setReady(true), 40);
    const t2 = window.setTimeout(() => setOverlay(false), 1200);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      {overlay ? (
        <div
          className="shimmer-load-overlay pointer-events-none absolute inset-0 z-20"
          aria-hidden="true"
        />
      ) : null}
      <div
        className={`shimmer-load-content transition-opacity duration-700 ${ready ? "animate-shimmer-load opacity-100" : "opacity-0"}`}
      >
        {children}
      </div>
    </div>
  );
}
