import '@fontsource-variable/chivo';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, Ban, Check, CircleDot, Copy, MessageCircle, Moon, Plus, Star, Voicemail, Wifi } from 'lucide-react';
import { useReveal } from '../../shared/motion';
import { ProgressiveBlur } from '../../shared/ProgressiveBlur';
import { describeOffer, initials, type LandingProps } from '../../shared/offer';
import {
  APP,
  COUNTRIES,
  DND_HOURS,
  FAQ,
  LINE,
  OWN_CONTACTS,
  SCREENSHOTS,
  SCREENSHOT_CAPTIONS,
  SECOND_CONTACTS,
  STEPS,
  USE_CASES,
  photo,
} from './content';
import { SceneNote, ScenePhone, SceneTabs, ShareCard, useScenes } from './LineScenes';
import { Bars, Chip, LineMark, TypeIn, delay, order } from './parts';
import './page.css';

type Tone = 'light' | 'dark' | 'green';

/** Do Not Disturb hours, day by day, as store screenshot 7 shows them. */
const DND_WEEK = DND_HOURS.flatMap(([days, hours]) =>
  days === 'Mon – Fri' ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => [day, hours]) : [[days, hours]],
);

/** Your own number, never shown in full. */
const MASKED = '(•••) •••-••12';

/**
 * The tone under a point: the topmost element that names one with `data-header`, which is a
 * section or one half of a split section ("light" when nothing names it).
 */
function toneAt(x: number, y: number): Tone {
  for (const element of document.elementsFromPoint(x, y)) {
    const tone = element.getAttribute('data-header');
    if (tone === 'dark' || tone === 'green') return tone;
    if (tone !== null) return 'light';
  }
  return 'light';
}

function Head({ id, line, title, children }: { id: string; line: 1 | 2 | 'both'; title: string; children?: ReactNode }) {
  return (
    <div className='duo-head' data-reveal=''>
      <LineMark on={line} />
      <div className='duo-head-body'>
        <h2 id={id} className='duo-h2'>
          {title}
        </h2>
        {children ? <p>{children}</p> : null}
      </div>
    </div>
  );
}

