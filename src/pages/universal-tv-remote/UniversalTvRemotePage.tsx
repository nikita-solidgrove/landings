import '@fontsource-variable/red-hat-display';
import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { House, Info, LayoutGrid, Minus, Pause, Plus, Power, Search, Star, Tv, Volume2, Wifi } from 'lucide-react';
import { prefersReducedMotion, useReveal } from '../../shared/motion';
import { ProgressiveBlur } from '../../shared/ProgressiveBlur';
import { describeOffer, initials, type LandingProps } from '../../shared/offer';
import { APP, BRANDS, FAQ, RATING, SCREENSHOTS, STEPS, SYSTEMS, USE_CASES, photo } from './content';
import { RemoteDemo } from './RemoteDemo';
import './page.css';

/** Order of an element in an entrance sequence; the CSS turns it into a delay. */
const order = (i: number) => ({ '--i': i }) as CSSProperties;
const delay = (ms: number) => ({ '--reveal-delay': `${ms}ms` }) as CSSProperties;
const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(' ');
/** Keeps "Wi-Fi" and "smart TV" from breaking across lines (a word joiner after the hyphen). */
const keep = (text: string) => text.replaceAll('Wi-Fi', 'Wi-\u2060Fi').replaceAll('smart TV', 'smart\u00a0TV');

type Terms = ReturnType<typeof describeOffer>;

