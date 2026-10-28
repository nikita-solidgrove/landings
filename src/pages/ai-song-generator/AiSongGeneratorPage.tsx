import { Fragment, useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowRight, ArrowUpRight, Check, Dices, Plus } from 'lucide-react';
import { Tilt, useReveal } from '../../shared/motion';
import { ProgressiveBlur } from '../../shared/ProgressiveBlur';
import { describeOffer, initials, type LandingProps } from '../../shared/offer';
import { APP, FAQ, GENRES, SCREENSHOTS, TICKER_PHOTOS, USE_CASES, photo } from './content';
import { SongDemo } from './SongDemo';
import './page.css';

const SHARE_TARGETS = ['TikTok', 'Reels', 'Shorts', 'Stories'];
const TAGLINES = ['Your words', 'Real music', 'Any vibe', 'Any photo', 'Your voice'];

/** Order of an element in an entrance sequence; the CSS turns it into a delay. */
const order = (i: number) => ({ '--i': i }) as CSSProperties;
const delay = (ms: number) => ({ '--reveal-delay': `${ms}ms` }) as CSSProperties;

export function AiSongGeneratorPage({ offer, creator, onStart }: LandingProps) {
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

  return (
    <div className='asg' ref={root}>
      {creator && offer.discountPercent ? (
        <div className='asg-ribbon'>
          {creator.avatarUrl ? (
            <img src={creator.avatarUrl} alt='' className='asg-avatar' />
          ) : (
            <span className='asg-avatar' aria-hidden='true'>{initials(creator.name)}</span>
          )}
          <p>
            <strong>{creator.name}</strong> picked this app for you
          </p>
          <span className='asg-ribbon-deal'>−{offer.discountPercent}% today</span>
        </div>
      ) : null}

      <header ref={header} className='asg-header' data-stuck={headerStuck} data-tone={headerTone}>
        <div className='asg-header-backdrop' aria-hidden='true'>
          <ProgressiveBlur layers={6} maxBlur={18} />
          <div className='asg-header-tint asg-header-tint-light' />
          <div className='asg-header-tint asg-header-tint-dark' />
        </div>
        <div className='asg-wrap asg-header-row'>
          <a href='#top' className='asg-identity'>
            <img src={APP.iconUrl} alt='' width={40} height={40} />
            <span>
              <strong>{APP.name}</strong>
              <small>by {APP.developer}</small>
            </span>
          </a>
          <button type='button' className='asg-header-cta' onClick={onStart}>
            Make a song
          </button>
        </div>
      </header>

      <main id='top'>
        <section className='asg-hero'>
          <div className='asg-wrap asg-hero-grid'>
            <div className='asg-hero-copy'>
              <h1 className='asg-poster'>
                <span className='asg-line'><span style={order(1)}>Any idea.</span></span>
                <span className='asg-line'>
                  <span style={order(2)}><span className='asg-poster-accent'>A real song.</span></span>
                </span>
                <span className='asg-line'><span style={order(3)}>In under a minute.</span></span>
              </h1>
              <p className='asg-lead asg-intro' style={order(4)}>
                Type your lyrics, describe a vibe or snap a photo. The app writes, composes and sings a finished
                track for you.
              </p>
              <div className='asg-offer asg-intro' style={order(5)}>
                {terms.today ? (
                  <p className='asg-price'>
                    <strong>{terms.today}</strong> <s>{terms.regular}</s> <span>first payment</span>
                  </p>
                ) : null}
                <button ref={heroCta} type='button' className='asg-cta' onClick={onStart}>
                  Make my first song
                  <ArrowRight size={20} strokeWidth={2.5} />
                </button>
                <p className='asg-terms'>{terms.terms}</p>
              </div>
              <ul className='asg-proof asg-intro' style={order(6)}>
                {['No studio', 'No instruments', 'No experience'].map((item) => (
                  <li key={item}>
                    <Check size={16} strokeWidth={3} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className='asg-stage'>
              <div className='asg-vinyl' aria-hidden='true' />
              <figure className='asg-portrait' aria-hidden='true'>
                <img src={photo('listening', 320)} alt='' />
              </figure>
              <div className='asg-float asg-float-a' aria-hidden='true'>
                <img src={photo('sunsetWalk', 220)} alt='' />
                <span>Golden Hour</span>
              </div>
              <div className='asg-float asg-float-b' aria-hidden='true'>
                <img src={photo('journal', 220)} alt='' />
                <span>Napkin Song</span>
              </div>
              <div className='asg-stage-card'>
                <SongDemo />
              </div>
            </div>
          </div>
        </section>

        <div className='asg-ticker' data-header='dark' aria-label={`${GENRES.join(', ')} and more: 30+ genres`}>
          <div className='asg-ticker-row' aria-hidden='true'>
            <div className='asg-ticker-track'>
              {[0, 1].map((copy) => (
                <span key={copy} className='asg-ticker-set'>
                  {GENRES.map((genre, i) => (
                    <Fragment key={genre}>
                      <span className='asg-ticker-word'>{genre}</span>
                      <img className='asg-ticker-photo' src={photo(TICKER_PHOTOS[i % TICKER_PHOTOS.length], 160, 96)} alt='' />
                    </Fragment>
                  ))}
                </span>
              ))}
            </div>
          </div>
          <div className='asg-ticker-row asg-ticker-row-outline' aria-hidden='true'>
            <div className='asg-ticker-track asg-ticker-reverse'>
              {[0, 1, 2].map((copy) => (
                <span key={copy} className='asg-ticker-set'>
                  {TAGLINES.map((line) => (
                    <Fragment key={line}>
                      <span className='asg-ticker-word'>{line}</span>
                      <span className='asg-ticker-star'>✦</span>
                    </Fragment>
                  ))}
                </span>
              ))}
            </div>
          </div>
        </div>

        <section className='asg-section' aria-labelledby='asg-modes-title'>
          <div className='asg-wrap'>
            <div className='asg-section-head' data-reveal=''>
              <span className='asg-kicker'>Three ways in</span>
              <h2 id='asg-modes-title' className='asg-title'>Start a song from anything.</h2>
            </div>

            <div className='asg-modes'>
              <div data-reveal='' style={delay(0)}>
                <Tilt className='asg-sleeve asg-sleeve-violet'>
                  <span className='asg-sleeve-label'>Lyrics mode</span>
                  <h3>Your words, sung.</h3>
                  <p>Paste a poem, a verse or a whole song. Pick a genre, a voice and instruments.</p>
                  <div className='asg-sleeve-art asg-lyrics-art'>
                    <img className='asg-art-photo' src={photo('writing', 480, 360)} alt='' />
                    <div className='asg-paper'>
                      <p>I wrote it on a napkin</p>
                      <p>the night you said goodbye</p>
                      <p>and now I hear it sung</p>
                    </div>
                  </div>
                </Tilt>
              </div>

              <div data-reveal='' style={delay(120)}>
                <Tilt className='asg-sleeve asg-sleeve-coral'>
                  <span className='asg-sleeve-label'>Smart mode</span>
                  <h3>Describe a vibe.</h3>
                  <p>The AI writes the lyrics, composes the melody and produces the track.</p>
                  <div className='asg-sleeve-art asg-bubbles'>
                    <span style={order(0)}>“a hopeful acoustic song about starting over”</span>
                    <span style={order(1)}>“dark trap about city nights”</span>
                    <span className='asg-idea' style={order(2)}><Dices size={16} /> Song Idea</span>
                  </div>
                </Tilt>
              </div>

              <div data-reveal='' style={delay(240)}>
                <Tilt className='asg-sleeve asg-sleeve-ink'>
                  <span className='asg-sleeve-label'>Image mode</span>
                  <h3>Snap a photo. Hear the song.</h3>
                  <p>The AI reads the mood and colors of your picture and makes a track to match.</p>
                  <div className='asg-sleeve-art asg-photo-song'>
                    <span className='asg-polaroid'>
                      <img src={photo('sunsetJump', 300)} alt='' />
                    </span>
                    <ArrowRight className='asg-photo-arrow' size={22} aria-hidden='true' />
                    <span className='asg-photo-result'>a chill summer anthem</span>
                  </div>
                </Tilt>
              </div>
            </div>
          </div>
        </section>

        <section className='asg-section asg-steps-section' aria-labelledby='asg-steps-title'>
          <div className='asg-wrap'>
            <div className='asg-section-head' data-reveal=''>
              <span className='asg-kicker'>How it works</span>
              <h2 id='asg-steps-title' className='asg-title'>Idea to song in four taps.</h2>
            </div>
            <ol className='asg-steps' data-reveal=''>
              {[
                ['Start with anything', 'Your lyrics, a one-line idea or a photo from your gallery.'],
                ['Pick your sound', '30+ genres, the vocal style and the instruments you want.'],
                ['Tap Create', 'A finished track with vocals, lyrics and music, usually in under a minute.'],
              ].map(([title, text], i) => (
                <li key={title} style={order(i)}>
                  <span className='asg-step-no'>0{i + 1}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
              <li style={order(3)}>
                <span className='asg-step-no'>04</span>
                <h3>Share it</h3>
                <p>Post it to {SHARE_TARGETS.slice(0, -1).join(', ')} and {SHARE_TARGETS.at(-1)}, or send it to someone.</p>
              </li>
            </ol>
          </div>
        </section>

        <section className='asg-section' aria-labelledby='asg-uses-title'>
          <div className='asg-wrap'>
            <div className='asg-section-head asg-head-split' data-reveal=''>
              <div>
                <span className='asg-kicker'>What will you make?</span>
                <h2 id='asg-uses-title' className='asg-title'>A song nobody else has.</h2>
              </div>
              <p>Every song is saved to your library with the idea behind it. Download it or share it in a tap.</p>
            </div>
            <div className='asg-covers'>
              {USE_CASES.map((item, i) => (
                <div key={item.title} data-reveal='' style={delay(i * 90)}>
                  <button type='button' className={`asg-single asg-single-${item.tone}`} onClick={onStart}>
                    <span className='asg-single-media'>
                      <img className='asg-single-duo' src={photo(item.photo, 640, 480)} alt='' />
                      <img className='asg-single-color' src={photo(item.photo, 640, 480)} alt='' />
                      <span className='asg-single-plus' aria-hidden='true'><ArrowUpRight size={18} /></span>
                    </span>
                    <span className='asg-single-tag'>{item.tag}</span>
                    <h3>{item.title}</h3>
                    <p>“{item.prompt}”</p>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className='asg-section asg-shots-section' data-header='dark' aria-labelledby='asg-shots-title'>
          <div className='asg-wrap asg-section-head' data-reveal=''>
            <span className='asg-kicker'>Inside the app</span>
            <h2 id='asg-shots-title' className='asg-title'>Your pocket music studio.</h2>
          </div>
          <div className='asg-shots' tabIndex={0} aria-label='App screenshots'>
            <div className='asg-shots-track'>
              {[0, 1].map((copy) =>
                SCREENSHOTS.map((url, i) => (
                  <img
                    key={`${copy}-${url}`}
                    src={url}
                    alt={copy === 0 ? `${APP.name} screenshot ${i + 1}` : ''}
                    aria-hidden={copy === 1 || undefined}
                    loading='lazy'
                    width={300}
                    height={649}
                  />
                )),
              )}
            </div>
          </div>
        </section>

        <section className='asg-section asg-faq-section' aria-labelledby='asg-faq-title'>
          <div className='asg-wrap asg-faq-grid'>
            <div className='asg-faq-side' data-reveal=''>
              <span className='asg-kicker'>Questions</span>
              <h2 id='asg-faq-title' className='asg-title'>Before your first song.</h2>
              <div className='asg-faq-cta'>
                <button type='button' className='asg-cta' onClick={onStart}>
                  Make my first song
                  <ArrowRight size={20} strokeWidth={2.5} />
                </button>
              </div>
            </div>
            <div className='asg-faq' data-reveal='' style={delay(120)}>
              {FAQ.map((item) => (
                <details key={item.question}>
                  <summary>
                    {item.question}
                    <Plus size={20} aria-hidden='true' />
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className='asg-final' data-header='dark'>
          <img className='asg-final-bg' src={photo('concert', 1800, 1100)} alt='' aria-hidden='true' />
          <div className='asg-final-covers' aria-hidden='true'>
            <img src={photo('starryCity', 240)} alt='' />
            <img src={photo('momGift', 240)} alt='' />
            <img src={photo('sunsetWalk', 240)} alt='' />
            <img src={photo('roadTrip', 240)} alt='' />
          </div>
          <div className='asg-wrap asg-final-inner' data-reveal=''>
            <img src={APP.iconUrl} alt='' width={88} height={88} className='asg-final-icon' />
            <h2 className='asg-poster asg-poster-light'>Your song is one tap away.</h2>
            <p>Your ideas deserve to be heard.</p>
            <button type='button' className='asg-cta asg-cta-pulse' onClick={onStart}>
              Make my first song
              <ArrowRight size={20} strokeWidth={2.5} />
            </button>
            <p className='asg-terms asg-terms-light'>{terms.terms}</p>
          </div>
        </section>
      </main>

      <footer className='asg-footer' data-header='dark'>
        <div className='asg-wrap asg-footer-row'>
          <span>
            {APP.name} – Make Music is developed by {APP.legalName} Songs are generated by AI, so every result
            depends on your idea. Payment details are processed securely by our payment provider. Photos:
            Unsplash.
          </span>
          <nav aria-label='Legal'>
            <a href={APP.privacyUrl} target='_blank' rel='noopener noreferrer'>Privacy Policy</a>
            <a href={APP.termsUrl} target='_blank' rel='noopener noreferrer'>Terms of Use</a>
          </nav>
        </div>
      </footer>

      <div className={showDock ? 'asg-dock is-visible' : 'asg-dock'} aria-hidden={!showDock}>
        <img src={APP.iconUrl} alt='' width={44} height={44} />
        <span className='asg-dock-text'>
          <strong>{terms.today ?? terms.regular}</strong>
          <small>{terms.today ? `then ${terms.regular}` : 'cancel anytime'}</small>
        </span>
        <button type='button' className='asg-cta asg-cta-small' onClick={onStart} tabIndex={showDock ? 0 : -1}>
          Make a song
        </button>
      </div>
    </div>
  );
}
