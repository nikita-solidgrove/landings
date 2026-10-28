import '@fontsource-variable/bricolage-grotesque/standard.css';
import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowRight, BookOpen, Check, HeartPulse, Map, ShieldCheck, StickyNote } from 'lucide-react';
import { Tilt, prefersReducedMotion, useReveal } from '../../shared/motion';
import { ProgressiveBlur } from '../../shared/ProgressiveBlur';
import { describeOffer, initials, type LandingProps } from '../../shared/offer';
import { APP, DAY_LABELS, DURATIONS, FAQ, MOMENTS, PRESETS, SCREENSHOTS, STEPS, clock, photo, range } from './content';
import { DayDial } from './DayDial';
import { arcPath, dayClock, hhmm, polar, toMinutes, turnOf, useDayClock } from './dial';
import { FocusDemo } from './FocusDemo';
import { ScheduleDial } from './ScheduleDial';
import './page.css';

/** Order of an element in an entrance sequence; the CSS turns it into a delay. */
const order = (i: number) => ({ '--i': i }) as CSSProperties;
const delay = (ms: number) => ({ '--reveal-delay': `${ms}ms` }) as CSSProperties;

const presetById = (id: string) => PRESETS.find((p) => p.id === id)!;

// The allowlist example from the app's own screenshot.
const ALLOWED = [
  { name: 'Health', icon: HeartPulse, color: '#e8365a' },
  { name: 'Maps', icon: Map, color: '#2f74e0' },
  { name: 'Notes', icon: StickyNote, color: '#c98a00' },
  { name: 'Books', icon: BookOpen, color: '#e8701a' },
];

