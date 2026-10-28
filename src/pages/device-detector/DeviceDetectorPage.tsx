import '@fontsource-variable/martian-mono/standard.css';
import '@fontsource-variable/hanken-grotesk';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Aperture, BookOpen, Bluetooth, Check, Plus } from 'lucide-react';
import { useReveal } from '../../shared/motion';
import { ProgressiveBlur } from '../../shared/ProgressiveBlur';
import { describeOffer, initials, type LandingProps } from '../../shared/offer';
import { APP, FAQ, LIGHT_FILTERS, PLACES, ROUTINE, SCREENSHOTS, TOOLS, photo } from './content';
import { DialScale, RoomScope } from './RoomScope';
import './page.css';

/** Order of an element in an entrance sequence; the CSS turns it into a delay. */
const order = (i: number) => ({ '--i': i }) as CSSProperties;
const delay = (ms: number) => ({ '--reveal-delay': `${ms}ms` }) as CSSProperties;

export function DeviceDetectorPage({ offer, creator, onStart }: LandingProps) {
  const root = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);
  const heroCta = useRef<HTMLButtonElement>(null);
  const finale = useRef<HTMLElement>(null);
  const [showDock, setShowDock] = useState(false);
  const [headerStuck, setHeaderStuck] = useState(false);
  const [headerTone, setHeaderTone] = useState<'light' | 'dark'>('dark');
  const [checked, setChecked] = useState(false);
  const terms = describeOffer(offer);

  useReveal(root);

  useEffect(() => {
    // The tint shows once content scrolls under the header (the creator ribbon scrolls away first),
    // and turns dark with light text over sections marked data-header="dark". The status reads
    // "done" once the visitor reaches the checked room at the end.
    const onScroll = () => {
      const box = header.current?.getBoundingClientRect();
      if (!box) return;
      setHeaderStuck(window.scrollY > 4 && box.top <= 0);
      const under = document.elementFromPoint(window.innerWidth / 2, box.bottom + 1);
      setHeaderTone(under?.closest('[data-header="dark"]') ? 'dark' : 'light');
      const end = finale.current?.getBoundingClientRect();
      setChecked(Boolean(end && end.top < window.innerHeight * 0.55));
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

  return (
    <div className='dd' ref={root}>
      {creator && offer.discountPercent ? (
        <div className='dd-ribbon'>
          {creator.avatarUrl ? (
            <img src={creator.avatarUrl} alt='' className='dd-avatar' />
          ) : (
            <span className='dd-avatar' aria-hidden='true'>{initials(creator.name)}</span>
          )}
          <p>
            <strong>{creator.name}</strong> picked this app for you
          </p>
          <span className='dd-ribbon-deal'>−{offer.discountPercent}% today</span>
        </div>
      ) : null}

      <header ref={header} className='dd-header' data-stuck={headerStuck} data-tone={headerTone}>
        <div className='dd-header-backdrop' aria-hidden='true'>
          <ProgressiveBlur layers={6} maxBlur={18} />
          <div className='dd-header-tint dd-header-tint-light' />
          <div className='dd-header-tint dd-header-tint-dark' />
        </div>
        <div className='dd-wrap dd-header-row'>
          <a href='#top' className='dd-brand'>
            <img src={APP.iconUrl} alt='' width={32} height={32} />
            <span>{APP.name}</span>
          </a>
          <p className='dd-status' data-state={checked ? 'done' : 'ready'}>
            <i className='dd-led' aria-hidden='true' />
            <span className='dd-status-what'>Room check ·</span>
            <span>{checked ? 'done' : 'ready'}</span>
          </p>
          <button type='button' className='dd-key dd-key-small dd-header-key' onClick={onStart}>
            Check a room
          </button>
        </div>
      </header>

      <main id='top'>
        <section className='dd-hero' data-header='dark'>
          <div className='dd-wrap dd-hero-grid'>
            <div className='dd-hero-copy'>
              <h1 className='dd-h1'>
                <span style={order(0)}>Check</span>
                <span style={order(1)}>the room.</span>
                <span style={order(3)}>Then relax.</span>
              </h1>
              <p className='dd-lead dd-intro' style={order(4)}>
                See what’s on the room’s Wi-Fi and Bluetooth, then sweep for unusual signals with your phone’s own
                sensors. A quick look around, for peace of mind.
              </p>
              <div className='dd-offer dd-intro' style={order(5)}>
                <p className='dd-price'>
                  {terms.today ? (
                    <>
                      <strong>{terms.today}</strong> <s>{terms.regular}</s> <span>first payment</span>
                    </>
                  ) : (
                    <strong>{terms.regular}</strong>
                  )}
                </p>
                <button ref={heroCta} type='button' className='dd-key' onClick={onStart}>
                  Start my room check
                  <span className='dd-key-arrow' aria-hidden='true'>→</span>
                </button>
                <p className='dd-terms'>{terms.terms}</p>
              </div>
              <dl className='dd-spec dd-intro' style={order(6)}>
                <div>
                  <dt>hardware</dt>
                  <dd>nothing extra</dd>
                </div>
                <div>
                  <dt>setup</dt>
                  <dd>simple</dd>
                </div>
                <div>
                  <dt>guides</dt>
                  <dd>step by step</dd>
                </div>
              </dl>
            </div>

            <div className='dd-hero-stage'>
              <RoomScope />
            </div>
          </div>
        </section>

        <section className='dd-section dd-tools' data-header='dark' aria-labelledby='dd-tools-title'>
          <div className='dd-wrap'>
            <span className='dd-scale' aria-hidden='true' />
            <div className='dd-head' data-reveal=''>
              <h2 id='dd-tools-title' className='dd-h2'>
                <Channel no='01' name='Tools' />
                Four ways to look around.
                <br />
                One phone.
              </h2>
              <p className='dd-sub'>
                No gadgets to pack. Device Detector brings several ways of looking around into one simple tool on
                the phone you already carry.
              </p>
            </div>

            <div className='dd-rack'>
              <Module index={0}>
                <ul className='dd-wifi'>
                  {[
                    ['Router', 'known'],
                    ['My Phone', 'known'],
                    ['Unknown Device', 'unknown'],
                  ].map(([name, state]) => (
                    <li key={name} className={state === 'unknown' ? 'is-unknown' : undefined}>
                      <i className='dd-led' />
                      <span>{name}</span>
                      <small>{state}</small>
                    </li>
                  ))}
                </ul>
              </Module>

              <Module index={1}>
                <span className='dd-minirad'>
                  <i className='dd-minirad-ring' />
                  <i className='dd-minirad-ring' />
                  <i className='dd-minirad-ring' />
                  <i className='dd-minirad-sweep' />
                  <b style={{ left: '74%', top: '30%', '--ping': '520ms' } as CSSProperties} />
                  <b style={{ left: '66%', top: '76%', '--ping': '1520ms' } as CSSProperties} />
                  <b style={{ left: '22%', top: '58%', '--ping': '2900ms' } as CSSProperties} />
                  <span className='dd-minirad-core'>
                    <Bluetooth size={18} strokeWidth={2.4} />
                  </span>
                </span>
              </Module>

              <Module index={2}>
                <MagnetMeter />
              </Module>

              <Module index={3}>
                <LightFilter />
              </Module>
            </div>

            <p className='dd-aux' data-reveal=''>
              <span className='dd-aux-plate' aria-hidden='true'>
                <BookOpen size={16} strokeWidth={2.2} />
                AUX
              </span>
              <span>
                <strong>Guides &amp; Tips</strong> walk you through every tool step by step, so you know what to point
                your phone at.
              </span>
            </p>
          </div>
        </section>

        <section className='dd-section dd-routine' aria-labelledby='dd-routine-title'>
          <div className='dd-wrap dd-routine-grid'>
            <figure className='dd-routine-photo' data-reveal=''>
              <span className='dd-frame'>
                <img
                  src={photo('suitcase', 760, 900)}
                  alt='A traveler with a suitcase at the window of a hotel room'
                  loading='lazy'
                  width={760}
                  height={900}
                />
              </span>
              <figcaption className='dd-plate'>
                <i className='dd-led' aria-hidden='true' />
                Room checked<span className='dd-plate-more'> · time to unpack</span>
              </figcaption>
            </figure>

            <div className='dd-routine-copy'>
              <div className='dd-head' data-reveal=''>
                <h2 id='dd-routine-title' className='dd-h2'>
                  <Channel no='02' name='Routine' />
                  Your arrival{' '}
                  <br className='dd-br' />
                  routine.
                </h2>
                <p className='dd-sub'>The tools one after another, in the order that makes sense when you walk in.</p>
              </div>
              <ol className='dd-steps' data-reveal='' aria-label='Room check, step by step'>
                {ROUTINE.map((step, i) => (
                  <li key={step.title} style={order(i)}>
                    <span className='dd-step-mark' aria-hidden='true'>
                      <Check size={13} strokeWidth={3.2} />
                    </span>
                    <span className='dd-step-no'>{`0${i + 1}`}</span>
                    <span className='dd-step-text'>
                      <strong>{step.title}</strong>
                      <span>{step.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className='dd-section dd-screens' data-header='dark' aria-labelledby='dd-screens-title'>
          <div className='dd-wrap'>
            <div className='dd-head' data-reveal=''>
              <h2 id='dd-screens-title' className='dd-h2'>
                <Channel no='03' name='App' />
                Inside the app.
              </h2>
              <p className='dd-sub'>Scanner, Detector and Guides: three tabs, no complex setup.</p>
            </div>
          </div>
          <div className='dd-shots' tabIndex={0} aria-label='App screenshots'>
            {SCREENSHOTS.map((item, i) => (
              <figure key={item.url} className='dd-shot' data-reveal='' style={delay(i * 110)}>
                <span className='dd-shot-frame'>
                  <img src={item.url} alt={`${APP.name} screenshot: ${item.caption}`} loading='lazy' width={300} height={649} />
                </span>
                <figcaption>
                  <span>{`0${i + 1}`}</span>
                  {item.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className='dd-section dd-places' aria-labelledby='dd-places-title'>
          <div className='dd-wrap'>
            <div className='dd-head' data-reveal=''>
              <h2 id='dd-places-title' className='dd-h2'>
                <Channel no='04' name='Places' />
                Wherever you put{' '}
                <br className='dd-br' />
                your bag down.
              </h2>
              <p className='dd-sub'>
                Traveling, staying in a hotel, renting a car or just checking your home: take a quick look whenever a
                space is new to you.
              </p>
            </div>
          </div>
          <ul className='dd-places-row'>
            {PLACES.map((item, i) => (
              <li key={item.title} className='dd-place' data-reveal='' style={delay(i * 110)}>
                <span className='dd-frame dd-place-frame'>
                  <img src={photo(item.photo, 640, 800)} alt='' loading='lazy' width={640} height={800} />
                  <span className='dd-place-check' aria-hidden='true'>
                    <Check size={14} strokeWidth={3.2} />
                  </span>
                </span>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className='dd-section dd-faq' data-header='dark' aria-labelledby='dd-faq-title'>
          <div className='dd-wrap dd-faq-wrap'>
            <div className='dd-head' data-reveal=''>
              <h2 id='dd-faq-title' className='dd-h2'>
                <Channel no='05' name='Answers' />
                Good to know.
              </h2>
              <p className='dd-sub'>Straight answers, including what the app can’t do.</p>
            </div>
            <div className='dd-faq-list' data-reveal=''>
              {FAQ.map((item, i) => (
                <details key={item.question}>
                  <summary>
                    <span className='dd-faq-no'>{`05.${i + 1}`}</span>
                    <span className='dd-faq-q'>{item.question}</span>
                    <span className='dd-faq-key' aria-hidden='true'>
                      <Plus size={16} strokeWidth={2.4} />
                    </span>
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section ref={finale} className='dd-final' aria-labelledby='dd-final-title'>
          <div className='dd-wrap dd-final-grid'>
            <div className='dd-final-dial' data-reveal=''>
              <DialScale />
              <span className='dd-face'>
                <img src={photo('hotelRoom', 900, 900)} alt='The same hotel room, lamps on' loading='lazy' width={900} height={900} />
              </span>
              <span className='dd-final-badge' aria-hidden='true'>
                <Check size={16} strokeWidth={3} />
                checked
              </span>
            </div>
            <div className='dd-final-copy' data-reveal='' style={delay(160)}>
              <h2 id='dd-final-title' className='dd-h2 dd-final-title'>
                <Channel no='06' name='Done' />
                Checked.
                <br />
                Time to unpack.
              </h2>
              <p className='dd-final-lead'>A quick look around, wherever you stay.</p>
              <button type='button' className='dd-key' onClick={onStart}>
                Start my room check
                <span className='dd-key-arrow' aria-hidden='true'>→</span>
              </button>
              <p className='dd-terms'>{terms.terms}</p>
            </div>
          </div>
        </section>
      </main>

      <footer className='dd-footer' data-header='dark'>
        <div className='dd-wrap dd-footer-row'>
          <p>
            {APP.fullName} is developed by {APP.legalName}. The app provides scanning and analysis tools for your
            own awareness and cannot guarantee detection of every device. Payment details are processed securely by
            our payment provider. Photos: Unsplash.
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
      </footer>

      <div className={showDock ? 'dd-dock is-visible' : 'dd-dock'} aria-hidden={!showDock}>
        <img src={APP.iconUrl} alt='' width={40} height={40} />
        <span className='dd-dock-text'>
          <strong>{terms.today ?? terms.regular}</strong>
          <small>{terms.today ? `then ${terms.regular}` : 'cancel anytime'}</small>
        </span>
        <button type='button' className='dd-key dd-key-small' onClick={onStart} tabIndex={showDock ? 0 : -1}>
          Check a room
        </button>
      </div>
    </div>
  );
}

/** The section heading device: a channel readout run in before the heading, like an instrument display. */
function Channel({ no, name }: { no: string; name: string }) {
  return (
    <span className='dd-ch' aria-hidden='true'>
      <i className='dd-led' />
      <span className='dd-ch-no'>CH {no}</span>
      <span className='dd-ch-name'>{name}</span>
      <span className='dd-ch-bars'>
        <i />
        <i />
        <i />
        <i />
      </span>
    </span>
  );
}

/** One instrument in the rack: a faceplate with its channel, a display, a name and a line of text. */
function Module({ index, children }: { index: number; children: ReactNode }) {
  const tool = TOOLS[index];
  return (
    <article className='dd-mod' data-reveal='' style={delay(index * 90)}>
      <div className='dd-mod-plate'>
        <span className='dd-mod-no'>{`0${index + 1}`}</span>
        <span>{tool.short}</span>
        <i className='dd-led' aria-hidden='true' />
      </div>
      <div className={`dd-mod-screen dd-mod-${tool.id}`}>{children}</div>
      <h3>{tool.name}</h3>
      <p>{tool.text}</p>
    </article>
  );
}

/** Ticks of the magnetometer dial: a half circle, a tick every 9°, longer every 45°. */
const METER_TICKS = Array.from({ length: 21 }, (_, i) => {
  const angle = (-180 + i * 9) * (Math.PI / 180);
  const long = i % 5 === 0;
  const r1 = long ? 70 : 76;
  const r2 = 86;
  return {
    i,
    long,
    x1: 110 + Math.cos(angle) * r1,
    y1: 110 + Math.sin(angle) * r1,
    x2: 110 + Math.cos(angle) * r2,
    y2: 110 + Math.sin(angle) * r2,
  };
});

/** The app's own 66.67 µT reading; the needle swings in and settles. */
function MagnetMeter() {
  return (
    <div className='dd-meter'>
      <svg viewBox='0 0 220 124' aria-hidden='true'>
        <path className='dd-meter-arc' d='M 18 110 A 92 92 0 0 1 202 110' />
        {METER_TICKS.map((tick) => (
          <line key={tick.i} className={tick.long ? 'is-long' : undefined} x1={tick.x1} y1={tick.y1} x2={tick.x2} y2={tick.y2} />
        ))}
        <g className='dd-meter-needle' style={{ '--to': '30deg' } as CSSProperties}>
          <g className='dd-meter-tremble'>
            <line x1={110} y1={110} x2={110} y2={36} />
          </g>
        </g>
        <circle className='dd-meter-pivot' cx={110} cy={110} r={5} />
      </svg>
      <span className='dd-meter-value'>
        66.67<small>µT</small>
      </span>
    </div>
  );
}

/** The app's light filter, playable: tap a filter to look at the room through it. */
function LightFilter() {
  const [filter, setFilter] = useState<(typeof LIGHT_FILTERS)[number]['id']>('red');
  const color = LIGHT_FILTERS.find((item) => item.id === filter)?.color ?? '#ff2d4f';

  return (
    <div className='dd-light' style={{ '--filter': color } as CSSProperties}>
      <img src={photo('navyBedroom', 600, 520)} alt='' loading='lazy' width={600} height={520} />
      <span className='dd-light-tint' data-filter={filter} aria-hidden='true' />
      <span className='dd-light-hint'>Unusual reflections or light spots may indicate certain devices</span>
      <span className='dd-light-filters' role='group' aria-label='Light filter color'>
        {LIGHT_FILTERS.map((item) => (
          <button
            key={item.id}
            type='button'
            aria-label={item.label}
            aria-pressed={item.id === filter}
            style={{ color: item.color }}
            onClick={() => setFilter(item.id)}
          >
            <Aperture size={16} strokeWidth={2.25} />
          </button>
        ))}
      </span>
    </div>
  );
}
