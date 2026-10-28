import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { SKY, STARS, arcPath, polar, turnOf } from './dial';

const SIZE = 640;
const C = SIZE / 2;
const BAND = { r: 268, w: 36 };
const GAP = 3; // minutes left open between two sky steps

type Props = {
  /** Where the hand points, in minutes of the day. */
  minute: number;
  /** `day` for the hero (a phone sits in the middle), `night` for the ending. */
  variant: 'day' | 'night';
  /** Blocked windows drawn inside the band (night: Night lock). */
  blocks?: { start: number; end: number }[];
  className?: string;
  children?: ReactNode;
};

/** The 24-hour day as a dial: day above, night below, the hand at `minute`. */
export function DayDial({ minute, variant, blocks = [], className, children }: Props) {
  // The hand sweeps in from midnight once the page has painted.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const shown = ready ? minute : 0;

  return (
    <div className={['lv-dd', `lv-dd-${variant}`, className].filter(Boolean).join(' ')}>
      <svg className='lv-dd-svg' viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden='true'>
        {Array.from({ length: 96 }, (_, i) => {
          const major = i % 4 === 0;
          const [x1, y1] = polar(C, i * 15, major ? 296 : 302);
          const [x2, y2] = polar(C, i * 15, 310);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className={major ? 'lv-dd-tick is-major' : 'lv-dd-tick'} />;
        })}

        {SKY.map((step, i) => (
          <path
            key={step.from}
            d={arcPath(C, step.from + GAP, step.to - GAP, BAND.r)}
            strokeWidth={BAND.w}
            pathLength={1}
            className={`lv-dd-sky lv-sky-${step.tone}`}
            style={{ '--i': i } as CSSProperties}
          />
        ))}

        {STARS.map(([at, offset]) => {
          const [x, y] = polar(C, at, BAND.r + offset);
          return <circle key={at} cx={x} cy={y} r={1.9} className='lv-dd-star' />;
        })}

        {blocks.map((block) => (
          <path
            key={block.start}
            d={arcPath(C, block.start, block.end, 222)}
            strokeWidth={12}
            pathLength={1}
            className='lv-dd-block'
          />
        ))}

        <g className='lv-dd-hand' style={{ transform: `rotate(${turnOf(shown).toFixed(2)}deg)` }}>
          <line x1={C} y1={C - (variant === 'day' ? 240 : 150)} x2={C} y2={C - 314} className='lv-dd-needle' />
          <circle cx={C} cy={C - BAND.r} r={19} className='lv-dd-knob' />
          <circle cx={C} cy={C - BAND.r} r={5} className='lv-dd-pip' />
        </g>
      </svg>
      {children ? <div className='lv-dd-center'>{children}</div> : null}
    </div>
  );
}
