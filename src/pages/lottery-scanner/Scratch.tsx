import { useEffect, useRef, useState, type ReactNode } from 'react';
import { prefersReducedMotion } from '../../shared/motion';

type Point = { x: number; y: number };

const LATEX = '#c4c7cd';

/** Silver scratch-off latex with a fine print pattern and the "Scratch here" legend. */
function paint(canvas: HTMLCanvasElement) {
  const box = canvas.getBoundingClientRect();
  if (!box.width || !box.height) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(box.width * dpr);
  canvas.height = Math.round(box.height * dpr);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = box.width;
  const h = box.height;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = LATEX;
  ctx.fillRect(0, 0, w, h);

  // Printed diagonal fine lines, like the security pattern on real latex.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)';
  ctx.lineWidth = 1;
  for (let x = -h; x < w; x += 6) {
    ctx.beginPath();
    ctx.moveTo(x, h);
    ctx.lineTo(x + h, 0);
    ctx.stroke();
  }

  // Grain.
  const grains = Math.round((w * h) / 70);
  for (let i = 0; i < grains; i++) {
    ctx.fillStyle = i % 2 ? 'rgba(255, 255, 255, 0.4)' : 'rgba(52, 56, 66, 0.16)';
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.3, 1.3);
  }

  ctx.fillStyle = '#80848e';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const big = Math.max(24, Math.min(46, w / 9));
  ctx.font = `${big}px "Alfa Slab One", Georgia, serif`;
  ctx.fillText('Scratch here', w / 2, h / 2 - big * 0.3);
  ctx.font = `600 ${Math.round(big * 0.42)}px "Barlow Condensed", sans-serif`;
  ctx.fillText('or keep scrolling', w / 2, h / 2 + big * 0.62);
}

/**
 * A scratch-off panel: silver latex over its children. Scratch it with the pointer, or let it come
 * into view and it scratches itself clean. Focus inside clears it at once, and without motion there
 * is no latex at all. The children stay in the document the whole time.
 */
export function ScratchPanel({ children, className }: { children: ReactNode; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [reduced] = useState(prefersReducedMotion);
  const [clear, setClear] = useState(reduced);
  const done = useRef(reduced);
  const last = useRef<Point | null>(null);
  const moves = useRef(0);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    setClear(true);
  };

  const stroke = (to: Point, width: number) => {
    const ctx = canvas.current?.getContext('2d');
    if (!ctx || done.current) return;
    const from = last.current ?? to;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x + 0.01, to.y);
    ctx.stroke();
    last.current = to;
  };

  /** Clears the rest once about half of the latex is gone. */
  const measure = () => {
    const el = canvas.current;
    const ctx = el?.getContext('2d');
    if (!el || !ctx || !el.width) return;
    const data = ctx.getImageData(0, 0, el.width, el.height).data;
    let gone = 0;
    let seen = 0;
    for (let i = 3; i < data.length; i += 4 * 37) {
      seen++;
      if (data[i] < 64) gone++;
    }
    if (gone / seen > 0.48) finish();
  };

  useEffect(() => {
    const el = canvas.current;
    const wrap = box.current;
    if (done.current || !el || !wrap) return;

    let painted = false;
    const repaint = () => {
      if (done.current) return;
      paint(el);
      painted = true;
    };
    // The legend uses the page fonts; wait for them, but never for long.
    const fonts = document.fonts;
    const fallback = window.setTimeout(repaint, 900);
    fonts?.load('40px "Alfa Slab One"').then(() => {
      window.clearTimeout(fallback);
      repaint();
    }, repaint);

    const resize = new ResizeObserver(() => {
      if (painted) repaint();
    });
    resize.observe(el);

    // Scrolled into view: a coin runs across the latex in three passes.
    let frame = 0;
    let delay = 0;
    const run = () => {
      const rect = el.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const passes = 3;
      const width = (h / passes) * 1.35;
      const start = performance.now();
      const duration = 1500;
      last.current = null;
      const at = (t: number): Point => {
        const row = Math.min(passes - 1, Math.floor(t * passes));
        const u = t * passes - row;
        const x = row % 2 ? w + 24 - u * (w + 48) : -24 + u * (w + 48);
        const y = (h * (row + 0.5)) / passes + Math.sin(u * Math.PI * 5) * h * 0.08;
        return { x, y };
      };
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - (1 - t) ** 1.6;
        stroke(at(eased), width);
        if (t < 1 && !done.current) frame = requestAnimationFrame(tick);
        else finish();
      };
      frame = requestAnimationFrame(tick);
    };

    const seen = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || done.current) return;
        seen.disconnect();
        delay = window.setTimeout(run, 350);
      },
      { threshold: 0.9 },
    );
    seen.observe(el);

    return () => {
      window.clearTimeout(fallback);
      window.clearTimeout(delay);
      cancelAnimationFrame(frame);
      resize.disconnect();
      seen.disconnect();
    };
  }, []);

  const local = (event: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const onMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (done.current) return;
    // A mouse scratches by passing over; a finger or pen while it touches.
    if (event.pointerType !== 'mouse' && event.buttons === 0) return;
    stroke(local(event), 38);
    if (++moves.current % 10 === 0) measure();
  };

  return (
    <div ref={box} className={`lot-scratch${clear ? ' is-clear' : ''}${className ? ` ${className}` : ''}`} onFocusCapture={finish}>
      <div className='lot-scratch-prize'>{children}</div>
      {reduced ? null : (
        <canvas
          ref={canvas}
          className='lot-scratch-latex'
          aria-hidden='true'
          onPointerEnter={() => (last.current = null)}
          onPointerDown={(event) => (last.current = local(event))}
          onPointerMove={onMove}
          onPointerLeave={() => {
            last.current = null;
            measure();
          }}
          onPointerUp={measure}
        />
      )}
    </div>
  );
}
