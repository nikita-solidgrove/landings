import '@fontsource-variable/unbounded';
import '@fontsource-variable/onest';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { ArrowRight, Wifi } from 'lucide-react';
import { useReveal } from '../../shared/motion';
import { ProgressiveBlur } from '../../shared/ProgressiveBlur';
import { describeOffer, initials, type LandingProps } from '../../shared/offer';
import { APP, FEATURES, PROOF, SCREENSHOTS, STEPS } from './content';
import { CastDemo, HomeScreen, StatusBar } from './CastDemo';
import { PowerOnTv, UseCases, ZoomToTv } from './BigScreen';
import { SectionHead } from './NowShowing';
import { SettingsFaq } from './SettingsFaq';
import './page.css';

const delay = (ms: number) => ({ '--reveal-delay': `${ms}ms` }) as CSSProperties;
const pad = (n: number) => String(n).padStart(2, '0');

/** The local time, like the clock in a TV's top bar. */
function useClock() {
  const format = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const [time, setTime] = useState(format);
  useEffect(() => {
    const timer = window.setInterval(() => setTime(format()), 15000);
    return () => window.clearInterval(timer);
  }, []);
  return time;
}

/** Sets the font size so the line's text spans exactly the width of its box. */
function useFitWidth(ref: RefObject<HTMLElement | null>, max = 200) {
  useLayoutEffect(() => {
    const el = ref.current;
    const text = el?.firstElementChild as HTMLElement | null;
    if (!el || !text) return;
    let width = 0;
    const fit = (force = false) => {
      const available = el.clientWidth;
      if (!available || (available === width && !force)) return;
      width = available;
      el.style.fontSize = '100px';
      // offsetWidth ignores the entrance transform, so the size is right mid-animation too.
      const size = Math.min(max, (100 * available) / text.offsetWidth);
      el.style.fontSize = `${Math.floor(size * 10) / 10}px`;
    };
    fit();
    const observer = new ResizeObserver(() => fit());
    observer.observe(el);
    document.fonts?.ready.then(() => fit(true));
    return () => observer.disconnect();
  }, [ref, max]);
}

