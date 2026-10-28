import '@fontsource-variable/schibsted-grotesk';
import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode, type Ref, type RefObject } from 'react';
import { Plus } from 'lucide-react';
import { prefersReducedMotion, useReveal } from '../../shared/motion';
import { ProgressiveBlur } from '../../shared/ProgressiveBlur';
import { describeOffer, initials, type LandingProps } from '../../shared/offer';
import {
  APP,
  FAQ,
  FORMATS,
  LANGUAGES,
  RATING,
  REVIEWS,
  SCENES,
  SCREENSHOTS,
  SCREENSHOT_ALTS,
  SCREENSHOT_CAPTIONS,
  SOURCES,
  USE_CASES,
  photo,
} from './content';
import { LiveTranscript } from './LiveTranscript';
import './page.css';

/** Order of an element in a sequence; the CSS turns it into a delay. */
const order = (i: number) => ({ '--i': i }) as CSSProperties;
const delay = (ms: number) => ({ '--reveal-delay': `${ms}ms` }) as CSSProperties;

/** The hero line, as spoken: two lines, the first folds in two on phones. */
const HERO = [
  { stamp: '00:00', segments: [['Don’t'], ['type', 'it.']] },
  { stamp: '00:02', segments: [['Say', 'it.']] },
];
const HERO_WORDS = HERO.flatMap((line) => line.segments.flat());
const FINAL_WORDS = ['Start', 'talking.'];

/** The translated line from the app's own "Spanish into English" example. */
const TRANSLATED = SCENES[2].lines[0];

type Terms = ReturnType<typeof describeOffer>;

/** Counts words "said" so far, at a dictation pace, once `start` is true. */
function useDictation(words: string[], start: boolean, firstDelay: number) {
  const [reduced] = useState(prefersReducedMotion);
  const [count, setCount] = useState(reduced ? words.length : 0);
  useEffect(() => {
    if (reduced || !start || count >= words.length) return;
    const previous = words[count - 1] ?? '';
    const wait = count === 0 ? firstDelay : 260 + (/[.,!?]$/.test(previous) ? 320 : 0) + ((count * 37) % 5) * 26;
    const timer = window.setTimeout(() => setCount((c) => c + 1), wait);
    return () => window.clearTimeout(timer);
  }, [count, start, words, reduced, firstDelay]);
  return count;
}

/** True once the element has been on screen. */
function useSeen(ref: RefObject<HTMLElement | null>) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setSeen(true);
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return seen;
}

/** Words that appear one by one, with the text cursor after the newest. Hidden words keep their place. */
function Spoken({ words, from, count }: { words: string[]; from: number; count: number }) {
  return (
    <>
      {words.map((word, i) => {
        const n = from + i;
        return (
          <Fragment key={n}>
            {n === 0 && count === 0 ? <span className='stt-caret' /> : null}
            <span className={n < count ? 'stt-tw is-said' : 'stt-tw'}>{word}</span>
            {n === count - 1 ? <span className='stt-caret' /> : null}
            {i < words.length - 1 ? ' ' : null}
          </Fragment>
        );
      })}
    </>
  );
}

/** Splits a line into words the CSS can stagger (`.stt-dw` in headings, `.stt-cw` in captions). */
function Staggered({ text, className }: { text: string; className: string }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className={className} style={order(i)}>
            {word}
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </>
  );
}

/** Section head: a timestamp in the margin and a plain heading, dictated word by word. */
function Head({ id, stamp, title, children }: { id: string; stamp: string; title: string; children?: ReactNode }) {
  return (
    <div className='stt-head' data-reveal=''>
      <h2 id={id} className='stt-h2'>
        <span className='stt-stamp' aria-hidden='true'>
          [{stamp}]
        </span>
        <Staggered text={title} className='stt-dw' />
      </h2>
      {children ? <p className='stt-head-text'>{children}</p> : null}
    </div>
  );
}

/** A running clock with the font's wide tabular colons pulled in. */
function Timecode({ value }: { value: string }) {
  return (
    <>
      {value.split(':').map((part, i) => (
        <Fragment key={i}>
          {i ? <span className='stt-colon'>:</span> : null}
          {part}
        </Fragment>
      ))}
    </>
  );
}

