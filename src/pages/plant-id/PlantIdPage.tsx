import '@fontsource-variable/josefin-sans';
import '@fontsource-variable/nunito-sans';
import '@fontsource-variable/nunito-sans/wght-italic.css';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowRight, Check, Plus, Star, TriangleAlert } from 'lucide-react';
import { Tilt, useReveal } from '../../shared/motion';
import { ProgressiveBlur } from '../../shared/ProgressiveBlur';
import { describeOffer, initials, type LandingProps } from '../../shared/offer';
import { Monstera, SealShape, StageArt, Stamp } from './Botany';
import { CareIcon } from './CareIcon';
import {
  APP,
  FAQ,
  MY_PLANTS,
  PLACES,
  REMINDERS,
  SCREENSHOTS,
  SPOTTED_LEAF,
  SPOTTED_THUMB,
  STEPS,
  photo,
} from './content';
import { PlantScanner } from './PlantScanner';
import './page.css';

/** Order of an element in a staggered sequence; the CSS turns it into a delay. */
const order = (i: number) => ({ '--i': i }) as CSSProperties;
const delay = (ms: number) => ({ '--reveal-delay': `${ms}ms` }) as CSSProperties;

/** Where the twine sags above each of the four tags in "Indoors and out" (px, desktop). */
const PLACE_TWINE = [13, 23, 23, 13];
const PLACE_TILT = [-2.2, 1.4, -1, 2];

type LabelProps = {
  no: number;
  id?: string;
  title: ReactNode;
  /** The italic line under the name, like the Latin name on a herbarium label. */
  line?: ReactNode;
  heading?: 'h2' | 'h3';
  className?: string;
  children?: ReactNode;
};

/** The section heading device: a herbarium specimen label with its number, name and notes. */
function SpecimenLabel({ no, id, title, line, heading: Heading = 'h2', className, children }: LabelProps) {
  return (
    <div className={className ? `pid-label ${className}` : 'pid-label'}>
      <div className='pid-label-head'>
        <span className='pid-label-no' aria-hidden='true'>
          <small>No.</small>
          {no}
        </span>
        <div className='pid-label-name'>
          <Heading id={id} className='pid-label-title'>
            {title}
          </Heading>
          {line ? <p className='pid-label-line'>{line}</p> : null}
        </div>
      </div>
      {children ? <div className='pid-label-notes'>{children}</div> : null}
    </div>
  );
}

/** A strip of paper tape. */
const Tape = ({ className }: { className: string }) => <span className={`pid-tape ${className}`} aria-hidden='true' />;

/** A tiny leaf used as the bullet of label notes. */
const Sprig = () => (
  <svg className='pid-sprig' viewBox='0 0 16 16' aria-hidden='true'>
    <path d='M3 13C3 7 7 3 13 3C13 9 9 13 3 13Z' />
    <path d='M3 13L9 7' />
  </svg>
);

