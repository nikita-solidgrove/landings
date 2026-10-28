import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Pause, Play } from 'lucide-react';
import { prefersReducedMotion } from '../../shared/motion';
import { APP, DUBS, creatorFrame } from './content';
import { clipTime } from './Timecode';

type Phase = 'dubbing' | 'speaking' | 'done';

const DUB_MS = 1500;
const WORD_MS = 400;
const HOLD_MS = 2600;
const STATUSES = ['Translating', 'Cloning your voice', 'Syncing lips'];

/** Fixed speech-like bar heights, so the waveforms never jump between renders. */
const bars = (count: number, seed: number) =>
  Array.from({ length: count }, (_, i) => 0.2 + 0.8 * Math.abs(Math.sin((i + seed) * 1.31) * Math.cos((i + seed) * 0.37)));

const ORIGINAL_WAVE = bars(56, 2);
const DUB_WAVES = DUBS.map((_, i) => bars(56, 7 + i * 4));
const THUMBS = [0, 1, 2, 3, 4, 5];
const MOUTHS = [0, 1, 2, 3, 4];
const height = (h: number) => ({ '--h': h.toFixed(2) }) as CSSProperties;

/**
 * The edit bay: one creator clip dubbed language after language. The vertical player runs
 * "Translating → Cloning your voice → Syncing lips", then speaks the subtitle word by word, then
 * pings an iOS notification. The timeline beside it shows the tracks Dub AI rewrites (voice, lips,
 * subtitles) under one playhead. Pauses off screen; a static, fully said clip under reduced motion.
 */
