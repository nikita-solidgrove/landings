import '@fontsource/alfa-slab-one';
import '@fontsource/barlow-condensed/500.css';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/barlow-condensed/700.css';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowRight, ChevronDown, ScanLine } from 'lucide-react';
import { useReveal } from '../../shared/motion';
import { ProgressiveBlur } from '../../shared/ProgressiveBlur';
import { describeOffer, initials, type LandingProps } from '../../shared/offer';
import {
  APP,
  BOARD,
  FAQ,
  FEATURES,
  GAMES,
  HERO_FIELDS,
  HISTORY,
  SAMPLE_DRAWS,
  SCREENSHOTS,
  SLIP,
  STEPS,
  USE_CASES,
  pad,
  photo,
} from './content';
import { Barcode, Cta, Halftone, LineHead } from './Print';
import { ScanPhone, ScanPicker, ScanToast, useScanLoop } from './Scanner';
import { ScratchPanel } from './Scratch';
import { Ball } from './Ticket';
import './page.css';

/** Order of an element in an entrance sequence; the CSS turns it into a delay. */
const order = (i: number) => ({ '--i': i }) as CSSProperties;
const delay = (ms: number) => ({ '--reveal-delay': `${ms}ms` }) as CSSProperties;

const SERIAL = '0478 1100 0164';

function StepArt({ index }: { index: number }) {
  if (index === 0) {
    return (
      <span className='lot-mini-scan'>
        <ScanLine size={20} />
        Scan Ticket
      </span>
    );
  }
  if (index === 1) {
    return (
      <span className='lot-mini-finder'>
        <span className='lot-mini-ticket'>
          <i />
          <i />
          <i />
        </span>
      </span>
    );
  }
  // Line B of the Mega Millions example against the app's screenshot draw: 9, 18 and the Mega Ball.
  return (
    <span className='lot-mini-row'>
      {[9, 18, 33, 47, 66].map((n, k) => (
        <Ball key={n} n={n} className={k < 2 ? 'is-hit' : 'is-miss'} />
      ))}
      <Ball n={15} special='megaMillions' className='is-hit' />
    </span>
  );
}

/** The example play slip: numbers 1–69 and Powerball 1–26, with line A penciled in. */
function PlaySlip() {
  const cell = (n: number, marked: boolean, k: number) => (
    <span key={n} className={marked ? 'is-marked' : undefined} style={marked ? ({ '--d': `${300 + k * 160}ms` } as CSSProperties) : undefined}>
      <b>{n}</b>
    </span>
  );
  let mark = 0;
  return (
    <div className='lot-slip' aria-hidden='true'>
      <div className='lot-slip-top'>
        <b>{GAMES[SLIP.game].name}</b>
        <span>Example</span>
      </div>
      <dl className='lot-slip-form'>
        <div>
          <dt>Game</dt>
          <dd>
            {GAMES[SLIP.game].name} <ChevronDown size={16} />
          </dd>
        </div>
        <div>
          <dt>Drawing date</dt>
          <dd>Saturday</dd>
        </div>
        <div>
          <dt>Rows</dt>
          <dd>
            <i>−</i> 1 <i>+</i>
          </dd>
        </div>
      </dl>
      <div className='lot-slip-grid'>
        {Array.from({ length: SLIP.pool }, (_, i) => {
          const marked = SLIP.numbers.includes(i + 1);
          return cell(i + 1, marked, marked ? mark++ : 0);
        })}
      </div>
      <div className='lot-slip-pb'>
        <b>Power&shy;ball</b>
        <div className='lot-slip-grid'>
          {Array.from({ length: SLIP.ballPool }, (_, i) => cell(i + 1, i + 1 === SLIP.ball, SLIP.numbers.length))}
        </div>
      </div>
    </div>
  );
}

