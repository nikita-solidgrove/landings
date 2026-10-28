import { useEffect, useState, type RefObject } from 'react';
import { prefersReducedMotion } from '../../shared/motion';
import { APARTMENT, feetInches } from './content';

/**
 * 0 → 1 once `ref` scrolls into view, over `ms`, linear (the drawing's clock). Static 1 when the
 * visitor prefers reduced motion.
 */
export function useDrawProgress(ref: RefObject<HTMLElement | null>, ms = 2800) {
  const [progress, setProgress] = useState(() => (prefersReducedMotion() ? 1 : 0));

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion() || !('IntersectionObserver' in window)) {
      setProgress(1);
      return;
    }
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const started = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - started) / ms);
          setProgress(p);
          if (p < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.25 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [ref, ms]);

  return progress;
}

/** Share of the count-up at drawing progress `p`: numbers start once the walls are mostly drawn. */
export const counted = (p: number) => Math.min(1, Math.max(0, (p - 0.4) / 0.6));

export const roomArea = (widthIn: number, lengthIn: number) => (widthIn * lengthIn) / 144;

export const TOTAL_AREA = APARTMENT.reduce((sum, room) => sum + roomArea(room.widthIn, room.lengthIn), 0);

/** Plan units: 20 per foot. */
const FT = 20;

type DimProps = { from: number; to: number; at: number; wall: number; label: string };

/** A horizontal dimension: extension lines from the wall, the dimension line, 45° ticks, the value. */
function HDim({ from, to, at, wall, label }: DimProps) {
  const dir = at < wall ? -1 : 1;
  const width = label.length * 8.6 + 14;
  const mid = (from + to) / 2;
  return (
    <g className='lid-ap-dim'>
      <line x1={from} y1={wall + dir * 8} x2={from} y2={at + dir * 6} />
      <line x1={to} y1={wall + dir * 8} x2={to} y2={at + dir * 6} />
      <line className='lid-ap-dimline' x1={from - 8} y1={at} x2={to + 8} y2={at} pathLength={1} />
      <line x1={from - 5} y1={at + 5} x2={from + 5} y2={at - 5} />
      <line x1={to - 5} y1={at + 5} x2={to + 5} y2={at - 5} />
      <g className='lid-ap-value'>
        <rect x={mid - width / 2} y={at - 10} width={width} height={20} />
        <text x={mid} y={at + 5}>
          {label}
        </text>
      </g>
    </g>
  );
}

/** A vertical dimension, value turned to read from the right like on a drawing. */
function VDim({ from, to, at, wall, label }: DimProps) {
  const dir = at < wall ? -1 : 1;
  const width = label.length * 8.6 + 14;
  const mid = (from + to) / 2;
  return (
    <g className='lid-ap-dim'>
      <line x1={wall + dir * 8} y1={from} x2={at + dir * 6} y2={from} />
      <line x1={wall + dir * 8} y1={to} x2={at + dir * 6} y2={to} />
      <line className='lid-ap-dimline' x1={at} y1={from - 8} x2={at} y2={to + 8} pathLength={1} />
      <line x1={at - 5} y1={from + 5} x2={at + 5} y2={from - 5} />
      <line x1={at - 5} y1={to + 5} x2={at + 5} y2={to - 5} />
      <g className='lid-ap-value' transform={`rotate(-90 ${at} ${mid})`}>
        <rect x={at - width / 2} y={mid - 10} width={width} height={20} />
        <text x={at} y={mid + 5}>
          {label}
        </text>
      </g>
    </g>
  );
}

