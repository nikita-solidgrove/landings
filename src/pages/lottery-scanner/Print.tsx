import type { CSSProperties, ReactNode, Ref } from 'react';
import { ScanLine } from 'lucide-react';

/** The buying button: a ticket with notched corners, pressed into the paper on tap. */
export function Cta({ label, short, className, onClick, ctaRef, tabIndex }: {
  label: string;
  /** Shorter label for narrow headers. */
  short?: string;
  className?: string;
  onClick: () => void;
  ctaRef?: Ref<HTMLButtonElement>;
  tabIndex?: number;
}) {
  return (
    <button
      ref={ctaRef}
      type='button'
      className={`lot-cta${className ? ` ${className}` : ''}`}
      onClick={onClick}
      tabIndex={tabIndex}
    >
      <span className='lot-cta-face'>
        <ScanLine size={20} strokeWidth={2.4} aria-hidden='true' />
        {short ? (
          <>
            <span className='lot-cta-long'>{label}</span>
            <span className='lot-cta-short' aria-hidden='true'>{short}</span>
          </>
        ) : (
          label
        )}
      </span>
    </button>
  );
}

/**
 * Section heading set like a line on a ticket: the line letter in a play-slip box, then the slab
 * heading. The letter is decoration; the heading carries the meaning.
 */
export function LineHead({ letter, id, children, lead, className }: {
  letter: string;
  id: string;
  children: ReactNode;
  lead?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`lot-head${className ? ` ${className}` : ''}`} data-reveal=''>
      <span className='lot-head-tag' aria-hidden='true'>
        <small>Line</small>
        <b>{letter}</b>
      </span>
      <div className='lot-head-text'>
        <h2 id={id} className='lot-h2'>{children}</h2>
        {lead ? <p className='lot-head-lead'>{lead}</p> : null}
      </div>
    </div>
  );
}

/**
 * A photo printed as a one-color halftone on ticket paper. On hover the full-color photo is
 * scanned in from the top.
 */
export function Halftone({ src, className, style }: { src: string; className?: string; style?: CSSProperties }) {
  return (
    <span className={`lot-ht${className ? ` ${className}` : ''}`} style={style} aria-hidden='true'>
      <span className='lot-ht-print'>
        <img src={src} alt='' loading='lazy' />
      </span>
      <span className='lot-ht-ink' />
      <span className='lot-ht-paper' />
      <img className='lot-ht-color' src={src} alt='' decoding='async' />
    </span>
  );
}

/** Printed barcode with the serial under it. */
export function Barcode({ serial, className }: { serial: string; className?: string }) {
  return (
    <span className={`lot-barcode-block${className ? ` ${className}` : ''}`} aria-hidden='true'>
      <span className='lot-barcode-bars' />
      <span className='lot-barcode-serial'>{serial}</span>
    </span>
  );
}
