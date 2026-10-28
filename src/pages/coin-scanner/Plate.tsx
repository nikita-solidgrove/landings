import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { prefersReducedMotion } from '../../shared/motion';
import { CoinFace } from './CoinFace';
import { PLATE_FIELDS } from './content';

/**
 * A catalogue plate of one real coin, obverse and reverse, above the fields a result fills in. Each
 * field circles where it is read on the coin; the plate walks through them until the visitor picks one.
 */
export function Plate() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const field = PLATE_FIELDS[active];

  useEffect(() => {
    if (!auto || prefersReducedMotion() || !root.current) return;
    let visible = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.35 },
    );
    observer.observe(root.current);
    const timer = window.setInterval(() => {
      if (visible) setActive((current) => (current + 1) % PLATE_FIELDS.length);
    }, 2800);
    return () => {
      window.clearInterval(timer);
      observer.disconnect();
    };
  }, [auto]);

  function pick(index: number) {
    setActive(index);
    setAuto(false);
  }

  return (
    <div className='coin-plate' ref={root}>
      <figure className='coin-plate-sheet' data-reveal=''>
        <div className='coin-plate-coins'>
          {(['obv', 'rev'] as const).map((side) => (
            <div key={side} className='coin-plate-coin'>
              <div className='coin-plate-disc'>
                <CoinFace side={side === 'obv' ? 'lireObv' : 'lireRev'} size={600} />
                {field.spot && field.spot.side === side ? (
                  <span
                    key={field.id}
                    className={field.spot.r >= 50 ? 'coin-spot is-rim' : 'coin-spot'}
                    style={{ '--x': `${field.spot.x}%`, '--y': `${field.spot.y}%`, '--r': `${field.spot.r}%` } as CSSProperties}
                    aria-hidden='true'
                  />
                ) : null}
              </div>
              <span className='coin-plate-side'>{side === 'obv' ? 'Obverse' : 'Reverse'}</span>
            </div>
          ))}
          {field.spot === null ? (
            <span key='tag' className='coin-pricetag' aria-hidden='true'>
              <small>Example estimate</small>
              <strong>{field.value}</strong>
            </span>
          ) : null}
        </div>
        <figcaption>
          <b>Pl. 1</b>
          <span>Italy, 100 lire, 1981. A real coin; the fields show what a result card holds.</span>
        </figcaption>
      </figure>

      <ol className='coin-plate-fields' data-reveal='' style={{ '--reveal-delay': '140ms' } as CSSProperties}>
        {PLATE_FIELDS.map((item, i) => (
          <li key={item.id}>
            <button
              type='button'
              aria-pressed={i === active}
              onClick={() => pick(i)}
              onMouseEnter={() => {
                if (window.matchMedia('(hover: hover)').matches) pick(i);
              }}
            >
              <span className='coin-plate-no'>{String(i + 1).padStart(2, '0')}</span>
              <span className='coin-plate-name'>{item.label}</span>
              <span className='coin-leader' aria-hidden='true' />
              <strong>{item.value}</strong>
              <small>{item.note}</small>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