/** Recording clock in the toolbar: the document is listening. */
function RecClock() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const timer = window.setInterval(() => setSeconds((s) => (s + 1) % 3600), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return (
    <span className='stt-clock' aria-hidden='true'>
      <i />
      <b>REC</b>
      <span>
        <Timecode value={`00:${mm}:${ss}`} />
      </span>
    </span>
  );
}

type ButtonProps = {
  label: string;
  onClick: () => void;
  small?: boolean;
  className?: string;
  tabIndex?: number;
  ref?: Ref<HTMLButtonElement>;
};

function RecordButton({ label, onClick, small, className = '', tabIndex, ref }: ButtonProps) {
  return (
    <button
      ref={ref}
      type='button'
      className={['stt-btn', small ? 'stt-btn-sm' : '', className].filter(Boolean).join(' ')}
      onClick={onClick}
      tabIndex={tabIndex}
    >
      <span className='stt-btn-dot' aria-hidden='true' />
      {label}
    </button>
  );
}

function Offer({ terms, onStart, buttonRef, style }: { terms: Terms; onStart: () => void; buttonRef?: Ref<HTMLButtonElement>; style?: CSSProperties }) {
  return (
    <div className='stt-offer' style={style}>
      <p className='stt-price'>
        {terms.today ? (
          <>
            <strong>{terms.today}</strong> <s>{terms.regular}</s> <span>first payment</span>
          </>
        ) : (
          <strong>{terms.regular}</strong>
        )}
      </p>
      <RecordButton ref={buttonRef} label='Start voice typing' onClick={onStart} />
      <p className='stt-terms'>{terms.terms}</p>
    </div>
  );
}

