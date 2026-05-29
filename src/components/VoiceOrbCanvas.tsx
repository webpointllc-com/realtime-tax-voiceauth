import { useEffect, useRef } from "react";

type Props = {
  amplitude: number;
  /** Subtle faster Y-spin during page / orb load-in (~1.2s). */
  loadIn?: boolean;
  /** Fires the success FX (white implode -> burst -> afterglow) when it flips true. */
  success?: boolean;
  className?: string;
};

export function VoiceOrbCanvas({
  amplitude,
  loadIn = false,
  success = false,
  className = "",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ampRef = useRef(amplitude);
  const loadInRef = useRef(loadIn);
  const successAtRef = useRef<number>(0);

  useEffect(() => {
    ampRef.current = amplitude;
  }, [amplitude]);

  useEffect(() => {
    loadInRef.current = loadIn;
  }, [loadIn]);

  useEffect(() => {
    if (success) successAtRef.current = performance.now();
  }, [success]);

  useEffect(() => {
    // Dev-only validation hook (active only with ?fx=1) — lets headless tests fire the success FX.
    if (typeof window === "undefined") return;
    if (!new URLSearchParams(window.location.search).has("fx")) return;
    (window as unknown as { __forceSuccess?: () => void }).__forceSuccess = () => {
      successAtRef.current = performance.now();
    };
  }, []);

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

      // ---- success FX timeline (white implode -> burst -> afterglow), ported from Prototype-B ----
      const easeOutCubic = (x: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);
      const sElapsed = successAtRef.current ? performance.now() - successAtRef.current : Infinity;
      const sActive = sElapsed < 2200;
      const implodeP = sActive ? easeOutCubic(sElapsed / 430) : 0;
      const implodeFade = sActive ? Math.max(0, 1 - Math.max(0, (sElapsed - 430) / 280)) : 0;
      const fxImplode = implodeP * implodeFade;
      const burstRise = sActive ? easeOutCubic((sElapsed - 320) / 180) : 0;
      const burstFade = sActive ? Math.max(0, 1 - easeOutCubic((sElapsed - 520) / 560)) : 0;
      const fxBurst = burstRise * burstFade;
      const fxBurstProgress = sActive ? Math.max(0, Math.min(1, (sElapsed - 320) / 620)) : 0;
      const fxAfterglow = sActive ? Math.max(0, 1 - Math.max(0, (sElapsed - 860) / 1100)) : 0;

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

      // ---- success FX draw: implosion glow, then expanding white burst, then soft afterglow ----
      if (fxImplode > 0.01) {
        const ir = R * (1.32 - implodeP * 0.54);
        const ig = ctx.createRadialGradient(CX, CY, ir * 0.28, CX, CY, ir);
        ig.addColorStop(0, `rgba(255,255,255,${(0.025 * fxImplode).toFixed(3)})`);
        ig.addColorStop(0.58, `rgba(255,255,255,${(0.18 * fxImplode).toFixed(3)})`);
        ig.addColorStop(1, "rgba(255,255,255,0)");
        ctx.beginPath(); ctx.arc(CX, CY, ir, 0, 6.2832); ctx.fillStyle = ig; ctx.fill();
      }
      if (fxBurst > 0.01) {
        const br = R * (0.54 + fxBurstProgress * 1.78);
        const bg = ctx.createRadialGradient(CX, CY, 0, CX, CY, br);
        bg.addColorStop(0, `rgba(255,255,255,${(0.42 * fxBurst).toFixed(3)})`);
        bg.addColorStop(0.22, `rgba(255,255,255,${(0.22 * fxBurst).toFixed(3)})`);
        bg.addColorStop(0.62, `rgba(255,255,255,${(0.065 * fxBurst).toFixed(3)})`);
        bg.addColorStop(1, "rgba(255,255,255,0)");
        ctx.beginPath(); ctx.arc(CX, CY, br, 0, 6.2832); ctx.fillStyle = bg; ctx.fill();
      }
      if (fxAfterglow > 0.01) {
        const ag = ctx.createRadialGradient(CX, CY, R * 0.2, CX, CY, R * 1.7);
        ag.addColorStop(0, `rgba(74,158,255,${(0.10 * fxAfterglow).toFixed(3)})`);
        ag.addColorStop(0.5, `rgba(74,158,255,${(0.05 * fxAfterglow).toFixed(3)})`);
        ag.addColorStop(1, "rgba(74,158,255,0)");
        ctx.beginPath(); ctx.arc(CX, CY, R * 1.7, 0, 6.2832); ctx.fillStyle = ag; ctx.fill();
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
