import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from 'react';
import './motion.css';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Marks every `[data-reveal]` element inside `root` with `data-shown` once it scrolls into view.
 * The CSS owns the actual transition; `--reveal-delay` on an element staggers it.
 */
export function useReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const elements = root.current?.querySelectorAll<HTMLElement>('[data-reveal]');
    if (!elements?.length) return;

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.setAttribute('data-shown', ''));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute('data-shown', '');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [root]);
}

type TiltProps = {
  className?: string;
  style?: CSSProperties;
  /** Largest rotation in degrees. */
  max?: number;
  children: ReactNode;
} & Record<`data-${string}`, string | undefined>;

/** Tilts toward the pointer on devices with a fine pointer; flat everywhere else. */
export function Tilt({ className, style, max = 5, children, ...rest }: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || prefersReducedMotion()) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    event.currentTarget.style.setProperty('--tilt-x', `${(-y * max).toFixed(2)}deg`);
    event.currentTarget.style.setProperty('--tilt-y', `${(x * max).toFixed(2)}deg`);
  };

  const onPointerLeave = () => {
    ref.current?.style.setProperty('--tilt-x', '0deg');
    ref.current?.style.setProperty('--tilt-y', '0deg');
  };

  return (
    <div
      ref={ref}
      className={['tilt', className].filter(Boolean).join(' ')}
      style={style}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      {...rest}
    >
      {children}
    </div>
  );
}
