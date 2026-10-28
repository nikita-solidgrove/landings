import { useEffect, useId, useState } from 'react';
import { prefersReducedMotion } from '../../shared/motion';
import { CoinFace } from './CoinFace';
import { DEMO_COINS } from './content';
import { Rosette } from './Ornaments';

/** Obverse and reverse of each example coin, in the order the medal turns through them. */
const FACES = DEMO_COINS.flatMap((coin) => [
  { coin, side: coin.obverse, label: 'obverse' },
  { coin, side: coin.reverse, label: 'reverse' },
]);

const HOLD = 3400;
const at = (n: number) => FACES[((n % FACES.length) + FACES.length) % FACES.length];

/**
 * The hero: one real coin in the middle of a guilloché rosette. It turns from obverse to reverse,
 * then to the next example coin; the legend around it is that coin's example result, struck in as
 * the coin changes. A tap turns it by hand.
 */
export function HeroCoin() {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [reduced] = useState(prefersReducedMotion);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const timer = window.setTimeout(() => setStep((s) => s + 1), HOLD);
    return () => window.clearTimeout(timer);
  }, [step, reduced]);

  // The hidden side keeps the face that just turned away until the next turn starts, then takes
  // the next face while it still faces the back.
  const front = at(step - (step % 2));
  const back = at(step % 2 ? step : Math.max(step - 1, 1));
  const current = at(step);
  const r = 221;

  return (
    <div className='coin-medal'>
      <Rosette className='coin-medal-rosette' />
      <svg className='coin-medal-ring' viewBox='0 0 500 500' aria-hidden='true'>
        <defs>
          <path id={`${id}-path`} d={`M ${250 - r} 250 A ${r} ${r} 0 1 1 ${250 + r} 250 A ${r} ${r} 0 1 1 ${250 - r} 250`} />
          <mask id={`${id}-mask`} maskUnits='userSpaceOnUse' x='0' y='0' width='500' height='500'>
            <circle
              key={current.coin.id}
              className='coin-medal-wipe'
              cx='250'
              cy='250'
              r={r + 6}
              pathLength={1}
              transform='rotate(180 250 250)'
            />
          </mask>
        </defs>
        <circle className='coin-medal-rule' cx='250' cy='250' r='247' />
        <circle className='coin-medal-rule is-thin' cx='250' cy='250' r='242.5' />
        <circle className='coin-medal-beads' cx='250' cy='250' r='204' pathLength={240} />
        <g mask={`url(#${id}-mask)`}>
          <text className='coin-medal-legend'>
            <textPath href={`#${id}-path`} textLength={Math.round(2 * Math.PI * r) - 8}>
              {current.coin.ring.toUpperCase()}
            </textPath>
          </text>
        </g>
      </svg>
      <button
        type='button'
        className='coin-medal-coin'
        onClick={() => setStep((s) => s + 1)}
        aria-label={`Example coin: ${current.coin.title}, ${current.label}. Turn it over.`}
      >
        <span className='coin-medal-flipper' style={{ transform: `rotateY(${step * 180}deg)` }}>
          <CoinFace side={front.side} size={640} className='coin-medal-face' />
          <CoinFace side={back.side} size={640} className='coin-medal-face is-back' />
        </span>
      </button>
    </div>
  );
}
