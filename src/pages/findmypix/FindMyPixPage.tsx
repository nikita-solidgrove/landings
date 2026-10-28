import '@fontsource-variable/space-grotesk';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { useReveal } from '../../shared/motion';
import { ProgressiveBlur } from '../../shared/ProgressiveBlur';
import { describeOffer, initials, type LandingProps } from '../../shared/offer';
import { ContactSheet, FilmStrip } from './ContactSheet';
import { APP, FAQ, FINAL_SHEET, FRAMES, PRIVACY, PROOF, REASONS, STEPS, WHY_STRIP, photo } from './content';
import { FaceSearchDemo } from './FaceSearchDemo';
import { GreaseArrow, GreaseLoop } from './Grease';
import './page.css';

const delay = (ms: number) => ({ '--reveal-delay': `${ms}ms` }) as CSSProperties;
const PRIVACY_FRAMES = ['23A', '24', '24A'];

type Frame = { no: string; name: string };

/** Section frame number printed beside the heading, like the edge print on film. */
function Heading({ id, frame, lead, children }: { id: string; frame: string; lead?: ReactNode; children: ReactNode }) {
  return (
    <div className='fmp-head' data-reveal=''>
      <h2 id={id} className='fmp-h2'>
        <span className='fmp-fno' aria-hidden='true'>
          {frame}
          <i>▸</i>
        </span>
        <span className='fmp-h2-text'>{children}</span>
      </h2>
      {lead ? <p className='fmp-head-lead'>{lead}</p> : null}
    </div>
  );
}

const sectionFrame = (frame: Frame) => ({ 'data-frame': frame.no, 'data-frame-name': frame.name });

