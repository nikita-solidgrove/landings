import { useEffect, useState, type CSSProperties } from 'react';
import { Minus, Plus } from 'lucide-react';
import { prefersReducedMotion } from '../../shared/motion';
import { APP, DIAL, PRESETS } from './content';
import { Splash } from './Water';

type Phase = 'ready' | 'cleaning' | 'done';
type Mode = { tab: string; detail: string; particles: 'water' | 'dust'; seconds: number | null };

const MODES: Mode[] = [
  { tab: PRESETS[0].name, detail: `${PRESETS[0].label} · ${PRESETS[0].text}`, particles: 'water', seconds: 50 },
  { tab: PRESETS[1].name, detail: `${PRESETS[1].label} · ${PRESETS[1].text}`, particles: 'dust', seconds: 75 },
  { tab: 'Manual', detail: 'Your frequency, your cleaning time', particles: 'water', seconds: null },
];

const READY_MS = 1700;
const CLEAN_MS = 6400;
const DONE_MS = 2900;
const TICK_MS = 50;

/** Centers of the two speaker-hole groups on the phone edge (SVG units). */
const GROUPS = [97, 323];
const EDGE_Y = 120;

type Particle = { x: number; y: number; r: number; t: number; dx: number; dy: number; tone?: number };

function eject(x: number, y: number, r: number, t: number, push = 1): Particle {
  const gx = x < 210 ? GROUPS[0] : GROUPS[1];
  const side = x < 210 ? -1 : 1;
  const dx = ((x - gx) * 1.5 + side * 18) * push;
  const dy = (y < EDGE_Y ? -1 : 1) * (64 + r * 5) * push;
  return { x, y, r, t, dx, dy };
}

const WATER: Particle[] = [
  [70, 103, 9, 0.1],
  [113, 97, 6, 0.28],
  [134, 133, 11, 0.52],
  [84, 141, 7, 0.38],
  [56, 127, 5, 0.68],
  [152, 111, 5, 0.8],
  [296, 101, 8, 0.18],
  [340, 137, 10, 0.46],
  [364, 105, 6, 0.33],
  [310, 129, 5, 0.6],
  [276, 139, 6, 0.74],
  [204, 143, 6, 0.86],
  [228, 99, 4, 0.9],
  [118, 158, 7, 0.24],
  [352, 160, 6, 0.56],
].map(([x, y, r, t]) => eject(x, y, r * 1.25, t));

/** Seeded so the dust looks the same on every render. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const DUST: Particle[] = (() => {
  const rand = seeded(7);
  return Array.from({ length: 30 }, (_, i) => {
    const gx = GROUPS[i % 2];
    const x = gx + (rand() - 0.5) * 120;
    const y = 100 + rand() * 42;
    const r = 1.9 + rand() * 3;
    return { ...eject(x, y, r, 0.06 + rand() * 0.84, 1.3), tone: i % 3 };
  });
})();

const HOLES = GROUPS.flatMap((gx) => Array.from({ length: 6 }, (_, i) => gx - 45 + i * 18));

/** Spectrum of a clear speaker, and the same spectrum with the highs drowned out. */
const BARS = (() => {
  const rand = seeded(19);
  return Array.from({ length: 30 }, (_, i) => {
    const clear = 0.42 + 0.5 * Math.sin((i / 29) * Math.PI * 0.92 + 0.25) + (rand() - 0.5) * 0.18;
    const damp = i < 7 ? 0.78 : Math.max(0.1, 0.78 - (i - 7) * 0.06);
    return { clear: Math.min(1, Math.max(0.2, clear)), muffled: Math.max(0.06, clear * damp) };
  });
})();

