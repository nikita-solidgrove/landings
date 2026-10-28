import '@fontsource-variable/baloo-2';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowRight, Plus, Volume2 } from 'lucide-react';
import { prefersReducedMotion, useReveal } from '../../shared/motion';
import { ProgressiveBlur } from '../../shared/ProgressiveBlur';
import { describeOffer, initials, type LandingProps } from '../../shared/offer';
import { APP, DIAL, FAQ, MOMENTS, PRESETS, PROOF, SCREENSHOTS, photo } from './content';
import { SpeakerDemo } from './SpeakerDemo';
import { Bubbles, Drop, DropPhoto, Splash, Squiggle, Wave, ripple } from './Water';
import './page.css';

/** Order of an element in the hero entrance; the CSS turns it into a delay. */
const order = (i: number) => ({ '--i': i }) as CSSProperties;
const delay = (ms: number) => ({ '--reveal-delay': `${ms}ms` }) as CSSProperties;
/** Phase of a bobbing element, so neighbours never bob in step. */
const bob = (s: number) => ({ '--bob': `${s}s` }) as CSSProperties;

type HeaderTone = 'light' | 'dark' | 'pool' | 'sun';

const STEPS = [
  {
    art: 'mode',
    title: 'Pick a mode',
    text: 'A preset for water, dust or a quick daily clean, or set the tone yourself in Manual.',
  },
  {
    art: 'flip',
    title: 'Lay it face down',
    text: 'Place your phone face down. That’s the app’s own tip for the best result.',
  },
  {
    art: 'volume',
    title: 'Volume all the way up',
    text: 'Turn the volume to the maximum so the tones can do their job.',
  },
  {
    art: 'start',
    title: 'Press Start',
    text: 'The tones push water and dust out. Then run the speaker test to hear the difference.',
  },
] as const;

