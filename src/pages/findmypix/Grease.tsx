import type { CSSProperties } from 'react';

/*
 * Grease-pencil marks: the loose red loop a photographer draws around a keeper on a contact sheet,
 * and a quick arrow. Paths are generated once per seed so every loop is slightly different but the
 * same on every render. The CSS draws them in (stroke-dashoffset on pathLength 1).
 */

type Point = [number, number];

function random(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (value: number) => Math.round(value * 100) / 100;

/** Smooth curve through the points (Catmull-Rom as cubic Béziers). */
function smooth(points: Point[]) {
  let d = `M${round(points[0][0])} ${round(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const c1: Point = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Point = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${round(c1[0])} ${round(c1[1])} ${round(c2[0])} ${round(c2[1])} ${round(p2[0])} ${round(p2[1])}`;
  }
  return d;
}

const loops = new Map<number, string>();

/**
 * A loop in a (100 × ratio) × 100 box that overshoots its start, like a quick hand-drawn ellipse.
 * `ratio` should match the box it is drawn over so the stroke keeps an even width.
 */
export function loopPath(seed: number, ratio = 1) {
  const key = seed * 1000 + Math.round(ratio * 100);
  const cached = loops.get(key);
  if (cached) return cached;
  const rand = random(seed);
  const start = -Math.PI * (0.62 + rand() * 0.18);
  const turn = Math.PI * 2 * (1.1 + rand() * 0.06);
  const tilt = (rand() - 0.5) * 0.1;
  const phase = rand() * Math.PI * 2;
  const steps = 30;
  const points: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = start + turn * t;
    const grow = 0.965 + t * 0.06;
    const wobble = 1 + 0.022 * Math.sin(a * 3 + phase);
    const x = Math.cos(a) * 46 * ratio * grow * wobble;
    const y = Math.sin(a) * 44 * grow * wobble;
    const cos = Math.cos(tilt / ratio);
    const sin = Math.sin(tilt / ratio);
    points.push([50 * ratio + x * cos - y * sin, 50 + x * sin + y * cos]);
  }
  const d = smooth(points);
  loops.set(key, d);
  return d;
}

type MarkProps = { className?: string; style?: CSSProperties };

/**
 * Stretches to its box (an ellipse around whatever it is placed over). The stroke width is in
 * viewBox units (100 = the box height), set per use with --gw. No non-scaling-stroke: Chrome then
 * measures pathLength in one space and dashes in another, and the loop never closes.
 */
export function GreaseLoop({ seed, ratio = 1.35, className, style }: MarkProps & { seed: number; ratio?: number }) {
  return (
    <svg
      className={['fmp-grease', 'fmp-loop', className].filter(Boolean).join(' ')}
      style={style}
      viewBox={`0 0 ${round(100 * ratio)} 100`}
      preserveAspectRatio='none'
      aria-hidden='true'
      focusable='false'
    >
      <path d={loopPath(seed, ratio)} pathLength={1} />
    </svg>
  );
}

/**
 * An arrow drawn in one stroke plus a two-stroke head, in its own viewBox (keeps its proportions).
 * `bend` pushes the middle of the stroke sideways, in viewBox units.
 */
export function GreaseArrow({
  width,
  height,
  from,
  to,
  bend,
  className,
  style,
}: MarkProps & { width: number; height: number; from: Point; to: Point; bend: number }) {
  const [x0, y0] = from;
  const [x1, y1] = to;
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;
  const len = Math.hypot(x1 - x0, y1 - y0) || 1;
  const nx = -(y1 - y0) / len;
  const ny = (x1 - x0) / len;
  const cx = mx + nx * bend;
  const cy = my + ny * bend;
  const shaft = `M${round(x0)} ${round(y0)} Q${round(cx)} ${round(cy)} ${round(x1)} ${round(y1)}`;
  // Head: two short strokes back from the tip along the curve's end tangent.
  const tx = x1 - cx;
  const ty = y1 - cy;
  const tl = Math.hypot(tx, ty) || 1;
  const ux = tx / tl;
  const uy = ty / tl;
  const head = Math.min(16, len * 0.28);
  const wing = (angle: number): Point => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [x1 - head * (ux * cos - uy * sin), y1 - head * (uy * cos + ux * sin)];
  };
  const [ax, ay] = wing(0.5);
  const [bx, by] = wing(-0.5);
  const tip = `M${round(ax)} ${round(ay)} L${round(x1)} ${round(y1)} L${round(bx)} ${round(by)}`;

  return (
    <svg
      className={['fmp-grease', 'fmp-arrow', className].filter(Boolean).join(' ')}
      style={style}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden='true'
      focusable='false'
    >
      <path d={shaft} pathLength={1} />
      <path className='fmp-arrow-head' d={tip} pathLength={1} />
    </svg>
  );
}
