import type { CSSProperties, ReactNode } from 'react';

const TOTAL = 5;
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * The page's heading device: a TV info line under each heading, "Now showing", a progress bar that
 * fills to how far into the page the section sits, and the section's number.
 */
export function NowShowing({ n }: { n: number }) {
  return (
    <p className='smr-osd' aria-hidden='true' style={{ '--to': n / TOTAL } as CSSProperties}>
      <span>Now showing</span>
      <i className='smr-osd-bar'>
        <b />
      </i>
      <span className='smr-osd-no'>
        {pad(n)} / {pad(TOTAL)}
      </span>
    </p>
  );
}

/** Heading + "Now showing" line + an optional sentence, revealed together. */
export function SectionHead({ n, id, title, children }: { n: number; id: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div className='smr-head' data-reveal=''>
      <h2 id={id} className='smr-h2'>
        {title}
      </h2>
      <NowShowing n={n} />
      {children ? <p className='smr-head-text'>{children}</p> : null}
    </div>
  );
}