export function LotteryScannerPage({ offer, creator, onStart }: LandingProps) {
  const root = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);
  const heroCta = useRef<HTMLButtonElement>(null);
  const [showDock, setShowDock] = useState(false);
  const [headerStuck, setHeaderStuck] = useState(false);
  const [headerTone, setHeaderTone] = useState<'light' | 'dark'>('dark');
  const terms = describeOffer(offer);
  const loop = useScanLoop();

  useReveal(root);

  useEffect(() => {
    // The tint shows once content scrolls under the header (the creator ribbon scrolls away first),
    // and turns dark with light text over sections marked data-header="dark".
    const onScroll = () => {
      const box = header.current?.getBoundingClientRect();
      if (!box) return;
      setHeaderStuck(window.scrollY > 4 && box.top <= 0);
      const under = document.elementFromPoint(window.innerWidth / 2, box.bottom + 1);
      setHeaderTone(under?.closest('[data-header="dark"]') ? 'dark' : 'light');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => {
    const target = heroCta.current;
    if (!target) return;
    // Only once the visitor has scrolled past the hero button, not while it is still below the fold.
    const observer = new IntersectionObserver(([entry]) =>
      setShowDock(!entry.isIntersecting && entry.boundingClientRect.top < 0),
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const price = (
    <p className={terms.today ? 'lot-price' : 'lot-price lot-price-regular'}>
      <strong>{terms.today ?? terms.regular}</strong>
      {terms.today ? (
        <>
          <s>{terms.regular}</s>
          <span>First payment</span>
        </>
      ) : null}
    </p>
  );

  const [leadCase, ...moreCases] = USE_CASES;

  return (
    <div className='lot' ref={root}>
      {creator && offer.discountPercent ? (
        <div className='lot-ribbon'>
          {creator.avatarUrl ? (
            <img src={creator.avatarUrl} alt='' className='lot-avatar' />
          ) : (
            <span className='lot-avatar' aria-hidden='true'>{initials(creator.name)}</span>
          )}
          <p>
            <strong>{creator.name}</strong> picked this app for you
          </p>
          <span className='lot-ribbon-deal'>−{offer.discountPercent}% today</span>
        </div>
      ) : null}

      <header ref={header} className='lot-header' data-stuck={headerStuck} data-tone={headerTone}>
        <div className='lot-header-backdrop' aria-hidden='true'>
          <ProgressiveBlur layers={6} maxBlur={18} />
          <div className='lot-header-tint lot-header-tint-light' />
          <div className='lot-header-tint lot-header-tint-dark' />
        </div>
        <div className='lot-wrap lot-header-row'>
          <a href='#top' className='lot-identity'>
            <img src={APP.iconUrl} alt='' width={40} height={40} />
            <span>
              <strong>{APP.name}</strong>
              <small>by {APP.developer}</small>
            </span>
          </a>
          <Cta label='Check tickets' short='Check' className='lot-header-cta' onClick={onStart} />
        </div>
      </header>

      <main id='top'>
        {/* ---------- Hero: one giant ticket, the phone scanning it ---------- */}
        <section className='lot-hero' data-header='dark'>
          <div className='lot-wrap'>
            <div className='lot-board'>
              <div className='lot-ticket'>
                <div className='lot-ticket-main'>
                  <div className='lot-ticket-band'>
                    <b>{APP.name}</b>
                    <span>Powerball · Mega Millions</span>
                  </div>
                  <h1 className='lot-h1'>
                    <span className='lot-h1-line'>
                      <span style={order(1)}>Scan the ticket.</span>
                    </span>
                    <span className='lot-h1-line'>
                      <span style={order(2)}>Every line,</span>
                    </span>
                    <span className='lot-h1-line'>
                      <span style={order(3)}>
                        <span className='lot-scratch-word'>
                          checked.
                          <i aria-hidden='true' />
                        </span>
                      </span>
                    </span>
                  </h1>
                  <p className='lot-hero-lead'>
                    Point your camera at a Powerball or Mega Millions ticket. The app reads your numbers and checks
                    every line against the latest draw.
                  </p>
                  <dl className='lot-fields'>
                    {HERO_FIELDS.map((field) => (
                      <div key={field.label}>
                        <dt>{field.label}</dt>
                        <dd>{field.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className='lot-ticket-serial' aria-hidden='true'>
                    {SERIAL} · {APP.name} by {APP.developer} · iPhone · iOS 17.0+
                  </p>
                </div>

                <div className='lot-ticket-stub'>
                  <div className='lot-stub-band' aria-hidden='true'>No. {SERIAL.slice(0, 9)}</div>
                  <div className='lot-stub-offer'>
                    {price}
                    <Cta label='Check my tickets' onClick={onStart} ctaRef={heroCta} />
                    <p className='lot-terms'>{terms.terms}</p>
                  </div>
                  <Barcode serial={SERIAL} className='lot-stub-code' />
                </div>
              </div>

              <div className='lot-scan' role='group' aria-label='Example of scanning a lottery ticket in the app'>
                <ScanPhone loop={loop} />
                <ScanToast loop={loop} />
                <ScanPicker loop={loop} />
              </div>

              {loop.phase === 'done' ? (
                <span key={loop.index} className='lot-stamp' aria-hidden='true'>
                  Checked
                </span>
              ) : null}
            </div>
          </div>
        </section>

        {/* ---------- Line A: how it works ---------- */}
        <section className='lot-section lot-how' aria-labelledby='lot-how-title'>
          <div className='lot-wrap'>
            <LineHead letter='A' id='lot-how-title'>
              Wallet to result in three steps.
            </LineHead>

            <ol className='lot-steps'>
              {STEPS.map((item, i) => (
                <li key={item.title} className='lot-step' data-reveal='' style={delay(i * 140)}>
                  <Ball n={i + 1} className='lot-step-ball' />
                  <div className='lot-step-art' aria-hidden='true'>
                    <StepArt index={i} />
                  </div>
                  <h3 className='lot-h3'>{item.title}</h3>
                  <p>{item.text}</p>
                </li>
              ))}
            </ol>

            <div className='lot-manual' data-reveal=''>
              <div className='lot-manual-copy'>
                <h3>Ticket faded or torn? Type it in.</h3>
                <p>Pick the game and the drawing date, add your lines and check them the same way.</p>
              </div>
              <PlaySlip />
            </div>
          </div>
        </section>

        {/* ---------- Line B: after the draw ---------- */}
        <section className='lot-section lot-draw' data-header='dark' aria-labelledby='lot-draw-title'>
          <div className='lot-wrap'>
            <LineHead
              letter='B'
              id='lot-draw-title'
              lead='The latest winning numbers right after each draw, current jackpots with the next draw dates, and every ticket you already checked.'
            >
              Draw night, in your pocket.
            </LineHead>

            <div className='lot-draw-grid'>
              <div className='lot-sign' data-reveal=''>
                <div className='lot-sign-band'>
                  <b>Jackpot tracker</b>
                  <span>Example from the app</span>
                </div>
                {BOARD.map(({ game, next }) => {
                  const draw = SAMPLE_DRAWS[game];
                  return (
                    <div key={game} className={`lot-sign-row lot-sign-${game}`}>
                      <h3>{GAMES[game].name}</h3>
                      <p className='lot-sign-next'>
                        Next drawing <b>{next}</b>
                      </p>
                      <p className='lot-sign-jackpot'>
                        <small>Est. jackpot</small>
                        <strong>{draw.jackpot}</strong>
                      </p>
                      <div className='lot-sign-balls'>
                        <small>Latest winning numbers</small>
                        {draw.numbers.map((n, k) => <Ball key={n} n={n} style={order(k)} />)}
                        <Ball n={draw.ball} special={game} style={order(5)} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div data-reveal='' style={delay(180)}>
                <div className='lot-receipt'>
                  <h3>Your checks</h3>
                  <p className='lot-receipt-sub'>Example history</p>
                  <ul>
                    {HISTORY.map((item) => (
                      <li key={`${item.game}-${item.detail}`}>
                        <span>
                          <b>{item.game}</b>
                          <small>{item.detail}</small>
                        </span>
                        <em className={item.win ? 'is-win' : undefined}>{item.result}</em>
                      </li>
                    ))}
                  </ul>
                  <p className='lot-receipt-more'>
                    Past drawings <ArrowRight size={16} aria-hidden='true' />
                  </p>
                  <Barcode serial={SERIAL} />
                </div>
              </div>
            </div>
          </div>

          <div className='lot-tape'>
            <ul aria-label='What the app does'>
              {[...FEATURES, ...FEATURES].map((item, i) => (
                <li key={`${item}-${i}`} aria-hidden={i >= FEATURES.length ? true : undefined}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- Line C: every ticket ---------- */}
        <section className='lot-section lot-uses' aria-labelledby='lot-uses-title'>
          <div className='lot-wrap'>
            <LineHead
              letter='C'
              id='lot-uses-title'
              lead='One in your wallet or a whole stack: scan them one after another, and every check stays in your history.'
            >
              Don’t leave a ticket unchecked.
            </LineHead>

            <div className='lot-press'>
              <article className='lot-press-lead' data-reveal=''>
                <Halftone src={photo(leadCase.photo, 1100, 825)} className={`lot-ht-${leadCase.photo}`} />
                <h3>{leadCase.title}</h3>
                <p>{leadCase.text}</p>
              </article>
              <div className='lot-press-list'>
                {moreCases.map((item, i) => (
                  <article key={item.title} className='lot-press-item' data-reveal='' style={delay(120 + i * 110)}>
                    <Halftone src={photo(item.photo, 360, 360)} className={`lot-ht-${item.photo}`} />
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Line D: screenshots on a ticket roll ---------- */}
        <section className='lot-section lot-shots' data-header='dark' aria-labelledby='lot-shots-title'>
          <div className='lot-wrap'>
            <LineHead letter='D' id='lot-shots-title' lead='Five screens from the App Store listing.'>
              The real app, screen by screen.
            </LineHead>
            <div className='lot-roll-reveal' data-reveal=''>
            <div className='lot-roll' tabIndex={0} aria-label='App screenshots'>
              {SCREENSHOTS.map((item, i) => (
                <figure key={item.url} className='lot-frame'>
                  <img src={item.url} alt={`${APP.name}: ${item.caption}`} loading='lazy' width={300} height={649} />
                  <figcaption>
                    <b>{pad(i + 1)}</b>
                    {item.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
            </div>
          </div>
        </section>

        {/* ---------- Line E: questions, printed as a rules sheet ---------- */}
        <section className='lot-section lot-faq' aria-labelledby='lot-faq-title'>
          <div className='lot-wrap'>
            <div className='lot-rules'>
              <LineHead letter='E' id='lot-faq-title'>
                Questions before your first scan.
              </LineHead>
              <ol className='lot-rules-list'>
                {FAQ.map((item, i) => (
                  <li key={item.question}>
                    <h3>
                      <span aria-hidden='true'>{i + 1}.</span>
                      {item.question}
                    </h3>
                    <p>{item.answer}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ---------- Final call: a scratch card ---------- */}
        <section className='lot-final' data-header='dark' aria-labelledby='lot-final-title'>
          <div className='lot-wrap'>
            <div className='lot-card-wrap' data-reveal=''>
              <div className='lot-card'>
                <div className='lot-card-top'>
                  <img src={APP.iconUrl} alt='' width={44} height={44} />
                  <span>
                    <strong>{APP.name}</strong>
                    <small>by {APP.developer}</small>
                  </span>
                  <i aria-hidden='true'>No. {SERIAL}</i>
                </div>
                <h2 id='lot-final-title' className='lot-card-title'>
                  Don’t toss it.
                  <br />
                  <span>Scan it.</span>
                </h2>
                <p className='lot-card-lead'>Every ticket checked against the draw before it ends up with the receipts.</p>
                <ScratchPanel className='lot-card-scratch'>
                  {price}
                  <Cta label='Check my tickets' onClick={onStart} />
                  <p className='lot-terms'>{terms.terms}</p>
                </ScratchPanel>
                <p className='lot-card-fine'>
                  The app checks numbers only. Winning tickets must be redeemed in the state or jurisdiction where they
                  were sold.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className='lot-footer' data-header='dark'>
        <div className='lot-wrap lot-footer-row'>
          <Barcode serial={SERIAL} />
          <p>
            {APP.altStoreName} ({APP.storeName} on the US App Store) is developed by {APP.legalName} The app checks
            numbers only; winning tickets must be redeemed in the state or jurisdiction where they were sold. Payment
            details are processed securely by our payment provider. Photos: Unsplash.
          </p>
          <nav aria-label='Legal'>
            <a href={APP.privacyUrl} target='_blank' rel='noopener noreferrer'>Privacy Policy</a>
            <a href={APP.termsUrl} target='_blank' rel='noopener noreferrer'>Terms of Use</a>
          </nav>
        </div>
      </footer>

      <div className={showDock ? 'lot-dock is-visible' : 'lot-dock'} aria-hidden={!showDock}>
        <img src={APP.iconUrl} alt='' width={44} height={44} />
        <span className='lot-dock-text'>
          <strong>{terms.today ?? terms.regular}</strong>
          <small>{terms.today ? `then ${terms.regular}` : 'cancel anytime'}</small>
        </span>
        <Cta label='Check tickets' short='Check' className='lot-dock-cta' onClick={onStart} tabIndex={showDock ? 0 : -1} />
      </div>
    </div>
  );
}
