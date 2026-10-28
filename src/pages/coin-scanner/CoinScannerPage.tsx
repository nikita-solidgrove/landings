import '@fontsource/krona-one';
import '@fontsource-variable/manrope';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { useReveal } from '../../shared/motion';
import { ProgressiveBlur } from '../../shared/ProgressiveBlur';
import { describeOffer, initials, type LandingProps } from '../../shared/offer';
import { CoinFace } from './CoinFace';
import { HeroCoin } from './HeroCoin';
import { CatNo, Seal } from './Ornaments';
import { Plate } from './Plate';
import { ScanDemo } from './ScanDemo';
import { APP, FAQ, HISTORY, LEDGER, SCREENSHOTS, SETS, TRAY_REGION, TRAY_TAGS, USE_CASES, photo, photoRegion } from './content';
import './page.css';

/** Order of an element in an entrance sequence; the CSS turns it into a delay. */
const order = (i: number) => ({ '--i': i }) as CSSProperties;
const delay = (ms: number) => ({ '--reveal-delay': `${ms}ms` }) as CSSProperties;

/** A section head: the catalogue number struck on a medallion, the heading, an optional lead. */
function Head({ n, id, title, children }: { n: number; id: string; title: string; children?: ReactNode }) {
  return (
    <div className='coin-head' data-reveal=''>
      <CatNo n={n} />
      <h2 id={id} className='coin-h2'>
        {title}
      </h2>
      {children ? <p className='coin-lead'>{children}</p> : null}
    </div>
  );
}

