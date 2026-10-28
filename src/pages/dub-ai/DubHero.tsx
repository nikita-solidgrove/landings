import { Fragment, useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../../shared/motion';
import { HEADLINE, heroShot } from './content';

// The original line holds longest, so English is what most visitors read first.
const HOLD_ORIGINAL = 5200;
const HOLD_DUB = 2600;
const DURATIONS = HEADLINE.map((_, i) => (i === 0 ? HOLD_ORIGINAL : HOLD_DUB));
const STARTS = DURATIONS.map((_, i) => DURATIONS.slice(0, i).reduce((sum, ms) => sum + ms, 0));
const TOTAL = DURATIONS.reduce((sum, ms) => sum + ms, 0);

/** Sentences of a subtitle, so a line only breaks between them (like a subtitler would). */
const sentences = (text: string) => text.split(/(?<=[.。।])\s*/).filter(Boolean);

const chapterAt = (t: number) => {
  let i = 0;
  while (i < STARTS.length - 1 && STARTS[i + 1] <= t) i++;
  return i;
};

/**
 * The opening shot: a full-bleed letterboxed frame whose subtitle is the headline. The subtitle is
 * re-dubbed language after language while a playhead runs along the chapter bar under the frame;
 * a chapter tap jumps to that language.
 */
export function DubHero() {
  const reduced = prefersReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const scrub = useRef<HTMLDivElement>(null);
  const elapsed = useRef(0);
  const visible = useRef(true);
  const shown = useRef(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const target = root.current;
    if (!target || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let last = performance.now();
    // Hold the first frame while the letterbox opens.
    let wait = 1000;
    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      if (wait > 0) wait -= dt;
      else if (visible.current && !document.hidden) elapsed.current = (elapsed.current + dt) % TOTAL;
      const i = chapterAt(elapsed.current);
      if (i !== shown.current) {
        shown.current = i;
        setActive(i);
      }
      scrub.current?.style.setProperty('--p', (elapsed.current / TOTAL).toFixed(4));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const jump = (i: number) => {
    elapsed.current = STARTS[i];
    shown.current = i;
    setActive(i);
    scrub.current?.style.setProperty('--p', (STARTS[i] / TOTAL).toFixed(4));
  };

  const line = HEADLINE[active];
  const original = active === 0;

  return (
    <div ref={root} className='dub-opening'>
      <div className='dub-shot'>
        <img
          className='dub-shot-img'
          src={heroShot(1280)}
          srcSet={`${heroShot(800)} 800w, ${heroShot(1280)} 1280w, ${heroShot(1920)} 1920w, ${heroShot(2560)} 2560w`}
          sizes='100vw'
          alt=''
          width={1920}
          height={1080}
          fetchPriority='high'
        />
        <div className='dub-shot-top' aria-hidden='true'>
          <span className='dub-shot-track'>
            <i className={original ? 'dub-track-dot' : 'dub-track-dot is-dub'} />
            <b>{line.code}</b>
            {original ? 'Original' : `${line.name} · your voice`}
          </span>
          <span>Example</span>
        </div>
        <span className={original ? 'dub-shot-lips' : 'dub-shot-lips is-on'} aria-hidden='true'>
          <span>Lip-sync</span>
        </span>
        <h1 className='dub-subline'>
          <span className='dub-sr'>{HEADLINE[0].text}</span>
          <span key={line.code} className='dub-subline-text' lang={line.lang} aria-hidden='true'>
            {sentences(line.text).map((part, i) => (
              <Fragment key={i}>
                {i > 0 && line.lang !== 'ja' ? ' ' : null}
                <span className='dub-subline-part'>{part}</span>
              </Fragment>
            ))}
          </span>
        </h1>
      </div>

      <div className='dub-wrap'>
        <div ref={scrub} className='dub-scrub' style={{ ['--p' as string]: '0' }}>
          <span className='dub-scrub-bar' aria-hidden='true'>
            <span className='dub-scrub-fill' />
          </span>
          <div className='dub-chapters' role='group' aria-label='Play the headline in another language'>
            {HEADLINE.map((item, i) => (
              <button
                key={item.code}
                type='button'
                className='dub-chapter'
                aria-pressed={i === active}
                aria-label={i === 0 ? 'English original' : item.name}
                style={{ flexGrow: DURATIONS[i] }}
                onClick={() => jump(i)}
              >
                <b>{item.code}</b>
                <span>{i === 0 ? 'Original' : item.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