export function ScreenMirroringPage({ offer, creator, onStart }: LandingProps) {
  const root = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);
  const heroCta = useRef<HTMLButtonElement>(null);
  const bigLine = useRef<HTMLSpanElement>(null);
  const dock = useRef<HTMLDivElement>(null);
  const casts = useRef<HTMLOListElement>(null);
  const pointing = useRef(false);
  const [showDock, setShowDock] = useState(false);
  const [headerStuck, setHeaderStuck] = useState(false);
  const [headerTone, setHeaderTone] = useState<'light' | 'dark'>('dark');
  const [feature, setFeature] = useState(0);
  const terms = describeOffer(offer);
  const clock = useClock();

  useReveal(root);
  useFitWidth(bigLine);

  useEffect(() => {
    // The tint shows once content scrolls under the header (the creator ribbon scrolls away first),
    // and turns dark with light text over sections marked data-header="dark".
    const onScroll = () => {
      const box = header.current?.getBoundingClientRect();
      if (!box) return;
      setHeaderStuck(window.scrollY > 4 && box.top <= 0);
      const under = document.elementFromPoint(window.innerWidth / 2, box.bottom + 1);
      setHeaderTone(under?.closest('[data-header="dark"]') ? 'dark' : 'light');
      const total = document.documentElement.scrollHeight - window.innerHeight;
      dock.current?.style.setProperty('--progress', total > 0 ? (window.scrollY / total).toFixed(3) : '0');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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

  useEffect(() => {
    // The row crossing the middle of the screen is the one in focus, unless the pointer picks one.
    const rows = casts.current?.querySelectorAll<HTMLElement>('[data-index]');
    if (!rows?.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (pointing.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) setFeature(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: '-46% 0px -46% 0px' },
    );
    rows.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, []);

  return (
    <div className='smr' ref={root}>
      {creator && offer.discountPercent ? (
        <div className='smr-ribbon'>
          {creator.avatarUrl ? (
            <img src={creator.avatarUrl} alt='' className='smr-avatar' />
          ) : (
            <span className='smr-avatar' aria-hidden='true'>
              {initials(creator.name)}
            </span>
          )}
          <p>
            <strong>{creator.name}</strong> picked this app for you
          </p>
          <span className='smr-ribbon-deal'>−{offer.discountPercent}% today</span>
        </div>
      ) : null}

      <header ref={header} className='smr-header' data-stuck={headerStuck} data-tone={headerTone}>
        <div className='smr-header-backdrop' aria-hidden='true'>
          <ProgressiveBlur layers={6} maxBlur={18} />
          <div className='smr-header-tint smr-header-tint-light' />
          <div className='smr-header-tint smr-header-tint-dark' />
        </div>
        <div className='smr-wrap smr-header-row'>
          <a href='#top' className='smr-identity'>
            <img src={APP.iconUrl} alt='' width={34} height={34} />
            <span>{APP.name}</span>
          </a>
          <nav className='smr-nav' aria-label='Sections'>
            <a href='#smr-casts'>What it casts</a>
            <a href='#smr-how'>How it works</a>
            <a href='#smr-faq'>Questions</a>
          </nav>
          <div className='smr-header-end'>
            <span className='smr-clock' aria-hidden='true'>
              <Wifi strokeWidth={2.4} />
              <span>{clock}</span>
            </span>
            <button type='button' className='smr-btn smr-btn-small smr-header-cta' onClick={onStart}>
              Start casting
            </button>
          </div>
        </div>
      </header>

      <main id='top'>
        <section className='smr-hero' data-header='dark'>
          <div className='smr-wrap'>
            <h1 className='smr-h1'>
              <span className='smr-h1-small'>Your phone, on the</span>
              <span className='smr-h1-big' ref={bigLine}>
                <span>big screen.</span>
              </span>
            </h1>
            <ul className='smr-proof'>
              {PROOF.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div className='smr-hero-body'>
              <div className='smr-hero-copy'>
                <p className='smr-lead'>
                  Cast photos, videos and YouTube to your Smart TV, or mirror your iPhone screen in real time. No cables,
                  no complicated setup.
                </p>
                <div className='smr-offer'>
                  {terms.today ? (
                    <p className='smr-price'>
                      <strong>{terms.today}</strong> <s>{terms.regular}</s> <span>first payment</span>
                    </p>
                  ) : null}
                  <button ref={heroCta} type='button' className='smr-btn' onClick={onStart}>
                    Start casting
                    <ArrowRight strokeWidth={2.4} />
                  </button>
                  <p className='smr-terms'>{terms.terms}</p>
                </div>
              </div>
              <div className='smr-hero-stage'>
                <CastDemo />
              </div>
            </div>
          </div>
        </section>

        <ZoomToTv />

        <section id='smr-casts' className='smr-section smr-light' aria-labelledby='smr-casts-title'>
          <div className='smr-wrap'>
            <SectionHead n={2} id='smr-casts-title' title='Six ways to fill the screen.'>
              Everything sits on one simple home screen, easy to use even if you have never cast anything before.
            </SectionHead>
            <div className='smr-casts-grid'>
              <div className='smr-casts-side' aria-hidden='true'>
                <div className='smr-device smr-casts-phone'>
                  <div className='smr-phone-screen'>
                    <StatusBar />
                    <span className='smr-island' />
                    <div className='smr-ps is-on'>
                      <HomeScreen focus={feature} />
                    </div>
                  </div>
                </div>
                <p className='smr-note'>
                  <span>Example:</span> the app's home screen
                </p>
              </div>
              <div>
                <ol className='smr-casts-list' ref={casts} onPointerLeave={() => (pointing.current = false)}>
                  {FEATURES.map((item, i) => (
                    <li
                      key={item.name}
                      data-index={i}
                      className={feature === i ? 'is-active' : undefined}
                      style={{ '--c': item.color } as CSSProperties}
                      onPointerEnter={(event) => {
                        if (event.pointerType !== 'mouse') return;
                        pointing.current = true;
                        setFeature(i);
                      }}
                    >
                      <span className='smr-casts-no' aria-hidden='true'>
                        {pad(i + 1)}
                      </span>
                      <div className='smr-casts-body'>
                        <h3>{item.name}</h3>
                        <p>{item.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className='smr-casts-cta'>
                  <button type='button' className='smr-btn smr-btn-ink' onClick={onStart}>
                    Start casting
                    <ArrowRight strokeWidth={2.4} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <UseCases />

        <section id='smr-how' className='smr-section smr-light' aria-labelledby='smr-how-title'>
          <div className='smr-wrap'>
            <SectionHead n={4} id='smr-how-title' title='Phone to TV in a few taps.'>
              Your iPhone and your TV on the same Wi‑Fi. No cables, no complicated setup.
            </SectionHead>
            <ol className='smr-steps'>
              {STEPS.map((step, i) => (
                <li key={step.title} data-reveal='' style={delay(i * 140)}>
                  <img
                    className='smr-step-shot'
                    src={SCREENSHOTS[step.shot].url}
                    alt={`${APP.name} screenshot: ${SCREENSHOTS[step.shot].alt}`}
                    loading='lazy'
                    width={600}
                    height={1298}
                  />
                  <div className='smr-step-text'>
                    <span className='smr-step-no' aria-hidden='true'>
                      {i + 1}
                    </span>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className='smr-how-cta'>
              <button type='button' className='smr-btn smr-btn-ink' onClick={onStart}>
                Start casting
                <ArrowRight strokeWidth={2.4} />
              </button>
            </div>
          </div>
        </section>

        <section id='smr-faq' className='smr-section' data-header='dark' aria-labelledby='smr-faq-title'>
          <div className='smr-wrap'>
            <SectionHead n={5} id='smr-faq-title' title='Before the first cast.' />
            <SettingsFaq />
          </div>
        </section>

        <section className='smr-final' data-header='dark' aria-labelledby='smr-final-title'>
          <div className='smr-wrap smr-final-grid'>
            <PowerOnTv />
            <div className='smr-final-copy' data-reveal='' style={delay(200)}>
              <h2 id='smr-final-title' className='smr-h2 smr-final-title'>
                Tonight, put it on the big screen.
              </h2>
              <p className='smr-final-sub'>Photos, videos, YouTube or your whole screen. Your TV is one tap away.</p>
              {terms.today ? (
                <p className='smr-price'>
                  <strong>{terms.today}</strong> <s>{terms.regular}</s> <span>first payment</span>
                </p>
              ) : null}
              <button type='button' className='smr-btn' onClick={onStart}>
                Start casting
                <ArrowRight strokeWidth={2.4} />
              </button>
              <p className='smr-terms'>{terms.terms}</p>
            </div>
          </div>
        </section>
      </main>

      <footer className='smr-footer' data-header='dark'>
        <div className='smr-wrap smr-footer-row'>
          <div className='smr-footer-id'>
            <img src={APP.iconUrl} alt='' width={28} height={28} />
            <span>
              {APP.fullName} is developed by {APP.legalName} Payment details are processed securely by our payment
              provider. Photos: Unsplash.
            </span>
          </div>
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

      <div ref={dock} className={showDock ? 'smr-dock is-visible' : 'smr-dock'} aria-hidden={!showDock}>
        <i className='smr-dock-line' aria-hidden='true'>
          <b />
        </i>
        <img src={APP.iconUrl} alt='' width={42} height={42} />
        <span className='smr-dock-text'>
          <strong>{terms.today ?? terms.regular}</strong>
          <small>{terms.today ? `then ${terms.regular}` : 'Cancel anytime'}</small>
        </span>
        <button type='button' className='smr-btn smr-btn-small' onClick={onStart} tabIndex={showDock ? 0 : -1}>
          Start casting
        </button>
      </div>
    </div>
  );
}
