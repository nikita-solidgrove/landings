import type { CSSProperties } from 'react';

/*
 * Hand-drawn pieces of the seed-packet world: a monstera silhouette (the icon's leaf), the three
 * growth stages of "how it works", the scalloped seal and the herbarium stamp. Pure SVG, no assets.
 */

/** A leaf pointing up with its base at 0,0 (about 22 × 34 units). */
const LEAF = 'M0 0C9-6 11.5-21 0-34C-11.5-21-9-6 0 0Z';

type LeafProps = { x: number; y: number; angle: number; scale?: number; delay?: number; tone?: 'a' | 'b' };

/** One leaf; the inner group sways around the leaf's base (see .pid-sway). */
function Leaf({ x, y, angle, scale = 1, delay = 0, tone = 'a' }: LeafProps) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
      <g className='pid-sway' style={{ animationDelay: `${delay}ms` } as CSSProperties}>
        <path d={LEAF} className={tone === 'a' ? 'pid-leaf-a' : 'pid-leaf-b'} />
        <path d='M0-2V-29' className='pid-leaf-rib' />
      </g>
    </g>
  );
}

/** A monstera leaf in one flat color, its splits cut in the background color. */
export function Monstera({ className }: { className: string }) {
  return (
    <svg className={className} viewBox='0 0 300 380' aria-hidden='true'>
      <g className='pid-monstera'>
        <path className='pid-monstera-stem' d='M150 300C152 330 160 356 176 380' />
        <path
          className='pid-monstera-blade'
          d='M150 300C88 334 8 284 10 190C12 98 80 18 150 16C220 18 290 98 290 190C292 284 212 334 150 300Z'
        />
        <path
          className='pid-monstera-cut'
          d='M14 214L112 200M22 140L118 150M62 70L130 104M286 214L188 200M278 140L182 150M238 70L170 104M108 300L136 246M192 300L164 246'
        />
        <path className='pid-monstera-rib' d='M150 298C150 220 150 120 150 34' />
      </g>
    </svg>
  );
}

/** Green focus brackets, like the corners on the app icon. */
function Brackets() {
  return (
    <g className='pid-art-brackets'>
      <path d='M74 132V118Q74 106 86 106H100' />
      <path d='M140 106H154Q166 106 166 118V132' />
      <path d='M74 196V210Q74 222 86 222H100' />
      <path d='M140 222H154Q166 222 166 210V196' />
    </g>
  );
}

/**
 * The three stages of "how it works", drawn on a soil line at y = 200: a sprout caught in the
 * camera's brackets, a named seedling with its plant marker, a grown plant getting its water.
 */
export function StageArt({ stage }: { stage: number }) {
  return (
    <svg className='pid-art' viewBox='0 0 240 240' aria-hidden='true'>
      {stage === 0 ? (
        <g className='pid-art-plant'>
          <ellipse className='pid-art-seed' cx='120' cy='216' rx='9' ry='6' />
          <path className='pid-art-root' d='M114 220C108 226 106 232 100 234M124 221C130 228 136 230 140 236' />
          <path className='pid-art-stem' d='M120 211C121 196 118 182 120 168' />
          <Leaf x={120} y={170} angle={-58} scale={0.8} />
          <Leaf x={120} y={170} angle={58} scale={0.8} delay={500} tone='b' />
          <Brackets />
        </g>
      ) : null}
      {stage === 1 ? (
        <g className='pid-art-plant'>
          <g className='pid-art-marker' transform='rotate(7 178 200)'>
            <path d='M166 140H190V204L178 216L166 204Z' />
            <path className='pid-art-marker-ink' d='M171 154H185M171 162H182M171 170H185' />
          </g>
          <path className='pid-art-root' d='M120 204C114 214 110 222 102 228M120 204C126 214 132 220 140 226' />
          <path className='pid-art-stem' d='M120 204C118 176 123 146 120 112' />
          <Leaf x={120} y={182} angle={-62} scale={1.05} />
          <Leaf x={120} y={170} angle={60} scale={1.1} delay={400} tone='b' />
          <Leaf x={121} y={146} angle={-48} scale={0.95} delay={900} tone='b' />
          <Leaf x={120} y={134} angle={44} scale={0.9} delay={200} />
          <Leaf x={120} y={114} angle={-6} scale={0.85} delay={700} />
        </g>
      ) : null}
      {stage === 2 ? (
        <g className='pid-art-plant'>
          <path className='pid-art-drop' d='M152 22C158 32 162 38 162 44A10 10 0 0 1 142 44C142 38 146 32 152 22Z' />
          <path className='pid-art-root' d='M120 204C112 216 104 222 94 228M120 204C128 216 138 222 148 226M120 206V232' />
          <path className='pid-art-stem' d='M120 204C116 168 125 128 120 78' />
          <path className='pid-art-stem pid-art-stem-thin' d='M121 150C134 138 146 128 160 124M119 168C106 158 92 152 80 150' />
          <Leaf x={120} y={190} angle={-70} scale={1.15} />
          <Leaf x={120} y={182} angle={72} scale={1.2} delay={300} tone='b' />
          <Leaf x={80} y={150} angle={-56} scale={1.05} delay={900} tone='b' />
          <Leaf x={160} y={124} angle={50} scale={1.1} delay={500} />
          <Leaf x={121} y={128} angle={-36} scale={1} delay={1200} />
          <Leaf x={120} y={104} angle={34} scale={0.95} delay={150} tone='b' />
          <circle className='pid-art-bud' cx='120' cy='74' r='9' />
          <circle className='pid-art-bud-eye' cx='120' cy='74' r='3.5' />
        </g>
      ) : null}
    </svg>
  );
}

/** A scalloped circle (stamp or wax-seal edge) as a path, centered on 0,0. */
function scallop(radius: number, bumps: number, depth: number) {
  const points: string[] = [];
  const steps = bumps * 12;
  for (let i = 0; i <= steps; i += 1) {
    const angle = (i / steps) * Math.PI * 2;
    const r = radius - depth * (1 - Math.cos(angle * bumps)) * 0.5;
    points.push(`${(Math.cos(angle) * r).toFixed(2)} ${(Math.sin(angle) * r).toFixed(2)}`);
  }
  return `M${points.join('L')}Z`;
}

const SEAL_EDGE = scallop(100, 22, 7);

/** The seal's scalloped edge with an inner printed ring; the button text sits on top. */
export function SealShape() {
  return (
    <svg className='pid-seal-shape' viewBox='-100 -100 200 200' aria-hidden='true'>
      <path className='pid-seal-edge' d={SEAL_EDGE} />
      <circle className='pid-seal-ring' r='85' />
    </svg>
  );
}

/** A round herbarium stamp with its text set on the ring. */
export function Stamp({ id, label, no }: { id: string; label: string; no: number }) {
  return (
    <svg className='pid-stamp' viewBox='-60 -60 120 120' aria-hidden='true'>
      <defs>
        <path id={id} d='M0 -41A41 41 0 1 1 -0.01 -41' />
      </defs>
      <circle r='56' className='pid-stamp-line' />
      <circle r='31' className='pid-stamp-line pid-stamp-thin' />
      <text className='pid-stamp-ring-text'>
        <textPath href={`#${id}`} startOffset='0' textLength='252' lengthAdjust='spacing'>
          PLANT IDENTIFIER · SPECIMEN · {label} ·
        </textPath>
      </text>
      <text className='pid-stamp-no' y='3' textAnchor='middle'>
        No. {no}
      </text>
    </svg>
  );
}
