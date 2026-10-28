import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Cast } from 'lucide-react';
import { prefersReducedMotion } from '../../shared/motion';
import { USE_CASES, photo } from './content';
import { NowShowing, SectionHead } from './NowShowing';

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * A photo on a phone grows into a full-width screen as the visitor scrolls: the section is tall,
 * its inner stage sticks, and the scroll position drives `--p` (growth) and `--q` (the caption).
 */
export function ZoomToTv() {
  const section = useRef<HTMLElement>(null);
  const [still] = useState(prefersReducedMotion);

  useEffect(() => {
    const el = section.current;
    if (still || !el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const box = el.getBoundingClientRect();
      const distance = Math.max(1, el.offsetHeight - window.innerHeight);
      const raw = clamp(-box.top / distance);
      el.style.setProperty('--p', easeInOut(clamp((raw - 0.06) / 0.6)).toFixed(4));
      el.style.setProperty('--q', clamp((raw - 0.7) / 0.14).toFixed(3));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [still]);

  return (
    <section ref={section} className='smr-zoom' data-header='dark' data-still={still} aria-labelledby='smr-zoom-title'>
      <div className='smr-zoom-stage'>
        <div className='smr-wrap smr-zoom-head' data-reveal=''>
          <h2 id='smr-zoom-title' className='smr-h2'>
            Stop passing the phone around.
          </h2>
          <NowShowing n={1} />
        </div>
        <div className='smr-zoom-light' aria-hidden='true'>
          <img src={photo('dadSon', 320, 180)} alt='' loading='lazy' />
        </div>
        <div className='smr-zoom-frame' aria-hidden='true'>
          <img src={photo('dadSon', 1600, 900)} alt='' loading='lazy' />
          <span className='smr-zoom-island' />
        </div>
        <div className='smr-zoom-third'>
          <div className='smr-wrap'>
            <p>
              Holiday photos, the clip from last weekend, the video everyone has to see. Put it on the TV and the whole
              room sees it at once.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Use cases on one big screen, with a phone per use case in front of it. Tapping a phone casts its
 * picture to the screen; without a tap they take turns while the section is in view.
 */
export function UseCases() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!auto || paused || !inView || prefersReducedMotion()) return;
    const timer = window.setTimeout(() => setActive((a) => (a + 1) % USE_CASES.length), 5200);
    return () => window.clearTimeout(timer);
  }, [active, auto, paused, inView]);

  const item = USE_CASES[active];

  return (
    <section className='smr-section smr-uses-section' data-header='dark' aria-labelledby='smr-uses-title'>
      <div className='smr-wrap'>
        <SectionHead n={3} id='smr-uses-title' title='Some things deserve a bigger screen.'>
          Made for entertainment, presentations, home use and work.
        </SectionHead>

        <div
          ref={root}
          className='smr-uses'
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div className='smr-uses-light' aria-hidden='true'>
            {USE_CASES.map((use, i) => (
              <img key={use.photo} src={photo(use.photo, 320, 180)} alt='' loading='lazy' className={i === active ? 'is-on' : undefined} />
            ))}
          </div>
          <div className='smr-uses-tv'>
            <div className='smr-uses-picture'>
              {USE_CASES.map((use, i) => (
                <img
                  key={use.photo}
                  src={photo(use.photo, 1600, 900)}
                  alt=''
                  loading='lazy'
                  className={i === active ? 'is-on' : undefined}
                />
              ))}
            </div>
          </div>
          <div className='smr-uses-third' key={active} aria-live='polite'>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>

          <div className='smr-uses-phones' role='group' aria-label='Choose what to put on the screen'>
            {USE_CASES.map((use, i) => (
              <button
                key={use.photo}
                type='button'
                className='smr-uses-phone'
                aria-pressed={i === active}
                style={{ '--i': i } as CSSProperties}
                onClick={() => {
                  setActive(i);
                  setAuto(false);
                }}
              >
                <span className='smr-uses-device'>
                  <img src={photo(use.photo, 260, 560)} alt='' loading='lazy' />
                  <span className='smr-uses-cast' aria-hidden='true'>
                    <Cast />
                  </span>
                </span>
                <span className='smr-uses-name'>{use.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The closing TV: it powers on (a bright line across the dark screen that opens into the picture) once
 * it is in view and its picture has loaded, and then the room behind it lights up. The picture is never
 * clipped while waiting: Chrome does not lazy-load an image that is clipped away.
 */
export function PowerOnTv() {
  const room = useRef<HTMLDivElement>(null);
  const picture = useRef<HTMLImageElement>(null);
  const [seen, setSeen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = picture.current;
    if (img?.complete && img.naturalWidth) setLoaded(true);
    const el = room.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setSeen(true);
        observer.disconnect();
      },
      { threshold: 0.45 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={room} className='smr-final-room' data-on={seen && loaded} aria-hidden='true'>
      <div className='smr-final-light'>
        <img src={photo('movieNight', 320, 180)} alt='' loading='lazy' />
      </div>
      <div className='smr-final-tv'>
        <div className='smr-final-screen'>
          <img ref={picture} src={photo('movieNight', 1600, 900)} alt='' loading='lazy' onLoad={() => setLoaded(true)} />
          <i className='smr-final-shutter' />
          <i className='smr-final-line' />
        </div>
      </div>
    </div>
  );
}
