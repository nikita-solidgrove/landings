import { useEffect, useRef, type CSSProperties } from 'react';
import { prefersReducedMotion } from '../../shared/motion';
import { LOUPE_REST, SHEET, type Shot } from './content';
import { ShotImage } from './Frame';
import { GreaseLoop } from './Grease';

type StripProps = {
  shots: Shot[];
  /** Frame number of the first exposure (edge print). */
  first: number;
  lazy?: boolean;
  /** Per frame: which loupe rest point it is ("wide", "narrow" or both). */
  rest?: (index: number) => string | undefined;
  className?: string;
  style?: CSSProperties;
};

/** A strip of 35 mm film: sprocket holes, frames, edge numbers; matched frames get a grease loop. */
export function FilmStrip({ shots, first, lazy, rest, className, style }: StripProps) {
  return (
    <div className={['fmp-strip', className].filter(Boolean).join(' ')} style={style} aria-hidden='true'>
      {shots.map((shot, i) => {
        const no = first + i;
        return (
          <div
            key={i}
            className='fmp-frame'
            data-match={shot.match ? '' : undefined}
            data-rest={rest?.(i)}
            style={{ '--n': no } as CSSProperties}
          >
            <ShotImage shot={shot} lazy={lazy} />
            {shot.match ? <GreaseLoop seed={no * 13 + 5} className='fmp-frame-loop' /> : null}
            <span className='fmp-edge' aria-hidden='true'>
              <span>▸ {no}</span>
              <span>{no}A</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Strips() {
  return (
    <div className='fmp-strips'>
      {SHEET.map((shots, si) => (
        <FilmStrip
          key={si}
          shots={shots}
          first={si * shots.length + 1}
          rest={(fi) => {
            const marks = [];
            if (LOUPE_REST.wide[0] === si && LOUPE_REST.wide[1] === fi) marks.push('wide');
            if (LOUPE_REST.narrow[0] === si && LOUPE_REST.narrow[1] === fi) marks.push('narrow');
            return marks.length ? marks.join(' ') : undefined;
          }}
          style={{ '--si': si } as CSSProperties}
        />
      ))}
    </div>
  );
}

/**
 * The hero's contact sheet. A loupe follows a mouse pointer over it and magnifies a copy of the
 * same strips; on touch screens (and when the pointer leaves) it rests on one of the circled frames.
 */
export function ContactSheet() {
  const sheet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sheet.current;
    if (!el) return;
    const narrow = window.matchMedia('(max-width: 860px)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = prefersReducedMotion();

    let current = { x: 0, y: 0 };
    let target = { x: 0, y: 0 };
    let following = false;
    let frame = 0;

    const apply = () => {
      el.style.setProperty('--lx', `${current.x.toFixed(1)}px`);
      el.style.setProperty('--ly', `${current.y.toFixed(1)}px`);
    };

    const restPoint = () => {
      const box = el.getBoundingClientRect();
      const spot = el.querySelector<HTMLElement>(
        `:scope > .fmp-strips [data-rest~="${narrow.matches ? 'narrow' : 'wide'}"]`,
      );
      if (!spot) return { x: box.width * 0.75, y: box.height / 2 };
      const r = spot.getBoundingClientRect();
      return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height * 0.48 };
    };

    const tick = () => {
      const k = reduced ? 1 : following ? 0.22 : 0.1;
      current = { x: current.x + (target.x - current.x) * k, y: current.y + (target.y - current.y) * k };
      if (Math.abs(target.x - current.x) < 0.3 && Math.abs(target.y - current.y) < 0.3) {
        current = target;
        apply();
        frame = 0;
        return;
      }
      apply();
      frame = requestAnimationFrame(tick);
    };

    const moveTo = (point: { x: number; y: number }, instant = false) => {
      target = point;
      if (instant) {
        current = point;
        apply();
        return;
      }
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const measure = () => {
      el.style.setProperty('--sw', `${el.offsetWidth}px`);
      el.style.setProperty('--sh', `${el.offsetHeight}px`);
      if (!following) moveTo(restPoint(), true);
      el.dataset.loupe = 'ready';
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !finePointer.matches || narrow.matches) return;
      const box = el.getBoundingClientRect();
      following = true;
      moveTo({ x: event.clientX - box.left, y: event.clientY - box.top });
    };

    const onLeave = () => {
      if (!following) return;
      following = false;
      moveTo(restPoint());
    };

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    narrow.addEventListener('change', measure);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      observer.disconnect();
      narrow.removeEventListener('change', measure);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className='fmp-sheet' ref={sheet} aria-hidden='true'>
      <Strips />
      <div className='fmp-loupe'>
        <div className='fmp-loupe-view'>
          <Strips />
        </div>
      </div>
    </div>
  );
}
