import { useEffect, useState, type CSSProperties } from 'react';
import { prefersReducedMotion } from '../../shared/motion';
import { DEMO_ROOM, feetInches, photo, squareFeet } from './content';

type Phase = 'scan' | 'plan' | 'export';

const PHASES: { id: Phase; label: string; ms: number }[] = [
  { id: 'scan', label: 'Scan', ms: 4800 },
  { id: 'plan', label: 'Plan', ms: 5600 },
  { id: 'export', label: 'Export', ms: 3600 },
];

const { widthIn, lengthIn, heightIn } = DEMO_ROOM;
const AREA = squareFeet(widthIn, lengthIn);

/** Seconds into the scan when the beam reaches an element: its edges draw as the beam passes. */
const at = (seconds: number) => ({ '--at': `${seconds}s` }) as CSSProperties;

/** Position on the room photo (900 × 600 crop), in percent, plus the wall's angle. */
const pin = (x: number, y: number, angle = 0, seconds = 0) =>
  ({ left: `${(x / 900) * 100}%`, top: `${(y / 600) * 100}%`, '--angle': `${angle}deg`, '--at': `${seconds}s` }) as CSSProperties;

/** Share of a measurement captured at scan progress `p`, between two progress points. */
const captured = (p: number, from: number, to: number) => Math.min(1, Math.max(0, (p - from) / (to - from)));

/**
 * The app's core moment as a looping example, drawn as Fig. 1 of the hero sheet: a room photo is
 * swept by the scan, the walls get measured, the photo turns into a 2D floor plan with dimensions,
 * and the plan is exported. The schedule under it counts the measurements up.
 */
