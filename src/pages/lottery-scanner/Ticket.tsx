import type { CSSProperties } from 'react';
import { GAMES, pad, type DemoTicket, type GameId } from './content';

type BallProps = {
  n: number;
  /** The game's special ball: red Powerball or gold Mega Ball. */
  special?: GameId;
  className?: string;
  style?: CSSProperties;
};

/** A flat lottery ball: colored shell, white label with the number. */
export function Ball({ n, special, className, style }: BallProps) {
  const tone = special === 'powerball' ? ' lot-ball-red' : special === 'megaMillions' ? ' lot-ball-gold' : '';
  return (
    <span className={`lot-ball${tone}${className ? ` ${className}` : ''}`} style={style}>
      <span>{n}</span>
    </span>
  );
}

type PaperProps = {
  ticket: DemoTicket;
  /** How many printed numbers the scanner has read so far (highlighted), or -1 for none. */
  readUpTo?: number;
  className?: string;
};

/** The printed ticket: thermal paper with zigzag edges, lines of numbers and a barcode. */
export function PaperTicket({ ticket, readUpTo = -1, className }: PaperProps) {
  const game = GAMES[ticket.game];
  let position = 0;

  return (
    <div className={`lot-paper-shadow${className ? ` ${className}` : ''}`} aria-hidden='true'>
      <div className={`lot-paper lot-paper-${ticket.game}`}>
        <div className='lot-paper-head'>
          <strong>{game.name}</strong>
          <span>Example ticket</span>
        </div>
        <ol className='lot-paper-lines'>
          {ticket.lines.map((line) => (
            <li key={line.label}>
              <b>{line.label}</b>
              {[...line.numbers, line.ball].map((n, i) => {
                const read = position++ < readUpTo;
                return (
                  <span key={i} className={`${i === 5 ? 'lot-paper-ball' : ''}${read ? ' is-read' : ''}`}>
                    {i === 5 ? <i>{game.ballShort}</i> : null}
                    {pad(n)}
                  </span>
                );
              })}
            </li>
          ))}
        </ol>
        <div className='lot-paper-foot'>
          <span>1 draw</span>
          <span>0478 1100 0164</span>
        </div>
        <div className='lot-barcode' />
      </div>
    </div>
  );
}
