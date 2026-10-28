import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { ChevronLeft, DollarSign, ImageIcon, X, Zap } from 'lucide-react';
import { prefersReducedMotion } from '../../shared/motion';
import { APP, DEMO_TICKETS, GAMES, SAMPLE_DRAWS, checkLine, photo } from './content';
import { Ball, PaperTicket } from './Ticket';

export type Phase = 'aim' | 'read' | 'check' | 'done';

const AIM_MS = 1100;
const READ_MS = 85;
const OPEN_MS = 800;
const CHECK_MS = 210;
const ROW_PAUSE_MS = 380;
const DONE_MS = 3800;

const HINTS: Record<Phase, string> = {
  aim: 'Hold the ticket inside the frame',
  read: 'Reading your numbers…',
  check: 'Checking against the draw…',
  done: 'Done',
};

const countOf = (index: number) => DEMO_TICKETS[index].lines.length * 6;

/**
 * The app's core moment as a looping example: the camera finds the ticket, reads the numbers,
 * then the result screen checks every line against the draw, number by number. The hero shares
 * the loop, so the ticket it lies on can be stamped when a check is done.
 */
export function useScanLoop() {
  const reduced = prefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>(reduced ? 'done' : 'aim');
  const [step, setStep] = useState(reduced ? countOf(0) : 0);

  const ticket = DEMO_TICKETS[index];
  const draw = SAMPLE_DRAWS[ticket.game];
  const total = countOf(index);
  const results = useMemo(() => ticket.lines.map((line) => checkLine(line, draw, ticket.game)), [ticket, draw]);

  function select(next: number) {
    setIndex(next);
    setStep(reduced ? countOf(next) : 0);
    setPhase(reduced ? 'done' : 'aim');
  }

  useEffect(() => {
    if (reduced) return;
    let timer: number;

    if (phase === 'aim') {
      timer = window.setTimeout(() => setPhase('read'), AIM_MS);
    } else if (phase === 'read') {
      timer = window.setTimeout(() => {
        if (step < total) setStep(step + 1);
        else {
          setStep(0);
          setPhase('check');
        }
      }, step < total ? READ_MS : 420);
    } else if (phase === 'check') {
      const wait = step === 0 ? OPEN_MS : step % 6 === 0 ? CHECK_MS + ROW_PAUSE_MS : CHECK_MS;
      timer = window.setTimeout(() => {
        if (step < total) setStep(step + 1);
        else setPhase('done');
      }, wait);
    } else {
      timer = window.setTimeout(() => select((index + 1) % DEMO_TICKETS.length), DONE_MS);
    }

    return () => window.clearTimeout(timer);
  }, [phase, step, index, total, reduced]);

  return { index, phase, step, total, ticket, draw, results, select };
}

export type ScanLoop = ReturnType<typeof useScanLoop>;