export function UniversalTvRemotePage({ offer, creator, onStart }: LandingProps) {
  const root = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);
  const heroCta = useRef<HTMLButtonElement>(null);
  const powerCta = useRef<HTMLButtonElement>(null);
  const [showDock, setShowDock] = useState(false);
  const [headerStuck, setHeaderStuck] = useState(false);
  const [headerTone, setHeaderTone] = useState<'light' | 'dark'>('light');
  const terms = describeOffer(offer);

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
    const hero = heroCta.current;
    const power = powerCta.current;
    if (!hero || !power) return;
    // Only once the visitor has scrolled past the hero button, not while it is still below the fold,
    // and out of the way while the big power button at the end is on screen.
    const state = { pastHero: false, atPower: false };
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero) state.pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        else state.atPower = entry.isIntersecting;
      }
      setShowDock(state.pastHero && !state.atPower);
    });
    observer.observe(hero);
    observer.observe(power);
    return () => observer.disconnect();
  }, []);

  return (
    <div className='tvr' ref={root}>
      {creator && offer.discountPercent ? (
        <div className='tvr-ribbon'>
          {creator.avatarUrl ? (
            <img src={creator.avatarUrl} alt='' className='tvr-avatar' />
          ) : (
            <span className='tvr-avatar' aria-hidden='true'>{initials(creator.name)}</span>
          )}
          <p>
            <strong>{creator.name}</strong> picked this app for you
          </p>
          <span className='tvr-ribbon-deal'>−{offer.discountPercent}% today</span>
        </div>
      ) : null}

      <header ref={header} className='tvr-header' data-stuck={headerStuck} data-tone={headerTone}>
        <div className='tvr-header-backdrop' aria-hidden='true'>
          <ProgressiveBlur layers={6} maxBlur={18} />
          <div className='tvr-header-tint tvr-header-tint-light' />
          <div className='tvr-header-tint tvr-header-tint-dark' />
        </div>
        <div className='tvr-wrap tvr-header-row'>
          <a href='#top' className='tvr-identity'>
            <img src={APP.iconUrl} alt='' width={38} height={38} />
            <span>
              <strong>{APP.shortName}</strong>
              <span className='tvr-print'>by {APP.developer}</span>
            </span>
          </a>
          <button type='button' className='tvr-header-cta' onClick={onStart} aria-label='Get the app'>
            <i className='tvr-header-led' aria-hidden='true' />
            <span className='tvr-print' aria-hidden='true'>Get the app</span>
            <span className='tvr-header-key' aria-hidden='true'>
              <Power />
            </span>
          </button>
        </div>
      </header>

      <main id='top'>
        <section className='tvr-hero' aria-labelledby='tvr-hero-title'>
          <div className='tvr-wrap tvr-hero-head'>
            <h1 id='tvr-hero-title' className='tvr-h1'>
              <span style={order(0)}>Lost the remote?</span>
              <span style={order(1)}>Use your phone.</span>
            </h1>
            <p className='tvr-lead tvr-intro' style={order(3)}>
              {keep('Your iPhone or iPad becomes the remote for your smart TV. Volume, channels, search and pause, all over Wi-Fi.')}
            </p>
            <div className='tvr-buy tvr-intro' style={order(4)}>
              <PriceLine terms={terms} />
              <button ref={heroCta} type='button' className='tvr-btn' onClick={onStart}>
                <span className='tvr-btn-glyph' aria-hidden='true'>
                  <Power />
                </span>
                Turn my phone into a remote
              </button>
              <p className='tvr-terms'>{terms.terms}</p>
            </div>
            <ul className='tvr-proof tvr-intro' style={order(5)}>
              <li>
                <Star className='tvr-star' aria-hidden='true' />
                {RATING.value} on the App Store
              </li>
              <li>
                <Tv aria-hidden='true' />
                100+ TV brands
              </li>
              <li>
                <Wifi aria-hidden='true' />
                Works over Wi-Fi
              </li>
            </ul>
          </div>

          <div className='tvr-wrap tvr-stage'>
            <RemoteDemo>
              <p className='tvr-print'>Works with</p>
              <ul className='tvr-compat-brands' aria-label='TV brands named in the App Store listing'>
                {BRANDS.map((brand) => (
                  <li key={brand}>{brand}</li>
                ))}
                <li className='tvr-compat-more'>and more</li>
              </ul>
              <p className='tvr-compat-systems'>
                <strong>Smart TV systems</strong>
                {SYSTEMS.join(' · ')} and more
              </p>
            </RemoteDemo>
          </div>
        </section>

        <section className='tvr-section tvr-setup' aria-labelledby='tvr-setup-title'>
          <div className='tvr-wrap'>
            <Head
              id='tvr-setup-title'
              legend='Pair · Wi-Fi'
              glyph={<Wifi />}
              lead={keep(`No pointing at the TV. The app looks for smart TVs on your Wi-Fi: ${SYSTEMS.join(', ')} and more.`)}
            >
              It finds your TV by itself.
            </Head>
            <SetupPanel />
          </div>
        </section>

        <section className='tvr-section tvr-controls tvr-dark' data-header='dark' aria-labelledby='tvr-controls-title'>
          <div className='tvr-wrap'>
            <Head
              id='tvr-controls-title'
              legend='Vol · Ch'
              glyph='±'
              lead='Volume, channels, menus, search and play/pause, on big buttons that are easy to hit in the dark.'
            >
              Every button you reach for. Plus a keyboard.
            </Head>

            <div className='tvr-ctrl-grid'>
              <article className='tvr-ctrl' data-reveal=''>
                <div className='tvr-ctrl-well'>
                  <VolumeMock />
                </div>
                <p className='tvr-print'>Rockers · Mute</p>
                <h3>Volume and channels</h3>
                <p>Turn it up, flip channels, mute in one tap. Try the rockers.</p>
              </article>
              <article className='tvr-ctrl' data-reveal='' style={delay(90)}>
                <div className='tvr-ctrl-well'>
                  <KeyboardMock text='sunset coast' />
                </div>
                <p className='tvr-print'>Keyboard</p>
                <h3>Keyboard search</h3>
                <p>Type the title on your phone instead of pecking letters with arrow keys.</p>
              </article>
              <article className='tvr-ctrl' data-reveal='' style={delay(180)}>
                <div className='tvr-ctrl-well'>
                  <div className='tvr-nav' aria-hidden='true'>
                    <span className='tvr-nav-ring'>
                      <i />
                      <i />
                      <i />
                      <i />
                      <b>OK</b>
                    </span>
                    <span className='tvr-nav-keys'>
                      <span className='tvr-mini-key'>
                        <House />
                      </span>
                      <span className='tvr-mini-key tvr-mini-play'>
                        <Pause fill='currentColor' strokeWidth={0} />
                      </span>
                    </span>
                  </div>
                </div>
                <p className='tvr-print'>Arrows · OK · Home</p>
                <h3>Menus, play and pause</h3>
                <p>Arrows, OK, Home and Back for every menu. Pause without getting up.</p>
              </article>
              <article className='tvr-ctrl' data-reveal='' style={delay(270)}>
                <div className='tvr-ctrl-well'>
                  <div className='tvr-padmock' aria-hidden='true'>
                    <span className='tvr-padmock-touch'>
                      <i />
                    </span>
                    <span className='tvr-padmock-keys'>
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                        <b key={digit}>{digit}</b>
                      ))}
                    </span>
                  </div>
                </div>
                <p className='tvr-print'>Touchpad · 123</p>
                <h3>Touchpad and keypad</h3>
                <p>Swipe around the screen, or punch in a channel number.</p>
              </article>
            </div>
          </div>
        </section>

        <section className='tvr-section tvr-uses' aria-labelledby='tvr-uses-title'>
          <div className='tvr-wrap'>
            <Head
              id='tvr-uses-title'
              legend='Home'
              glyph={<House />}
              lead='Wherever the remote went, the phone in your pocket takes over.'
            >
              For every night in.
            </Head>
            <ul className='tvr-uses-row'>
              {USE_CASES.map((item, i) => (
                <li key={item.title} className='tvr-use' data-reveal='' style={delay(i * 90)}>
                  <span className='tvr-use-media'>
                    <img src={photo(item.photo, 640, 853)} alt='' loading='lazy' />
                    <MomentOverlay kind={item.overlay} />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className='tvr-section tvr-screens' aria-labelledby='tvr-screens-title'>
          <div className='tvr-wrap'>
            <Head
              center
              id='tvr-screens-title'
              legend='Menu'
              glyph={<LayoutGrid />}
              lead='Remote, touchpad, keyboard and keypad, one tab away from each other.'
            >
              Big buttons. Dark screen. Easy at night.
            </Head>
            <ul className='tvr-shots' aria-label='App screenshots'>
              {SCREENSHOTS.map((shot, i) => (
                <li key={shot.url} className='tvr-shot' data-reveal='' style={delay(i * 80)}>
                  <figure>
                    <img src={shot.url} alt={`${APP.name}: ${shot.alt}`} loading='lazy' width={600} height={1298} />
                    <figcaption className='tvr-print'>{shot.legend}</figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className='tvr-section tvr-faq-section' aria-labelledby='tvr-faq-title'>
          <div className='tvr-wrap'>
            <Head id='tvr-faq-title' legend='Info' glyph={<Info />} lead='Press a key to read the answer.'>
              Before you get comfy.
            </Head>
            <FaqPad onStart={onStart} />
          </div>
        </section>

        <section className='tvr-final tvr-dark' data-header='dark' aria-labelledby='tvr-final-title'>
          <div className='tvr-wrap tvr-final-inner' data-reveal=''>
            <h2 id='tvr-final-title' className='tvr-final-title'>
              Your remote is already in your pocket.
            </h2>
            <p className='tvr-final-lead'>Set it up tonight, before the movie starts.</p>
            <div className='tvr-power-unit'>
              <i className='tvr-power-led' aria-hidden='true' />
              <span className='tvr-power-well'>
                <button ref={powerCta} type='button' className='tvr-power' onClick={onStart}>
                  <Power aria-hidden='true' />
                  Get the remote
                </button>
              </span>
              <span className='tvr-print' aria-hidden='true'>Power</span>
            </div>
            <PriceLine terms={terms} />
            <p className='tvr-terms'>{terms.terms}</p>
          </div>
        </section>
      </main>

      <footer className='tvr-footer tvr-dark' data-header='dark'>
        <div className='tvr-wrap'>
          <div className='tvr-plate'>
            <span className='tvr-plate-mark'>
              <img src={APP.iconUrl} alt='' width={36} height={36} />
              <span>
                {APP.shortName}
                <span className='tvr-print'>iPhone · iPad · iOS 15.0+</span>
              </span>
            </span>
            <p>
              {APP.name} is developed by {APP.legalName} It is not an official product of {BRANDS.join(', ')}; brand
              names only describe compatibility. Payment details are processed securely by our payment provider.
              Photos: Unsplash.
            </p>
            <nav aria-label='Legal'>
              <a href={APP.privacyUrl} target='_blank' rel='noopener noreferrer'>
                Privacy Policy
              </a>
              <a href={APP.termsUrl} target='_blank' rel='noopener noreferrer'>
                Terms of Use
              </a>
            </nav>
          </div>
        </div>
      </footer>

      <div className={showDock ? 'tvr-dock is-visible' : 'tvr-dock'} aria-hidden={!showDock}>
        <span className='tvr-dock-lcd'>
          <img src={APP.iconUrl} alt='' width={38} height={38} />
          <span className='tvr-dock-text'>
            <strong>{terms.today ?? terms.regular}</strong>
            <small>{terms.today ? `then ${terms.regular}` : 'Cancel anytime'}</small>
          </span>
        </span>
        <button type='button' className='tvr-btn' onClick={onStart} tabIndex={showDock ? 0 : -1}>
          Get the remote
        </button>
      </div>
    </div>
  );
}

function PriceLine({ terms }: { terms: Terms }) {
  return (
    <p className='tvr-price'>
      <strong>{terms.today ?? terms.regular}</strong>
      {terms.today ? (
        <>
          <s>{terms.regular}</s> <span>first payment</span>
        </>
      ) : null}
    </p>
  );
}

/** The heading device: a small key with its printed legend, then a plain heading. */
function Head({
  id,
  legend,
  glyph,
  lead,
  center,
  children,
}: {
  center?: boolean;
  id: string;
  legend: string;
  glyph: ReactNode;
  lead?: string;
  children: ReactNode;
}) {
  return (
    <div className={cx('tvr-head', center && 'tvr-head-center')} data-reveal=''>
      <p className='tvr-legend' aria-hidden='true'>
        <span className='tvr-legend-key'>{glyph}</span>
        <span className='tvr-print'>{legend}</span>
      </p>
      <h2 id={id} className='tvr-h2'>
        {children}
      </h2>
      {lead ? <p className='tvr-head-lead'>{lead}</p> : null}
    </div>
  );
}

/** The listing's three steps as keys whose LEDs light in turn, then the TV is found. */
function SetupPanel() {
  const ref = useRef<HTMLDivElement>(null);
  const done = STEPS.length + 1;
  const [lit, setLit] = useState(() => (prefersReducedMotion() ? done : 0));
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = ref.current;
    if (!target || prefersReducedMotion()) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.3 });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    // One step lights every second; the connection holds for a while, then it starts over.
    const timer = window.setTimeout(() => setLit(lit >= done ? 0 : lit + 1), lit >= done ? 3600 : lit ? 1100 : 600);
    return () => window.clearTimeout(timer);
  }, [visible, lit, done]);

  const connected = lit >= done;
  return (
    <div className='tvr-pair' ref={ref} data-reveal=''>
      <ol className='tvr-pair-steps'>
        {STEPS.map((step, i) => (
          <li key={step.title} className={cx('tvr-pair-key', lit > i && 'is-lit')}>
            <span className='tvr-pair-top' aria-hidden='true'>
              <b>{i + 1}</b>
              <i className='tvr-led' />
            </span>
            <h3>{keep(step.title)}</h3>
            <p>{keep(step.text)}</p>
          </li>
        ))}
      </ol>
      <div className='tvr-pair-scan' data-connected={connected} aria-hidden='true'>
        <span className='tvr-print'>Example</span>
        <span className='tvr-grille'>
          <i className='tvr-grille-sweep' />
          <span className='tvr-grille-core'>
            <Tv />
          </span>
        </span>
        <p className='tvr-pair-status'>
          {connected ? (
            <>
              <i className='tvr-led is-on' />
              Samsung TV · Connected
            </>
          ) : (
            'Searching for TV…'
          )}
        </p>
        <p className='tvr-pair-note'>{keep('Make sure your phone and TV are on the same Wi-Fi network')}</p>
      </div>
    </div>
  );
}

