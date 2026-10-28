import { useId } from 'react';

/*
 * Engraved ornaments of a certificate, drawn with math instead of images: guilloché rosettes
 * (phase-shifted wavy rings laid over each other, the way a rose engine cuts banknote plates),
 * the embossed seal and the catalogue-number medallion used as the section heading device.
 */

type Band = { r: number; amp: number; lobes: number; strands: number };

const round = (n: number) => Math.round(n * 10) / 10;

/** `strands` copies of a ring that waves `lobes` times, each shifted by a fraction of a wave. */
function wavyRings({ r, amp, lobes, strands }: Band, perLobe = 12) {
  const steps = lobes * perLobe;
  const paths: string[] = [];
  for (let s = 0; s < strands; s++) {
    const phase = (s / strands) * Math.PI * 2;
    const points: string[] = [];
    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      const rr = r + amp * Math.sin(lobes * t + phase);
      points.push(`${round(rr * Math.cos(t))} ${round(rr * Math.sin(t))}`);
    }
    paths.push(`M${points.join(' ')}Z`);
  }
  return paths;
}

const ROSETTE_BANDS: Band[] = [
  { r: 470, amp: 18, lobes: 72, strands: 5 },
  { r: 400, amp: 32, lobes: 48, strands: 7 },
  { r: 318, amp: 40, lobes: 32, strands: 9 },
];

const rosetteCache = new Map<string, string>();

/**
 * The rosette is drawn once into an image, so turning it slowly costs the page nothing but a
 * composited rotation.
 */
function rosetteUri(color: string) {
  const cached = rosetteCache.get(color);
  if (cached) return cached;
  const paths = ROSETTE_BANDS.flatMap((band) => wavyRings(band))
    .map((d) => `<path d="${d}"/>`)
    .join('');
  const rules = [498, 492, 352, 268, 263].map((r) => `<circle r="${r}"/>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-500 -500 1000 1000"><g fill="none" stroke="${color}" stroke-width="1">${paths}${rules}</g></svg>`;
  const uri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  rosetteCache.set(color, uri);
  return uri;
}

export function Rosette({ className, color = '#1f4d45' }: { className?: string; color?: string }) {
  return <img className={className} src={rosetteUri(color)} alt='' aria-hidden='true' draggable={false} />;
}

const SEAL_EDGE = (() => {
  const steps = 48 * 10;
  const points: string[] = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const r = 104 + 3.4 * Math.cos(48 * t);
    points.push(`${round(r * Math.cos(t))} ${round(r * Math.sin(t))}`);
  }
  return `M${points.join(' ')}Z`;
})();

const SEAL_ROSE = wavyRings({ r: 38, amp: 15, lobes: 12, strands: 6 }, 10);

/** The embossed copper seal at the foot of the certificate; its rosette turns slowly. */
export function Seal({ className }: { className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const r = 76;
  return (
    <svg className={['coin-seal', className].filter(Boolean).join(' ')} viewBox='-112 -112 224 224' aria-hidden='true'>
      <defs>
        <path id={`${id}-legend`} d={`M ${-r} 0 A ${r} ${r} 0 1 1 ${r} 0 A ${r} ${r} 0 1 1 ${-r} 0`} />
      </defs>
      <path className='coin-seal-edge' d={SEAL_EDGE} />
      <circle className='coin-seal-rule' r='95' />
      <circle className='coin-seal-rule is-thin' r='91' />
      <text className='coin-seal-legend'>
        <textPath href={`#${id}-legend`} textLength={Math.round(2 * Math.PI * r) - 4}>
          COIN SCANNER · SNAP &amp; IDENTIFY COINS EASILY ·
        </textPath>
      </text>
      <circle className='coin-seal-rule is-thin' r='62' />
      <circle className='coin-seal-rule' r='58' />
      <g className='coin-seal-rose'>
        {SEAL_ROSE.map((d) => (
          <path key={d.slice(0, 24)} d={d} />
        ))}
      </g>
      <circle className='coin-seal-core' r='13' />
      <circle className='coin-seal-rule is-thin' r='9' />
    </svg>
  );
}

/** The heading device: a catalogue number struck on a small medallion that sits on a double rule. */
export function CatNo({ n }: { n: number }) {
  return (
    <span className='coin-catno' aria-hidden='true'>
      <span className='coin-catno-rule' />
      <span className='coin-catno-medal'>
        <small>Cat. No.</small>
        <b>{String(n).padStart(2, '0')}</b>
      </span>
      <span className='coin-catno-rule' />
    </span>
  );
}