export function FindMyPixPage({ offer, creator, onStart }: LandingProps) {
  const root = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);
  const heroCta = useRef<HTMLButtonElement>(null);
  const [showDock, setShowDock] = useState(false);
  const [headerStuck, setHeaderStuck] = useState(false);
  const [headerTone, setHeaderTone] = useState<'light' | 'dark'>('light');
  const [frame, setFrame] = useState<Frame>(FRAMES.hero);
  const terms = describeOffer(offer);

  useReveal(root);

  useEffect(() => {
    // The tint shows once content scrolls under the header (the creator ribbon scrolls away first),
    // turns dark with light text over sections marked data-header="dark", and the frame counter
    // shows the number of the section under the header.
    const onScroll = () => {
      const box = header.current?.getBoundingClientRect();
      if (!box) return;
      setHeaderStuck(window.scrollY > 4 && box.top <= 0);
      const under = document.elementFromPoint(window.innerWidth / 2, box.bottom + 1);
      setHeaderTone(under?.closest('[data-header="dark"]') ? 'dark' : 'light');
      const section = under?.closest<HTMLElement>('[data-frame]');
      const no = section?.dataset.frame;
      if (no) setFrame((prev) => (prev.no === no ? prev : { no, name: section.dataset.frameName ?? '' }));
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

  const price = terms.today ? (
    <p className='fmp-price'>
      <strong>{terms.today}</strong> <s>{terms.regular}</s> today
    </p>
  ) : null;

  return (
    <div className='fmp' ref={root}>
      {creator && offer.discountPercent ? (
        <div className='fmp-ribbon'>
          {creator.avatarUrl ? (
            <img src={creator.avatarUrl} alt='' className='fmp-avatar' />
          ) : (
            <span className='fmp-avatar' aria-hidden='true'>
              {initials(creator.name)}
            </span>
          )}
          <p>
            <strong>{creator.name}</strong> picked this app for you
          </p>
          <span className='fmp-ribbon-deal'>−{offer.discountPercent}% today</span>
        </div>
      ) : null}

      <header ref={header} className='fmp-header' data-stuck={headerStuck} data-tone={headerTone}>
        <div className='fmp-header-backdrop' aria-hidden='true'>
          <ProgressiveBlur layers={6} maxBlur={18} />
          <div className='fmp-header-tint fmp-header-tint-light' />
          <div className='fmp-header-tint fmp-header-tint-dark' />
        </div>
        <div className='fmp-wrap fmp-header-row'>
          <a href='#top' className='fmp-identity'>
            <img src={APP.iconUrl} alt='' width={30} height={30} />
            <span>{APP.name}</span>
          </a>
          <div className='fmp-run' aria-hidden='true'>
            <span className='fmp-counter-group'>
              <span className='fmp-counter'>
                <span key={frame.no} className='fmp-counter-no'>
                  {frame.no}
                </span>
                <small>/36</small>
              </span>
              <span className='fmp-counter-name'>{frame.name}</span>
            </span>
          </div>
          <button type='button' className='fmp-header-cta' onClick={onStart}>
            Find my photos
          </button>
        </div>
      </header>

      <main id='top'>
        <section className='fmp-hero' {...sectionFrame(FRAMES.hero)} aria-labelledby='fmp-hero-title'>
          <ContactSheet />
          <div className='fmp-wrap fmp-hero-inner'>
            <div className='fmp-card'>
              <h1 id='fmp-hero-title' className='fmp-h1'>
                See where{' '}
                <span className='fmp-circled'>
                  your face
                  <GreaseLoop seed={11} ratio={3.4} className='fmp-circled-loop' />
                </span>{' '}
                shows up online.
              </h1>
              <p className='fmp-lead'>
                Upload a selfie or portrait. {APP.name} searches publicly available sources for photos with your face
                and shows you the page each one is on.
              </p>
              <div className='fmp-offer'>
                {price}
                <button ref={heroCta} type='button' className='fmp-cta' onClick={onStart}>
                  Find my photos
                  <ArrowRight size={20} strokeWidth={2.25} />
                </button>
                <p className='fmp-terms'>{terms.terms}</p>
              </div>
              <ul className='fmp-proof'>
                {PROOF.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className='fmp-sec fmp-search' {...sectionFrame(FRAMES.search)} aria-labelledby='fmp-search-title'>
          <div className='fmp-wrap'>
            <Heading
              id='fmp-search-title'
              frame={FRAMES.search.no}
              lead='FindMyPix reads your face, searches publicly available sources and lists what it finds. Every match comes with a similarity score and the page it was found on.'
            >
              One selfie in. Matches out, each with its source.
            </Heading>
            <div data-reveal='' style={delay(120)}>
              <FaceSearchDemo />
            </div>
          </div>
        </section>

        <section className='fmp-sec fmp-why' {...sectionFrame(FRAMES.why)} aria-labelledby='fmp-why-title'>
          <div className='fmp-wrap'>
            <Heading
              id='fmp-why-title'
              frame={FRAMES.why.no}
              lead={`Your photos travel: friends post them, pages repost them. ${APP.name} helps you see where your face turns up.`}
            >
              Curious, cautious or just keeping track.
            </Heading>
          </div>
          <div className='fmp-why-stage'>
            <FilmStrip shots={WHY_STRIP} first={14} lazy className='fmp-why-strip' />
            <ol className='fmp-wrap fmp-why-list'>
              {REASONS.map((item, i) => (
                <li key={item.title} className='fmp-why-item' data-reveal='' style={delay(i * 120)}>
                  <div className='fmp-lens'>
                    <img src={photo(item.photo, 520, 520)} alt='' loading='lazy' />
                  </div>
                  <div className='fmp-why-text'>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className='fmp-sec fmp-how' {...sectionFrame(FRAMES.how)} aria-labelledby='fmp-how-title'>
          <div className='fmp-wrap'>
            <Heading
              id='fmp-how-title'
              frame={FRAMES.how.no}
              lead={`The app’s own screens, in order. No external websites involved: you search right in ${APP.name}.`}
            >
              From one photo to the pages it is on.
            </Heading>
            <ol className='fmp-prints'>
              {STEPS.map((step, i) => (
                <li key={step.title} className='fmp-print' data-reveal='' style={delay(i * 120)}>
                  <figure className='fmp-print-photo'>
                    <img
                      src={step.screen}
                      alt={`${APP.name} screen: ${step.title}`}
                      loading='lazy'
                      width={300}
                      height={649}
                    />
                  </figure>
                  <span className='fmp-print-no'>
                    Step {i + 1}
                    <i aria-hidden='true'>▸</i>
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                  {i < STEPS.length - 1 ? (
                    <GreaseArrow
                      width={76}
                      height={44}
                      from={[6, 30]}
                      to={[70, 15]}
                      bend={-11}
                      className='fmp-print-arrow'
                      style={{ '--draw-delay': '0.55s' } as CSSProperties}
                    />
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          className='fmp-privacy'
          data-header='dark'
          {...sectionFrame(FRAMES.privacy)}
          aria-labelledby='fmp-privacy-title'
        >
          <div className='fmp-wrap fmp-privacy-row'>
            <div className='fmp-privacy-cell fmp-privacy-head' data-reveal=''>
              <h2 id='fmp-privacy-title' className='fmp-h2'>
                <span className='fmp-fno' aria-hidden='true'>
                  {FRAMES.privacy.no}
                  <i>▸</i>
                </span>
                <span className='fmp-h2-text'>Built to protect your privacy.</span>
              </h2>
            </div>
            {PRIVACY.map((item, i) => (
              <div key={item.title} className='fmp-privacy-cell' data-reveal='' style={delay(100 + i * 110)}>
                <span className='fmp-privacy-no' aria-hidden='true'>
                  {PRIVACY_FRAMES[i]}
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className='fmp-sec fmp-faq-sec' {...sectionFrame(FRAMES.faq)} aria-labelledby='fmp-faq-title'>
          <div className='fmp-wrap'>
            <Heading id='fmp-faq-title' frame={FRAMES.faq.no}>
              Before your first search.
            </Heading>
            <div className='fmp-sleeve' data-reveal='' style={delay(100)}>
              <div className='fmp-sleeve-holes' aria-hidden='true'>
                <span />
                <span />
                <span />
              </div>
              <div className='fmp-pockets'>
                {FAQ.map((item, i) => (
                  <details key={item.question} className='fmp-pocket' open={i === 0}>
                    <summary>
                      <span className='fmp-pocket-no' aria-hidden='true'>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span>{item.question}</span>
                      <Plus size={20} className='fmp-pocket-icon' aria-hidden='true' />
                    </summary>
                    <div className='fmp-pocket-strip'>
                      <p>{item.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className='fmp-final' {...sectionFrame(FRAMES.final)} aria-labelledby='fmp-final-title'>
          <div className='fmp-wrap fmp-final-grid fmp-develops' data-reveal=''>
            <div className='fmp-final-sheet' aria-hidden='true'>
              {FINAL_SHEET.map((shots, si) => (
                <FilmStrip key={si} shots={shots} first={22 + si * shots.length} lazy />
              ))}
            </div>
            <GreaseArrow
              width={96}
              height={150}
              from={[6, 8]}
              to={[88, 140]}
              bend={-22}
              className='fmp-final-arrow'
            />
            <div className='fmp-final-cta'>
              <GreaseArrow
                width={70}
                height={180}
                from={[54, 4]}
                to={[18, 172]}
                bend={-18}
                className='fmp-final-arrow-down'
                style={{ '--draw-delay': '1.5s' } as CSSProperties}
              />
              <h2 id='fmp-final-title' className='fmp-h2'>
                <span className='fmp-fno' aria-hidden='true'>
                  {FRAMES.final.no}
                  <i>▸</i>
                </span>
                <span className='fmp-h2-text'>One selfie is all it takes.</span>
              </h2>
              <p>See where your face shows up in photos that are publicly available online.</p>
              {price ?? <p className='fmp-price' aria-hidden='true' />}
              <button type='button' className='fmp-cta' onClick={onStart}>
                Find my photos
                <ArrowRight size={20} strokeWidth={2.25} />
              </button>
              <p className='fmp-terms'>{terms.terms}</p>
            </div>
          </div>
        </section>
      </main>

      <footer className='fmp-footer' data-header='dark'>
        <div className='fmp-wrap fmp-footer-row'>
          <span>
            <strong>{APP.fullName}</strong> is developed by {APP.legalName} Search results shown on this page are
            examples made with stock photos. Payment details are processed securely by our payment provider. Photos:
            Unsplash.
          </span>
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

      <div className={showDock ? 'fmp-dock is-visible' : 'fmp-dock'} aria-hidden={!showDock}>
        <img src={APP.iconUrl} alt='' width={42} height={42} />
        <span className='fmp-dock-text'>
          <strong>{terms.today ? `${terms.today} today` : terms.regular}</strong>
          <small>{terms.today ? `then ${terms.regular}` : 'Cancel anytime'}</small>
        </span>
        <button type='button' className='fmp-cta fmp-cta-small' onClick={onStart} tabIndex={showDock ? 0 : -1}>
          Find my photos
        </button>
      </div>
    </div>
  );
}