export function LuviaPage({ offer, creator, onStart }: LandingProps) {
  const root = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);
  const heroCta = useRef<HTMLButtonElement>(null);
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
      // The dock appears once the hero button has scrolled out above the viewport.
      const cta = heroCta.current?.getBoundingClientRect();
      setShowDock(!!cta && cta.top < 0 && cta.bottom < 0);
      const under = document.elementFromPoint(window.innerWidth / 2, box.bottom + 1);
      setHeaderTone(under?.closest('[data-header="dark"]') ? 'dark' : 'light');
      // The tint takes the color of the hour you are in.
      const sky = under?.closest<HTMLElement>('section, footer');
      if (sky) header.current?.style.setProperty('--lv-tint', getComputedStyle(sky).backgroundColor);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    // The page is one day: each section carries its time, and scrolling moves the clock between them.
    const page = root.current;
    if (!page) return;
    const stepwise = prefersReducedMotion();
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.45;
      const anchors = Array.from(page.querySelectorAll<HTMLElement>('[data-time]'), (node, i) => ({
        at: i === 0 ? line : node.getBoundingClientRect().top + window.scrollY,
        minute: toMinutes(node.dataset.time ?? '06:00'),
      }));
      const y = window.scrollY + line;
      let minute = anchors[0]?.minute ?? 360;
      for (let i = 0; i < anchors.length; i++) {
        const a = anchors[i];
        const b = anchors[i + 1];
        if (y < a.at) break;
        minute = a.minute;
        if (b && y < b.at && !stepwise) {
          minute = a.minute + ((b.minute - a.minute) * (y - a.at)) / (b.at - a.at);
          break;
        }
      }
      dayClock.set(Math.round(minute));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return (
    <div className='lv' ref={root}>
      {creator && offer.discountPercent ? (
        <div className='lv-ribbon'>
          {creator.avatarUrl ? (
            <img src={creator.avatarUrl} alt='' className='lv-avatar' />
          ) : (
            <span className='lv-avatar' aria-hidden='true'>
              {initials(creator.name)}
            </span>
          )}
          <p>
            <strong>{creator.name}</strong> picked this app for you
          </p>
          <span className='lv-ribbon-deal'>−{offer.discountPercent}% today</span>
        </div>
      ) : null}

      <header ref={header} className='lv-header' data-stuck={headerStuck} data-tone={headerTone}>
        <div className='lv-header-backdrop' aria-hidden='true'>
          <ProgressiveBlur layers={6} maxBlur={18} />
          <div className='lv-header-tint lv-header-tint-light' />
          <div className='lv-header-tint lv-header-tint-dark' />
        </div>
        <div className='lv-wrap lv-header-row'>
          <HeaderClock />
          <a href='#top' className='lv-brand' aria-label={`${APP.name}, ${APP.subtitle}`}>
            <img src={APP.iconUrl} alt='' width={30} height={30} />
            <span>luvia</span>
          </a>
          <button type='button' className='lv-header-cta' onClick={onStart}>
            Get Luvia
          </button>
        </div>
      </header>

      <main id='top'>
        <section className='lv-hero' data-time='06:00' aria-labelledby='lv-hero-title'>
          <div className='lv-wrap lv-center'>
            <h1 id='lv-hero-title' className='lv-display'>
              {['take', 'your', 'time', 'back.'].map((word, i) => (
                <Fragment key={word}>
                  {i ? ' ' : null}
                  <span className='lv-word' style={order(i)}>
                    {word}
                  </span>
                </Fragment>
              ))}
            </h1>
            <p className='lv-lead lv-intro' style={order(4)}>
              Luvia blocks the apps pulling you away from what matters: automatically on your schedule, or the second
              you need to focus.
            </p>

            <HeroDial>
              <Tilt className='lv-hero-phone' max={4}>
                <FocusDemo />
              </Tilt>
            </HeroDial>
            <p className='lv-example lv-intro' style={order(6)}>
              Example: a 25-minute Quick Focus session
            </p>

            <div className='lv-offer lv-intro' style={order(7)}>
              <p className='lv-price'>
                {terms.today ? (
                  <>
                    <strong>{terms.today}</strong> today <s>{terms.regular}</s>
                  </>
                ) : (
                  <strong>{terms.regular}</strong>
                )}
              </p>
              <button ref={heroCta} type='button' className='lv-cta' onClick={onStart}>
                Take my time back
                <span className='lv-cta-knob' aria-hidden='true'>
                  <ArrowRight size={20} strokeWidth={2.4} />
                </span>
              </button>
              <p className='lv-terms'>{terms.terms}</p>
            </div>
            <ul className='lv-proof lv-intro' style={order(8)}>
              <li>Built on Apple’s Screen Time API</li>
              <li>Blocking runs on your device</li>
              <li>Works even when the app is closed</li>
            </ul>
          </div>
        </section>

        <section className='lv-sec lv-sec-morning' data-time='07:00' aria-labelledby='lv-morning-title'>
          <div className='lv-wrap lv-center'>
            <Heading id='lv-morning-title' time='07:00'>
              morning, before the scroll
            </Heading>
            <p className='lv-sub' data-reveal='' style={delay(100)}>
              Morning window keeps the apps you pick locked from 7 to 9 AM by default. Coffee and a chapter come before
              the first notification.
            </p>
            <Moment index={0} shape='circle' />
          </div>
        </section>

        <Steps />

        <section className='lv-sec lv-sec-focus' data-time='09:00' aria-labelledby='lv-focus-title'>
          <div className='lv-wrap lv-center'>
            <Heading id='lv-focus-title' time='09:00'>
              deep work, in one tap
            </Heading>
            <p className='lv-sub' data-reveal='' style={delay(100)}>
              Need to focus right now? Pick a duration and your distracting apps are blocked instantly.
            </p>
            <div className='lv-focus'>
              <figure className='lv-arch is-before' data-reveal='' style={delay(200)}>
                <span className='lv-arch-photo'>
                  <img src={photo('phoneHand', 520, 680)} alt='A hand holding a phone, mid-scroll' loading='lazy' />
                </span>
                <figcaption>the quick check</figcaption>
              </figure>
              <QuickFocus />
              <figure className='lv-arch is-after' data-reveal='' style={delay(300)}>
                <span className='lv-arch-photo'>
                  <img src={photo('deskFocus', 520, 680)} alt='Someone focused at a desk' loading='lazy' />
                </span>
                <figcaption>the hours that matter</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <Rules />

        <section className='lv-sec lv-sec-dinner' data-time='18:00' aria-labelledby='lv-dinner-title'>
          <div className='lv-wrap lv-center'>
            <Heading id='lv-dinner-title' time='18:00'>
              dinner, phones down
            </Heading>
            <p className='lv-sub' data-reveal='' style={delay(100)}>
              Dinner table locks the apps you pick from 6 to 8 PM by default. Talk to the people right in front of you.
            </p>
            <Moment index={1} shape='arch' />
          </div>
        </section>

        <section className='lv-sec lv-sec-plan' data-time='20:00' data-header='dark' aria-labelledby='lv-plan-title'>
          <div className='lv-wrap lv-center'>
            <Heading id='lv-plan-title' time='20:00'>
              set it once. luvia does the rest.
            </Heading>
            <p className='lv-sub' data-reveal='' style={delay(100)}>
              Choose the days and the time window. Luvia blocks the apps on schedule, even when the app is closed. No
              willpower required.
            </p>
            <div className='lv-plan' data-reveal='' style={delay(200)}>
              <ScheduleDial />
            </div>
          </div>
        </section>

        <Score />

        <Screens />

        <section className='lv-sec lv-sec-faq' data-time='22:00' data-header='dark' aria-labelledby='lv-faq-title'>
          <div className='lv-wrap lv-center'>
            <Heading id='lv-faq-title' time='22:00'>
              a few answers<br className='lv-br' /> before bed
            </Heading>
            <div className='lv-faq' data-reveal='' style={delay(120)}>
              {FAQ.map((item, i) => (
                <details key={item.question} open={i === 0}>
                  <summary>
                    <span className='lv-faq-q'>{item.question}</span>
                    <span className='lv-faq-icon' aria-hidden='true' />
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className='lv-final' data-time='22:30' data-header='dark' aria-labelledby='lv-final-title'>
          <Stars />
          <div className='lv-wrap lv-center'>
            <div data-reveal=''>
              <FinalDial />
            </div>
            <h2 id='lv-final-title' className='lv-final-line' data-reveal='' style={delay(120)}>
              your time back starts tonight.
            </h2>
            <div className='lv-final-offer' data-reveal='' style={delay(220)}>
              <button type='button' className='lv-cta lv-cta-night' onClick={onStart}>
                Take my time back
                <span className='lv-cta-knob' aria-hidden='true'>
                  <ArrowRight size={20} strokeWidth={2.4} />
                </span>
              </button>
              <p className='lv-terms'>{terms.terms}</p>
            </div>
          </div>
        </section>
      </main>

      <footer className='lv-footer' data-header='dark'>
        <div className='lv-wrap lv-footer-inner'>
          <span className='lv-footer-brand'>
            <img src={APP.iconUrl} alt='' width={28} height={28} />
            luvia
          </span>
          <p>
            {APP.storeName} is developed by {APP.legalName} It uses Apple’s Screen Time API and is not made by Apple.
            Payment details are processed securely by our payment provider. Photos: Unsplash.
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

      <div className={showDock ? 'lv-dock is-visible' : 'lv-dock'} aria-hidden={!showDock}>
        <img src={APP.iconUrl} alt='' width={40} height={40} />
        <span className='lv-dock-text'>
          <strong>{terms.today ?? terms.regular}</strong>
          <small>{terms.today ? `today, then ${terms.regular}` : 'cancel anytime'}</small>
        </span>
        <button type='button' className='lv-dock-cta' onClick={onStart} tabIndex={showDock ? 0 : -1}>
          Get Luvia
        </button>
      </div>
    </div>
  );
}

/** A section heading: the time of day, then a plain lowercase line. */
function Heading({ id, time, children }: { id: string; time: string; children: ReactNode }) {
  return (
    <h2 id={id} className='lv-h' data-reveal=''>
      <span className='lv-h-time'>{time}</span>
      <span className='lv-h-dot' aria-hidden='true'>
        {' · '}
      </span>
      {children}
    </h2>
  );
}

/** The page clock in the header: a tiny dial and the time of the section you are in. */
function HeaderClock() {
  const minute = useDayClock();
  return (
    <span className='lv-hclock' aria-hidden='true'>
      <span className='lv-hclock-face'>
        <span className='lv-hclock-hand' style={{ transform: `rotate(${turnOf(minute).toFixed(1)}deg)` }} />
      </span>
      <span className='lv-hclock-time'>{hhmm(minute)}</span>
    </span>
  );
}

/** Hero: the day as a dial with the phone in the middle; the sun moves as you scroll. */
function HeroDial({ children }: { children: ReactNode }) {
  const minute = useDayClock();
  return (
    <DayDial minute={prefersReducedMotion() ? 6 * 60 : minute} variant='day' className='lv-hero-dial'>
      {children}
    </DayDial>
  );
}

/** Ending: the same dial at night, Night lock running. */
function FinalDial() {
  const live = useDayClock();
  const minute = prefersReducedMotion() ? 22 * 60 + 30 : Math.max(live, 21 * 60);
  const night = presetById('night-lock');
  return (
    <DayDial minute={minute} variant='night' blocks={[{ start: night.start, end: night.end }]} className='lv-final-dial'>
      <span className='lv-final-time'>{hhmm(minute)}</span>
      <span className='lv-final-status'>{minute >= night.start ? 'Night lock on' : 'Wind down on'}</span>
    </DayDial>
  );
}

/** A preset switched on turns the scroll into the moment it protects (switches itself on in view). */
function Moment({ index, shape }: { index: number; shape: 'circle' | 'arch' }) {
  const item = MOMENTS[index];
  const preset = presetById(item.preset);
  const box = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(() => prefersReducedMotion());

  useEffect(() => {
    const target = box.current;
    if (!target || prefersReducedMotion()) return;
    let timer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        timer = window.setTimeout(() => setOn(true), 1100);
      },
      { threshold: 0.55 },
    );
    observer.observe(target);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  const toggle = () => setOn((value) => !value);
  const size = shape === 'arch' ? [720, 900] : [880, 880];

  return (
    <div ref={box} className={`lv-moment is-${shape}`} data-on={on || undefined} data-reveal='' style={delay(200)}>
      <div className='lv-moment-photo' onClick={toggle} aria-hidden='true'>
        <img className='lv-moment-before' src={photo(item.before, size[0], size[1])} alt='' loading='lazy' />
        <img className='lv-moment-after' src={photo(item.after, size[0], size[1])} alt='' loading='lazy' />
      </div>
      <span className='lv-moment-notice' aria-hidden='true'>
        <img src={APP.iconUrl} alt='' />
        <span>
          <strong>
            {preset.title} is on <small>now</small>
          </strong>
          <span>Apps blocked until {clock(preset.end)}</span>
        </span>
      </span>
      <button
        type='button'
        role='switch'
        aria-checked={on}
        aria-label={`${preset.title} example: ${item.line}`}
        className='lv-moment-switch'
        onClick={toggle}
      >
        <span className='lv-moment-emoji' aria-hidden='true'>
          {preset.emoji}
        </span>
        <span className='lv-moment-text'>
          <strong>{preset.title}</strong>
          <small>
            {range(preset)} · {DAY_LABELS[preset.days]}
          </small>
        </span>
        <span className='lv-switch' aria-hidden='true' />
      </button>
    </div>
  );
}

/** How it works: three stops on the sun's path across the sky. */
function Steps() {
  const visuals = [
    <img key='a' className='is-grey' src={photo('phonesCrowd', 420)} alt='' loading='lazy' />,
    <MiniDial key='b' />,
    <img key='c' src={photo('parkReading', 420)} alt='' loading='lazy' />,
  ];

  return (
    <section className='lv-sec lv-sec-steps' data-time='08:00' aria-labelledby='lv-steps-title'>
      <div className='lv-wrap lv-center'>
        <Heading id='lv-steps-title' time='08:00'>
          three steps,<br className='lv-br' /> over coffee
        </Heading>
        <p className='lv-sub' data-reveal='' style={delay(100)}>
          Set it up once. No willpower required.
        </p>
        <div className='lv-path' data-reveal='' style={delay(150)}>
          <svg className='lv-path-sky' viewBox='0 0 1000 420' aria-hidden='true'>
            <path d='M 40 337 A 558 558 0 0 1 960 337' className='lv-path-line' />
            <g className='lv-path-sun'>
              <circle cx={500} cy={95} r={13} />
            </g>
          </svg>
          <ol className='lv-steps'>
            {STEPS.map((step, i) => (
              <li key={step.title} className='lv-step'>
                <span className='lv-step-disc' aria-hidden='true'>
                  {visuals[i]}
                </span>
                <span className='lv-step-no' aria-hidden='true'>
                  {i + 1}
                </span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/** Step two's picture: a small day dial with the three default presets drawn on it. */
function MiniDial() {
  const C = 100;
  const shown = ['night-lock', 'morning-window', 'dinner-table'].map(presetById);
  const [hx, hy] = polar(C, 22 * 60, 64);
  return (
    <svg className='lv-mini-dial' viewBox='0 0 200 200'>
      <circle cx={C} cy={C} r={100} className='lv-mini-face' />
      {Array.from({ length: 24 }, (_, i) => {
        const [x1, y1] = polar(C, i * 60, i % 6 === 0 ? 80 : 84);
        const [x2, y2] = polar(C, i * 60, 89);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className='lv-mini-tick' />;
      })}
      {shown.map((preset, i) => (
        <path key={preset.id} d={arcPath(C, preset.start, preset.end, 68)} className={`lv-mini-arc is-${i}`} />
      ))}
      <line x1={C} y1={C} x2={hx} y2={hy} className='lv-mini-hand' />
      <circle cx={C} cy={C} r={6} className='lv-mini-pin' />
    </svg>
  );
}

/** Quick Focus with the listing's durations; the ring counts down while it is on screen. */
function QuickFocus() {
  const box = useRef<HTMLDivElement>(null);
  const [pick, setPick] = useState(1);
  const [visible, setVisible] = useState(false);
  const total = DURATIONS[pick].minutes * 60;
  const [left, setLeft] = useState(total);

  useEffect(() => {
    const target = box.current;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.4 });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => setLeft(total), [total]);

  useEffect(() => {
    if (!visible || !total || prefersReducedMotion()) return;
    const timer = window.setInterval(() => setLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [visible, total]);

  const share = total ? left / total : 1;
  const two = (n: number) => String(n).padStart(2, '0');
  const readout = !total
    ? '∞'
    : left >= 3600
      ? `${Math.floor(left / 3600)}:${two(Math.floor((left % 3600) / 60))}:${two(left % 60)}`
      : `${Math.floor(left / 60)}:${two(left % 60)}`;

  return (
    <div className='lv-qf' ref={box} data-reveal='' style={delay(150)}>
      <div className='lv-qf-ring'>
        <svg viewBox='0 0 240 240' aria-hidden='true'>
          <circle cx={120} cy={120} r={108} className='lv-qf-track' />
          <circle
            cx={120}
            cy={120}
            r={108}
            pathLength={1}
            className='lv-qf-arc'
            style={{ strokeDashoffset: 1 - share } as CSSProperties}
          />
        </svg>
        <span className='lv-qf-readout'>
          <strong data-long={left >= 3600 || undefined}>{readout}</strong>
          <small>{total ? 'left in Quick Focus' : 'Quick Focus, no limit'}</small>
        </span>
      </div>
      <div className='lv-durations' role='radiogroup' aria-label='Quick Focus duration'>
        {DURATIONS.map((item, i) => (
          <button
            key={item.label}
            type='button'
            role='radio'
            aria-checked={i === pick}
            data-on={i === pick || undefined}
            onClick={() => setPick(i)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className='lv-example'>Example</p>
    </div>
  );
}

/** Allowlist, emergency exit and privacy: the listing's exceptions. */
function Rules() {
  return (
    <section className='lv-sec lv-sec-rules' data-time='12:30' aria-labelledby='lv-rules-title'>
      <div className='lv-wrap lv-center'>
        <Heading id='lv-rules-title' time='12:30'>
          your rules, your exceptions
        </Heading>
        <p className='lv-sub' data-reveal='' style={delay(100)}>
          Some apps stay open no matter what. And when life happens, there’s an emergency exit.
        </p>

        <div className='lv-rules'>
          <div className='lv-rule' data-reveal='' style={delay(150)}>
            <div className='lv-allow' aria-hidden='true'>
              <span className='lv-mini-segment'>
                <span>Block</span>
                <span data-on=''>Allow only</span>
              </span>
              <ul>
                {ALLOWED.map(({ name, icon: Glyph, color }) => (
                  <li key={name}>
                    <span className='lv-allow-disc' style={{ color }}>
                      <Glyph size={26} strokeWidth={2.2} />
                      <span className='lv-allow-check'>
                        <Check size={12} strokeWidth={3.4} />
                      </span>
                    </span>
                    {name}
                  </li>
                ))}
              </ul>
            </div>
            <h3>some apps stay open</h3>
            <p>Add them to your always-allowed list. No schedule touches them.</p>
          </div>

          <div className='lv-rule' data-reveal='' style={delay(250)}>
            <div className='lv-wheel' aria-hidden='true'>
              <span className='lv-wheel-band' />
              <span className='lv-wheel-track'>
                {Array.from({ length: 15 }, (_, i) => (
                  <span key={i} data-on={i === 11 || undefined}>
                    {i + 1} {i === 0 ? 'minute' : 'minutes'}
                  </span>
                ))}
              </span>
            </div>
            <h3>an emergency exit, always there</h3>
            <p>Pause blocking for up to 15 minutes. The session picks back up on its own.</p>
          </div>
        </div>

        <p className='lv-private' data-reveal=''>
          <ShieldCheck size={20} strokeWidth={2} aria-hidden='true' />
          <span>
            <strong>Private by design.</strong> Luvia uses Apple’s Screen Time API, and all blocking runs on your
            device.
          </span>
        </p>
      </div>
    </section>
  );
}

/** Focus score and screen time goal as two rings (example numbers from the app's screenshot). */
function Score() {
  return (
    <section className='lv-sec lv-sec-score' data-time='21:00' data-header='dark' aria-labelledby='lv-score-title'>
      <div className='lv-wrap lv-center'>
        <Heading id='lv-score-title' time='21:00'>
          see how focused<br className='lv-br' /> you really are
        </Heading>
        <p className='lv-sub' data-reveal='' style={delay(100)}>
          A look back before bed: how well you stuck to your schedules, and how close you got to your goal.
        </p>
        <div className='lv-scores'>
          <figure className='lv-score is-focus' data-reveal='' style={delay(150)}>
            <span className='lv-score-ring'>
              <svg viewBox='0 0 220 220' aria-hidden='true'>
                <circle cx={110} cy={110} r={96} className='lv-score-track' />
                <circle cx={110} cy={110} r={96} pathLength={1} className='lv-score-arc' style={{ '--p': 0.95 } as CSSProperties} />
              </svg>
              <span className='lv-score-value'>
                <strong>95%</strong>
                <small>Focus today</small>
              </span>
            </span>
            <figcaption>
              <h3>your focus score</h3>
              <p>Your daily Focus % shows how much blocked-app time slipped through and how often you unblocked.</p>
            </figcaption>
          </figure>
          <figure className='lv-score is-goal' data-reveal='' style={delay(250)}>
            <span className='lv-score-ring'>
              <svg viewBox='0 0 220 220' aria-hidden='true'>
                <circle cx={110} cy={110} r={96} className='lv-score-track' />
                <circle cx={110} cy={110} r={96} pathLength={1} className='lv-score-arc' style={{ '--p': 0.8 } as CSSProperties} />
              </svg>
              <span className='lv-score-value'>
                <strong>2.4h</strong>
                <small>of a 3h goal</small>
              </span>
            </span>
            <figcaption>
              <h3>a goal you can see</h3>
              <p>Set a daily screen time goal and track how close you are to it throughout the day.</p>
            </figcaption>
          </figure>
        </div>
        <p className='lv-example'>Example numbers</p>
      </div>
    </section>
  );
}

/** The app's own App Store screenshots, fanned along an arc (a swipeable row on smaller screens). */
function Screens() {
  const middle = (SCREENSHOTS.length - 1) / 2;
  return (
    <section className='lv-sec lv-sec-screens' data-time='21:30' data-header='dark' aria-labelledby='lv-screens-title'>
      <div className='lv-wrap lv-center'>
        <Heading id='lv-screens-title' time='21:30'>
          your phone, on your terms
        </Heading>
      </div>
      <div className='lv-shots' tabIndex={0} aria-label='App screenshots' data-reveal='' style={delay(120)}>
        {SCREENSHOTS.map((shot, i) => (
          <img
            key={shot.url}
            src={shot.url}
            alt={shot.alt}
            loading='lazy'
            width={300}
            height={649}
            style={{ '--k': i - middle, '--i': i } as CSSProperties}
          />
        ))}
      </div>
    </section>
  );
}

// A fixed sky: positions are generated once from a small seeded sequence, so they never jump.
const STAR_FIELD = (() => {
  let seed = 7;
  const next = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  return Array.from({ length: 46 }, () => ({
    x: next() * 100,
    y: next() * 100,
    size: next() < 0.18 ? 3 : 2,
    wait: next() * 6,
  }));
})();

function Stars() {
  return (
    <span className='lv-stars' aria-hidden='true'>
      {STAR_FIELD.map((star, i) => (
        <i
          key={i}
          style={
            {
              left: `${star.x.toFixed(2)}%`,
              top: `${star.y.toFixed(2)}%`,
              '--s': `${star.size}px`,
              '--w': `${star.wait.toFixed(2)}s`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}