export function DubBay({ children }: { children?: ReactNode }) {
  const reduced = prefersReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(0);
  const [phase, setPhase] = useState<Phase>(reduced ? 'speaking' : 'dubbing');
  const [progress, setProgress] = useState(0);
  const [word, setWord] = useState(0);
  const [playing, setPlaying] = useState(!reduced);
  const [visible, setVisible] = useState(false);

  const language = DUBS[index];
  const joiner = language.joiner ?? ' ';
  const words = useMemo(
    () => language.cues.flatMap((cue, c) => cue.map((text, w) => ({ text, cue: c, first: w === 0 }))),
    [language],
  );

  // A new language (auto-advance or a tap) restarts the clip.
  if (shown !== index) {
    setShown(index);
    setPhase(reduced ? 'speaking' : 'dubbing');
    setProgress(0);
    setWord(0);
  }

  useEffect(() => {
    const target = root.current;
    if (!target || !('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !playing || !visible) return;
    let timer: number;
    if (phase === 'dubbing') {
      timer = window.setTimeout(() => {
        if (progress < 100) setProgress(Math.min(100, progress + 5));
        else setPhase('speaking');
      }, DUB_MS / 20);
    } else if (phase === 'speaking') {
      timer = window.setTimeout(() => {
        if (word < words.length - 1) setWord(word + 1);
        else setPhase('done');
      }, WORD_MS);
    } else {
      timer = window.setTimeout(() => setIndex((index + 1) % DUBS.length), HOLD_MS);
    }
    return () => window.clearTimeout(timer);
  }, [phase, progress, word, words.length, playing, visible, reduced, index]);

  const allSaid = reduced || phase === 'done';
  const currentCue = allSaid ? language.cues.length - 1 : words[word].cue;
  const played = phase === 'dubbing' ? 0 : allSaid ? 1 : (word + 1) / words.length;
  const durationMs = words.length * WORD_MS;
  const ticks = Array.from({ length: Math.floor(durationMs / 1000) + 1 }, (_, s) => s);
  const status = STATUSES[Math.min(STATUSES.length - 1, Math.floor(progress / (100 / STATUSES.length)))];
  const speaking = phase === 'speaking' && !reduced;

  // Where each subtitle cue starts and ends on the clip, as fractions of its length.
  let said = 0;
  const cues = language.cues.map((cue) => {
    const start = said / words.length;
    said += cue.length;
    return { text: cue.join(joiner), start, end: said / words.length };
  });

  return (
    <div ref={root} className='dub-bay' aria-label={`Example: a creator video dubbed into ${language.name}`}>
      <div className='dub-monitor'>
        <div className='dub-player'>
          <img className='dub-player-img' src={creatorFrame(640)} alt='' width={360} height={640} loading='lazy' />
          <div className='dub-player-top' aria-hidden='true'>
            <span className='dub-shot-track'>
              <i className={phase === 'dubbing' ? 'dub-track-dot' : 'dub-track-dot is-dub'} />
              <b>{language.code}</b>
              {phase === 'dubbing' ? 'Dubbing' : 'Your voice'}
            </span>
            <span>Example</span>
          </div>

          <span className={speaking ? 'dub-lips is-speaking' : 'dub-lips'} aria-hidden='true' />

          {phase === 'dubbing' && !reduced ? (
            <div className='dub-processing' aria-hidden='true'>
              <span>{status}…</span>
              <span className='dub-processing-bar'>
                <span style={{ width: `${progress}%` }} />
              </span>
            </div>
          ) : (
            <p key={`${language.code}-${currentCue}`} className='dub-player-sub' lang={language.code.toLowerCase()}>
              {(reduced ? words : words.filter((item) => item.cue === currentCue)).map((item, i) => {
                const at = words.indexOf(item);
                const state = allSaid || at < word ? 'is-said' : at === word ? 'is-now' : '';
                return (
                  <Fragment key={at}>
                    {i > 0 ? (reduced && item.first ? ' ' : joiner) : null}
                    <span className={`dub-word ${state}`}>{item.text}</span>
                  </Fragment>
                );
              })}
            </p>
          )}

          {phase === 'done' && !reduced ? (
            <div key={index} className='dub-toast' aria-hidden='true'>
              <img src={APP.iconUrl} alt='' width={34} height={34} />
              <span>
                <span className='dub-toast-head'>
                  <strong>{APP.name}</strong>
                  <small>now</small>
                </span>
                <span>Your {language.name} video is ready to share.</span>
              </span>
            </div>
          ) : null}
        </div>

        <div className='dub-transport'>
          <button
            type='button'
            className='dub-play'
            aria-label={playing ? 'Pause example' : 'Play example'}
            onClick={() => setPlaying(!playing)}
            disabled={reduced}
          >
            {playing && !reduced ? <Pause size={15} fill='currentColor' /> : <Play size={15} fill='currentColor' />}
          </button>
          <span className='dub-transport-name'>{language.name}</span>
          <span className='dub-transport-time'>
            {clipTime(played * durationMs)} / {clipTime(durationMs)}
          </span>
        </div>
      </div>

      <div className='dub-langs' role='group' aria-label='Dub the example into'>
        {DUBS.map((item, i) => (
          <button
            key={item.code}
            type='button'
            className='dub-lang'
            aria-pressed={i === index}
            onClick={() => setIndex(i)}
          >
            <b>{item.code}</b>
            <span>{item.name}</span>
            {i === index ? <i className='dub-lang-fill' style={{ width: `${played * 100}%` }} /> : null}
          </button>
        ))}
      </div>

      <div className='dub-timeline' aria-hidden='true' style={{ '--played': played } as CSSProperties}>
        <div className='dub-tl-row dub-tl-ruler'>
          <span className='dub-tl-name'>{language.code} dub</span>
          <span className='dub-tl-lane'>
            <span className='dub-tl-ticks'>
              {ticks.map((s) => (
                <span key={s} style={{ left: `${((s * 1000) / durationMs) * 100}%` }}>
                  {clipTime(s * 1000)}
                </span>
              ))}
            </span>
            {phase === 'dubbing' && !reduced ? (
              <span className='dub-tl-render'>
                <span style={{ width: `${progress}%` }} />
              </span>
            ) : null}
          </span>
        </div>

        <div className='dub-tl-row dub-tl-picture'>
          <span className='dub-tl-name'>Picture</span>
          <span className='dub-tl-lane dub-thumbs'>
            {THUMBS.map((i) => (
              <img key={i} src={creatorFrame(120)} alt='' loading='lazy' width={120} height={213} />
            ))}
          </span>
        </div>

        <div className='dub-tl-row'>
          <span className='dub-tl-name'>Original</span>
          <span className='dub-tl-lane dub-wave is-muted'>
            {ORIGINAL_WAVE.map((h, i) => (
              <i key={i} style={height(h)} />
            ))}
          </span>
        </div>

        <div className='dub-tl-row'>
          <span className='dub-tl-name is-voice'>Your voice</span>
          <span className={speaking && playing ? 'dub-tl-lane dub-wave is-live' : 'dub-tl-lane dub-wave'}>
            {DUB_WAVES[index].map((h, i) => (
              <i key={i} className={i / DUB_WAVES[index].length < played ? 'is-played' : undefined} style={height(h)} />
            ))}
          </span>
        </div>

        <div className='dub-tl-row'>
          <span className='dub-tl-name is-lips'>Lips</span>
          <span className='dub-tl-lane dub-mouths'>
            {MOUTHS.map((i) => {
              const at = Math.min(MOUTHS.length - 1, Math.floor(played * MOUTHS.length));
              const state = phase === 'dubbing' ? '' : allSaid || i < at ? 'is-said' : i === at ? 'is-now' : '';
              return (
                <span key={i} className={`dub-mouth ${state}`} style={{ '--z': `${230 + (i % 3) * 16}%` } as CSSProperties}>
                  <img src={creatorFrame(360)} alt='' loading='lazy' width={360} height={640} />
                </span>
              );
            })}
          </span>
        </div>

        <div className='dub-tl-row'>
          <span className='dub-tl-name is-subs'>Subtitles</span>
          <span className='dub-tl-lane dub-clips' lang={language.code.toLowerCase()}>
            {cues.map((cue) => (
              <span
                key={cue.start}
                className={played >= cue.end ? 'is-said' : played > cue.start ? 'is-now' : undefined}
                style={{ flexGrow: cue.end - cue.start }}
              >
                {cue.text}
              </span>
            ))}
          </span>
        </div>

        <span className='dub-tl-head' />
      </div>

      {children ? <div className='dub-bay-notes'>{children}</div> : null}
    </div>
  );
}