export function CoinScannerPage({ offer, creator, onStart }: LandingProps) {
  const root = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);
  const heroCta = useRef<HTMLButtonElement>(null);
  const [showDock, setShowDock] = useState(false);
  const [headerStuck, setHeaderStuck] = useState(false);
  const [headerTone, setHeaderTone] = useState<'light' | 'dark'>('light');
  const [albumView, setAlbumView] = useState<'collection' | 'history'>('collection');
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

  return (
    <div className='coin' ref={root}>
      {creator && offer.discountPercent ? (
        <div className='coin-ribbon'>
          {creator.avatarUrl ? (
            <img src={creator.avatarUrl} alt='' className='coin-avatar' />
          ) : (
            <span className='coin-avatar' aria-hidden='true'>
              {initials(creator.name)}
            </span>
          )}
          <p>
            <strong>{creator.name}</strong> picked this app for you
          </p>
          <span className='coin-ribbon-deal'>−{offer.discountPercent}% today</span>
        </div>
      ) : null}

      <header ref={header} className='coin-header' data-stuck={headerStuck} data-tone={headerTone}>
        <div className='coin-header-backdrop' aria-hidden='true'>
          <ProgressiveBlur layers={6} maxBlur={18} />
          <div className='coin-header-tint coin-header-tint-light' />
          <div className='coin-header-tint coin-header-tint-dark' />
        </div>
        <div className='coin-wrap coin-band'>
          <span className='coin-band-motto'>Snap &amp; identify coins</span>
          <a href='#top' className='coin-mark'>
            <img src={APP.iconUrl} alt='' width={36} height={36} />
            <span>{APP.shortName}</span>
          </a>
          <span className='coin-band-end'>
            <button type='button' className='coin-btn coin-btn-small' onClick={onStart}>
              Scan a coin
            </button>
          </span>
        </div>
        <span className='coin-band-line' aria-hidden='true' />
      </header>

      <main id='top'>
        <section className='coin-hero' aria-labelledby='coin-hero-title'>
          <div className='coin-wrap coin-hero-inner'>
            <h1 id='coin-hero-title' className='coin-h1'>
              <span style={order(0)}>Snap both sides.</span>
              <span style={order(1)}>Know your coin.</span>
            </h1>

            <div className='coin-hero-stage'>
              <p className='coin-hero-lead coin-intro' style={order(3)}>
                Two photos, and the app matches your coin with a global database: year, country, metal, denomination,
                its story and a price estimate.
              </p>
              <div className='coin-hero-medal'>
                <HeroCoin />
                <p className='coin-hero-note'>Example result around the coin. Tap it to turn it over.</p>
              </div>
              <ul className='coin-hero-facts coin-intro' style={order(4)}>
                <li>
                  <b>{APP.rating} ★</b>
                  <span>on the App Store, {APP.ratingCount} ratings</span>
                </li>
                <li>
                  <b>US · Europe · Asia</b>
                  <span>and many other regions</span>
                </li>
                <li>
                  <b>Your sets</b>
                  <span>collections with notes and categories</span>
                </li>
              </ul>
            </div>

            <div className='coin-offer coin-intro' style={order(5)}>
              <p className='coin-price'>
                <strong>{terms.today ?? terms.regular}</strong>
                {terms.today ? (
                  <>
                    <s>{terms.regular}</s>
                    <span>first payment</span>
                  </>
                ) : null}
              </p>
              <button ref={heroCta} type='button' className='coin-btn coin-btn-large' onClick={onStart}>
                Scan my first coin
                <ArrowRight size={18} strokeWidth={2.25} />
              </button>
              <p className='coin-terms'>{terms.terms}</p>
            </div>
          </div>
        </section>

        <section className='coin-section coin-velvet coin-scan-section' data-header='dark' aria-labelledby='coin-scan-title'>
          <div className='coin-wrap'>
            <Head n={1} id='coin-scan-title' title='Two photos. One catalogue entry.'>
              Shoot the front, turn the coin over, shoot the back. The app matches both sides and fills in the card.
            </Head>
            <ScanDemo />
          </div>
        </section>

        <section className='coin-section coin-plate-section' aria-labelledby='coin-plate-title'>
          <div className='coin-wrap'>
            <Head n={2} id='coin-plate-title' title='Read from the coin itself.'>
              Mint year, country of origin, metal, denomination and the story behind the design, plus what the coin might
              be worth today.
            </Head>
            <Plate />
          </div>
        </section>

        <section className='coin-section coin-world' data-header='dark' aria-labelledby='coin-world-title'>
          <div className='coin-wrap'>
            <Head n={3} id='coin-world-title' title='One app for the whole drawer.'>
              Coins from the United States, Europe, Asia and many other regions, all in one app.
            </Head>
            <div className='coin-tray' data-reveal=''>
              <div className='coin-tray-photo'>
                <img src={photoRegion('worldCoins', TRAY_REGION, 1400, 907)} alt='A tray of coins from around the world' loading='lazy' />
              </div>
              {TRAY_TAGS.map((tag, i) => (
                <span
                  key={tag.name}
                  className={tag.y < 22 ? 'coin-tag is-below' : 'coin-tag'}
                  style={{ '--x': `${tag.x}%`, '--y': `${tag.y}%`, '--i': i } as CSSProperties}
                >
                  <span className='coin-tag-dot'>{i + 1}</span>
                  <span className='coin-tag-label'>
                    <strong>{tag.name}</strong>
                    <small>{tag.detail}</small>
                  </span>
                </span>
              ))}
            </div>
            <ol className='coin-tray-legend'>
              {TRAY_TAGS.map((tag, i) => (
                <li key={tag.name}>
                  <b>{i + 1}</b>
                  <span>
                    {tag.name}
                    <small>{tag.detail}</small>
                  </span>
                </li>
              ))}
            </ol>
            <p className='coin-tray-note'>Example labels on a real tray of coins.</p>
          </div>
        </section>

        <section className='coin-section coin-uses-section' aria-labelledby='coin-uses-title'>
          <div className='coin-wrap'>
            <Head n={4} id='coin-uses-title' title='Every jar, drawer and tin has a few.' />
            <ul className='coin-uses'>
              {USE_CASES.map((item, i) => (
                <li key={item.title} className='coin-use' data-reveal='' style={delay(i * 90)}>
                  <span className='coin-use-medal' aria-hidden='true'>
                    <span className='coin-use-photo'>
                      <img className='coin-use-duo' src={photo(item.photo, 480, 480)} alt='' loading='lazy' />
                      <img className='coin-use-color' src={photo(item.photo, 480, 480)} alt='' loading='lazy' />
                    </span>
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className='coin-section coin-velvet coin-album-section' data-header='dark' aria-labelledby='coin-album-title'>
          <div className='coin-wrap'>
            <Head n={5} id='coin-album-title' title='Every coin filed, with its own note.'>
              Create, organize and track your collection. Keep the jar, the trip coins and the box from the attic in their
              own sets.
            </Head>

            <div className='coin-album' data-reveal=''>
              <div className='coin-segmented' role='group' aria-label='Collection view'>
                <button type='button' aria-pressed={albumView === 'collection'} onClick={() => setAlbumView('collection')}>
                  Collection
                </button>
                <button type='button' aria-pressed={albumView === 'history'} onClick={() => setAlbumView('history')}>
                  History
                </button>
              </div>

              {albumView === 'collection' ? (
                <div className='coin-trays'>
                  {SETS.map((set, s) => (
                    <div key={set.name} className='coin-set'>
                      <div className='coin-set-velvet' aria-hidden='true'>
                        {set.coins.map((side, n) => (
                          <span key={n} className='coin-set-well' style={order(s * 4 + n)}>
                            <CoinFace side={side} size={120} />
                          </span>
                        ))}
                      </div>
                      <strong>{set.name}</strong>
                    </div>
                  ))}
                  <button type='button' className='coin-set coin-set-new' onClick={onStart}>
                    <span className='coin-set-velvet' aria-hidden='true'>
                      {[0, 1, 2, 3].map((n) => (
                        <span key={n} className='coin-set-well' />
                      ))}
                      <span className='coin-set-plus'>
                        <Plus size={20} strokeWidth={2.5} />
                      </span>
                    </span>
                    <strong>New Collection</strong>
                  </button>
                </div>
              ) : (
                <ul className='coin-history'>
                  {HISTORY.map((item, i) => (
                    <li key={item.name} style={order(i)}>
                      <CoinFace side={item.side} size={120} />
                      <strong>{item.name}</strong>
                      <span className='coin-leader' aria-hidden='true' />
                      <small>{item.meta}</small>
                    </li>
                  ))}
                </ul>
              )}

              <div className='coin-album-foot'>
                <dl className='coin-ledger'>
                  {LEDGER.map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <span className='coin-leader' aria-hidden='true' />
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <div className='coin-note'>
                  <span>
                    Note <i>Example</i>
                  </span>
                  <p>100 Lire, 1981. From Grandpa’s blue tin, keep it with the Italy coins.</p>
                </div>
              </div>

              <button type='button' className='coin-btn coin-btn-ivory coin-btn-large' onClick={onStart}>
                Start my collection
                <ArrowRight size={18} strokeWidth={2.25} />
              </button>
            </div>
          </div>
        </section>

        <section className='coin-section coin-shots-section' aria-labelledby='coin-shots-title'>
          <div className='coin-wrap'>
            <Head n={6} id='coin-shots-title' title='Scanner, details, sets and history.' />
            <div className='coin-shots' tabIndex={0} aria-label='App screenshots'>
              {SCREENSHOTS.map((item, i) => (
                <figure key={item.url} data-reveal='' style={delay(i * 80)}>
                  <span className='coin-shot-mat'>
                    <img src={item.url} alt={`${APP.shortName} screenshot: ${item.caption}`} loading='lazy' width={300} height={649} />
                  </span>
                  <figcaption>
                    <b>Pl. {i + 1}</b>
                    {item.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className='coin-section coin-faq-section' aria-labelledby='coin-faq-title'>
          <div className='coin-wrap'>
            <Head n={7} id='coin-faq-title' title='Before your first scan.' />
            <div className='coin-index' data-reveal=''>
              {FAQ.map((item, i) => (
                <details key={item.question}>
                  <summary>
                    <span className='coin-index-q'>{item.question}</span>
                    <span className='coin-leader' aria-hidden='true' />
                    <span className='coin-index-no' aria-hidden='true'>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className='coin-final coin-velvet' data-header='dark' aria-labelledby='coin-final-title'>
          <div className='coin-wrap'>
            <div className='coin-cert' data-reveal=''>
              <span className='coin-cert-border' aria-hidden='true' />
              <div className='coin-cert-inner'>
                <h2 id='coin-final-title' className='coin-h2 coin-cert-title'>
                  Every coin has a story.
                </h2>
                <p className='coin-cert-text'>Snap both sides of the next old coin you find, and read yours.</p>
                <Seal className='coin-cert-seal' />
                <button type='button' className='coin-btn coin-btn-large' onClick={onStart}>
                  Scan my first coin
                  <ArrowRight size={18} strokeWidth={2.25} />
                </button>
                <p className='coin-terms'>{terms.terms}</p>
                <div className='coin-cert-sign'>
                  <span>
                    <b>{APP.shortName}</b>
                    <small>Issued by</small>
                  </span>
                  <span>
                    <b>{creator ? creator.name : 'iPhone, iOS 15.0+'}</b>
                    <small>{creator ? 'Picked for you by' : 'Works on'}</small>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className='coin-footer' data-header='dark'>
        <div className='coin-wrap coin-footer-inner'>
          <p>
            {APP.name} is developed by {APP.legalName}
          </p>
          <nav aria-label='Legal'>
            <a href={APP.privacyUrl} target='_blank' rel='noopener noreferrer'>
              Privacy Policy
            </a>
            <a href={APP.termsUrl} target='_blank' rel='noopener noreferrer'>
              Terms of Use
            </a>
          </nav>
          <p className='coin-footer-small'>
            Coins, details and prices on this page are examples; values in the app are estimates. Payment details are
            processed securely by our payment provider. Photos: Unsplash.
          </p>
        </div>
      </footer>

      <div className={showDock ? 'coin-dock is-visible' : 'coin-dock'} aria-hidden={!showDock}>
        <span className='coin-dock-line' aria-hidden='true' />
        <div className='coin-dock-row'>
          <img src={APP.iconUrl} alt='' width={42} height={42} />
          <span className='coin-dock-text'>
            <strong>{terms.today ?? terms.regular}</strong>
            <small>{terms.today ? `then ${terms.regular}` : 'Cancel anytime'}</small>
          </span>
          <button type='button' className='coin-btn coin-btn-small' onClick={onStart} tabIndex={showDock ? 0 : -1}>
            Scan a coin
          </button>
        </div>
      </div>
    </div>
  );
}
