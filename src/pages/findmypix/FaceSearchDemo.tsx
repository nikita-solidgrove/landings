import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Globe } from 'lucide-react';
import { prefersReducedMotion } from '../../shared/motion';
import { DEMO_SUBJECTS, groupUrl, photo, similarityTone, type DemoMatch, type DemoSubject } from './content';
import { boxStyle, ShotImage } from './Frame';
import { GreaseLoop } from './Grease';

type Phase = 'scan' | 'search' | 'results';

const SCAN_MS = 2000;
const SEARCH_MS = 1800;
const MATCH_MS = 1000;
const HOLD_MS = 4400;

const selfieUrl = (subject: DemoSubject, width: number) =>
  photo(subject.selfie.photo, width, Math.round(width / 1.5), subject.selfie.focus);

/**
 * The app's search as a strip of film: your photo is the first frame, the matches are exposed one
 * by one, circled, each with the app's similarity badge and its source. Loops once it is in view.
 */
export function FaceSearchDemo() {
  const reduced = prefersReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(reduced);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>(reduced ? 'results' : 'scan');
  const [shown, setShown] = useState(reduced ? DEMO_SUBJECTS[0].matches.length : 0);
  const [run, setRun] = useState(0);

  const subject = DEMO_SUBJECTS[index];
  const total = subject.matches.length;

  // Warm the cache so every frame lands with its picture.
  useEffect(() => {
    for (const item of DEMO_SUBJECTS) {
      new Image().src = selfieUrl(item, 540);
      new Image().src = selfieUrl(item, 96);
      for (const found of item.matches) new Image().src = groupUrl(found.shot);
    }
  }, []);

  // Start the first search when the strip is actually on screen.
  useEffect(() => {
    const el = root.current;
    if (!el || live) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setLive(true);
        setRun((value) => value + 1);
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [live]);

  useEffect(() => {
    if (reduced || !live) return;
    let timer: number;
    if (phase === 'scan') {
      timer = window.setTimeout(() => setPhase('search'), SCAN_MS);
    } else if (phase === 'search') {
      timer = window.setTimeout(() => {
        setPhase('results');
        setShown(1);
      }, SEARCH_MS);
    } else if (shown < total) {
      timer = window.setTimeout(() => setShown(shown + 1), MATCH_MS);
    } else {
      timer = window.setTimeout(() => select((index + 1) % DEMO_SUBJECTS.length), HOLD_MS);
    }
    return () => window.clearTimeout(timer);
  }, [phase, shown, total, index, run, reduced, live]);

  function select(next: number) {
    setIndex(next);
    setShown(reduced ? DEMO_SUBJECTS[next].matches.length : 0);
    setPhase(reduced ? 'results' : 'scan');
    setRun((value) => value + 1);
  }

  const status =
    phase === 'scan'
      ? 'Analyzing photo…'
      : phase === 'search'
        ? 'Searching the web…'
        : `${shown} potential match${shown === 1 ? '' : 'es'}`;

  return (
    <div className='fmp-demo' ref={root} role='group' aria-label='Example of a face search in FindMyPix'>
      <div className='fmp-roll' data-phase={phase}>
        <div className='fmp-cell fmp-cell-you'>
          <div className='fmp-cell-film'>
            <span className='fmp-cell-print' aria-hidden='true'>
              Example<span className='fmp-cell-print-more'> · stock photos</span>
            </span>
            <div className='fmp-cell-frame fmp-selfie' data-phase={phase}>
              <img key={index} src={selfieUrl(subject, 540)} alt='' />
              <span className='fmp-selfie-box fmp-brackets' aria-hidden='true' />
              <span className='fmp-scanline' aria-hidden='true' />
            </div>
          </div>
          <div className='fmp-cell-cap'>
            <strong className='fmp-cap-title'>Your photo</strong>
            <span className='fmp-status' data-phase={phase} aria-live='polite'>
              {status}
            </span>
            <span key={run} className='fmp-progress' data-phase={phase} aria-hidden='true'>
              <span />
            </span>
            <div className='fmp-faces' role='tablist' aria-label='Example faces'>
              {DEMO_SUBJECTS.map((item, i) => (
                <button
                  key={item.label}
                  type='button'
                  role='tab'
                  aria-selected={i === index}
                  aria-label={item.label}
                  onClick={() => select(i)}
                >
                  <img src={selfieUrl(item, 96)} alt='' />
                </button>
              ))}
              <span className='fmp-faces-hint'>Try another face</span>
            </div>
          </div>
        </div>

        {subject.matches.map((found, i) => {
          const done = i < shown;
          return (
            <div
              key={`${run}-${i}`}
              className='fmp-cell'
              data-state={done ? 'found' : phase === 'search' ? 'searching' : 'waiting'}
            >
              <div className='fmp-cell-film'>
                <span className='fmp-cell-print' aria-hidden='true'>
                  ▸ {i + 2}
                </span>
                <div className='fmp-cell-frame'>{done ? <MatchShot found={found} /> : <span className='fmp-unexposed' />}</div>
                {done ? <GreaseLoop seed={index * 31 + i * 7 + 3} className='fmp-cell-loop' /> : null}
              </div>
              <div className='fmp-cell-cap'>
                {done ? (
                  <>
                    <span className={`fmp-badge fmp-badge-${similarityTone(found.similarity)}`}>
                      Similarity: {found.similarity}%
                    </span>
                    <span className='fmp-site'>
                      <Globe size={15} aria-hidden='true' />
                      {found.site}
                    </span>
                    <span className='fmp-source'>
                      Open Source Page
                      <ArrowUpRight size={14} aria-hidden='true' />
                    </span>
                  </>
                ) : (
                  <span className='fmp-cap-wait' aria-hidden='true'>
                    <span />
                    <span />
                    <span />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className='fmp-demo-note'>Example with stock photos. Results depend on what is publicly available.</p>
    </div>
  );
}

function MatchShot({ found }: { found: DemoMatch }) {
  const { box } = found;
  const focus = { x: (box.x + box.w / 2) / 100, y: (box.y + box.h / 2) / 100, z: found.zoom };
  return (
    <ShotImage shot={{ photo: found.shot, focus, match: found.person }} width={540}>
      <span className='fmp-facebox fmp-brackets' style={boxStyle(box)} aria-hidden='true' />
    </ShotImage>
  );
}