/** Two working rockers: volume fills the meter, channel changes the display. */
function VolumeMock() {
  const [level, setLevel] = useState(6);
  const [channel, setChannel] = useState(4);
  return (
    <div className='tvr-vol'>
      <Rocker name='Volume' label='VOL' onUp={() => setLevel((v) => Math.min(10, v + 1))} onDown={() => setLevel((v) => Math.max(0, v - 1))} />
      <div className='tvr-vol-readout'>
        <span className='tvr-meter' aria-hidden='true'>
          {Array.from({ length: 10 }, (_, i) => (
            <i key={i} data-on={i < level} />
          ))}
        </span>
        <span className='tvr-lcd' aria-hidden='true'>
          <small>CH</small>
          {String(channel).padStart(2, '0')}
        </span>
        <span className='tvr-sr' aria-live='polite'>
          Example: volume {level} of 10, channel {channel}
        </span>
      </div>
      <Rocker name='Channel' label='CH' onUp={() => setChannel((c) => (c >= 99 ? 1 : c + 1))} onDown={() => setChannel((c) => (c <= 1 ? 99 : c - 1))} />
    </div>
  );
}

function Rocker({ name, label, onUp, onDown }: { name: string; label: string; onUp: () => void; onDown: () => void }) {
  return (
    <span className='tvr-rock'>
      <button type='button' aria-label={`${name} up`} onClick={onUp}>
        <Plus />
      </button>
      <span className='tvr-rock-label' aria-hidden='true'>
        {label}
      </span>
      <button type='button' aria-label={`${name} down`} onClick={onDown}>
        <Minus />
      </button>
    </span>
  );
}

