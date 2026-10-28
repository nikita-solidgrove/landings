import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../../shared/motion';

const FPS = 24;
const pad = (n: number) => String(n).padStart(2, '0');

/** SMPTE-style timecode (hh:mm:ss:ff at 24 fps) for a frame count. */
export function formatTimecode(frames: number) {
  const seconds = Math.floor(frames / FPS);
  return `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}:${pad(frames % FPS)}`;
}

/** Short clip time (0:03) for a duration in milliseconds. */
export const clipTime = (ms: number) => `0:${pad(Math.floor(ms / 1000))}`;

/**
 * A running camera timecode. It writes straight to the DOM once per frame, so the page never
 * re-renders for it; it stays at zero under reduced motion.
 */
export function Timecode({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const start = performance.now();
    let shown = -1;
    let raf = 0;
    const tick = (now: number) => {
      const frames = Math.floor(((now - start) / 1000) * FPS);
      if (frames !== shown && ref.current) {
        shown = frames;
        ref.current.textContent = formatTimecode(frames);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <span ref={ref} className={className}>
      {formatTimecode(0)}
    </span>
  );
}
