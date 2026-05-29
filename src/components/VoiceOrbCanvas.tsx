import { useEffect, useRef } from "react";

type Props = {
  amplitude: number;
  /** Subtle faster Y-spin during page / orb load-in (~1.2s). */
  loadIn?: boolean;
  className?: string;
};

export function VoiceOrbCanvas({
  amplitude,
  loadIn = false,
  className = "",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ampRef = useRef(amplitude);
  const loadInRef = useRef(loadIn);

  useEffect(() => {
    ampRef.current = amplitude;
  }, [amplitude]);

  useEffect(() => {
    loadInRef.current = loadIn;
  }, [loadIn]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const SIZE = 220;
    canvas.width = SIZE * DPR;
    canvas.height = SIZE * DPR;
    ctx.scale(DPR, DPR);

    const CX = SIZE / 2;
    const CY = SIZE / 2;
    const R = 66;
    const N = 760;
    const pts: { x: number; y: number; z: number }[] = [];
    const GA = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i += 1) {
      const y = 1 - (i / (N - 1)) * 2;
      const rr = Math.sqrt(Math.max(0, 1 - y * y));
      const th = GA * i;
      pts.push({ x: Math.cos(th) * rr, y, z: Math.sin(th) * rr });
    }

    let lx = -0.52;
    let ly = -0.6;
    let lz = 0.6;
    const ll = Math.sqrt(lx * lx + ly * ly + lz * lz);
    lx /= ll;
    ly /= ll;
    lz /= ll;

    let t = 0;
    let raf = 0;
    let amp = ampRef.current;

    const frame = () => {
      t += 1 / 60;
      const target = ampRef.current;
      amp += (target - amp) * 0.1;
      const loadBoost = loadInRef.current ? 0.55 : 0;
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.globalCompositeOperation = "lighter";

      const aY = t * (0.14 + amp * 0.14 + loadBoost);
      const tX = -0.32;
      const cY = Math.cos(aY);
      const sY = Math.sin(aY);
      const cX = Math.cos(tX);
      const sX = Math.sin(tX);
      const breathe = 1 + Math.sin(t * (0.85 + amp * 0.55)) * (0.018 + amp * 0.022);

      const arr: {
        sx: number;
        sy: number;
        z: number;
        persp: number;
        la: number;
        d: number;
      }[] = [];

      for (let i = 0; i < pts.length; i += 1) {
        const p = pts[i];
        let x = p.x * cY + p.z * sY;
        let z = -p.x * sY + p.z * cY;
        let y = p.y;
        const y2 = y * cX - z * sX;
        const z2 = y * sX + z * cX;
        y = y2;
        z = z2;
        x *= breathe;
        y *= breathe;
        z *= breathe;
        const camZ = 3.0;
        const persp = camZ / (camZ - z);
        const sx = CX + x * R * persp;
        const sy = CY + y * R * persp;
        const nl = x * lx + y * ly + z * lz;
        const la = 0.5 + nl * 0.5;
        const d = (z + 1) / 2;
        arr.push({ sx, sy, z, persp, la, d });
      }

      arr.sort((a, b) => a.z - b.z);

      for (let i = 0; i < arr.length; i += 1) {
        const q = arr[i];
        // radial shimmer: wave travels from orb center outward, intensity scales with mic amp
        const dxc = (q.sx - CX) / R;
        const dyc = (q.sy - CY) / R;
        const rad = Math.sqrt(dxc * dxc + dyc * dyc);
        const ripple = Math.sin(rad * 6.2 - t * 5.0) * (0.10 + amp * 0.32) * amp;
        let bright = Math.pow(q.la, 1.2) * 0.78 + q.d * 0.22 + amp * 0.16 + ripple;
        bright = Math.max(0, Math.min(1, bright));
        const r = 1.15 * q.persp * (0.86 + q.d * 0.3);
        const cr = (58 + bright * 150) | 0;
        const cg = (116 + bright * 116) | 0;
        const cb = (165 + bright * 88) | 0;
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${(0.04 + bright * 0.11).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(q.sx, q.sy, r * 2.7, 0, 6.2832);
        ctx.fill();
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${(0.24 + bright * 0.58).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(q.sx, q.sy, r, 0, 6.2832);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={220}
      height={220}
      className={`relative block h-[220px] w-[220px] ${className}`}
      aria-hidden="true"
    />
  );
}
