import type { CSSProperties } from 'react';

/** Order of an element in an entrance sequence; the CSS turns it into a delay. */
export const order = (i: number) => ({ '--i': i }) as CSSProperties;
export const delay = (ms: number) => ({ '--reveal-delay': `${ms}ms` }) as CSSProperties;

/**
 * Text that types itself in, one character at a time (CSS only, so it restarts whenever the element
 * mounts). Screen readers get the whole string at once.
 */
export function TypeIn({ text, className, start = 0 }: { text: string; className?: string; start?: number }) {
  return (
    <span className={className ? `duo-type ${className}` : 'duo-type'} style={{ '--t0': `${start}ms` } as CSSProperties}>
      <span className='duo-sr'>{text}</span>
      <span aria-hidden='true'>
        {Array.from(text).map((char, i) => (
          <span key={i} style={{ '--c': i } as CSSProperties}>
            {char}
          </span>
        ))}
      </span>
    </span>
  );
}

/** The line selector: "1 | 2", with the line(s) a block is about filled in. */
export function LineMark({ on, className }: { on: 1 | 2 | 'both'; className?: string }) {
  return (
    <span className={className ? `duo-mark ${className}` : 'duo-mark'} aria-hidden='true'>
      <b className={on === 1 || on === 'both' ? 'is-on' : undefined}>
        <span>1</span>
      </b>
      <b className={on === 2 || on === 'both' ? 'is-on' : undefined}>
        <span>2</span>
      </b>
    </span>
  );
}

/** Signal bars, like the two lines in an iPhone status bar. */
export function Bars({ className }: { className?: string }) {
  return (
    <span className={className ? `duo-bars ${className}` : 'duo-bars'} aria-hidden='true'>
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

/** The contact pattern of a SIM chip. */
export function Chip({ className }: { className?: string }) {
  return (
    <svg className={className ? `duo-chip ${className}` : 'duo-chip'} viewBox='0 0 46 36' aria-hidden='true'>
      <rect x='1' y='1' width='44' height='34' rx='5' />
      <path d='M16 1v11M30 1v11M16 24v11M30 24v11M1 12h15M30 12h15M1 24h15M30 24h15M16 12h14v12H16z' />
    </svg>
  );
}
