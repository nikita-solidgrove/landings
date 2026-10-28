import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Check, ChevronLeft, Image as ImageIcon, Lightbulb, Plus, X, Zap } from 'lucide-react';
import { prefersReducedMotion } from '../../shared/motion';
import { CoinFace } from './CoinFace';
import { APP, DEMO_COINS, STEPS, photoRegion, type DemoCoin, type SideName } from './content';

const PHASES = ['aim', 'trace', 'shot', 'flip', 'trace2', 'shot2', 'match', 'result', 'added'] as const;
type Phase = (typeof PHASES)[number];

const DURATION: Record<Phase, number> = {
  aim: 1100,
  trace: 1300,
  shot: 700,
  flip: 1100,
  trace2: 1300,
  shot2: 700,
  match: 1700,
  result: 2900,
  added: 3600,
};

const HINT: Record<Phase, string> = {
  aim: 'Center the coin in the frame',
  trace: 'Edge found',
  shot: 'Obverse saved',
  flip: 'Now turn it over',
  trace2: 'Edge found',
  shot2: 'Reverse saved',
  match: 'Finding the best matches…',
  result: '',
  added: '',
};

/** Which of the four steps beside the phone a phase belongs to, and where each step starts. */
const STEP_OF: Record<Phase, number> = { aim: 0, trace: 0, shot: 0, flip: 1, trace2: 1, shot2: 1, match: 2, result: 2, added: 3 };
const STEP_START: Phase[] = ['aim', 'flip', 'match', 'added'];
const STEP_MS = STEP_START.map((_, i) => PHASES.filter((p) => STEP_OF[p] === i).reduce((sum, p) => sum + DURATION[p], 0));

const reached = (phase: Phase, step: Phase) => PHASES.indexOf(phase) >= PHASES.indexOf(step);
const order = (i: number) => ({ '--i': i }) as CSSProperties;

/**
 * The app's scan flow as a looping example on a velvet tray: the camera traces the rim of a real
 * coin, takes the obverse, the coin turns over, the reverse is taken, and the result screen comes
 * up with the details the listing promises and an example price estimate. The four steps beside the
 * phone follow along and jump the demo when pressed. It only runs while it is on screen.
 */