export function SpeechToTextPage({ offer, creator, onStart }: LandingProps) {
  const root = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);
  const heroCta = useRef<HTMLButtonElement>(null);
  const finalSheet = useRef<HTMLElement>(null);
  const [showDock, setShowDock] = useState(false);
  const [headerStuck, setHeaderStuck] = useState(false);
  const [headerTone, setHeaderTone] = useState<'light' | 'dark'>('light');
  const terms = describeOffer(offer);

  const heroCount = useDictation(HERO_WORDS, true, 450);
  const finalSeen = useSeen(finalSheet);
  const finalCount = useDictation(FINAL_WORDS, finalSeen, 350);

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

  const heroDone = heroCount >= HERO_WORDS.length;
  const [feature, ...briefs] = USE_CASES;
  let word = 0;

  return (
    <div className='stt' ref={root}>
      {creator && offer.discountPercent ? (
        <div className='stt-ribbon'>
          {creator.avatarUrl ? (
            <img src={creator.avatarUrl} alt='' className='stt-avatar' />
          ) : (
            <span className='stt-avatar' aria-hidden='true'>
              {initials(creator.name)}
            </span>
          )}
          <p>
            <strong>{creator.name}</strong> picked this app for you
          </p>
          <span className='stt-ribbon-deal'>−{offer.discountPercent}% today</span>
        </div>
      ) : null}

      <header ref={header} className='stt-header' data-stuck={headerStuck} data-tone={headerTone}>
        <div className='stt-header-backdrop' aria-hidden='true'>
          <ProgressiveBlur layers={6} maxBlur={18} />
          <div className='stt-header-tint stt-header-tint-light' />
          <div className='stt-header-tint stt-header-tint-dark' />
        </div>
        <div className='stt-wrap stt-header-row'>
          <a href='#top' className='stt-doc'>
            <img src={APP.iconUrl} alt='' width={34} height={34} />
            <span>
              <strong>{APP.name}</strong>
              <small>Voice Typing · Audio Transcriber</small>
            </span>
          </a>
          <RecClock />
          <RecordButton label='Start voice typing' onClick={onStart} small className='stt-header-btn' />
        </div>
      </header>

      <main id='top' className='stt-wrap'>
        {/* Page 1: the headline is dictated, the recorder sits beside the short second line. */}
        <section className={heroDone ? 'stt-sheet stt-hero is-done' : 'stt-sheet stt-hero'}>
          <div className='stt-hero-body'>
            <h1
              className='stt-h1'
              aria-label='Don’t type it. Say it.'
              data-typing={heroCount > 0 && heroCount < HERO_WORDS.length}
            >
              {HERO.map((line, l) => {
                const lineStart = word;
                return (
                  <span key={l} className='stt-h1-line' aria-hidden='true'>
                    <span className={l === 0 || heroCount > lineStart ? 'stt-h1-stamp is-on' : 'stt-h1-stamp'}>
                      {l === 0 ? (
                        <span className='stt-who'>
                          <i />
                          You
                        </span>
                      ) : null}
                      {line.stamp}
                    </span>
                    {line.segments.map((segment, s) => {
                      const from = word;
                      word += segment.length;
                      return (
                        <Fragment key={s}>
                          <span className='stt-h1-seg'>
                            <Spoken words={segment} from={from} count={heroCount} />
                          </span>
                          {s < line.segments.length - 1 ? ' ' : null}
                        </Fragment>
                      );
                    })}
                  </span>
                );
              })}
            </h1>

            <div className='stt-hero-copy'>
              <p className='stt-lead' style={order(0)}>
                Speak and <mark className='stt-mark'>watch your words appear instantly</mark>. Transcribe meetings,
                lectures, voice memos and videos in over 90 languages, then export them as TXT, PDF, DOCX or SRT.
              </p>
              <Offer terms={terms} onStart={onStart} buttonRef={heroCta} style={order(1)} />
              <ul className='stt-notes' style={order(2)}>
                <li>{RATING.value} on the App Store</li>
                <li>90+ languages and dialects</li>
                <li>No ads</li>
              </ul>
            </div>

            <div className='stt-hero-aside'>
              <LiveTranscript />
            </div>
          </div>
          <span className='stt-folio' aria-hidden='true'>1</span>
        </section>

        {/* Page 2: every way in, as speakers in a transcript; then languages. */}
        <section className='stt-sheet' aria-labelledby='stt-sources-title'>
          <Head id='stt-sources-title' stamp='00:24' title='Anything with a voice, in writing.' />
          <ol className='stt-sources'>
            {SOURCES.map((source, i) => (
              <li key={source.label} className='stt-src' data-reveal='' style={delay(i * 80)}>
                <span className='stt-margin'>
                  <span className='stt-who'>{source.label}</span>
                  <span className='stt-stamp'>{`00:${26 + i * 5}`}</span>
                </span>
                <p className='stt-src-line'>
                  <mark className='stt-mark'>{source.text}</mark>
                </p>
                <span className='stt-src-meta'>
                  <b>[</b>
                  {source.meta}
                  <b>]</b>
                </span>
              </li>
            ))}
          </ol>

          <div className='stt-langs'>
            <Head id='stt-langs-title' stamp='00:51' title='Over 90 languages and dialects.'>
              Transcribe the language you speak, or turn speech in another language into English text.
            </Head>
            <figure className='stt-pull' data-reveal=''>
              <div className='stt-pull-line stt-pull-src'>
                <span className='stt-margin'>
                  <span className='stt-who'>Spanish</span>
                  <span className='stt-stamp'>{TRANSLATED.label}</span>
                </span>
                <p lang='es'>{TRANSLATED.original}</p>
              </div>
              <div className='stt-pull-line stt-pull-out'>
                <span className='stt-margin'>
                  <span className='stt-who'>English</span>
                </span>
                <blockquote>
                  <p>
                    <mark className='stt-mark'>{TRANSLATED.text}</mark>
                  </p>
                </blockquote>
              </div>
              <figcaption>Example from the app’s screenshots: Spanish speech, transcribed into English.</figcaption>
            </figure>
            <ul className='stt-langs-list' aria-label='Some of the languages in the app'>
              {LANGUAGES.map((language) => (
                <li key={language}>{language}</li>
              ))}
              <li>and more</li>
            </ul>
          </div>
          <span className='stt-folio' aria-hidden='true'>2</span>
        </section>

        {/* Page 3: the listing's use cases, as a magazine spread. */}
        <section className='stt-sheet' aria-labelledby='stt-uses-title'>
          <Head id='stt-uses-title' stamp='01:08' title='Talk now. Read it later.'>
            Accurate AI transcription, even in noisy places or with different accents. Every transcript is saved,
            ready to edit and share.
          </Head>

          <figure className='stt-feature' data-reveal=''>
            <div className='stt-feature-media'>
              <div className='stt-feature-photo'>
                <picture>
                  <source media='(max-width: 640px)' srcSet={photo(feature.photo, 800, 800)} />
                  <img src={photo(feature.photo, 1600, 700)} alt='' loading='lazy' />
                </picture>
              </div>
              <div className='stt-slip' aria-hidden='true'>
                <span className='stt-who'>
                  <i />
                  {feature.speaker}
                  <span>00:00:04</span>
                </span>
                <p>
                  <Staggered text={feature.caption} className='stt-cw' />
                </p>
              </div>
            </div>
            <figcaption>
              <strong>{feature.title}.</strong> {feature.text}
            </figcaption>
          </figure>

          <ul className='stt-briefs' tabIndex={0} aria-label='More ways to use it'>
            {briefs.map((item, i) => (
              <li key={item.title} className='stt-brief' data-reveal='' style={delay(i * 90)}>
                <figure>
                  <div className='stt-brief-photo'>
                    <img src={photo(item.photo, 480, 600)} alt='' loading='lazy' />
                  </div>
                  <figcaption>
                    <p className='stt-brief-cc' aria-hidden='true'>
                      <b>{item.speaker}</b>
                      <Staggered text={item.caption} className='stt-cw' />
                    </p>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
          <p className='stt-small'>Transcript lines on and under the photos are examples.</p>
          <span className='stt-folio' aria-hidden='true'>3</span>
        </section>
      </main>

      {/* Three steps as three pages on the desk. */}
      <section className='stt-steps-section' aria-labelledby='stt-steps-title'>
        <div className='stt-wrap stt-desk-block'>
          <Head id='stt-steps-title' stamp='01:47' title='From voice to document in three steps.' />
          <ol className='stt-steps'>
            <li className='stt-step' data-reveal='' style={delay(0)}>
              <div className='stt-step-top'>
                <span className='stt-stamp'>00:00</span>
                <span>Page 1 of 3</span>
              </div>
              <h3>Tap record, or add a file</h3>
              <p>Talk live, or bring a recording, a voice memo, a video or a link.</p>
              <div className='stt-step-ui' aria-hidden='true'>
                <div className='stt-ui-list'>
                  {['Voice Recorder', 'Import Files', 'Add Voice Memos', 'Pick a Video', 'Add From URL'].map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
              </div>
            </li>
            <li className='stt-step' data-reveal='' style={delay(120)}>
              <div className='stt-step-top'>
                <span className='stt-stamp'>00:05</span>
                <span>Page 2 of 3</span>
              </div>
              <h3>Watch it become text</h3>
              <p>Speakers are told apart automatically. Speech in another language can come out in English.</p>
              <div className='stt-step-ui' aria-hidden='true'>
                <div className='stt-ui-sample'>
                  <span>
                    <b>Speaker 1</b>Can we move the launch to Friday?
                  </span>
                  <span>
                    <b>Speaker 2</b>Friday works.
                  </span>
                </div>
                <div className='stt-ui-rows'>
                  <span className='stt-ui-row'>
                    <span>Speech language</span>
                    <strong>Spanish</strong>
                  </span>
                  <span className='stt-ui-row'>
                    <span>Transcribe into English</span>
                    <span className='stt-switch' />
                  </span>
                </div>
              </div>
            </li>
            <li className='stt-step' data-reveal='' style={delay(240)}>
              <div className='stt-step-top'>
                <span className='stt-stamp'>00:10</span>
                <span>Page 3 of 3</span>
              </div>
              <h3>Edit, then export</h3>
              <p>Rename speakers, format the text and save it the way you need it.</p>
              <div className='stt-step-ui' aria-hidden='true'>
                <div className='stt-ui-files'>
                  {FORMATS.map((format) => (
                    <span key={format.ext} className='stt-mini-file'>
                      <strong>{format.ext}</strong>
                      <small>{format.use}</small>
                    </span>
                  ))}
                </div>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* The real app, on ink. */}
      <section className='stt-ink' data-header='dark' aria-labelledby='stt-shots-title'>
        <div className='stt-wrap stt-desk-block'>
          <Head id='stt-shots-title' stamp='02:31' title='Every recording, one tidy library.'>
            Live recordings, files, voice memos, videos and links, each saved as a transcript you can open again.
          </Head>
          <ol className='stt-shots' tabIndex={0} aria-label='App screenshots'>
            {SCREENSHOTS.map((url, i) => (
              <li key={url} className='stt-shot' data-reveal='' style={delay(i * 70)}>
                <figure>
                  <img src={url} alt={SCREENSHOT_ALTS[i]} loading='lazy' width={300} height={650} />
                  <figcaption>
                    <span className='stt-stamp'>0{i + 1}</span>
                    {SCREENSHOT_CAPTIONS[i]}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className='stt-wrap stt-after'>
        {REVIEWS.length ? (
          <section className='stt-sheet' aria-labelledby='stt-reviews-title'>
            <Head id='stt-reviews-title' stamp='02:58' title={`${RATING.value} on the App Store.`} />
            {REVIEWS.map((review) => (
              <figure key={review.author} className='stt-pull-line stt-review' data-reveal=''>
                <span className='stt-margin stt-who'>{review.author}</span>
                <blockquote>
                  <p>
                    <strong>{review.title}.</strong> “{review.text}”
                  </p>
                </blockquote>
              </figure>
            ))}
          </section>
        ) : null}

        {/* FAQ as a transcript: Q. and A. are the speakers. */}
        <section className='stt-sheet' aria-labelledby='stt-faq-title'>
          <Head id='stt-faq-title' stamp='03:02' title='Asked and answered.' />
          <div className='stt-faq' data-reveal=''>
            {FAQ.map((item) => (
              <details key={item.question} className='stt-qa'>
                <summary>
                  <span className='stt-qa-who' aria-hidden='true'>
                    Q.
                  </span>
                  <span>{item.question}</span>
                  <Plus size={22} aria-hidden='true' />
                </summary>
                <div className='stt-qa-a'>
                  <span className='stt-qa-who' aria-hidden='true'>
                    A.
                  </span>
                  <p>{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
          <span className='stt-folio' aria-hidden='true'>4</span>
        </section>

        {/* The last page is blank, waiting for your voice. */}
        <section ref={finalSheet} className='stt-sheet stt-final' aria-labelledby='stt-final-title'>
          <h2
            id='stt-final-title'
            className='stt-final-h'
            aria-label='Start talking.'
            data-typing={finalCount > 0 && finalCount < FINAL_WORDS.length}
          >
            <span className={finalSeen || finalCount ? 'stt-h1-stamp is-on' : 'stt-h1-stamp'} aria-hidden='true'>
              <span className='stt-who'>
                <i />
                You
              </span>
              03:40
            </span>
            <span aria-hidden='true'>
              <Spoken words={FINAL_WORDS} from={0} count={finalCount} />
            </span>
          </h2>
          <p className='stt-final-text'>Your voice, in writing. Meetings, lectures, memos and videos, in over 90 languages.</p>
          <Offer terms={terms} onStart={onStart} />
          <span className='stt-folio' aria-hidden='true'>5</span>
        </section>
      </div>

      <footer className='stt-footer'>
        <div className='stt-wrap stt-footer-row'>
          <p>
            {APP.fullName} is developed by {APP.legalName} Transcription accuracy depends on the recording. Payment
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

      <div className={showDock ? 'stt-dock is-visible' : 'stt-dock'} aria-hidden={!showDock}>
        <img src={APP.iconUrl} alt='' width={40} height={40} />
        <span className='stt-dock-text'>
          <strong>{terms.today ?? terms.regular}</strong>
          <small>{terms.today ? `today, then ${terms.regular}` : 'Cancel anytime'}</small>
        </span>
        <RecordButton label='Start' small onClick={onStart} tabIndex={showDock ? 0 : -1} />
      </div>
    </div>
  );
}