/** A phone search field mirrored on the TV, typing on a loop. */
function KeyboardMock({ text }: { text: string }) {
  const [typed, setTyped] = useState(() => (prefersReducedMotion() ? text.length : 0));

  useEffect(() => {
    if (prefersReducedMotion()) return;
    // Types the text, holds it for a moment, then starts over.
    const timer = window.setTimeout(() => setTyped(typed >= text.length + 10 ? 0 : typed + 1), typed ? 130 : 700);
    return () => window.clearTimeout(timer);
  }, [typed, text]);

  const shown = text.slice(0, typed);
  return (
    <div className='tvr-type' aria-hidden='true'>
      <span className='tvr-print'>On your phone</span>
      <span className='tvr-type-field tvr-type-phone'>
        {shown}
        <i className='tvr-type-caret' />
      </span>
      <span className='tvr-print'>On your TV</span>
      <span className='tvr-type-field tvr-type-tv'>
        <Search />
        {shown || <span className='tvr-type-hint'>Search</span>}
      </span>
    </div>
  );
}

/** The on-screen moment each use-case photo stands for, drawn like the TV or app would show it. */
function MomentOverlay({ kind }: { kind: (typeof USE_CASES)[number]['overlay'] }) {
  if (kind === 'connected') {
    return (
      <span className='tvr-moment-osd tvr-moment-chip' aria-hidden='true'>
        <img src={APP.iconUrl} alt='' />
        <span>
          <strong>Samsung TV</strong>
          <small>
            <i /> Connected
          </small>
        </span>
      </span>
    );
  }
  if (kind === 'paused') {
    return (
      <span className='tvr-moment-osd tvr-moment-pause' aria-hidden='true'>
        <Pause size={26} fill='currentColor' strokeWidth={0} />
      </span>
    );
  }
  if (kind === 'volume') {
    return (
      <span className='tvr-moment-osd tvr-moment-volume' aria-hidden='true'>
        <Volume2 size={18} />
        <span className='tvr-moment-bar'>
          <i />
        </span>
        <b>48</b>
      </span>
    );
  }
  return (
    <span className='tvr-moment-osd tvr-moment-chip' aria-hidden='true'>
      <span className='tvr-moment-scan'>
        <Tv />
      </span>
      <span>
        <strong>LG TV found</strong>
        <small>Same Wi-Fi network</small>
      </span>
    </span>
  );
}