export function PlantIdPage({ offer, creator, onStart }: LandingProps) {
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
    <p className='pid-price'>
      <strong>{terms.today ?? terms.regular}</strong>
      {terms.today ? (
        <>
          {' '}
          <s>{terms.regular}</s> <span>first payment</span>
        </>
      ) : null}
    </p>
  );

  return (
    <div className='pid' ref={root}>
      {creator && offer.discountPercent ? (
        <div className='pid-ribbon'>
          {creator.avatarUrl ? (
            <img src={creator.avatarUrl} alt='' className='pid-avatar' />
          ) : (
            <span className='pid-avatar' aria-hidden='true'>
              {initials(creator.name)}
            </span>
          )}
          <p>
            <strong>{creator.name}</strong> picked this app for you
          </p>
          <span className='pid-ribbon-deal'>−{offer.discountPercent}% today</span>
        </div>
      ) : null}

      <header ref={header} className='pid-header' data-stuck={headerStuck} data-tone={headerTone}>
        <div className='pid-header-backdrop' aria-hidden='true'>
          <ProgressiveBlur layers={6} maxBlur={18} />
          <div className='pid-header-tint pid-header-tint-light' />
          <div className='pid-header-tint pid-header-tint-dark' />
        </div>
        <div className='pid-wrap pid-header-row'>
          <a href='#top' className='pid-nametag'>
            <span className='pid-nametag-shape'>
              <img src={APP.iconUrl} alt='' width={30} height={30} />
              <span className='pid-nametag-text'>
                <strong>{APP.name}</strong>
                <small>Care &amp; Health</small>
              </span>
            </span>
          </a>
          <button type='button' className='pid-header-cta' onClick={onStart}>
            <span>Get the app</span>
          </button>
        </div>
      </header>

      <main id='top'>
        {/* ---------- Hero: a seed packet ---------- */}
        <section className='pid-hero' data-header='dark'>
          <Monstera className='pid-hero-leaf pid-hero-leaf-a' />
          <Monstera className='pid-hero-leaf pid-hero-leaf-b' />
          <div className='pid-wrap pid-hero-grid'>
            <article className='pid-packet' aria-labelledby='pid-hero-title'>
              <div className='pid-packet-face'>
                <p className='pid-packet-band'>
                  <span>{APP.name}</span>
                  <span>Care &amp; Health</span>
                </p>
                <h1 id='pid-hero-title' className='pid-packet-title'>
                  <span>Snap a leaf.</span> <span>Know the plant.</span>
                </h1>
                <div className='pid-packet-body'>
                  <figure className='pid-window'>
                    <img src={photo('wildflowers', 460, 560, [0.5, 0.62])} alt='' />
                  </figure>
                  <div className='pid-packet-copy'>
                    <p className='pid-lead'>
                      Point your camera at any plant, flower or tree. Get its name in seconds, a health check
                      for diseases and reminders to water, mist and fertilize.
                    </p>
                    <dl className='pid-specs'>
                      <div>
                        <dt>plant species</dt>
                        <dd>30,000+</dd>
                      </div>
                      <div>
                        <dt>from photo to name</dt>
                        <dd>Seconds</dd>
                      </div>
                      <div>
                        <dt>{APP.ratingCount} App Store ratings</dt>
                        <dd>
                          {APP.rating}
                          <Star size={17} fill='currentColor' strokeWidth={0} aria-label='stars' />
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
              <div className='pid-flap'>
                {price}
                <button ref={heroCta} type='button' className='pid-cta' onClick={onStart}>
                  <span>Start identifying</span>
                  <ArrowRight size={20} strokeWidth={2.4} />
                </button>
                <p className='pid-terms'>{terms.terms}</p>
              </div>
            </article>

            <div className='pid-hero-demo'>
              <PlantScanner />
            </div>
          </div>
        </section>

        {/* ---------- Specimen sheets: identify, diagnose, care ---------- */}
        <section className='pid-folios' aria-label='What the app does'>
          <div className='pid-wrap'>
            <article className='pid-folio' aria-labelledby='pid-no1'>
              <div className='pid-folio-specimen' data-reveal=''>
                <figure className='pid-print pid-id-card'>
                  <Tape className='pid-tape-tl' />
                  <Tape className='pid-tape-br' />
                  <img src={photo('clover', 720, 600, [0.62, 0.6])} alt='' loading='lazy' />
                  <span className='pid-id-brackets' aria-hidden='true'>
                    <i />
                    <i />
                    <i />
                    <i />
                  </span>
                  <figcaption className='pid-chip pid-chip-static'>
                    <img className='pid-thumb' src={photo('clover', 120, 120, [0.62, 0.62])} alt='' />
                    <span>
                      <strong>Red clover</strong>
                      <small>Trifolium pratense</small>
                    </span>
                  </figcaption>
                  <span className='pid-example'>Example</span>
                </figure>
              </div>
              <div className='pid-folio-side' data-reveal='' style={delay(120)}>
                <Stamp id='pid-stamp-1' label='IDENTIFY' no={1} />
                <SpecimenLabel no={1} id='pid-no1' title='What plant is this?' line='Plants, flowers, trees and leaves'>
                  <p>
                    Snap it, or pick a photo from your gallery. You get its name and plant information in seconds,
                    for houseplants and outdoor finds alike.
                  </p>
                  <ul className='pid-facts'>
                    <li><Sprig />Over 30,000 species</li>
                    <li><Sprig />Camera or gallery</li>
                  </ul>
                </SpecimenLabel>
              </div>
            </article>

            <article className='pid-folio pid-folio-flip' aria-labelledby='pid-no2'>
              <div className='pid-folio-specimen' data-reveal=''>
                <div className='pid-dx'>
                  <div className='pid-print pid-dx-print'>
                    <Tape className='pid-tape-tr' />
                    <div
                      className='pid-dx-photo'
                      style={SPOTTED_LEAF}
                      role='img'
                      aria-label='A leaf with dark spots, from the app’s own screenshot'
                    />
                  </div>
                  <div className='pid-dx-card'>
                    <div className='pid-dx-head'>
                      <span className='pid-thumb' style={SPOTTED_THUMB} aria-hidden='true' />
                      <span>
                        <strong>
                          <TriangleAlert size={15} strokeWidth={2.6} /> Disease found
                        </strong>
                        <small>Alternaria</small>
                      </span>
                    </div>
                    <ol className='pid-dx-steps'>
                      <li>Remove the spotted leaves</li>
                      <li>Water the soil, keep leaves dry</li>
                      <li>Give it more air and light</li>
                    </ol>
                    <span className='pid-dx-note'>Example. The app’s own sample diagnosis.</span>
                  </div>
                </div>
              </div>
              <div className='pid-folio-side' data-reveal='' style={delay(120)}>
                <Stamp id='pid-stamp-2' label='DIAGNOSE' no={2} />
                <SpecimenLabel no={2} id='pid-no2' title='Why are the leaves spotting?' line='A health check from one photo'>
                  <p>
                    Snap the leaf that looks off. The built-in disease identifier checks the photo for common plant
                    diseases and gives you care recommendations to act on.
                  </p>
                  <ul className='pid-facts'>
                    <li><Sprig />Common plant diseases</li>
                    <li><Sprig />Expert care recommendations</li>
                  </ul>
                </SpecimenLabel>
              </div>
            </article>

            <article className='pid-folio' aria-labelledby='pid-no3'>
              <div className='pid-folio-specimen' data-reveal=''>
                <div className='pid-rem'>
                  <figure className='pid-print pid-rem-print'>
                    <Tape className='pid-tape-tl' />
                    <img src={photo('watering', 600, 720, [0.55, 0.4])} alt='' loading='lazy' />
                  </figure>
                  <div className='pid-rem-card'>
                    <div className='pid-tabs' aria-hidden='true'>
                      <span>Plants</span>
                      <span>Snap History</span>
                      <span className='is-on'>Reminders</span>
                    </div>
                    <p className='pid-rem-day'>
                      Today <span>Example</span>
                    </p>
                    <ul>
                      {REMINDERS.map((item, i) => (
                        <li key={item.label} style={order(i)}>
                          <CareIcon tone={item.tone} size={15} />
                          <span>
                            <strong>{item.label}</strong>
                            <small>
                              {item.plant} · {item.every}
                            </small>
                          </span>
                          <span className='pid-rem-check' aria-hidden='true'>
                            <Check size={13} strokeWidth={3.2} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className='pid-rem-toast' aria-hidden='true'>
                    <img src={APP.iconUrl} alt='' />
                    <span>
                      <strong>Misting</strong>
                      <small>Your Snake Plant is due today.</small>
                    </span>
                  </div>
                </div>
              </div>
              <div className='pid-folio-side' data-reveal='' style={delay(120)}>
                <Stamp id='pid-stamp-3' label='CARE' no={3} />
                <SpecimenLabel no={3} id='pid-no3' title='When do I water it again?' line='Water, mist, fertilize'>
                  <p>
                    Set reminders to water, mist and fertilize each plant on its own schedule. Your phone nudges you
                    on the day, so nothing dries out while you’re busy.
                  </p>
                  <ul className='pid-facts'>
                    <li><Sprig />Watering and fertilizing advice</li>
                    <li><Sprig />Reminders with notifications</li>
                  </ul>
                </SpecimenLabel>
              </div>
            </article>
          </div>
        </section>

        {/* ---------- Indoors and out: plant tags on a twine ---------- */}
        <section className='pid-places' data-header='dark' aria-labelledby='pid-places-title'>
          <div className='pid-wrap'>
            <SpecimenLabel
              no={4}
              id='pid-places-title'
              className='pid-label-wide'
              title='From the windowsill to the hiking trail.'
              line='Houseplants, herbs, flowers, trees and wild plants'
            />
          </div>
          <div className='pid-line-scroll'>
            <div className='pid-line'>
              <svg className='pid-line-twine' viewBox='0 0 100 48' preserveAspectRatio='none' aria-hidden='true'>
                <path d='M0 4Q50 44 100 4' />
              </svg>
              {PLACES.map((place, i) => (
                <figure
                  key={place.title}
                  className='pid-hang'
                  data-reveal=''
                  style={{ ...delay(i * 110), '--ty': `${PLACE_TWINE[i]}px`, '--tilt': `${PLACE_TILT[i]}deg` } as CSSProperties}
                >
                  <div className='pid-hang-tag'>
                    <img src={photo(place.photo, 480, 400, place.focus)} alt='' loading='lazy' />
                    <figcaption>
                      <h3>{place.title}</h3>
                      <em>{place.latin}</em>
                      <p>{place.text}</p>
                    </figcaption>
                  </div>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- How it works: three growth stages over a soil line ---------- */}
        <section className='pid-growth' data-header='dark' aria-labelledby='pid-growth-title'>
          <div className='pid-wrap'>
            <SpecimenLabel
              no={5}
              id='pid-growth-title'
              className='pid-label-center'
              title='Snap. Learn. Grow.'
              line='From the first photo to a care routine'
            />
            <ol className='pid-stages'>
              {STEPS.map((step, i) => (
                <li key={step.title} className='pid-stage' data-reveal='' style={delay(i * 160)}>
                  <span className='pid-stage-art'>
                    <StageArt stage={i} />
                    <span className='pid-stage-no' aria-hidden='true'>
                      <span>{i + 1}</span>
                    </span>
                  </span>
                  <div className='pid-stage-text'>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- My Plants ---------- */}
        <section className='pid-collection' aria-labelledby='pid-garden-title'>
          <div className='pid-wrap pid-collection-grid'>
            <div className='pid-collection-visual' data-reveal=''>
              <figure className='pid-arch'>
                <img src={photo('livingRoom', 760, 920)} alt='' loading='lazy' />
              </figure>
              <Tilt className='pid-garden-card' max={4}>
                <Tape className='pid-tape-top' />
                <p className='pid-garden-card-title'>My Plants</p>
                <div className='pid-tabs' aria-hidden='true'>
                  <span className='is-on'>Plants</span>
                  <span>Snap History</span>
                  <span>Reminders</span>
                </div>
                <ul>
                  {MY_PLANTS.map((plant, i) => (
                    <li key={plant.name} style={order(i)}>
                      <span className='pid-garden-thumb' style={plant.thumb} aria-hidden='true' />
                      <span className='pid-garden-name'>
                        <strong>{plant.name}</strong>
                        <small>{plant.latin}</small>
                        <span className='pid-garden-care'>
                          {plant.care.map((tone) => (
                            <CareIcon key={tone} tone={tone} size={11} />
                          ))}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                <span className='pid-garden-add' aria-hidden='true'>
                  <Plus size={20} strokeWidth={2.6} />
                </span>
              </Tilt>
            </div>
            <div className='pid-collection-copy' data-reveal='' style={delay(120)}>
              <SpecimenLabel no={6} id='pid-garden-title' title='Every plant you own, in one place.' line='My Plants, your virtual garden'>
                <p>
                  Save what you identify to My Plants and keep the whole collection, indoors or outdoors, on one
                  screen.
                </p>
                <ul className='pid-facts'>
                  <li><Sprig /><span><strong>Care notes and custom reminders</strong> for each plant</span></li>
                  <li><Sprig /><span><strong>Snap history</strong> of everything you’ve identified</span></li>
                  <li><Sprig /><span><strong>Care guides</strong>, beginner advice and expert articles</span></li>
                </ul>
              </SpecimenLabel>
              <button type='button' className='pid-cta' onClick={onStart}>
                <span>Start my garden</span>
                <ArrowRight size={20} strokeWidth={2.4} />
              </button>
            </div>
          </div>
        </section>

        {/* ---------- Screenshots, mounted like pressed specimens ---------- */}
        <section className='pid-pressed' aria-labelledby='pid-shots-title'>
          <div className='pid-wrap'>
            <SpecimenLabel
              no={7}
              id='pid-shots-title'
              className='pid-label-wide'
              title='Inside the app, screen by screen.'
              line='The five App Store screenshots'
            />
          </div>
          <div className='pid-mounts' tabIndex={0} aria-label='App screenshots'>
            {SCREENSHOTS.map((item, i) => (
              <figure key={item.url} className='pid-mount' data-reveal='' style={delay(i * 90)}>
                <Tape className='pid-tape-top' />
                <img src={item.url} alt={item.alt} loading='lazy' width={600} height={1298} />
                <figcaption>
                  <b>{String.fromCharCode(97 + i)}.</b> {item.note}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* ---------- FAQ: the back of the packet ---------- */}
        <section className='pid-faq-section' data-header='dark' aria-labelledby='pid-faq-title'>
          <div className='pid-wrap'>
            <div className='pid-back' data-reveal=''>
              <span className='pid-back-flap' aria-hidden='true' />
              <div className='pid-back-head'>
                <span className='pid-label-no' aria-hidden='true'>
                  <small>No.</small>8
                </span>
                <div>
                  <h2 id='pid-faq-title'>Growing instructions</h2>
                  <p>Before you snap your first plant.</p>
                </div>
              </div>
              <dl className='pid-instructions'>
                {FAQ.map((item, i) => (
                  <div key={item.question}>
                    <dt>
                      <span>{i + 1}.</span>
                      {item.question}
                    </dt>
                    <dd>{item.answer}</dd>
                  </div>
                ))}
              </dl>
              <p className='pid-back-foot'>
                <span><b>Snap from</b> camera or gallery</span>
                <span><b>Grows on</b> iPhone, iOS 15.0 or later</span>
                <span><b>Cancel</b> anytime</span>
              </p>
            </div>
          </div>
        </section>

        {/* ---------- Final call: a packet ready to plant, sealed with the button ---------- */}
        <section className='pid-final' aria-labelledby='pid-final-title'>
          <span className='pid-seeds' aria-hidden='true'>
            {Array.from({ length: 9 }, (_, i) => (
              <i key={i} style={order(i)} />
            ))}
          </span>
          <div className='pid-wrap'>
            <article className='pid-packet pid-packet-final' data-reveal=''>
              <div className='pid-packet-face'>
                <p className='pid-packet-band'>
                  <span>{APP.name}</span>
                  <span>Care &amp; Health</span>
                </p>
                <figure className='pid-window pid-window-icon'>
                  <img src={APP.iconUrl} alt='' width={200} height={200} loading='lazy' />
                </figure>
                <h2 id='pid-final-title' className='pid-packet-title'>
                  Ready to plant.
                </h2>
                <p className='pid-final-lead'>Name them, check on them and never miss a watering again.</p>
                {price}
              </div>
              <div className='pid-flap pid-flap-sealed'>
                <button type='button' className='pid-seal' onClick={onStart}>
                  <SealShape />
                  <span className='pid-seal-text'>
                    Start
                    <br />
                    identifying
                    <ArrowRight size={18} strokeWidth={2.6} />
                  </span>
                </button>
                <p className='pid-terms'>{terms.terms}</p>
              </div>
            </article>
          </div>
        </section>
      </main>

      <footer className='pid-footer' data-header='dark'>
        <div className='pid-wrap pid-footer-row'>
          <p>
            {APP.fullName} is developed by {APP.legalName} Plant names, diagnoses and care values on this page are
            examples; results depend on your photo. Payment details are processed securely by our payment provider.
            Photos: Unsplash and the app’s App Store screenshots.
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

      <div className={showDock ? 'pid-dock is-visible' : 'pid-dock'} aria-hidden={!showDock}>
        <div className='pid-dock-tag'>
          <img src={APP.iconUrl} alt='' width={40} height={40} />
          <span className='pid-dock-text'>
            <strong>{terms.today ?? terms.regular}</strong>
            <small>{terms.today ? `then ${terms.regular}` : 'cancel anytime'}</small>
          </span>
          <button type='button' className='pid-cta pid-cta-small' onClick={onStart} tabIndex={showDock ? 0 : -1}>
            <span className='pid-dock-long'>Start identifying</span>
            <span className='pid-dock-short'>Start</span>
          </button>
        </div>
      </div>
    </div>
  );
}
