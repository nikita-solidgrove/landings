import { useId, type ButtonHTMLAttributes, type CSSProperties, type PointerEvent, type ReactNode, type Ref } from 'react';
import { prefersReducedMotion } from '../../shared/motion';

/** A ring that spreads from the press point, like a finger touching water. */
export function ripple(event: PointerEvent<HTMLElement>) {
  if (prefersReducedMotion()) return;
  const target = event.currentTarget;
  const box = target.getBoundingClientRect();
  const size = Math.max(box.width, box.height) * 2;
  const ring = document.createElement('span');
  ring.className = 'spk-ripple';
  ring.setAttribute('aria-hidden', 'true');
  ring.style.width = `${size}px`;
  ring.style.height = `${size}px`;
  ring.style.left = `${event.clientX - box.left - size / 2}px`;
  ring.style.top = `${event.clientY - box.top - size / 2}px`;
  target.appendChild(ring);
  ring.addEventListener('animationend', () => ring.remove());
}

type SplashProps = ButtonHTMLAttributes<HTMLButtonElement> & { ref?: Ref<HTMLButtonElement> };

/** Round button with a ripple on press. */
export function Splash({ className, children, onPointerDown, ref, ...rest }: SplashProps) {
  return (
    <button
      ref={ref}
      type='button'
      className={['spk-splash', className].filter(Boolean).join(' ')}
      onPointerDown={(event) => {
        ripple(event);
        onPointerDown?.(event);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

/**
 * Wavy edge on top of a section, filled with that section's color (`--wave` on the section).
 * Two layers drift at different speeds, so the surface never looks like a straight cut.
 */
export function Wave({ className }: { className?: string }) {
  return (
    <div className={['spk-wave', className].filter(Boolean).join(' ')} aria-hidden='true'>
      <i />
      <i />
    </div>
  );
}

/** A hand-drawn wavy underline under a word of a heading; it draws itself once the heading shows. */
export function Squiggle({ children }: { children: ReactNode }) {
  return (
    <span className='spk-u'>
      {children}
      <svg viewBox='0 0 200 18' preserveAspectRatio='none' aria-hidden='true'>
        <path d='M3 10.5C18 3 32 2.5 49 8.5s30 8.5 49 1.8S131 1.5 150 7.6s32 8.4 47 1.4' />
      </svg>
    </span>
  );
}

const BUBBLES = [
  [6, 10, 13, 0],
  [14, 6, 9, -4],
  [22, 16, 15, -9],
  [31, 8, 11, -2],
  [44, 12, 14, -11],
  [53, 5, 8, -6],
  [61, 18, 17, -3],
  [70, 7, 10, -8],
  [78, 11, 12, -1],
  [86, 14, 16, -12],
  [93, 6, 9, -5],
  [97, 9, 12, -10],
];

/** Bubbles rising through a water section. */
export function Bubbles({ count = BUBBLES.length, className }: { count?: number; className?: string }) {
  return (
    <div className={['spk-bubbles', className].filter(Boolean).join(' ')} aria-hidden='true'>
      {BUBBLES.slice(0, count).map(([x, size, seconds, delay], i) => (
        <i
          key={i}
          style={
            {
              '--x': `${x}%`,
              '--s': `${size}px`,
              '--d': `${seconds}s`,
              '--delay': `${delay}s`,
              '--sway': `${i % 2 ? -1 : 1}`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

/** A small water drop glyph. */
export function Drop({ className }: { className?: string }) {
  return (
    <svg className={['spk-drop', className].filter(Boolean).join(' ')} viewBox='0 0 24 32' aria-hidden='true'>
      <path d='M12 1.5c3 4.6 10 11.6 10 19a10 10 0 0 1-20 0c0-7.4 7-14.4 10-19Z' />
    </svg>
  );
}

const DROP_PATH = 'M50 2C58 17 93 45 93 75c0 25-19 43-43 43S7 100 7 75C7 45 42 17 50 2Z';

/** A photo masked as a water drop, with a thin foam outline and a highlight. */
export function DropPhoto({ src, className }: { src: string; className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={['spk-dropphoto', className].filter(Boolean).join(' ')} viewBox='0 0 100 120' aria-hidden='true'>
      <defs>
        <clipPath id={`spk-drop-${id}`}>
          <path d={DROP_PATH} />
        </clipPath>
      </defs>
      <g clipPath={`url(#spk-drop-${id})`}>
        <rect className='spk-dropphoto-bg' width='100' height='120' />
        <image href={src} width='100' height='120' preserveAspectRatio='xMidYMid slice' />
      </g>
      <path className='spk-dropphoto-edge' d={DROP_PATH} />
      <ellipse className='spk-dropphoto-shine' cx='27' cy='66' rx='4.5' ry='10' transform='rotate(18 27 66)' />
    </svg>
  );
}