/** A window in a wall: the two wall faces and the glass line. */
function Window({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const flat = y1 === y2;
  return (
    <g className='lid-ap-window'>
      {[-4, 0, 4].map((o) =>
        flat ? (
          <line key={o} x1={x1} y1={y1 + o} x2={x2} y2={y2 + o} />
        ) : (
          <line key={o} x1={x1 + o} y1={y1} x2={x2 + o} y2={y2} />
        ),
      )}
    </g>
  );
}

/** Where each room's tag sits on the plan; `side` puts the name beside a small room's number. */
const TAGS: Record<number, { x: number; y: number; side?: boolean }> = {
  1: { x: 220, y: 214 },
  2: { x: 740, y: 336 },
  3: { x: 534, y: 362 },
  4: { x: 520, y: 262, side: true },
};

/**
 * The last sheet's drawing: an example apartment (living room with kitchen, hall, bath, bedroom)
 * drawn at 20 units per foot. Walls draw themselves once `progress` starts; areas count up with it.
 */
export function ApartmentPlan({ progress }: { progress: number }) {
  const share = counted(progress);
  return (
    <svg className='lid-ap' viewBox='20 8 920 516' data-drawn={progress > 0} role='img' aria-label='Example floor plan of a four-room apartment with dimensions and room areas'>
      {/* Walls, one path so the pen goes around the apartment in order */}
      <path
        className='lid-ap-wall'
        d='M100 200V90H150M250 90H290M370 90H480V220M480 200H540M580 200H620M620 230V170H860V260M860 340V420H620M620 440V270M620 440H480V280M540 300H620M500 300H480M480 400H100V300'
        pathLength={1}
      />

      <Window x1={150} y1={90} x2={250} y2={90} />
      <Window x1={290} y1={90} x2={370} y2={90} />
      <Window x1={100} y1={200} x2={100} y2={300} />
      <Window x1={860} y1={260} x2={860} y2={340} />

      <g className='lid-ap-door'>
        <line x1={540} y1={200} x2={540} y2={240} />
        <path d='M540 240 A40 40 0 0 0 580 200' />
        <line x1={500} y1={300} x2={500} y2={340} />
        <path d='M500 340 A40 40 0 0 0 540 300' />
        <line x1={620} y1={270} x2={660} y2={270} />
        <path d='M660 270 A40 40 0 0 0 620 230' />
      </g>

      {/* Furniture and fixtures, light */}
      <g className='lid-ap-fix'>
        <path d='M384 94V124H446V216H476' />
        <rect x={400} y={100} width={30} height={18} />
        <circle cx={461} cy={146} r={6} />
        <circle cx={461} cy={170} r={6} />
        <rect x={300} y={170} width={70} height={46} />
        <rect x={308} y={154} width={18} height={12} />
        <rect x={344} y={154} width={18} height={12} />
        <rect x={308} y={220} width={18} height={12} />
        <rect x={344} y={220} width={18} height={12} />
        <rect x={150} y={354} width={170} height={40} />
        <line x1={150} y1={366} x2={320} y2={366} />
        <rect x={200} y={300} width={70} height={34} />
        <rect x={690} y={176} width={100} height={124} />
        <rect x={698} y={184} width={38} height={20} />
        <rect x={744} y={184} width={38} height={20} />
        <line x1={690} y1={222} x2={790} y2={222} />
        <rect x={798} y={178} width={22} height={22} />
        <rect x={584} y={304} width={32} height={132} />
        <rect x={488} y={350} width={18} height={30} />
      </g>

      <HDim from={100} to={860} at={30} wall={90} label={feetInches(38 * 12)} />
      <HDim from={100} to={480} at={56} wall={90} label={feetInches(19 * 12)} />
      <HDim from={480} to={620} at={56} wall={90} label={feetInches(7 * 12)} />
      <HDim from={620} to={860} at={56} wall={170} label={feetInches(12 * 12)} />
      <VDim from={90} to={400} at={52} wall={100} label={feetInches(15.5 * 12)} />
      <VDim from={170} to={420} at={906} wall={860} label={feetInches(12.5 * 12)} />
      <HDim from={480} to={620} at={478} wall={440} label={feetInches(7 * 12)} />

      {APARTMENT.map((room) => {
        const tag = TAGS[room.no];
        const area = (roomArea(room.widthIn, room.lengthIn) * share).toFixed(1);
        return (
          <g key={room.no} className='lid-ap-room'>
            <g className='lid-ap-no'>
              <rect x={tag.x - 14} y={tag.y - 14} width={28} height={28} />
              <text x={tag.x} y={tag.y + 6}>
                {room.no}
              </text>
            </g>
            {tag.side ? (
              <text className='lid-ap-name lid-ap-side' x={tag.x + 24} y={tag.y + 5}>
                {room.name}
              </text>
            ) : (
              <>
                <text className='lid-ap-name' x={tag.x} y={tag.y + 38}>
                  {room.name}
                </text>
                <g className='lid-ap-area'>
                  <rect x={tag.x - 40} y={tag.y + 48} width={80} height={22} />
                  <text x={tag.x} y={tag.y + 64}>
                    {area} ft²
                  </text>
                </g>
              </>
            )}
          </g>
        );
      })}

      {/* North arrow, scale bar, room height */}
      <g className='lid-ap-legend'>
        <circle cx={740} cy={124} r={14} />
        <path className='lid-ap-north' d='M740 108 L748 132 L740 127 Z' />
        <path d='M740 108 L732 132 L740 127 Z' />
        <text x={740} y={100}>
          N
        </text>
        <rect className='lid-ap-scale-a' x={100} y={482} width={5 * FT} height={7} />
        <rect className='lid-ap-scale-b' x={100 + 5 * FT} y={482} width={5 * FT} height={7} />
        <text x={100} y={510}>
          0
        </text>
        <text x={100 + 5 * FT} y={510}>
          5
        </text>
        <text x={100 + 10 * FT} y={510}>
          10 ft
        </text>
        <text className='lid-ap-height' x={860} y={508}>
          Room height {feetInches(105)}
        </text>
      </g>
    </svg>
  );
}