const formatHz = (hz: number) => Math.round(hz).toLocaleString('en-US').replace(',', ' ');
function formatTime(seconds: number) {
  const whole = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

/** Automatic modes sweep the tone up and down; the values are an illustration. */
function sweep(mode: number, progress: number) {
  const wave = 0.5 - 0.5 * Math.cos(progress * Math.PI * 2 * 2.5);
  return mode === 0 ? 120 + wave * 780 : 900 + wave * 5600;
}

const ease = (p: number) => 1 - (1 - p) ** 2;

/** The app's cleaning flow as a looping example: water or dust on the speaker edge → tones → clear sound. */
export function SpeakerDemo() {
  const reduced = prefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>(reduced ? 'cleaning' : 'ready');
  const [progress, setProgress] = useState(reduced ? 0.5 : 0);
  const [cycle, setCycle] = useState(0);
  const [hz, setHz] = useState(DIAL.start);

  const mode = MODES[index];

  useEffect(() => {
    if (reduced) return;
    let timer: number;
    if (phase === 'ready') {
      timer = window.setTimeout(() => setPhase('cleaning'), READY_MS);
    } else if (phase === 'cleaning') {
      timer = window.setTimeout(() => {
        const next = progress + TICK_MS / CLEAN_MS;
        if (next >= 1) {
          setProgress(1);
          setPhase('done');
        } else setProgress(next);
      }, TICK_MS);
    } else {
      timer = window.setTimeout(() => select((index + 1) % MODES.length), DONE_MS);
    }
    return () => window.clearTimeout(timer);
  }, [phase, progress, index, reduced]);

  function select(next: number) {
    setIndex(next);
    setCycle((c) => c + 1);
    setProgress(reduced ? 0.5 : 0);
    setPhase(reduced ? 'cleaning' : 'ready');
  }

  function toggle() {
    if (phase === 'cleaning') {
      setCycle((c) => c + 1);
      setProgress(0);
      setPhase('ready');
    } else {
      if (phase === 'done') setCycle((c) => c + 1);
      setProgress(0);
      setPhase('cleaning');
    }
  }

  const cleaning = phase === 'cleaning';
  const shown = phase === 'done' ? 1 : phase === 'ready' ? 0 : progress;
  const frequency = mode.seconds === null ? hz : sweep(index, shown);
  // Higher tones ripple faster.
  const waveSpeed = 1.9 - Math.min(1.2, Math.log10(frequency / 100) * 0.5);
  const status = phase === 'done' ? 'Clear' : phase === 'cleaning' ? 'Clearing…' : 'Muffled';
  const particles = mode.particles === 'water' ? WATER : DUST;

  return (
    <div className='spk-demo' aria-label='Example of a speaker cleaning in the app'>
      <div className='spk-demo-top'>
        <div className='spk-demo-tabs' role='tablist' aria-label='Cleaning modes'>
          {MODES.map((item, i) => (
            <button
              key={item.tab}
              type='button'
              role='tab'
              aria-selected={i === index}
              className='spk-demo-tab'
              onClick={() => select(i)}
            >
              {item.tab}
            </button>
          ))}
        </div>
        <p className='spk-demo-detail'>{mode.detail}</p>
      </div>

      <div className='spk-demo-body'>
        <div className={`spk-lens is-${phase}`} style={{ '--wave-speed': `${waveSpeed}s` } as CSSProperties}>
          <svg viewBox='0 0 420 240' className='spk-lens-svg' aria-hidden='true'>
            <defs>
              <linearGradient id='spk-metal' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0' stopColor='#f4f8ff' />
                <stop offset='0.45' stopColor='#c9d7ee' />
                <stop offset='1' stopColor='#e6eefa' />
              </linearGradient>
              <radialGradient id='spk-bead' cx='0.38' cy='0.32' r='0.75'>
                <stop offset='0' stopColor='#ffffff' stopOpacity='0.95' />
                <stop offset='0.35' stopColor='#bfe6ff' stopOpacity='0.7' />
                <stop offset='1' stopColor='#2b7bff' stopOpacity='0.75' />
              </radialGradient>
            </defs>

            {cleaning ? (
              <g className='spk-waves'>
                {GROUPS.map((gx) =>
                  [0, 1, 2].map((ring) => (
                    <circle
                      key={`${gx}-${ring}`}
                      cx={gx}
                      cy={EDGE_Y}
                      r={30}
                      style={{ animationDelay: `calc(var(--wave-speed) * ${ring / 3} * -1)` }}
                    />
                  )),
                )}
              </g>
            ) : null}

            <g className='spk-edge'>
              <rect x='18' y='92' width='384' height='56' rx='28' fill='url(#spk-metal)' stroke='#9fb1cf' strokeWidth='1.5' />
              <rect x='40' y='97' width='340' height='3' rx='1.5' fill='#ffffff' opacity='0.85' />
              {HOLES.map((x) => (
                <g key={x}>
                  <circle cx={x} cy={EDGE_Y} r='6.5' fill='#0a1c3f' />
                  <circle cx={x - 1.6} cy={EDGE_Y - 1.8} r='1.6' fill='#3d5d93' />
                </g>
              ))}
              <rect x='176' y='109' width='68' height='22' rx='11' fill='#0a1c3f' />
              <rect x='186' y='117' width='48' height='6' rx='3' fill='#2c4675' />
            </g>

            <g key={`${index}-${cycle}`} className={`spk-particles is-${mode.particles}`}>
              {particles.map((p, i) => {
                const out = phase === 'done' || (cleaning && shown >= p.t);
                const style = {
                  '--dx': `${p.dx}px`,
                  '--dy': `${p.dy}px`,
                  '--land': `${i * 45}ms`,
                } as CSSProperties;
                const state = out ? 'is-out' : cleaning ? 'is-shaking' : 'is-in';
                return mode.particles === 'water' ? (
                  <g key={i} className={`spk-bead ${state}`} style={style}>
                    <ellipse cx={p.x} cy={p.y} rx={p.r} ry={p.r * 0.86} fill='url(#spk-bead)' stroke='#ffffff' strokeOpacity='0.85' strokeWidth='1' />
                    <ellipse cx={p.x - p.r * 0.35} cy={p.y - p.r * 0.35} rx={p.r * 0.28} ry={p.r * 0.2} fill='#ffffff' />
                    <circle className='spk-spray' cx={p.x} cy={p.y} r={Math.max(1.4, p.r * 0.3)} />
                    <circle className='spk-spray spk-spray-b' cx={p.x} cy={p.y} r={Math.max(1.1, p.r * 0.22)} />
                  </g>
                ) : (
                  <circle
                    key={i}
                    className={`spk-speck spk-speck-${p.tone} ${state}`}
                    cx={p.x}
                    cy={p.y}
                    r={p.r}
                    style={style}
                  />
                );
              })}
            </g>
          </svg>
          {phase === 'done' ? (
            <span className='spk-lens-done'>Speaker clear</span>
          ) : (
            <span className='spk-lens-label'>Speaker grille, close up</span>
          )}

          {phase !== 'cleaning' ? (
            <div key={`${phase}-${index}-${cycle}`} className='spk-toast' aria-hidden='true'>
              <img src={APP.iconUrl} alt='' />
              <span>
                <small>{APP.name} · now</small>
                <strong>{phase === 'done' ? `${mode.tab} complete` : 'Place your phone face down'}</strong>
                <em>{phase === 'done' ? 'Run the speaker test next' : 'Turn the volume all the way up'}</em>
              </span>
            </div>
          ) : null}
        </div>

        <div className='spk-demo-side'>
          <div className='spk-readout'>
            <div className='spk-hz' aria-live='off'>
              <small>{mode.seconds === null ? 'Manual tone' : 'Auto tone'}</small>
              <strong>
                {formatHz(frequency)}
                <span>Hz</span>
              </strong>
            </div>
            {mode.seconds === null ? (
              <div className='spk-steppers'>
                <button
                  type='button'
                  className='spk-step-btn spk-step-minus'
                  aria-label='Lower the example frequency'
                  onClick={() => setHz((value) => Math.max(DIAL.min, value - DIAL.step * 5))}
                >
                  <Minus size={18} strokeWidth={3} />
                </button>
                <button
                  type='button'
                  className='spk-step-btn spk-step-plus'
                  aria-label='Raise the example frequency'
                  onClick={() => setHz((value) => Math.min(DIAL.max, value + DIAL.step * 5))}
                >
                  <Plus size={18} strokeWidth={3} />
                </button>
              </div>
            ) : (
              <div className='spk-timer'>
                <small>Time left</small>
                <strong>{formatTime(mode.seconds * (1 - shown))}</strong>
              </div>
            )}
          </div>
          <span className='spk-progress' aria-hidden='true'>
            <span style={{ transform: `scaleX(${shown})` }} />
          </span>

          <div className='spk-sound' aria-label={`Sound: ${status}`}>
            <div className='spk-sound-row'>
              <span className='spk-sound-label'>
                Before <em>Muffled</em>
              </span>
              <span className='spk-bars is-before' aria-hidden='true'>
                {BARS.map((bar, i) => (
                  <i key={i} style={{ '--h': bar.muffled } as CSSProperties} />
                ))}
              </span>
            </div>
            <div className='spk-sound-row'>
              <span className='spk-sound-label'>
                After{' '}
                <em className={`is-${phase === 'done' ? 'clear' : phase === 'cleaning' ? 'clearing' : 'muffled'}`}>{status}</em>
              </span>
              <span className={cleaning ? 'spk-bars is-after is-live' : 'spk-bars is-after'} aria-hidden='true'>
                {BARS.map((bar, i) => (
                  <i
                    key={i}
                    style={{ '--h': bar.muffled + (bar.clear - bar.muffled) * ease(shown), '--d': `${(i % 7) * -0.11}s` } as CSSProperties}
                  />
                ))}
              </span>
            </div>
          </div>

          <div className='spk-demo-foot'>
            <Splash className={cleaning ? 'spk-demo-go is-stop' : 'spk-demo-go'} onClick={toggle}>
              {cleaning ? 'Stop' : phase === 'done' ? 'Again' : 'Start'}
            </Splash>
            <p className='spk-demo-note'>Example, sped up. No sound plays on this page.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