export function ScanDemo() {
  const reduced = prefersReducedMotion();
  const [phase, setPhase] = useState<Phase>(reduced ? 'plan' : 'scan');
  const [cycle, setCycle] = useState(0);
  const [progress, setProgress] = useState(reduced ? 1 : 0);

  // Next phase when this one has played out; the loop starts over after the export.
  useEffect(() => {
    if (reduced) return;
    const index = PHASES.findIndex((item) => item.id === phase);
    const timer = window.setTimeout(() => {
      const next = PHASES[(index + 1) % PHASES.length].id;
      if (next === 'scan') setCycle((n) => n + 1);
      setPhase(next);
    }, PHASES[index].ms);
    return () => window.clearTimeout(timer);
  }, [phase, cycle, reduced]);

  // Scan progress drives the readouts while the beam sweeps the room.
  useEffect(() => {
    if (phase !== 'scan' || reduced) {
      setProgress(1);
      return;
    }
    const started = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const p = Math.min(1, (now - started) / 3800);
      setProgress(p);
      if (p < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [phase, cycle, reduced]);

  function select(next: Phase) {
    if (next === 'scan') setCycle((n) => n + 1);
    setPhase(next);
  }

  const scanning = phase === 'scan' && progress < 1;
  const width = captured(progress, 0.1, 0.55);
  const length = captured(progress, 0.35, 0.85);
  const height = captured(progress, 0.05, 0.4);
  const status = scanning
    ? `Scanning ${String(Math.round(progress * 100)).padStart(2, '0')}%`
    : { scan: 'Scan complete', plan: 'Floor plan ready', export: 'Ready to export' }[phase];

  return (
    <div className='lid-demo' data-phase={phase}>
      <div className='lid-demo-head'>
        <p className='lid-fig'>
          <span>Fig. 1</span> {DEMO_ROOM.name}, example scan
        </p>
        <div className='lid-tabs' role='group' aria-label='Example steps'>
          {PHASES.map((item, i) => (
            <button
              key={item.id}
              type='button'
              className='lid-tab'
              aria-pressed={item.id === phase}
              onClick={() => select(item.id)}
            >
              <span aria-hidden='true'>{i + 1}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className='lid-viewport-frame'>
        <span className='lid-crop lid-crop-tl' aria-hidden='true' />
        <span className='lid-crop lid-crop-tr' aria-hidden='true' />
        <span className='lid-crop lid-crop-bl' aria-hidden='true' />
        <span className='lid-crop lid-crop-br' aria-hidden='true' />
        <div
          className='lid-viewport'
          key={cycle}
          role='img'
          aria-label='Example: a living room photo is scanned, measured and turned into a floor plan, then exported as PDF'
        >
          <div className='lid-photo-layer' aria-hidden='true'>
            <img className='lid-photo' src={photo('scanRoom', 900, 600)} alt='' />
            <div className='lid-scanned' />
            <svg className='lid-edges' viewBox='0 0 900 600' preserveAspectRatio='none'>
              <line x1='168' y1='0' x2='194' y2='413' pathLength={1} style={at(0.3)} />
              <line x1='168' y1='4' x2='540' y2='58' pathLength={1} style={at(0.35)} />
              <line x1='540' y1='58' x2='800' y2='0' pathLength={1} style={at(0.35)} />
              <line x1='540' y1='58' x2='545' y2='358' pathLength={1} style={at(0.6)} />
              <line x1='0' y1='451' x2='194' y2='413' pathLength={1} style={at(2.6)} />
              <line x1='194' y1='413' x2='545' y2='358' pathLength={1} style={at(2.4)} />
              <line x1='545' y1='358' x2='900' y2='458' pathLength={1} style={at(2.5)} />
            </svg>
            <span className='lid-dot' style={pin(540, 58, 0, 0.6)} />
            <span className='lid-dot' style={pin(194, 413, 0, 2.7)} />
            <span className='lid-dot' style={pin(545, 358, 0, 2.6)} />
            <span className='lid-ar' style={pin(543, 210, 0, 1.9)}>{feetInches(heightIn)}</span>
            <span className='lid-ar' style={pin(368, 384, -9, 3.3)}>{feetInches(widthIn)}</span>
            <span className='lid-ar' style={pin(724, 405, 15.5, 3.5)}>{feetInches(lengthIn)}</span>
            <div className='lid-beam' />
          </div>

          <div className='lid-plan-layer' aria-hidden='true'>
            <FloorPlan />
          </div>
          <div className='lid-wipe' aria-hidden='true' />

          <span className='lid-status' aria-live='polite'>
            <span className={scanning ? 'lid-rec is-on' : 'lid-rec'} aria-hidden='true' />
            {status}
          </span>

          <div className='lid-export' aria-hidden={phase !== 'export'}>
            <span className='lid-export-title'>Export “{DEMO_ROOM.name}”</span>
            <span className='lid-export-options'>
              <span className='lid-export-option lid-export-pick'>
                <span className='lid-export-box' />
                PDF
              </span>
              <span className='lid-export-option'>
                <span className='lid-export-box' />
                USDZ
              </span>
            </span>
          </div>
        </div>
      </div>

      <dl className='lid-schedule'>
        <div>
          <dt>Width</dt>
          <dd>{width ? feetInches(widthIn * width) : '––'}</dd>
        </div>
        <div>
          <dt>Length</dt>
          <dd>{length ? feetInches(lengthIn * length) : '––'}</dd>
        </div>
        <div>
          <dt>Height</dt>
          <dd>{height ? feetInches(heightIn * height) : '––'}</dd>
        </div>
        <div>
          <dt>Area</dt>
          <dd>{scanning ? '––' : AREA}</dd>
        </div>
      </dl>
    </div>
  );
}

/** The 2D plan of the photo's room: windows on the far wall, radiator on the right, door behind the camera. */
export function FloorPlan({ className }: { className?: string }) {
  return (
    <svg className={['lid-plan', className].filter(Boolean).join(' ')} viewBox='0 0 600 400'>
      {/* Walls with openings for the window bank and the door */}
      <path className='lid-p-wall' d='M206 72 H170 V338 H352 M402 338 H430 V72 H384' pathLength={1} />
      {/* Window bank: frame lines and two mullions */}
      <g className='lid-p-window'>
        <line x1='206' y1='67' x2='384' y2='67' />
        <line x1='206' y1='77' x2='384' y2='77' />
        <line x1='265' y1='67' x2='265' y2='77' />
        <line x1='325' y1='67' x2='325' y2='77' />
      </g>
      {/* Radiator under the right wall */}
      <rect className='lid-p-fixture' x='414' y='92' width='9' height='58' />
      {/* Door leaf and swing */}
      <g className='lid-p-door'>
        <line x1='402' y1='338' x2='402' y2='290' />
        <path d='M402 290 A48 48 0 0 0 354 338' pathLength={1} />
      </g>

      {/* Dimensions: extension lines, dimension line, architectural ticks, value */}
      <g className='lid-p-dim lid-p-dim-top'>
        <line x1='170' y1='58' x2='170' y2='30' />
        <line x1='430' y1='58' x2='430' y2='30' />
        <line className='lid-p-dimline' x1='162' y1='38' x2='438' y2='38' pathLength={1} />
        <line x1='164' y1='44' x2='176' y2='32' />
        <line x1='424' y1='44' x2='436' y2='32' />
        <rect x='264' y='26' width='72' height='24' />
        <text x='300' y='43'>{feetInches(DEMO_ROOM.widthIn)}</text>
      </g>
      <g className='lid-p-dim lid-p-dim-left'>
        <line x1='156' y1='72' x2='124' y2='72' />
        <line x1='156' y1='338' x2='124' y2='338' />
        <line className='lid-p-dimline' x1='132' y1='64' x2='132' y2='346' pathLength={1} />
        <line x1='126' y1='78' x2='138' y2='66' />
        <line x1='126' y1='344' x2='138' y2='332' />
        <g transform='rotate(-90 132 205)'>
          <rect x='96' y='193' width='72' height='24' />
          <text x='132' y='210'>{feetInches(DEMO_ROOM.lengthIn)}</text>
        </g>
      </g>

      <g className='lid-p-area'>
        <text className='lid-p-room' x='300' y='188'>
          {DEMO_ROOM.name}
        </text>
        <rect x='244' y='200' width='112' height='30' />
        <text x='300' y='220'>{AREA}</text>
      </g>

      <g className='lid-p-legend'>
        <text className='lid-p-height' x='584' y='34'>
          Room height {feetInches(DEMO_ROOM.heightIn)}
        </text>
        {/* Scale bar: 5 ft at 17.4 units per foot */}
        <rect className='lid-p-scale-a' x='470' y='362' width='43.5' height='7' />
        <rect className='lid-p-scale-b' x='513.5' y='362' width='43.5' height='7' />
        <text className='lid-p-scale' x='470' y='388'>0</text>
        <text className='lid-p-scale' x='557' y='388'>5 ft</text>
      </g>
    </svg>
  );
}