export function ScanDemo() {
  const root = useRef<HTMLDivElement>(null);
  const [reduced] = useState(prefersReducedMotion);
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>(reduced ? 'result' : 'aim');
  const coin = DEMO_COINS[index];
  const active = STEP_OF[phase];

  useEffect(() => {
    const target = root.current;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.1 });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !visible) return;
    const timer = window.setTimeout(() => {
      const next = PHASES.indexOf(phase) + 1;
      if (next < PHASES.length) {
        setPhase(PHASES[next]);
      } else {
        setIndex((index + 1) % DEMO_COINS.length);
        setPhase('aim');
      }
    }, DURATION[phase]);
    return () => window.clearTimeout(timer);
  }, [phase, index, reduced, visible]);

  function pickCoin(next: number) {
    setIndex(next);
    setPhase(reduced ? 'result' : 'aim');
  }

  const flipped = reached(phase, 'flip');
  const tracing = phase === 'trace' || phase === 'shot' || phase === 'trace2' || phase === 'shot2';
  const flash = phase === 'shot' || phase === 'shot2';

  const step = (i: number) => (
    <li key={STEPS[i].title} className={active === i ? 'coin-step is-active' : 'coin-step'}>
      <button type='button' onClick={() => setPhase(STEP_START[i])} aria-current={active === i ? 'step' : undefined}>
        <span className='coin-step-well' aria-hidden='true'>
          <CoinFace side={STEPS[i].side} size={150} />
        </span>
        <span className='coin-step-text'>
          <b>{String(i + 1).padStart(2, '0')}</b>
          <strong>{STEPS[i].title}</strong>
          <small>{STEPS[i].text}</small>
        </span>
        {active === i && !reduced ? (
          <span
            key={`${index}-${i}`}
            className='coin-step-progress'
            style={{ '--ms': `${STEP_MS[i]}ms` } as CSSProperties}
            aria-hidden='true'
          />
        ) : null}
      </button>
    </li>
  );

  return (
    <div className='coin-scan' ref={root} data-running={visible && !reduced}>
      <ol className='coin-steps is-left'>{[0, 1].map(step)}</ol>

      <div className='coin-scan-phone'>
        <div className='coin-phone' data-phase={phase} aria-label='Example of scanning a coin in the app' role='img'>
          <div className='coin-phone-screen'>
            <div className='coin-cam-top'>
              <Zap size={16} />
              <span className='coin-cam-title'>{flipped ? 'Reverse' : 'Obverse'}</span>
              <X size={16} />
            </div>

            <div className='coin-viewfinder'>
              <img key={`bg-${coin.id}`} className='coin-viewfinder-bg' src={photoRegion(coin.scene, coin.table, 360, 360)} alt='' />
              <div className='coin-frame'>
                <span className='coin-bracket coin-bracket-top' />
                <span className='coin-bracket coin-bracket-bottom' />
                <div key={coin.id} className='coin-subject'>
                  <div className={flipped ? 'coin-flipper is-flipped' : 'coin-flipper'}>
                    <CoinFace side={coin.obverse} className='coin-side-front' />
                    <CoinFace side={coin.reverse} className='coin-side-back' />
                  </div>
                  {tracing ? (
                    <svg key={flipped ? 'rev' : 'obv'} className='coin-trace' viewBox='0 0 100 100'>
                      <circle cx='50' cy='50' r='48.5' pathLength={1} />
                    </svg>
                  ) : null}
                  {phase === 'match' ? <span className='coin-scanline' /> : null}
                </div>
              </div>
              {flash ? <span key={phase} className='coin-flash' /> : null}
              {HINT[phase] ? (
                <p key={`hint-${phase}`} className='coin-hint'>
                  {HINT[phase]}
                </p>
              ) : null}
            </div>

            <div className='coin-cam-controls'>
              <div className='coin-capture-row'>
                <Capture label='Obverse' side={coin.obverse} done={reached(phase, 'shot')} active={!flipped} />
                <Capture label='Reverse' side={coin.reverse} done={reached(phase, 'shot2')} active={flipped && !reached(phase, 'shot2')} />
              </div>
              <div className='coin-cam-row'>
                <ImageIcon size={18} />
                <span className={flash ? 'coin-shutter is-pressed' : 'coin-shutter'} />
                <Lightbulb size={18} />
              </div>
            </div>

            {reached(phase, 'result') ? <ResultScreen key={coin.id} coin={coin} added={phase === 'added'} animate={!reduced} /> : null}

            {phase === 'added' ? (
              <div className='coin-toast'>
                <img src={APP.iconUrl} alt='' />
                <span>
                  <small>
                    <b>Coin Scanner</b>
                    <i>now</i>
                  </small>
                  <strong>Added to {coin.set}</strong>
                  <em>{coin.title}</em>
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <ol className='coin-steps is-right' start={3}>
        {[2, 3].map(step)}
      </ol>

      <div className='coin-picker' role='group' aria-label='Example coins'>
        {DEMO_COINS.map((item, i) => (
          <button key={item.id} type='button' aria-pressed={i === index} onClick={() => pickCoin(i)}>
            <CoinFace side={item.obverse} size={96} />
            <span>{item.label}</span>
          </button>
        ))}
        <p>Examples. Prices are estimates and depend on condition.</p>
      </div>
    </div>
  );
}

function Capture({ label, side, done, active }: { label: string; side: SideName; done: boolean; active: boolean }) {
  return (
    <span className={['coin-capture', done ? 'is-done' : '', active ? 'is-active' : ''].filter(Boolean).join(' ')}>
      <span className='coin-capture-dot'>
        {done ? (
          <>
            <CoinFace side={side} size={96} />
            <Check className='coin-capture-check' size={12} strokeWidth={3.5} />
          </>
        ) : null}
      </span>
      {label}
    </span>
  );
}

/** Counts up to a year, like a catalogue being leafed through to the right page. */
function CountYear({ value, animate }: { value: string; animate: boolean }) {
  const target = Number(value);
  const [shown, setShown] = useState(animate && Number.isFinite(target) ? target - 80 : target);

  useEffect(() => {
    if (!animate || !Number.isFinite(target)) return;
    const from = target - 80;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 900);
      setShown(Math.round(from + (target - from) * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animate, target]);

  return <>{Number.isFinite(target) ? shown : value}</>;
}

function ResultScreen({ coin, added, animate }: { coin: DemoCoin; added: boolean; animate: boolean }) {
  return (
    <div className='coin-result'>
      <div className='coin-result-bar'>
        <ChevronLeft size={18} />
        <span>Best match</span>
        <i>Example</i>
      </div>
      <div className='coin-result-tray'>
        <CoinFace side={coin.obverse} size={160} />
        <CoinFace side={coin.reverse} size={160} />
      </div>
      <h3>{coin.title}</h3>
      <dl className='coin-result-rows'>
        {coin.rows.map(([label, value], i) => (
          <div key={label} style={order(i)}>
            <dt>{label}</dt>
            <span className='coin-leader' aria-hidden='true' />
            <dd>{label === 'Mint year' ? <CountYear value={value} animate={animate} /> : value}</dd>
          </div>
        ))}
      </dl>
      <div className='coin-result-value' style={order(coin.rows.length)}>
        <span>
          <b>Price estimate</b>
          <small>Example estimate</small>
        </span>
        <strong>{coin.value}</strong>
      </div>
      <span className={added ? 'coin-result-add is-added' : 'coin-result-add'}>
        {added ? <Check size={15} strokeWidth={3} /> : <Plus size={15} strokeWidth={3} />}
        {added ? `Added to ${coin.set}` : 'Add to My Coins'}
      </span>
    </div>
  );
}
