'use client';

import React, { useEffect, useRef } from 'react';

/**
 * Blob Morph with Pure Monochrome Luminous Aesthetic (黑白/单色柔光流体)
 * Organic shape easing between four poses with dynamic surface currents,
 * rotating grayscale illumination, and soft ethereal monochromatic aura.
 */
export default function BlobCanvas({ className = 'w-64 h-64' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1080;
    const H = 1080;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * ratio);
    canvas.height = Math.round(H * ratio);

    const TAU = Math.PI * 2;
    const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
    const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
    const mod = (x: number, m: number) => ((x % m) + m) % m;
    const smoothstep = (a: number, b: number, x: number) => {
      const k = clamp((x - a) / (b - a));
      return k * k * (3 - 2 * k);
    };

    const win = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

    // Damped spring settling
    const spring = (k: number, zeta = 0.55, freq = 1.2) => {
      if (k <= 0) return 0;
      if (k >= 1) return 1;
      const w = TAU * freq;
      const wd = w * Math.sqrt(Math.max(1e-6, 1 - zeta * zeta));
      const v =
        1 -
        Math.exp(-zeta * w * k) *
          (Math.cos(wd * k) + ((zeta * w) / wd) * Math.sin(wd * k));
      return lerp(v, 1, smoothstep(0.85, 1, k));
    };

    // Radial contour tracer
    const radial = (
      c: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      rf: (a: number) => number,
      rot = 0,
      sx = 1,
      sy = 1,
      N = 240
    ) => {
      c.beginPath();
      for (let i = 0; i < N; i++) {
        const a = (i / N) * TAU;
        const r = rf(a);
        const x = cx + Math.cos(a + rot) * r * sx;
        const y = cy + Math.sin(a + rot) * r * sy;
        if (i === 0) {
          c.moveTo(x, y);
        } else {
          c.lineTo(x, y);
        }
      }
      c.closePath();
    };

    // Four designed poses: bean, soft triangle, peanut, pebble
    const POSES = [
      [
        [2, 0.17, 0.3],
        [3, 0.09, 1.2],
        [4, 0.035, 0],
      ],
      [
        [3, 0.15, -0.4],
        [2, 0.07, 1.0],
        [5, 0.025, 0.2],
      ],
      [
        [2, 0.19, 1.9],
        [4, -0.08, 1.9],
        [3, 0.045, 0.5],
      ],
      [
        [2, 0.12, 2.6],
        [3, 0.08, 2.2],
        [4, 0.04, 0.7],
      ],
    ];

    const coefs = (pose: number) => {
      const c: Record<number, [number, number]> = {
        2: [0, 0],
        3: [0, 0],
        4: [0, 0],
        5: [0, 0],
      };
      for (const [n, a, ph] of POSES[mod(pose, 4)]) {
        c[n][0] += a * Math.cos(n * ph);
        c[n][1] += a * Math.sin(n * ph);
      }
      return c;
    };

    let animationFrameId: number;
    let time = 0;
    let last = performance.now();

    const draw = (t: number) => {
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const u = H / 100;
      const cx = W / 2;
      const cy = H / 2;
      const R = 28 * u;

      // Cycle through 4 poses every 10 seconds (2.5s per transition)
      const s = t / 2.5;
      const i = Math.floor(s);
      const k = s - i;
      const m = spring(win(k, 0.0, 0.92), 0.52, 1.15);
      const A = coefs(i);
      const Bc = coefs(i + 1);
      const C: [number, number, number][] = [];
      for (let n = 2; n <= 5; n++) {
        C.push([n, lerp(A[n][0], Bc[n][0], m), lerp(A[n][1], Bc[n][1], m)]);
      }

      // Moving surface currents
      const T1 = TAU * (t / 2.8);
      const T2 = TAU * (t / 1.9);
      const rf = (q: number) => {
        let r = 1;
        for (const [n, a, b] of C) {
          r += a * Math.cos(n * q) + b * Math.sin(n * q);
        }
        r +=
          0.038 * Math.sin(3 * q - T1) +
          0.022 * Math.sin(5 * q + T2 + 1.3) +
          0.015 * Math.cos(2 * q + t * 1.2);
        return R * r;
      };

      const rot = TAU * (t / 14);

      // Monochromatic dynamic light direction (单色光源移动)
      const gradAngle = TAU * (t / 8);
      const gx = cx + Math.cos(gradAngle) * (R * 0.38);
      const gy = cy + Math.sin(gradAngle) * (R * 0.38);

      // Outer diffused monochrome glow aura
      const glowGrad = ctx.createRadialGradient(gx, gy, R * 0.1, cx, cy, R * 1.35);
      glowGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.9)'); // Pure white glow
      glowGrad.addColorStop(0.3, 'rgba(226, 232, 240, 0.75)'); // Soft silver slate
      glowGrad.addColorStop(0.6, 'rgba(148, 163, 184, 0.45)'); // Muted graphite
      glowGrad.addColorStop(0.85, 'rgba(100, 116, 139, 0.2)'); // Deep charcoal rim
      glowGrad.addColorStop(1.0, 'rgba(30, 41, 59, 0.0)'); // Translucent edge

      // Core luminous monochrome gradient (高光与深邃质感)
      const coreGrad = ctx.createRadialGradient(gx, gy, R * 0.04, cx, cy, R * 1.15);
      coreGrad.addColorStop(0.0, '#FFFFFF'); // Luminous specular highlight
      coreGrad.addColorStop(0.24, '#E2E8F0'); // Pure silver-white
      coreGrad.addColorStop(0.55, '#94A3B8'); // Slate silver
      coreGrad.addColorStop(0.82, '#475569'); // Graphite shadow
      coreGrad.addColorStop(1.0, '#1E293B'); // Obsidian rim

      // Draw diffused soft glow under-layer
      ctx.save();
      ctx.filter = 'blur(36px)';
      ctx.fillStyle = glowGrad;
      radial(ctx, cx, cy, rf, rot, 1, 1, 240);
      ctx.fill();
      ctx.restore();

      // Draw medium soft luminous aura
      ctx.save();
      ctx.filter = 'blur(16px)';
      ctx.fillStyle = coreGrad;
      radial(ctx, cx, cy, rf, rot, 1, 1, 240);
      ctx.fill();
      ctx.restore();

      // Draw smooth core with gentle ethereal blur
      ctx.save();
      ctx.filter = 'blur(6px)';
      ctx.fillStyle = coreGrad;
      radial(ctx, cx, cy, rf, rot, 1, 1, 240);
      ctx.fill();
      ctx.restore();
    };

    const frame = (now: number) => {
      time += (now - last) / 1000;
      last = now;
      draw(time);
      animationFrameId = requestAnimationFrame(frame);
    };

    animationFrameId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative flex items-center justify-center">
      {/* Subtle monochrome ambient backlight */}
      <div
        className="absolute w-56 h-56 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full blur-3xl opacity-35 pointer-events-none transition-opacity duration-250 ease-out"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(226,232,240,0.8) 0%, rgba(203,213,225,0.4) 50%, transparent 80%)',
        }}
      />
      <canvas
        ref={canvasRef}
        className={`${className} object-contain transition-transform duration-250 ease-out hover:scale-105 active:scale-95`}
        aria-label="Blob Morph Monochrome Glow Animation"
      />
    </div>
  );
}
