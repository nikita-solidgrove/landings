import '@fontsource-variable/fredoka/standard.css';
import '@fontsource-variable/nunito';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowRight, ArrowUpRight, CalendarDays, Plus } from 'lucide-react';
import { useReveal } from '../../shared/motion';
import { ProgressiveBlur } from '../../shared/ProgressiveBlur';
import { describeOffer, initials, type LandingProps } from '../../shared/offer';
import { Avatar, CheckBox, Family, HeadNote, Magnet, MarkIcon, Note, Polaroid, TodoRow, tilt } from './bits';
import {
  APP,
  DETAILS,
  DIARY_EXAMPLES,
  FAMILY,
  FAQ,
  MEMBERS,
  PROOF,
  SCREENSHOTS,
  STEPS,
  TODAY,
  TODAY_DONE,
  WEEK,
  photo,
} from './content';
import { FamilyDemo } from './FamilyDemo';
import './page.css';

const delay = (ms: number) => ({ '--reveal-delay': `${ms}ms` }) as CSSProperties;
const order = (i: number) => ({ '--i': i }) as CSSProperties;

/** Small, deliberate tilts so the collage stays tidy. */
const TILTS = [-1.6, 1.3, -0.9, 1.7, -1.3, 1.1, -1.8];

const CTA_LABEL = 'Start our family plan';