export function DuolinePage({ offer, creator, onStart }: LandingProps) {
  const root = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);
  const heroCta = useRef<HTMLButtonElement>(null);
  const [showDock, setShowDock] = useState(false);
  const [stuck, setStuck] = useState(false);
  const [left, setLeft] = useState<Tone>('dark');
  const [right, setRight] = useState<Tone>('green');
  const terms = describeOffer(offer);
  const scenes = useScenes();

  useReveal(root);

  useEffect(() => {
    // The header is split like the page: each half takes the tone of what is under it. The tint
    // shows once content scrolls under the header (the creator ribbon scrolls away first).
    const onScroll = () => {
      const box = header.current?.getBoundingClientRect();
      if (!box) return;
      setStuck(window.scrollY > 4 && box.top <= 0);
      const y = box.bottom + 1;
      setLeft(toneAt(window.innerWidth * 0.25, y));
      setRight(toneAt(window.innerWidth * 0.75, y));
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
    <p className='duo-price'>
      {terms.today ? (
        <>
          <strong>{terms.today}</strong>
          <s>{terms.regular}</s>
          <span>first payment</span>
        </>
      ) : (
        <strong>{terms.regular}</strong>
      )}
    </p>
  );

  return (
    <div className='duo' ref={root}>
      {creator && offer.discountPercent ? (
        <div className='duo-ribbon'>
          {creator.avatarUrl ? (
            <img src={creator.avatarUrl} alt='' className='duo-avatar' />
          ) : (
            <span className='duo-avatar' aria-hidden='true'>
              {initials(creator.name)}
            </span>
          )}
          <p>
            <strong>{creator.name}</strong> picked this app for you
          </p>
          <span className='duo-ribbon-deal'>−{offer.discountPercent}% today</span>
        </div>
      ) : null}

      <header ref={header} className='duo-header' data-stuck={stuck} data-left={left} data-right={right}>
        <div className='duo-header-backdrop' aria-hidden='true'>
          <ProgressiveBlur layers={6} maxBlur={18} />
          <div className='duo-tint duo-tint-l' />
          <div className='duo-tint duo-tint-r' />
        </div>
        <div className='duo-header-row'>
          <div className='duo-header-half duo-header-half-l'>
            <a href='#top' className='duo-identity'>
              <img src={APP.iconUrl} alt='' width={38} height={38} />
              <span>
                <strong>{APP.name}</strong>
                <small>by {APP.legalName}</small>
              </span>
            </a>
            <span className='duo-sig duo-sig-1' aria-hidden='true'>
              1 <Bars />
            </span>
          </div>
          <span className='duo-header-seam' aria-hidden='true' />
          <div className='duo-header-half duo-header-half-r'>
            <span className='duo-sig duo-sig-2' aria-hidden='true'>
              2 <Bars />
            </span>
            <button type='button' className='duo-cta duo-header-cta' onClick={onStart}>
              Get a number
              <ArrowRight size={16} strokeWidth={2.4} aria-hidden='true' />
            </button>
          </div>
        </div>
      </header>

      <main id='top'>
        {/* Hero: your line | the second line, the phone on the seam. */}
        <section className='duo-hero' aria-labelledby='duo-hero-title'>
          <span className='duo-bg duo-hero-bg-1' data-header='dark' aria-hidden='true' />
          <span className='duo-bg duo-hero-bg-2' data-header='green' aria-hidden='true' />
          <h1 id='duo-hero-title' className='duo-sr'>
            One phone. Two numbers.
          </h1>

          <div className='duo-hero-col duo-hero-col-1'>
            <p className='duo-hero-line duo-hero-line-1' aria-hidden='true'>
              <span>One phone.</span>
            </p>
            <p className='duo-hero-lead duo-intro' style={order(3)}>
              Add a second number for calls and texts, no new SIM card. Hand it to buyers, clients and dates, and
              keep your own number to yourself.
            </p>
            <ul className='duo-hero-proof duo-intro' style={order(5)}>
              <li>
                <Check size={16} strokeWidth={3} aria-hidden='true' />
                No extra SIM card
              </li>
              <li>
                <Check size={16} strokeWidth={3} aria-hidden='true' />
                Local numbers in the US, UK, Canada and Israel
              </li>
              <li>
                <Star size={15} strokeWidth={0} fill='currentColor' aria-hidden='true' />
                {APP.rating} on the App Store · {APP.ratingCount} ratings
              </li>
            </ul>
            <div className='duo-hero-id duo-hero-id-1 duo-on-dark duo-intro' style={order(7)}>
              <p className='duo-id-head'>
                <LineMark on={1} className='duo-mark-sm' />
                Your number
              </p>
              <strong className='duo-id-number duo-masked' aria-hidden='true'>
                {MASKED}
              </strong>
              <SceneNote state={scenes} />
            </div>
          </div>

          <div className='duo-hero-phone'>
            <ScenePhone state={scenes} />
          </div>

          <div className='duo-hero-col duo-hero-col-2'>
            <p className='duo-hero-line duo-hero-line-2' aria-hidden='true'>
              <span>Two numbers.</span>
            </p>
            <div className='duo-hero-offer duo-intro' style={order(4)}>
              {price}
              <button ref={heroCta} type='button' className='duo-cta' onClick={onStart}>
                Get my second number
                <ArrowRight size={20} strokeWidth={2.4} aria-hidden='true' />
              </button>
              <p className='duo-terms'>{terms.terms}</p>
            </div>
            <div className='duo-hero-id duo-hero-id-2 duo-on-green duo-intro' style={order(8)}>
              <p className='duo-id-head'>
                <LineMark on={2} className='duo-mark-sm' />
                Your second number
                <small>Example</small>
              </p>
              <ShareCard state={scenes} />
              <p className='duo-hero-fine'>Example. Every number shown here is fictional.</p>
            </div>
          </div>

          <div className='duo-hero-tabs duo-intro' style={order(9)}>
            <SceneTabs state={scenes} />
          </div>
        </section>

        <section className='duo-section duo-who' aria-labelledby='duo-who-title'>
          <div className='duo-wrap'>
            <Head id='duo-who-title' line='both' title='Give out this one. Keep yours.'>
              Separate personal and business contacts, notifications and messages, and switch between your lines
              whenever you want.
            </Head>

            <div className='duo-who-table' data-reveal=''>
              <div className='duo-who-col duo-who-col-1'>
                <p className='duo-who-head'>
                  <LineMark on={1} className='duo-mark-sm' />
                  <span>Your number</span>
                  <strong className='duo-masked'>{MASKED}</strong>
                </p>
                <ul>
                  {OWN_CONTACTS.map(([name, role], i) => (
                    <li key={name} style={order(i)}>
                      <span className='duo-who-avatar' aria-hidden='true'>
                        {initials(name)}
                      </span>
                      <span>
                        <strong>{name}</strong>
                        <small>{role}</small>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className='duo-who-col duo-who-col-2 duo-on-green'>
                <p className='duo-who-head'>
                  <LineMark on={2} className='duo-mark-sm' />
                  <span>Your second number</span>
                  <strong>{LINE}</strong>
                </p>
                <ul>
                  {SECOND_CONTACTS.map(([name, role], i) => (
                    <li key={name} style={order(i + 1)}>
                      <span className='duo-who-avatar' aria-hidden='true'>
                        {initials(name)}
                      </span>
                      <span>
                        <strong>{name}</strong>
                        <small>{role}</small>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className='duo-fine'>Example contacts and numbers.</p>
          </div>
        </section>

        <section className='duo-section duo-uses' aria-labelledby='duo-uses-title'>
          <div className='duo-wrap'>
            <Head id='duo-uses-title' line={2} title='A number for every new hello.'>
              Selling online, a side business, new clients, dating: get one number or a few, and manage them all on one
              iPhone.
            </Head>

            <div className='duo-sims'>
              {USE_CASES.map((item, i) => (
                <article key={item.tag} className={`duo-sim duo-sim-${item.tone}`} data-reveal='' style={delay(i * 90)}>
                  <div className='duo-sim-photo'>
                    <img className='duo-sim-duo' src={photo(item.photo, 640, 520)} alt='' loading='lazy' />
                    <img className='duo-sim-color' src={photo(item.photo, 640, 520)} alt='' loading='lazy' />
                  </div>
                  <Chip className='duo-sim-chip' />
                  <p className='duo-sim-tag'>{item.tag}</p>
                  <h3>{item.title}</h3>
                  <p className='duo-sim-text'>{item.text}</p>
                  <p className='duo-sim-number'>
                    <span>{item.number}</span>
                    <small>{item.place} · example</small>
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className='duo-section duo-steps' aria-labelledby='duo-steps-title'>
          <div className='duo-wrap'>
            <Head id='duo-steps-title' line={2} title='Your second line, in three steps.' />
            <ol className='duo-steps-list'>
              {STEPS.map((step, i) => (
                <li key={step.title} className='duo-step' data-reveal='' style={delay(i * 120)}>
                  <span className='duo-step-no'>0{i + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                  <div className='duo-step-ui' aria-hidden='true'>
                    {i === 0 ? (
                      <ul className='duo-panel duo-countries'>
                        {COUNTRIES.map((country, c) => (
                          <li key={country.name} className={c === 0 ? 'is-picked' : undefined}>
                            <span className='duo-flag'>{country.flag}</span>
                            <span>{country.name}</span>
                            <small>{country.code}</small>
                            {c === 0 ? <Check size={15} strokeWidth={3} /> : null}
                          </li>
                        ))}
                      </ul>
                    ) : i === 1 ? (
                      <div className='duo-panel duo-copy'>
                        <small>Your 2nd line</small>
                        <strong>
                          <TypeIn text={`+1 ${LINE}`} start={500} />
                        </strong>
                        <span className='duo-copy-actions'>
                          <span className='duo-copy-btn'>
                            <Copy size={14} strokeWidth={2.6} /> Copy number
                          </span>
                          <span className='duo-copy-done'>
                            <Check size={14} strokeWidth={3} /> Copied
                          </span>
                        </span>
                      </div>
                    ) : (
                      <div className='duo-panel duo-mini-chat'>
                        <p className='duo-bubble duo-bubble-in'>Is the table still available?</p>
                        <p className='duo-bubble duo-bubble-out'>It is! Want to see it Saturday?</p>
                        <small>Sent from {LINE}</small>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className='duo-section duo-rules duo-on-dark' data-header='dark' aria-labelledby='duo-rules-title'>
          <div className='duo-wrap'>
            <Head id='duo-rules-title' line={2} title='Your line. Your rules.'>
              Quiet hours, a voicemail greeting for each number, spam blocking and call recording. Your personal time
              stays personal.
            </Head>

            <div className='duo-rules-grid' data-reveal=''>
              <div className='duo-cell duo-cell-dnd'>
                <h3>
                  <Moon size={20} aria-hidden='true' /> Do Not Disturb
                </h3>
                <p>Choose when your second line rings: all the time, or on a schedule.</p>
                <div className='duo-cell-ui duo-dnd' aria-hidden='true'>
                  <div className='duo-dnd-row duo-dnd-switch'>
                    <span>Do Not Disturb</span>
                    <span className='duo-toggle is-on' />
                  </div>
                  <div className='duo-dnd-row duo-dnd-mode'>
                    <span>Based on schedule</span>
                    <Check size={16} strokeWidth={3} />
                  </div>
                  {DND_WEEK.map(([day, hours]) => (
                    <div key={day} className='duo-dnd-row'>
                      <span>{day}</span>
                      <span className='duo-dnd-hours'>{hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className='duo-cell duo-cell-numbers'>
                <h3>
                  <Plus size={20} aria-hidden='true' /> Several numbers
                </h3>
                <p>One iPhone, several lines. Switch between them anytime.</p>
                <div className='duo-cell-ui duo-numbers' aria-hidden='true'>
                  {[
                    ['🇺🇸', `+1 ${LINE}`, 'Shop'],
                    ['🇬🇧', '+44 20 7946 0958', 'Business'],
                  ].map(([flag, number, use], i) => (
                    <div key={number} className='duo-number-row'>
                      <span className='duo-flag'>{flag}</span>
                      <span className='duo-number-text'>
                        <strong>{number}</strong>
                        <small>{use} · example</small>
                      </span>
                      <span className={i === 0 ? 'duo-toggle is-on' : 'duo-toggle'} />
                    </div>
                  ))}
                </div>
              </div>

              <div className='duo-cell duo-cell-voice'>
                <h3>
                  <Voicemail size={20} aria-hidden='true' /> Voicemail and auto-replies
                </h3>
                <p>A greeting for each number, and replies for missed messages.</p>
                <div className='duo-cell-ui' aria-hidden='true'>
                  <div className='duo-greeting'>
                    <span className='duo-play' />
                    <span className='duo-wave'>
                      {Array.from({ length: 22 }, (_, i) => (
                        <i key={i} style={{ animationDelay: `${(i % 7) * -0.13}s` }} />
                      ))}
                    </span>
                    <small>0:12</small>
                  </div>
                  <p className='duo-auto'>
                    <small>Auto-reply</small>
                    Thanks for your message! I’ll get back to you after 9 am.
                  </p>
                </div>
              </div>

              <div className='duo-cell duo-cell-record'>
                <h3>
                  <CircleDot size={20} aria-hidden='true' /> Call recording
                </h3>
                <p>Record with one tap and play important calls back anytime.</p>
                <div className='duo-cell-ui' aria-hidden='true'>
                  <div className='duo-rec'>
                    <span className='duo-rec-dot' />
                    <span>Recording…</span>
                    <strong>03:34</strong>
                  </div>
                </div>
              </div>

              <div className='duo-cell duo-cell-block'>
                <h3>
                  <Ban size={20} aria-hidden='true' /> Spam blocking
                </h3>
                <p>Block the numbers you don’t want to hear from.</p>
                <ul className='duo-cell-ui duo-blocked' aria-hidden='true'>
                  <li>
                    <span>(415) 555-0190</span>
                    <em>Blocked</em>
                  </li>
                  <li>
                    <span>(213) 555-0104</span>
                    <em>Blocked</em>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className='duo-travel duo-on-dark' aria-labelledby='duo-travel-title'>
          <div className='duo-travel-photo' data-header='dark'>
            <img src={photo('departures', 1200, 1100)} alt='' loading='lazy' />
          </div>
          <div className='duo-travel-body' data-header='dark'>
            <div className='duo-travel-copy'>
              <Head id='duo-travel-title' line={2} title='Abroad? Call home over Wi‑Fi.'>
                Calls and texts go over the Internet, so you can stay in touch from anywhere in the world and leave
                roaming charges out of it. No mobile plan needed.
              </Head>
              <div className='duo-island-call' data-reveal='' style={delay(200)} aria-hidden='true'>
                <span className='duo-island-avatar'>M</span>
                <span className='duo-island-text'>
                  <strong>Mom</strong>
                  <small>
                    <Wifi size={12} strokeWidth={2.8} /> Wi‑Fi call · 2nd line
                  </small>
                </span>
                <span className='duo-island-time'>12:48</span>
              </div>
            </div>
          </div>
        </section>

        <section className='duo-section duo-shots' aria-labelledby='duo-shots-title'>
          <div className='duo-wrap duo-shots-grid'>
            <Head id='duo-shots-title' line={2} title='Inside the app.'>
              Your numbers, voicemail with call recording, and Do Not Disturb, as the App Store shows them.
            </Head>
            <div className='duo-shots-row'>
              {SCREENSHOTS.map((url, i) => (
                <figure key={url} className='duo-shot' data-reveal='' style={delay(i * 110)}>
                  <img src={url} alt={`${APP.name}: ${SCREENSHOT_CAPTIONS[i].title}`} loading='lazy' width={300} height={649} />
                  <figcaption>
                    <strong>{SCREENSHOT_CAPTIONS[i].title}</strong>
                    {SCREENSHOT_CAPTIONS[i].text}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className='duo-faq' aria-labelledby='duo-faq-title'>
          <span className='duo-bg duo-faq-bg-1' data-header='light' aria-hidden='true' />
          <span className='duo-bg duo-faq-bg-2' data-header='dark' aria-hidden='true' />
          <div className='duo-faq-intro'>
            <Head id='duo-faq-title' line='both' title='Good questions.' />
          </div>
          <div className='duo-faq-aside duo-on-dark' data-reveal=''>
            <p>Still deciding? Here is what people ask before they get a second number.</p>
            <button type='button' className='duo-cta duo-cta-green' onClick={onStart}>
              Get my second number
              <ArrowRight size={20} strokeWidth={2.4} aria-hidden='true' />
            </button>
          </div>
          {([1, 2] as const).map((line) => (
            <div
              key={line}
              className={line === 1 ? 'duo-faq-col duo-faq-col-1' : 'duo-faq-col duo-faq-col-2 duo-on-dark'}
              data-reveal=''
              style={delay(line === 1 ? 0 : 140)}
            >
              <h3 className='duo-faq-title'>
                <LineMark on={line} className='duo-mark-sm' />
                {line === 1 ? 'How it works' : 'Good to know'}
              </h3>
              {FAQ.filter((item) => item.line === line).map((item) => (
                <details key={item.question}>
                  <summary>
                    {item.question}
                    <span className='duo-faq-icon' aria-hidden='true'>
                      <Plus size={18} strokeWidth={2.2} />
                    </span>
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          ))}
        </section>

        <section className='duo-final' aria-labelledby='duo-final-title'>
          <span className='duo-bg duo-final-bg-1' data-header='dark' aria-hidden='true' />
          <span className='duo-bg duo-final-bg-2' data-header='green' aria-hidden='true' />
          <h2 id='duo-final-title' className='duo-sr'>
            Keep your number. Get a second one.
          </h2>

          <div className='duo-final-half duo-final-keep duo-on-dark' data-reveal=''>
            <LineMark on={1} />
            <p className='duo-final-line' aria-hidden='true'>
              Keep
              <br />
              yours.
            </p>
            <strong className='duo-id-number duo-masked' aria-hidden='true'>
              {MASKED}
            </strong>
            <p className='duo-final-text'>For family, friends and everyone who already has it.</p>
            <div className='duo-final-notif' aria-hidden='true'>
              <span className='duo-final-notif-app'>
                <MessageCircle size={16} fill='currentColor' strokeWidth={0} />
              </span>
              <span>
                <b>Mom</b>
                <span>Dinner on Sunday? ❤️</span>
                <small>To your own number</small>
              </span>
            </div>
          </div>

          <div className='duo-final-sim' data-reveal='' style={delay(250)} aria-hidden='true'>
            <div className='duo-sim-card'>
              <Chip />
              <b>2</b>
            </div>
          </div>

          <div className='duo-final-half duo-final-get duo-on-green' data-reveal='' style={delay(150)}>
            <LineMark on={2} />
            <p className='duo-final-line' aria-hidden='true'>
              Get a
              <br />
              second one.
            </p>
            <p className='duo-final-number'>
              <TypeIn className='duo-id-number' text={LINE} start={700} />
              <small>Example</small>
            </p>
            <p className='duo-final-text'>For buyers, clients, dates and trips.</p>
            {price}
            <button type='button' className='duo-cta' onClick={onStart}>
              Get my second number
              <ArrowRight size={20} strokeWidth={2.4} aria-hidden='true' />
            </button>
            <p className='duo-terms'>{terms.terms}</p>
          </div>
        </section>
      </main>

      <footer className='duo-footer' data-header='dark'>
        <div className='duo-footer-grid'>
          <div>
            <p>
              {APP.name} is developed by {APP.legalName}.
            </p>
            <p>The app is not intended for emergency calls such as 911.</p>
          </div>
          <div>
            <nav aria-label='Legal'>
              <a href={APP.privacyUrl} target='_blank' rel='noopener noreferrer'>
                Privacy Policy
              </a>
              <a href={APP.termsUrl} target='_blank' rel='noopener noreferrer'>
                Terms of Use
              </a>
            </nav>
            <p>Payment details are processed securely by our payment provider. Photos: Unsplash.</p>
          </div>
        </div>
      </footer>

      <div className={showDock ? 'duo-dock is-visible' : 'duo-dock'} aria-hidden={!showDock}>
        <div className='duo-dock-bar'>
          <span className='duo-dock-line'>
            <img src={APP.iconUrl} alt='' width={42} height={42} />
            <span className='duo-dock-text'>
              <strong>{terms.today ?? terms.regular}</strong>
              <small>{terms.today ? `then ${terms.regular}` : 'Cancel anytime'}</small>
            </span>
          </span>
          <button type='button' className='duo-dock-cta' onClick={onStart} tabIndex={showDock ? 0 : -1}>
            Get a number
            <ArrowRight size={18} strokeWidth={2.4} aria-hidden='true' />
          </button>
        </div>
      </div>
    </div>
  );
}