export function SpeakerCleanerPage({ offer, creator, onStart }: LandingProps) {
  const root = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);
  const heroCta = useRef<HTMLButtonElement>(null);
  const [showDock, setShowDock] = useState(false);
  const [headerStuck, setHeaderStuck] = useState(false);
  const [headerTone, setHeaderTone] = useState<HeaderTone>('pool');
  const terms = describeOffer(offer);

  useReveal(root);

  useEffect(() => {
    // The tint shows once content scrolls under the header (the creator ribbon scrolls away first).
    // Over sections marked data-header="dark" the tint turns dark; data-tint="pool" keeps it pool blue,
    // and the light sun-yellow section gets a yellow tint instead of the foam one.
    const onScroll = () => {
      const box = header.current?.getBoundingClientRect();
      if (!box) return;
      setHeaderStuck(window.scrollY > 4 && box.top <= 0);
      const under = document.elementFromPoint(window.innerWidth / 2, box.bottom + 1);
      const dark = under?.closest<HTMLElement>('[data-header="dark"]');
      const sun = under?.closest('[data-tint="sun"]');
      setHeaderTone(dark ? (dark.dataset.tint === 'pool' ? 'pool' : 'dark') : sun ? 'sun' : 'light');
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
    <div className='spk' ref={root}>
      {creator && offer.discountPercent ? (
        <div className='spk-ribbon'>
          {creator.avatarUrl ? (
            <img src={creator.avatarUrl} alt='' className='spk-avatar' />
          ) : (
            <span className='spk-avatar' aria-hidden='true'>{initials(creator.name)}</span>
          )}
          <p>
            <strong>{creator.name}</strong> picked this app for you
          </p>
          <span className='spk-ribbon-deal'>−{offer.discountPercent}% today</span>
        </div>
      ) : null}

      <header
        ref={header}
        className={showDock ? 'spk-header is-docked' : 'spk-header'}
        data-stuck={headerStuck}
        data-tone={headerTone}
      >
        <div className='spk-header-backdrop' aria-hidden='true'>
          <ProgressiveBlur layers={6} maxBlur={16} />
          <div className='spk-header-tint spk-header-tint-light' />
          <div className='spk-header-tint spk-header-tint-dark' />
          <div className='spk-header-tint spk-header-tint-pool' />
          <div className='spk-header-tint spk-header-tint-sun' />
        </div>
        <div className='spk-bar'>
          <a href='#top' className='spk-identity'>
            <img src={APP.iconUrl} alt='' width={38} height={38} />
            <span>{APP.name}</span>
          </a>
          <nav className='spk-bar-links' aria-label='On this page'>
            <a href='#spk-how'>How it works</a>
            <a href='#spk-modes'>Modes</a>
            <a href='#spk-faq'>Questions</a>
          </nav>
          <Splash className='spk-btn spk-btn-bar' onClick={onStart}>
            Clear my speaker
          </Splash>
        </div>
      </header>

      <main id='top'>
        <section className='spk-hero' data-header='dark' data-tint='pool'>
          <div className='spk-hero-water' aria-hidden='true'>
            <span className='spk-caustics' />
            <Bubbles />
            <span className='spk-hero-ring' style={bob(0)}>
              <img src={photo('poolJump', 360, 360)} alt='' />
            </span>
            <span className='spk-hero-drop' style={bob(-2.4)}>
              <DropPhoto src={photo('splash', 400, 480)} />
            </span>
          </div>

          <div className='spk-wrap spk-hero-copy'>
            <h1 className='spk-hero-title'>
              <span className='spk-rise' style={order(0)}>Water in your speaker?</span>{' '}
              <span className='spk-rise' style={order(1)}>
                Let <Squiggle>sound</Squiggle> push it out.
              </span>
            </h1>
            <p className='spk-hero-lead spk-intro' style={order(3)}>
              Cleaning tones shake water and dust out of your phone’s speaker, so music and calls sound clear and loud
              again.
            </p>
            <div className='spk-hero-offer spk-intro' style={order(4)}>
              {terms.today ? (
                <p className='spk-price'>
                  <strong>{terms.today}</strong> <s>{terms.regular}</s> <span>first payment</span>
                </p>
              ) : null}
              <Splash ref={heroCta} className='spk-btn spk-btn-big' onClick={onStart}>
                Clear my speaker
                <ArrowRight size={22} strokeWidth={2.6} />
              </Splash>
              <p className='spk-terms'>{terms.terms}</p>
            </div>
            <ul className='spk-proof spk-intro' style={order(5)}>
              {PROOF.map((item) => (
                <li key={item}>
                  <Drop />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className='spk-float-zone'>
            <div className='spk-float'>
              <span className='spk-float-rings' aria-hidden='true'>
                <i />
                <i />
                <i />
              </span>
              <SpeakerDemo />
            </div>
          </div>
        </section>

        <section className='spk-section spk-moments-section' aria-labelledby='spk-moments-title'>
          <Wave />
          <div className='spk-wrap'>
            <div className='spk-head' data-reveal=''>
              <h2 id='spk-moments-title' className='spk-h2'>
                <span className='spk-line'>
                  Wet, sandy, <Squiggle>muffled?</Squiggle>
                </span>{' '}
                <span className='spk-line'>There’s a mode for that.</span>
              </h2>
              <p className='spk-sub'>Pick the moment, press Start, and hear your speaker come back.</p>
            </div>
            <ul className='spk-moments'>
              {MOMENTS.map((item, i) => (
                <li key={item.title} className='spk-moment' data-reveal='' style={delay(i * 110)}>
                  <span className='spk-moment-photo' style={bob(i * -1.7)}>
                    <DropPhoto src={photo(item.photo, 500, 600)} />
                  </span>
                  <span className='spk-moment-place'>{item.place}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <span className='spk-moment-mode'>
                    <Drop />
                    {item.preset}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id='spk-how' className='spk-section spk-steps-section' data-tint='sun' aria-labelledby='spk-steps-title'>
          <Wave />
          <div className='spk-wrap'>
            <div className='spk-head' data-reveal=''>
              <h2 id='spk-steps-title' className='spk-h2'>
                Four taps to <Squiggle>clear sound.</Squiggle>
              </h2>
              <p className='spk-sub'>Face down, volume up, Start. The app tells you the rest.</p>
            </div>
            <div className='spk-steps-wrap'>
              <svg className='spk-steps-line' viewBox='0 0 1000 60' preserveAspectRatio='none' aria-hidden='true'>
                <path d='M0 30C62 6 125 6 187 30s125 24 188 0 125-24 187 0 125 24 188 0 125-24 250 0' />
              </svg>
              <ol className='spk-steps'>
                {STEPS.map((step, i) => (
                  <li key={step.title} className='spk-step' data-reveal='' style={delay(i * 120)}>
                    <span className='spk-step-bubble' style={bob(i * -1.3)} aria-hidden='true'>
                      <StepArt kind={step.art} />
                      <span className='spk-step-no'>{i + 1}</span>
                    </span>
                    <div className='spk-step-text'>
                      <h3>{step.title}</h3>
                      <p>{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <Lanes onStart={onStart} />

        <section className='spk-section spk-tools-section' aria-labelledby='spk-tools-title'>
          <Wave />
          <div className='spk-wrap'>
            <div className='spk-head' data-reveal=''>
              <h2 id='spk-tools-title' className='spk-h2'>
                Your tone. Your <Squiggle>test.</Squiggle>
              </h2>
              <p className='spk-sub'>Beyond the presets: dial the frequency yourself, then check both speakers.</p>
            </div>
            <div className='spk-tools'>
              <div className='spk-tool spk-tool-dial' data-reveal=''>
                <span className='spk-caustics' aria-hidden='true' />
                <DialPanel />
              </div>
              <div className='spk-tool spk-tool-test' data-reveal='' style={delay(140)}>
                <StereoPanel />
              </div>
            </div>
          </div>
        </section>

        <section
          className='spk-section spk-shots-section'
          data-header='dark'
          data-tint='pool'
          aria-labelledby='spk-shots-title'
        >
          <Wave />
          <div className='spk-shots-water' aria-hidden='true'>
            <span className='spk-caustics' />
            <Bubbles count={8} />
          </div>
          <div className='spk-wrap'>
            <div className='spk-head' data-reveal=''>
              <h2 id='spk-shots-title' className='spk-h2'>
                Simple enough for a <Squiggle>wet hand.</Squiggle>
              </h2>
              <p className='spk-sub'>One screen to clean, one dial for any frequency, one test for both speakers.</p>
            </div>
            <div className='spk-shots' tabIndex={0} aria-label='App screenshots'>
              {SCREENSHOTS.map((item, i) => (
                <figure key={item.url} className='spk-shot' data-reveal='' style={delay(i * 120)}>
                  <span className='spk-shot-frame' style={bob(i * -2.1)}>
                    <img
                      src={item.url}
                      alt={`${APP.name} screenshot: ${item.title}`}
                      loading='lazy'
                      width={300}
                      height={649}
                    />
                  </span>
                  <figcaption>
                    <strong>{item.title}</strong>
                    <span>{item.text}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section id='spk-faq' className='spk-section spk-faq-section' aria-labelledby='spk-faq-title'>
          <Wave />
          <div className='spk-wrap spk-faq-wrap'>
            <div className='spk-head' data-reveal=''>
              <h2 id='spk-faq-title' className='spk-h2'>
                Before you press <Squiggle>Start.</Squiggle>
              </h2>
            </div>
            <div className='spk-faq' data-reveal='' style={delay(100)}>
              {FAQ.map((item) => (
                <details key={item.question} className='spk-faq-item'>
                  <summary>
                    <span>{item.question}</span>
                    <span className='spk-faq-icon' aria-hidden='true'>
                      <Plus size={20} strokeWidth={2.6} />
                    </span>
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className='spk-final' data-header='dark'>
          <Wave />
          <div className='spk-final-water' aria-hidden='true'>
            <span className='spk-rays' />
            <span className='spk-caustics' />
            <Bubbles />
          </div>
          <div className='spk-wrap spk-final-inner'>
            <div className='spk-head' data-reveal=''>
              <h2 className='spk-h2 spk-final-title'>
                Back to loud and <Squiggle>clear.</Squiggle>
              </h2>
              <p className='spk-sub'>Your next pool day, beach day or rainy day, covered.</p>
            </div>
            <div className='spk-final-action' data-reveal='' style={delay(120)}>
              <span className='spk-final-rings' aria-hidden='true'>
                <i />
                <i />
                <i />
              </span>
              <button type='button' className='spk-final-btn' onClick={onStart} onPointerDown={ripple}>
                <span>Clear my speaker</span>
                <ArrowRight size={30} strokeWidth={2.6} />
              </button>
            </div>
            {terms.today ? (
              <p className='spk-price spk-final-price' data-reveal='' style={delay(200)}>
                <strong>{terms.today}</strong> <s>{terms.regular}</s> <span>first payment</span>
              </p>
            ) : null}
            <p className='spk-terms' data-reveal='' style={delay(220)}>
              {terms.terms}
            </p>
          </div>
        </section>
      </main>

      <footer className='spk-footer' data-header='dark'>
        <div className='spk-wrap spk-footer-inner'>
          <a href='#top' className='spk-footer-id'>
            <img src={APP.iconUrl} alt='' width={36} height={36} />
            <span>{APP.fullName}</span>
          </a>
          <p>
            {APP.fullName} is developed by {APP.legalName} Cleaning works with sound and can’t repair a damaged
            speaker. Payment details are processed securely by our payment provider.
          </p>
          <nav aria-label='Legal'>
            <a href={APP.privacyUrl} target='_blank' rel='noopener noreferrer'>
              Privacy Policy
            </a>
            <a href={APP.termsUrl} target='_blank' rel='noopener noreferrer'>
              Terms of Use
            </a>
            <span>Photos: Unsplash</span>
          </nav>
        </div>
      </footer>

      <div className={showDock ? 'spk-dock is-visible' : 'spk-dock'} aria-hidden={!showDock}>
        <img src={APP.iconUrl} alt='' width={40} height={40} />
        <span className='spk-dock-text'>
          <strong>{terms.today ?? terms.regular}</strong>
          <small>{terms.today ? `then ${terms.regular}` : 'Cancel anytime'}</small>
        </span>
        <Splash className='spk-btn spk-btn-dock' onClick={onStart} tabIndex={showDock ? 0 : -1}>
          Clear my speaker
        </Splash>
      </div>
    </div>
  );
}

/** The small picture inside each step bubble. */
function StepArt({ kind }: { kind: (typeof STEPS)[number]['art'] }) {
  if (kind === 'mode') {
    return (
      <span className='spk-art spk-art-mode'>
        <i className='is-on'>Water Eject</i>
        <i>Dust Blast</i>
        <i>Quick Clean</i>
      </span>
    );
  }
  if (kind === 'flip') {
    return (
      <span className='spk-art spk-art-flip'>
        <span className='spk-flip'>
          <i className='spk-flip-front' />
          <i className='spk-flip-back' />
        </span>
      </span>
    );
  }
  if (kind === 'volume') {
    return (
      <span className='spk-art spk-art-volume'>
        <span className='spk-volume'>
          <span className='spk-volume-fill' />
          <Volume2 size={20} />
        </span>
      </span>
    );
  }
  return (
    <span className='spk-art spk-art-start'>
      <span className='spk-mini-rings'>
        <i />
        <i />
        <i />
      </span>
      <span className='spk-mini-start'>Start</span>
    </span>
  );
}

/** The presets as lanes of a pool seen from above; each lane is as long as the preset's timer. */
function Lanes({ onStart }: { onStart: () => void }) {
  const [active, setActive] = useState(0);
  const longest = Math.max(...PRESETS.map((preset) => preset.seconds));

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const timer = window.setInterval(() => setActive((i) => (i + 1) % PRESETS.length), 2600);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section id='spk-modes' className='spk-section spk-lanes-section' data-header='dark' aria-labelledby='spk-lanes-title'>
      <Wave />
      <div className='spk-wrap'>
        <div className='spk-head' data-reveal=''>
          <h2 id='spk-lanes-title' className='spk-h2'>
            Five presets. <Squiggle>Pick a lane.</Squiggle>
          </h2>
          <p className='spk-sub'>
            The app sets the frequencies for you. One tap, one timer, from 30 seconds to 3½ minutes.
          </p>
        </div>
        <div className='spk-pool' data-reveal='' style={delay(80)}>
          <span className='spk-caustics' aria-hidden='true' />
          <ol className='spk-lanes'>
            {PRESETS.map((preset, i) => (
              <li
                key={preset.name}
                className={i === active ? 'spk-lane is-active' : 'spk-lane'}
                onPointerEnter={() => setActive(i)}
                style={{ '--share': preset.seconds / longest } as CSSProperties}
              >
                <span className='spk-lane-no' aria-hidden='true'>{i + 1}</span>
                <span className='spk-lane-name'>
                  <strong>{preset.name}</strong>
                  <span>{preset.text}</span>
                </span>
                <span className='spk-lane-track' aria-hidden='true'>
                  <i />
                </span>
                <span className='spk-lane-time' aria-label={preset.label}>{preset.time}</span>
              </li>
            ))}
            <li className='spk-lane spk-lane-manual'>
              <span className='spk-lane-no' aria-hidden='true'>{PRESETS.length + 1}</span>
              <span className='spk-lane-name'>
                <strong>Manual</strong>
                <span>Set any frequency and the cleaning time yourself</span>
              </span>
              <span className='spk-lane-track' aria-hidden='true'>
                <i />
              </span>
              <span className='spk-lane-time'>You</span>
            </li>
          </ol>
        </div>
        <p className='spk-lanes-note' data-reveal=''>Each lane is as long as its timer.</p>
        <div className='spk-center' data-reveal=''>
          <Splash className='spk-btn spk-btn-big' onClick={onStart}>
            Clear my speaker
            <ArrowRight size={22} strokeWidth={2.6} />
          </Splash>
        </div>
      </div>
    </section>
  );
}

const formatHz = (hz: number) => hz.toLocaleString('en-US').replace(',', ' ');

/** The Manual mode dial from the app's screenshot, as a working example (no sound). */
function DialPanel() {
  const [hz, setHz] = useState(DIAL.start);
  const share = (hz - DIAL.min) / (DIAL.max - DIAL.min);
  const angle = Math.PI * (1 - share);
  const thumb = { x: 120 + 96 * Math.cos(angle), y: 116 - 96 * Math.sin(angle) };
  const arc = Math.PI * 96;

  return (
    <>
      <span className='spk-tool-label'>Manual mode</span>
      <h3>Dial any tone.</h3>
      <p>Set the frequency anywhere up to 25 kHz and choose how long the cleaning runs.</p>
      <div className='spk-dial'>
        <svg viewBox='0 0 240 132' aria-hidden='true'>
          <path className='spk-dial-track' d='M24 116 A96 96 0 0 1 216 116' />
          <path
            className='spk-dial-fill'
            d='M24 116 A96 96 0 0 1 216 116'
            style={{ strokeDasharray: `${arc * share} ${arc}` }}
          />
          <circle className='spk-dial-thumb' cx={thumb.x} cy={thumb.y} r='9' />
        </svg>
        <div className='spk-dial-value'>
          <strong>{formatHz(hz)}</strong>
          <span>Hz</span>
        </div>
      </div>
      <div className='spk-dial-controls'>
        <Splash
          className='spk-step-btn spk-step-minus'
          aria-label='Lower the frequency by 100 Hz'
          onClick={() => setHz((value) => Math.max(DIAL.min, value - DIAL.step))}
        >
          <span aria-hidden='true'>−</span>
        </Splash>
        <input
          type='range'
          className='spk-dial-range'
          min={DIAL.min}
          max={DIAL.max}
          step={DIAL.step}
          value={hz}
          onChange={(event) => setHz(Number(event.target.value))}
          aria-label='Example frequency in hertz'
        />
        <Splash
          className='spk-step-btn spk-step-plus'
          aria-label='Raise the frequency by 100 Hz'
          onClick={() => setHz((value) => Math.min(DIAL.max, value + DIAL.step))}
        >
          <span aria-hidden='true'>+</span>
        </Splash>
      </div>
      <p className='spk-tool-note'>Example of the app’s dial. No sound plays here.</p>
    </>
  );
}

/** The Stereo Speaker Test from the app's screenshot: top and bottom speaker in turn. */
function StereoPanel() {
  const [testing, setTesting] = useState(() => !prefersReducedMotion());

  return (
    <>
      <span className='spk-tool-label'>Stereo speaker test</span>
      <h3>Hear both speakers.</h3>
      <p>Check the top and the bottom speaker after cleaning, and hear the stereo come back.</p>
      <div className={testing ? 'spk-test is-testing' : 'spk-test'}>
        <div className='spk-test-speaker'>
          <span className='spk-cone'>
            <i />
            <i />
          </span>
          <span className='spk-test-name'>Speaker top</span>
        </div>
        <div className='spk-test-speaker spk-test-speaker-b'>
          <span className='spk-cone'>
            <i />
            <i />
          </span>
          <span className='spk-test-name'>Speaker bottom</span>
        </div>
      </div>
      <Splash className={testing ? 'spk-test-btn is-stop' : 'spk-test-btn'} onClick={() => setTesting(!testing)}>
        {testing ? 'Stop' : 'Start test'}
      </Splash>
      <p className='spk-tool-note'>Example. No sound plays here.</p>
    </>
  );
}
