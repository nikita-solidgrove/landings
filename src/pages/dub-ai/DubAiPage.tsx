import '@fontsource-variable/syne';
import '@fontsource-variable/dm-sans';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Play } from 'lucide-react';
import { prefersReducedMotion, useReveal } from '../../shared/motion';
import { ProgressiveBlur } from '../../shared/ProgressiveBlur';
import { describeOffer, initials, type LandingProps } from '../../shared/offer';
import { APP, CREDITS, FAQ, SCREENSHOTS, STEPS, USE_CASES, photo } from './content';
import { DubBay } from './DubBay';
import { DubHero } from './DubHero';
import { Timecode } from './Timecode';
import './page.css';

const delay = (ms: number) => ({ '--reveal-delay': `${ms}ms` }) as CSSProperties;

/** .srt timing for the FAQ cues, one cue every 4.2 seconds. */
const srt = (ms: number) => {
  const pad = (n: number, size = 2) => String(n).padStart(size, '0');
  const s = Math.floor(ms / 1000);
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)},${pad(ms % 1000, 3)}`;
};
const cueTime = (i: number) => `${srt(1000 + i * 4200)} --> ${srt(4600 + i * 4200)}`;

/** Section heading: a clapperboard slate (scene number and name) beside a plain heading. */
function Scene({ no, name, id, title, lead }: { no: string; name: string; id: string; title: string; lead?: ReactNode }) {
  return (
    <div className='dub-head' data-reveal=''>
      <span className='dub-slate' aria-hidden='true'>
        <span className='dub-slate-stick' />
        <span className='dub-slate-board'>
          <span className='dub-slate-no'>
            <small>Sc.</small>
            {no}
          </span>
          <span className='dub-slate-name'>{name}</span>
        </span>
      </span>
      <div>
        <h2 id={id} className='dub-title'>
          {title}
        </h2>
        {lead ? <p className='dub-head-lead'>{lead}</p> : null}
      </div>
    </div>
  );
}

const PlayMark = () => <Play size={14} fill='currentColor' strokeWidth={0} aria-hidden='true' />;

export function DubAiPage({ offer, creator, onStart }: LandingProps) {
  const root = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);
  const heroCta = useRef<HTMLButtonElement>(null);
  const reel = useRef<HTMLDivElement>(null);
  const reelTrack = useRef<HTMLDivElement>(null);
  const dock = useRef<HTMLDivElement>(null);
  const [showDock, setShowDock] = useState(false);
  const [headerStuck, setHeaderStuck] = useState(false);
  const [headerTone, setHeaderTone] = useState<'light' | 'dark'>('dark');
  const [scene, setScene] = useState('Opening');
  const terms = describeOffer(offer);

  useReveal(root);

  useEffect(() => {
    // The tint shows once content scrolls under the header (the creator ribbon scrolls away first),
    // dark with light text over sections marked data-header="dark", paper over the storyboard.
    const onScroll = () => {
      const box = header.current?.getBoundingClientRect();
      if (!box) return;
      setHeaderStuck(window.scrollY > 4 && box.top <= 0);
      const under = document.elementFromPoint(window.innerWidth / 2, box.bottom + 1);
      setHeaderTone(under?.closest('[data-header="dark"]') ? 'dark' : 'light');
      const current = under?.closest<HTMLElement>('[data-scene]')?.dataset.scene;
      if (current) setScene(current);
      // The dock's scrubber shows how far into the page ("the film") the visitor is.
      const max = document.documentElement.scrollHeight - window.innerHeight;
      dock.current?.style.setProperty('--page', (max > 0 ? Math.min(1, window.scrollY / max) : 0).toFixed(4));
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

  useEffect(() => {
    // On desktops the filmstrip runs sideways while the page scrolls past it; touch screens swipe it.
    const box = reel.current;
    const track = reelTrack.current;
    if (!box || !track) return;
    const query = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');
    let raf = 0;
    const update = () => {
      raf = 0;
      if (!query.matches || prefersReducedMotion()) {
        box.dataset.linked = 'false';
        track.style.removeProperty('--shift');
        return;
      }
      box.dataset.linked = 'true';
      // Starts once the whole strip is on screen, ends as it reaches the header.
      const rect = box.getBoundingClientRect();
      const start = window.innerHeight - rect.height;
      const run = Math.min(1, Math.max(0, (start - rect.top) / Math.max(200, start - 96)));
      const max = Math.max(0, track.scrollWidth - box.clientWidth);
      track.style.setProperty('--shift', `${(-run * max).toFixed(1)}px`);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    query.addEventListener('change', schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      query.removeEventListener('change', schedule);
    };
  }, []);

  const price = terms.today ? (
    <p className='dub-price'>
      <strong>{terms.today}</strong> <s>{terms.regular}</s> first payment
    </p>
  ) : (
    <p className='dub-price'>
      <strong>{terms.regular}</strong> cancel anytime
    </p>
  );

  return (
    <div className='dub' ref={root}>
      {creator && offer.discountPercent ? (
        <div className='dub-ribbon'>
          {creator.avatarUrl ? (
            <img src={creator.avatarUrl} alt='' className='dub-avatar' />
          ) : (
            <span className='dub-avatar' aria-hidden='true'>
              {initials(creator.name)}
            </span>
          )}
          <p>
            <strong>{creator.name}</strong> picked this app for you
          </p>
          <span className='dub-ribbon-deal'>−{offer.discountPercent}% today</span>
        </div>
      ) : null}

      <header ref={header} className='dub-header' data-stuck={headerStuck} data-tone={headerTone}>
        <div className='dub-header-backdrop' aria-hidden='true'>
          <ProgressiveBlur layers={6} maxBlur={18} />
          <div className='dub-header-tint dub-header-tint-dark' />
          <div className='dub-header-tint dub-header-tint-light' />
        </div>
        <div className='dub-wrap dub-header-row'>
          <a href='#top' className='dub-brand'>
            <img src={APP.iconUrl} alt='' width={34} height={34} />
            {APP.name}
          </a>
          <span className='dub-header-tc' aria-hidden='true'>
            <i className='dub-rec' />
            <Timecode className='dub-tc' />
            <span className='dub-header-scene'>{scene}</span>
          </span>
          <button type='button' className='dub-btn dub-btn-header' onClick={onStart}>
            <PlayMark />
            Dub a video
          </button>
        </div>
      </header>

      <main id='top'>
        <section className='dub-hero' data-header='dark' data-scene='Opening'>
          <DubHero />
          <div className='dub-wrap dub-hero-offer'>
            <p className='dub-lead'>
              Upload a video and pick a language. Dub AI translates it in your own voice, matches your lips to the new
              words and adds subtitles.
            </p>
            <div className='dub-hero-buy'>
              {price}
              <button ref={heroCta} type='button' className='dub-btn' onClick={onStart}>
                <PlayMark />
                Dub my first video
              </button>
              <p className='dub-terms'>{terms.terms}</p>
            </div>
            <ul className='dub-proof'>
              <li>Keeps your own voice</li>
              <li>Lips matched to the new audio</li>
              <li>Subtitles in one click</li>
            </ul>
          </div>
        </section>

        <section
          className='dub-section dub-bay-section'
          data-header='dark'
          data-scene='Sc. 01 · The dub'
          aria-labelledby='dub-bay-title'
        >
          <div className='dub-wrap'>
            <Scene
              no='01'
              name='The dub'
              id='dub-bay-title'
              title='Same take. New language.'
              lead='Pick a language and watch one clip get dubbed: translated, spoken in the same voice, lips matched, subtitles on.'
            />
            <div data-reveal=''>
              <DubBay>
                <ul className='dub-notes'>
                  <li className='is-voice'>
                    <h3>Your own voice</h3>
                    <p>Dub AI keeps the unique sound of your voice while you speak a new language.</p>
                  </li>
                  <li className='is-lips'>
                    <h3>Lips in sync</h3>
                    <p>Your lip movements are matched to the translated audio, for a natural result.</p>
                  </li>
                  <li className='is-subs'>
                    <h3>Subtitles in one click</h3>
                    <p>Captions make your video easier to follow and help it reach a broader audience.</p>
                  </li>
                </ul>
                <p className='dub-note'>Example clip. Tap a language to dub it again.</p>
              </DubBay>
            </div>
          </div>
        </section>

        <section
          className='dub-section dub-reel-section'
          data-header='dark'
          data-scene='Sc. 02 · On location'
          aria-labelledby='dub-reel-title'
        >
          <div className='dub-wrap'>
            <Scene
              no='02'
              name='On location'
              id='dub-reel-title'
              title='Made for anyone who talks to a camera.'
              lead='Dub AI is built for content creators, educators and business teams, and it works just as well for the videos you send home.'
            />
          </div>
          <div ref={reel} className='dub-reel' data-reveal=''>
            <div ref={reelTrack} className='dub-reel-track'>
              {USE_CASES.map((item) => (
                <figure key={item.who} className='dub-reel-item'>
                  <div className='dub-film'>
                    <span className='dub-film-edge' aria-hidden='true'>
                      {item.from} › {item.to} · Example
                    </span>
                    <span className='dub-film-frame'>
                      <img src={photo(item.photo, 1080, 452)} alt='' loading='lazy' width={1080} height={452} />
                      <span className='dub-film-sub' lang={item.lang}>
                        {item.subtitle}
                      </span>
                    </span>
                  </div>
                  <figcaption>
                    <h3>{item.who}</h3>
                    <p>
                      <strong>{item.title}.</strong> {item.text}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className='dub-section dub-board-section' data-scene='Sc. 03 · Storyboard' aria-labelledby='dub-board-title'>
          <div className='dub-wrap'>
            <Scene
              no='03'
              name='Storyboard'
              id='dub-board-title'
              title='Four shots to a finished dub.'
              lead='Upload your video, select a language and let Dub AI handle the translation, the lip-sync and the subtitles.'
            />
            <ol className='dub-boards'>
              {STEPS.map((item, i) => (
                <li key={item.title} className='dub-board' data-reveal='' style={delay(i * 110)}>
                  <span className='dub-board-frame'>
                    <img
                      src={SCREENSHOTS[item.shot]}
                      alt={`${APP.name} screenshot: ${item.title}`}
                      loading='lazy'
                      width={300}
                      height={649}
                    />
                    <span className='dub-board-no' aria-hidden='true'>
                      {i + 1}
                    </span>
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </li>
              ))}
            </ol>
            <div className='dub-board-foot'>
              <button type='button' className='dub-btn' onClick={onStart}>
                <PlayMark />
                Dub my first video
              </button>
              <p>Screens from the App Store listing.</p>
            </div>
          </div>
        </section>

        <section
          className='dub-section dub-faq-section'
          data-header='dark'
          data-scene='Sc. 04 · Subtitles'
          aria-labelledby='dub-faq-title'
        >
          <div className='dub-wrap'>
            <Scene no='04' name='Subtitles' id='dub-faq-title' title='Questions, with subtitles.' />
            <dl className='dub-cues'>
              {FAQ.map((item, i) => (
                <div key={item.question} className='dub-cue' data-reveal='' style={delay((i % 2) * 90)}>
                  <span className='dub-cue-time' aria-hidden='true'>
                    <b>{i + 1}</b>
                    {cueTime(i)}
                  </span>
                  <dt>{item.question}</dt>
                  <dd>{item.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className='dub-end' data-header='dark' data-scene='End credits' aria-labelledby='dub-end-title'>
          <div className='dub-roll'>
            <div className='dub-roll-track'>
              {[0, 1].map((copy) => (
                <div key={copy} className='dub-roll-set' aria-hidden={copy === 1 ? true : undefined}>
                  <p className='dub-roll-title'>{APP.name}</p>
                  <dl className='dub-credits'>
                    {CREDITS.map((credit) => (
                      <div key={credit.role}>
                        <dt>{credit.role}</dt>
                        <dd>
                          {credit.names.map((name) => (
                            <span key={name}>{name}</span>
                          ))}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </div>

          <div className='dub-wrap dub-card' data-reveal=''>
            <img src={APP.iconUrl} alt='' width={76} height={76} className='dub-card-icon' />
            <h2 id='dub-end-title' className='dub-card-title'>
              <span>Starring you,</span> <span>in any language.</span>
            </h2>
            {price}
            <button type='button' className='dub-btn' onClick={onStart}>
              <PlayMark />
              Dub my first video
            </button>
            <p className='dub-terms'>{terms.terms}</p>
          </div>
        </section>
      </main>

      <footer className='dub-footer' data-header='dark'>
        <div className='dub-wrap dub-footer-in'>
          <p>
            {APP.fullName} is developed by {APP.legalName} Videos and subtitles on this page are examples. Payment
            details are processed securely by our payment provider. Photos: Unsplash.
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

      <div ref={dock} className={showDock ? 'dub-dock is-visible' : 'dub-dock'} aria-hidden={!showDock}>
        <span className='dub-dock-scrub' />
        <img src={APP.iconUrl} alt='' width={40} height={40} />
        <span className='dub-dock-text'>
          <strong>{terms.today ?? terms.regular}</strong>
          <small>{terms.today ? `then ${terms.regular}` : 'Cancel anytime'}</small>
        </span>
        <button type='button' className='dub-btn dub-btn-small' onClick={onStart} tabIndex={showDock ? 0 : -1}>
          <PlayMark />
          Dub a video
        </button>
      </div>
    </div>
  );
}