/**
 * The FAQ as a keypad: nine question keys in a 3 × 3 grid, the pressed one stays down and its answer
 * shows on the display beside it. On phones the keys stack and the answer opens under its key.
 */
function FaqPad({ onStart }: { onStart: () => void }) {
  const [open, setOpen] = useState(0);

  const press = (i: number) => {
    const stacked = window.matchMedia('(max-width: 640px)').matches;
    setOpen(open === i && stacked ? -1 : i);
  };

  return (
    <div className='tvr-faq' data-reveal=''>
      {FAQ.map((item, i) => (
        <Fragment key={item.question}>
          <button
            type='button'
            id={`tvr-faq-q-${i}`}
            className='tvr-faq-key'
            aria-expanded={open === i}
            aria-controls={`tvr-faq-a-${i}`}
            onClick={() => press(i)}
            style={{ '--r': Math.floor(i / 3) + 1, '--c': (i % 3) + 1 } as CSSProperties}
          >
            <span className='tvr-faq-top' aria-hidden='true'>
              <b>{i + 1}</b>
              <i className='tvr-led' />
            </span>
            <span className='tvr-faq-q'>{item.question}</span>
          </button>
          <div
            id={`tvr-faq-a-${i}`}
            role='region'
            aria-labelledby={`tvr-faq-q-${i}`}
            className='tvr-faq-a'
            data-open={open === i}
          >
            <span className='tvr-print' aria-hidden='true'>
              <i className='tvr-led is-on' />
              Answer {i + 1} of {FAQ.length}
            </span>
            <h3 key={`q${open}`} aria-hidden='true'>
              {item.question}
            </h3>
            <p key={`a${open}`}>{keep(item.answer)}</p>
            <div className='tvr-faq-cta'>
              <button type='button' className='tvr-btn' onClick={onStart}>
                <span className='tvr-btn-glyph' aria-hidden='true'>
                  <Power />
                </span>
                Get the remote
              </button>
            </div>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