/** The phone running the app: the Scan Ticket camera, then the Ticket Result screen. */
export function ScanPhone({ loop }: { loop: ScanLoop }) {
  const { phase, step, total, ticket, draw, results, index } = loop;
  const game = GAMES[ticket.game];
  const winners = results.filter((result) => result.wins);
  const sheetOpen = phase === 'check' || phase === 'done';
  const readUpTo = phase === 'aim' ? -1 : phase === 'read' ? step : total;
  const checked = sheetOpen ? step : 0;

  return (
    <div className='lot-phone' aria-hidden='true'>
      <div className='lot-screen' data-phase={phase}>
        <div className='lot-island' />
        <div className='lot-statusbar'>
          <span>9:41</span>
          <span className='lot-status-icons'>
            <i />
            <i />
            <b />
          </span>
        </div>

        {/* Camera: the app's Scan Ticket screen */}
        <div className='lot-cam'>
          <div className='lot-cam-bar'>
            <strong>Scan Ticket</strong>
            <X />
          </div>
          <div className='lot-cam-feed'>
            <img className='lot-cam-photo' src={photo('cornerStore', 400, 560)} alt='' />
            <PaperTicket key={`cam-${index}`} ticket={ticket} readUpTo={readUpTo} className='lot-cam-ticket' />
            <span className='lot-finder'>
              <span className='lot-finder-line' />
            </span>
            <span key={phase} className='lot-cam-hint'>{HINTS[phase]}</span>
          </div>
          <div className='lot-cam-controls'>
            <ImageIcon />
            <span className='lot-shutter' />
            <Zap />
          </div>
        </div>

        {/* Result: the app's Ticket Result screen */}
        <div className={sheetOpen ? 'lot-sheet is-open' : 'lot-sheet'}>
          <div className='lot-sheet-nav'>
            <span>
              <ChevronLeft />
              Back
            </span>
            <strong>Ticket Result</strong>
          </div>

          <div className='lot-sheet-card'>
            <strong>{game.name} Scan Results</strong>
            <span className='lot-sheet-date'>Drawing date: example</span>
            <span className='lot-sheet-label'>Winning numbers</span>
            <div className='lot-sheet-draw'>
              {draw.numbers.map((n) => <Ball key={n} n={n} />)}
              <Ball n={draw.ball} special={ticket.game} />
            </div>
          </div>

          <ol className='lot-rows'>
            {ticket.lines.map((line, row) => {
              const result = results[row];
              const done = checked >= (row + 1) * 6;
              const state = done ? (result.wins ? ' is-win' : ' is-miss') : '';
              return (
                <li key={line.label} className={`lot-row${state}`}>
                  <span className='lot-row-status'>{done ? result.wins ? <DollarSign /> : <X /> : null}</span>
                  <b>{line.label}</b>
                  <span className='lot-row-balls'>
                    {[...line.numbers, line.ball].map((n, i) => {
                      const position = row * 6 + i;
                      const isBall = i === 5;
                      const hit = isBall ? result.ballMatched : result.matched[i];
                      const seen = position < checked;
                      const cls = seen ? (hit ? 'is-hit' : 'is-miss') : position === checked && phase === 'check' ? 'is-now' : '';
                      return (
                        <Ball
                          key={i}
                          n={n}
                          special={isBall ? ticket.game : undefined}
                          className={cls}
                          style={{ '--d': `${i * 40}ms` } as CSSProperties}
                        />
                      );
                    })}
                  </span>
                  <small className='lot-row-result'>
                    {done ? (result.wins ? `${result.label} · winning line` : result.count ? `${result.count} matched · no prize` : 'No match') : ' '}
                  </small>
                </li>
              );
            })}
          </ol>

          <p className={phase === 'done' ? `lot-summary is-shown${winners.length ? ' is-win' : ''}` : sheetOpen ? 'lot-summary is-shown' : 'lot-summary'}>
            {phase !== 'done'
              ? `Checking line ${ticket.lines[Math.min(ticket.lines.length - 1, Math.floor(checked / 6))].label}…`
              : winners.length
                ? `${winners.length} winning line${winners.length > 1 ? 's' : ''} on this ticket`
                : 'No winning lines this draw'}
          </p>
          <p className='lot-sheet-note'>All winning tickets must be redeemed in the state/jurisdiction in which they are sold.</p>
          <span className='lot-sheet-done'>Done</span>
        </div>
      </div>
    </div>
  );
}

/** iOS-style notification once a check is done. */
export function ScanToast({ loop }: { loop: ScanLoop }) {
  const { phase, ticket, results, index } = loop;
  if (phase !== 'done') return null;
  const game = GAMES[ticket.game];
  const first = results.findIndex((result) => result.wins);
  return (
    <div key={index} className='lot-toast' aria-hidden='true'>
      <img src={APP.iconUrl} alt='' />
      <span>
        <small>
          {APP.name} <em>now</em>
        </small>
        <strong>{first >= 0 ? `Line ${ticket.lines[first].label} is a winning line` : 'All lines checked'}</strong>
        <span>
          {game.name} · {first >= 0 ? results[first].label : 'no prize this draw'}
        </span>
      </span>
    </div>
  );
}

/** Picks the example ticket the phone scans. */
export function ScanPicker({ loop }: { loop: ScanLoop }) {
  return (
    <div className='lot-picker'>
      <div className='lot-segment' role='tablist' aria-label='Example tickets'>
        {DEMO_TICKETS.map((item, i) => (
          <button
            key={item.game}
            type='button'
            role='tab'
            aria-selected={i === loop.index}
            className='lot-segment-tab'
            onClick={() => loop.select(i)}
          >
            {GAMES[item.game].name}
          </button>
        ))}
      </div>
      <p className='lot-picker-note'>Example tickets. The draws are the ones in the app’s screenshots.</p>
    </div>
  );
}