export function HomeHugPage({ offer, creator, onStart }: LandingProps) {
  const root = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);
  const heroCta = useRef<HTMLButtonElement>(null);
  const [showDock, setShowDock] = useState(false);
  const [headerStuck, setHeaderStuck] = useState(false);
  const [headerTone, setHeaderTone] = useState<'light' | 'dark'>('light');
  const terms = describeOffer(offer);
  const leftToday = TODAY.flatMap((part) => part.todos).filter((todo) => !todo.done).length;

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
    <div className='hh' ref={root}>
      {creator && offer.discountPercent ? (
        <div className='hh-ribbon'>
          {creator.avatarUrl ? (
            <img src={creator.avatarUrl} alt='' className='hh-ribbon-avatar' />
          ) : (
            <span className='hh-ribbon-avatar' aria-hidden='true'>{initials(creator.name)}</span>
          )}
          <p>
            <strong>{creator.name}</strong> picked this app for you
          </p>
          <span className='hh-ribbon-deal'>−{offer.discountPercent}% today</span>
        </div>
      ) : null}

      <header ref={header} className='hh-header' data-stuck={headerStuck} data-tone={headerTone}>
        <div className='hh-header-backdrop' aria-hidden='true'>
          <ProgressiveBlur layers={6} maxBlur={18} />
          <div className='hh-header-tint hh-header-tint-light' />
          <div className='hh-header-tint hh-header-tint-dark' />
        </div>
        <div className='hh-wrap hh-header-row'>
          <div className='hh-bar'>
            <a href='#top' className='hh-identity'>
              <img src={APP.iconUrl} alt='' width={42} height={42} />
              <strong>{APP.name}</strong>
            </a>
            <span className='hh-bar-family'>
              <Family size='md' />
              <small>Shared family planner</small>
            </span>
            <button type='button' className='hh-bar-cta' onClick={onStart}>
              Get HomeHug
            </button>
          </div>
        </div>
      </header>

      <main id='top'>
        {/* ---------- Hero: the fridge door ---------- */}
        <section className='hh-hero' aria-labelledby='hh-hero-title'>
          <div className='hh-door-wrap'>
            <div className='hh-door'>
              <span className='hh-door-handle' aria-hidden='true' />
              <div className='hh-hero-grid'>
                <div className='hh-hero-copy'>
                  <div className='hh-note hh-hero-note' style={tilt(-1)}>
                    <Magnet tone='anna' className='hh-magnet-l' />
                    <Magnet tone='kate' className='hh-magnet-r' />
                    <div className='hh-note-sheet'>
                      <h1 id='hh-hero-title' className='hh-display'>
                        Finally, everyone knows the plan.
                      </h1>
                      <p className='hh-lead'>
                        Jot it down like a note on the fridge. HomeHug’s AI turns it into to-dos, reminders and lists
                        your whole family shares.
                      </p>
                      <div className='hh-offer'>
                        {terms.today ? (
                          <p className='hh-price'>
                            <strong>{terms.today}</strong> <s>{terms.regular}</s> <span>first payment</span>
                          </p>
                        ) : null}
                        <button ref={heroCta} type='button' className='hh-btn' onClick={onStart}>
                          {CTA_LABEL}
                          <ArrowRight size={21} strokeWidth={2.6} aria-hidden='true' />
                        </button>
                        <p className='hh-terms'>{terms.terms}</p>
                      </div>
                    </div>
                  </div>
                  <ul className='hh-words'>
                    {PROOF.map((item, i) => (
                      <li key={item} style={tilt([-1.5, 1.2, -0.6][i], order(i))}>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Polaroid className='hh-hero-print-m' src={photo('baking', 220)} deg={5} magnet='john' />
                </div>

                <div className='hh-hero-stage'>
                  <Polaroid className='hh-hero-print hh-hero-print-a' src={photo('baking', 300)} deg={6} magnet='john' lazy={false} />
                  <Polaroid className='hh-hero-print hh-hero-print-b' src={photo('schoolRun', 280)} deg={-5} magnet='billy' lazy={false} />
                  <FamilyDemo />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- The family diary: what you write → what HomeHug files ---------- */}
        <section className='hh-section hh-diary' aria-labelledby='hh-diary-title'>
          <div className='hh-wrap'>
            <HeadNote
              id='hh-diary-title'
              magnet='anna'
              deg={-1.4}
              text='Skip the forms. Write a thought in the shared family diary and the AI files it as a to-do, a reminder or a list item.'
            >
              Write it the way you’d say it.
            </HeadNote>

            <ol className='hh-examples' tabIndex={0} aria-label='Notes and what HomeHug made of them'>
              {DIARY_EXAMPLES.map((item, i) => (
                <li key={item.note} className='hh-example'>
                  <Note paper={item.from} magnet={item.from} deg={TILTS[i]} reveal={i * 110} className='hh-example-note'>
                    <p>{item.note}</p>
                    <span className='hh-example-by'>
                      <Avatar who={item.from} size='sm' /> {FAMILY[item.from]} wrote
                    </span>
                  </Note>
                  <span className='hh-example-link' aria-hidden='true'>
                    <img src={APP.iconUrl} alt='' />
                  </span>
                  <div className='hh-example-result' data-reveal='' style={delay(i * 110 + 260)}>
                    <span className='hh-result-action'>
                      {item.action}
                      <ArrowUpRight size={14} strokeWidth={2.6} aria-hidden='true' />
                    </span>
                    {item.items ? (
                      <>
                        <strong className='hh-result-title'>{item.title}</strong>
                        <ul className='hh-todos'>
                          {item.items.map((title) => (
                            <TodoRow key={title} todo={{ id: title, title, who: item.from }} />
                          ))}
                        </ul>
                      </>
                    ) : (
                      <>
                        <strong className='hh-result-title'>
                          {item.title} <MarkIcon mark={item.mark === 'list' ? undefined : item.mark} />
                        </strong>
                        <span className='hh-result-where'>{item.where}</span>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            <p className='hh-fineprint'>Examples from the App Store listing and the app’s screenshots.</p>
          </div>
        </section>

        {/* ---------- One week on the planner ---------- */}
        <section className='hh-section hh-week' data-header='dark' aria-labelledby='hh-week-title'>
          <div className='hh-wrap'>
            <HeadNote
              id='hh-week-title'
              magnet='kate'
              deg={1.1}
              text='Assign a to-do to anyone at home, or let the AI help decide who. Everyone sees the same plan, and what’s already done.'
            >
              One week. Everyone on it.
            </HeadNote>

            <div className='hh-planner' data-reveal=''>
              <Magnet tone='anna' />
              <Magnet tone='john' className='hh-planner-magnet-r' />
              <div className='hh-planner-top'>
                <strong className='hh-planner-title'>This week</strong>
                <ul className='hh-legend' aria-label='The family'>
                  {MEMBERS.map((id) => (
                    <li key={id}>
                      <Avatar who={id} size='sm' />
                      {FAMILY[id]}
                    </li>
                  ))}
                </ul>
              </div>
              <ol className='hh-days'>
                {WEEK.map((item, i) => (
                  <li key={item.day} className='hh-day'>
                    <span className='hh-day-label'>
                      <span>{item.day}</span>
                      <b>{item.date}</b>
                    </span>
                    <Polaroid
                      className='hh-day-photo'
                      src={photo(item.photo, 360)}
                      deg={TILTS[i + 1] * 1.4}
                      magnet={item.task.who}
                    />
                    <div className={item.task.done ? 'hh-day-task is-done' : 'hh-day-task'}>
                      <CheckBox done={item.task.done} />
                      <span className='hh-day-title'>
                        <span className='hh-day-text'>{item.task.title}</span>
                        <small>
                          {item.task.done ? `Done by ${FAMILY[item.task.who]}` : item.task.meta ?? FAMILY[item.task.who]}
                        </small>
                      </span>
                      <span className='hh-day-marks'>
                        {item.everyone ? <Family /> : <Avatar who={item.task.who} size='sm' />}
                        <MarkIcon mark={item.task.mark} />
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <p className='hh-fineprint hh-fineprint-light'>Example week.</p>
          </div>
        </section>

        {/* ---------- Getting started: a list pad that ticks itself ---------- */}
        <section className='hh-section hh-steps' aria-labelledby='hh-steps-title'>
          <div className='hh-wrap hh-steps-grid'>
            <div>
              <HeadNote id='hh-steps-title' magnet='billy' deg={-1}>
                Set up in three ticks.
              </HeadNote>
              <div className='hh-list' data-reveal=''>
                <ol>
                  {STEPS.map((item, i) => (
                    <li key={item.title} style={order(i)}>
                      <span className='hh-tick' aria-hidden='true'>
                        <svg viewBox='0 0 26 26'>
                          <path d='M7 13.5l4 4L19.5 9' pathLength={1} />
                        </svg>
                      </span>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </li>
                  ))}
                </ol>
              </div>
              <button type='button' className='hh-btn hh-steps-cta' onClick={onStart}>
                {CTA_LABEL}
                <ArrowRight size={21} strokeWidth={2.6} aria-hidden='true' />
              </button>
            </div>

            <div className='hh-steps-photo' data-reveal='' style={delay(150)}>
              <Polaroid
                className='hh-steps-print'
                src={photo('sofaPhone', 760, 912)}
                alt='A couple on the sofa looking at one phone together'
                deg={2.2}
                pin='tape'
              />
              <div className='hh-toast' aria-hidden='true'>
                <img src={APP.iconUrl} alt='' />
                <span className='hh-toast-body'>
                  <span className='hh-notify-top'>
                    <b>HomeHug</b>
                    <small>9:00 PM</small>
                  </span>
                  <strong>Reminder: Prepare school lunch</strong>
                  <small>Every workday</small>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Today view on the door ---------- */}
        <section className='hh-section hh-today' aria-labelledby='hh-today-title'>
          <div className='hh-wrap'>
            <div className='hh-today-grid'>
              <div>
                <HeadNote
                  id='hh-today-title'
                  magnet='grape'
                  deg={1}
                  text='Today splits your to-dos into morning, afternoon and evening, and the app icon shows how many are left for today.'
                >
                  Morning, afternoon, evening. Sorted.
                </HeadNote>
                <ul className='hh-details'>
                  {DETAILS.map((item, i) => (
                    <Note
                      as='li'
                      key={item.title}
                      paper={item.who}
                      magnet={item.who}
                      deg={TILTS[i + 2]}
                      reveal={i * 90}
                      className='hh-detail'
                    >
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </Note>
                  ))}
                </ul>
              </div>

              <div className='hh-today-card' data-reveal='' style={delay(120)}>
                <div className='hh-today-head'>
                  <span className='hh-today-title'>
                    <CalendarDays size={22} strokeWidth={2.4} aria-hidden='true' />
                    Today
                  </span>
                  <Family size='md' />
                </div>
                {TODAY.map((part) => (
                  <section key={part.part} className='hh-part'>
                    <h4>{part.part}</h4>
                    <ul className='hh-todos'>
                      {part.todos.map((todo) => (
                        <TodoRow key={todo.id} todo={todo} />
                      ))}
                    </ul>
                  </section>
                ))}
                <div className='hh-done'>
                  <h4>Done by the family</h4>
                  <ul className='hh-todos hh-todos-grid'>
                    {TODAY_DONE.map((todo) => (
                      <TodoRow key={todo.id} todo={todo} />
                    ))}
                  </ul>
                </div>
                <div className='hh-badge-icon' role='img' aria-label={`App icon showing ${leftToday} to-dos left today`}>
                  <img src={APP.iconUrl} alt='' />
                  <span aria-hidden='true'>{leftToday}</span>
                </div>
              </div>
            </div>
            <p className='hh-fineprint'>Example day. To-dos from the app’s screenshots.</p>
          </div>
        </section>

        {/* ---------- Screenshots, pinned up ---------- */}
        <section className='hh-section hh-shots-section' aria-labelledby='hh-shots-title'>
          <div className='hh-wrap'>
            <HeadNote
              id='hh-shots-title'
              magnet='john'
              deg={-1.2}
              text='The App Store screenshots: Upcoming, the AI diary, the family to-do list and the shared groceries.'
            >
              The plan, in every pocket.
            </HeadNote>
            <ul className='hh-shots' tabIndex={0} aria-label='App screenshots'>
              {SCREENSHOTS.map((item, i) => (
                <li key={item.url} className='hh-shot' data-reveal='' style={tilt(TILTS[i + 3], delay(i * 100))}>
                  <Magnet tone={MEMBERS[i]} />
                  <img src={item.url} alt={item.alt} loading='lazy' width={300} height={649} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- FAQ: notes ---------- */}
        <section className='hh-section hh-faq-section' data-header='dark' aria-labelledby='hh-faq-title'>
          <div className='hh-wrap hh-faq-grid'>
            <HeadNote id='hh-faq-title' magnet='kate' deg={-1.5} text='Still deciding? Here are the short answers.'>
              Good to know.
            </HeadNote>
            {FAQ.map((item, i) => (
              <Note key={item.question} magnet={MEMBERS[i % MEMBERS.length]} deg={TILTS[i] * 0.6} reveal={(i % 2) * 90} className='hh-faq-note'>
                <details>
                  <summary>
                    {item.question}
                    <span className='hh-faq-toggle' aria-hidden='true'>
                      <Plus size={18} strokeWidth={2.8} />
                    </span>
                  </summary>
                  <p>{item.answer}</p>
                </details>
              </Note>
            ))}
          </div>
        </section>

        {/* ---------- Final call: the door, the button is the magnet holding the note ---------- */}
        <section className='hh-final' aria-labelledby='hh-final-title'>
          <div className='hh-door-wrap'>
            <div className='hh-door hh-door-final'>
              <span className='hh-door-handle' aria-hidden='true' />
              <Polaroid className='hh-final-print hh-final-print-1' src={photo('grandma', 320)} deg={-6} magnet='kate' />
              <Polaroid className='hh-final-print hh-final-print-2' src={photo('breakfast', 300)} deg={4} magnet='john' />
              <Polaroid className='hh-final-print hh-final-print-3' src={photo('familyKitchen', 320)} deg={5} magnet='billy' />

              <div className='hh-final-center'>
                <div className='hh-note hh-final-note hh-drop' data-reveal='' style={tilt(-1.4)}>
                  <div className='hh-note-sheet'>
                    <h2 id='hh-final-title' className='hh-display'>
                      <span>Off the fridge.</span> <span>Onto every phone.</span>
                    </h2>
                    <p>One plan the whole family can see, tick and count on.</p>
                  </div>
                  <button type='button' className='hh-magnet-cta' onClick={onStart}>
                    {CTA_LABEL}
                    <ArrowRight size={24} strokeWidth={2.6} aria-hidden='true' />
                  </button>
                </div>
                <p className='hh-final-terms'>{terms.terms}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className='hh-footer' data-header='dark'>
        <span className='hh-vent' aria-hidden='true' />
        <div className='hh-wrap hh-footer-row'>
          <span className='hh-footer-id'>
            <img src={APP.iconUrl} alt='' width={36} height={36} />
            {APP.name}
          </span>
          <p>
            {APP.storeName} is developed by {APP.legalName}. Payment details are processed securely by our payment
            provider. Photos: Unsplash.
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

      <div className={showDock ? 'hh-dock is-visible' : 'hh-dock'} aria-hidden={!showDock}>
        <img src={APP.iconUrl} alt='' width={44} height={44} />
        <span className='hh-dock-text'>
          <strong>{terms.today ?? terms.regular}</strong>
          <small>{terms.today ? `then ${terms.regular}` : 'cancel anytime'}</small>
        </span>
        <Family />
        <button type='button' className='hh-btn' onClick={onStart} tabIndex={showDock ? 0 : -1}>
          Get HomeHug
        </button>
      </div>
    </div>
  );
}
