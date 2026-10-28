import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Check, FileText, Pause, Play } from 'lucide-react';
import { prefersReducedMotion } from '../../shared/motion';
import { APP, FORMATS, SCENES, type Scene } from './content';

type Phase = 'listening' | 'export' | 'sent';

const WORD_MS = 165;
const PAUSE_MS = 260;
const SECONDS_PER_WORD = 0.42;

// Fixed bar shapes, so the waveform looks like speech rather than noise.
const BARS = Array.from({ length: 30 }, (_, i) => {
  const envelope = 0.35 + 0.65 * Math.abs(Math.sin(i * 0.37) * Math.cos(i * 0.11));
  return {
    height: Math.round(18 + envelope * 82),
    duration: 0.42 + ((i * 37) % 23) / 40,
    delay: -((i * 53) % 17) / 20,
  };
});

type Token = { line: number; word: string; index: number };

function tokenize(scene: Scene): Token[] {
  const tokens: Token[] = [];
  scene.lines.forEach((line, lineIndex) => {
    line.text.split(' ').forEach((word) => tokens.push({ line: lineIndex, word, index: tokens.length }));
  });
  return tokens;
}

const at = (count: number) => count * SECONDS_PER_WORD + (count ? 1 : 0);
const clock = (seconds: number) => `00:00:${String(Math.min(59, Math.floor(seconds))).padStart(2, '0')}`;
/** The font's tabular colons are wide; pull them in. */
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

const fileName = (scene: Scene) => `${scene.title}.${scene.format.toLowerCase()}`;

/**
 * The app's core moment as a looping example: speech comes in, the words land one by one beside
 * their timestamps, then the transcript is exported in one of the formats the listing names.
 */
export function LiveTranscript() {
  const reduced = prefersReducedMotion();
  const [index, setIndex] = useState(0);
  const scene = SCENES[index];
  const tokens = useMemo(() => tokenize(scene), [scene]);
  const [count, setCount] = useState(reduced ? tokens.length : 0);
  const [phase, setPhase] = useState<Phase>(reduced ? 'sent' : 'listening');
  const [picked, setPicked] = useState(reduced);
  const [paused, setPaused] = useState(false);
  const [full, setFull] = useState(false);
  const transcript = useRef<HTMLDivElement>(null);

  // Keep the newest words in view once the text outgrows the box.
  useLayoutEffect(() => {
    const box = transcript.current;
    if (!box) return;
    const overflowing = box.scrollHeight > box.clientHeight + 1;
    setFull(overflowing);
    box.scrollTo({ top: overflowing ? box.scrollHeight : 0, behavior: reduced || !overflowing ? 'auto' : 'smooth' });
  }, [count, index, reduced]);

  useEffect(() => {
    if (reduced || paused) return;
    let timer: number;

    if (phase === 'listening') {
      if (count < tokens.length) {
        const previous = tokens[count - 1]?.word ?? '';
        const wait = WORD_MS + (/[.,?!]$/.test(previous) ? PAUSE_MS : 0) + ((count * 31) % 7) * 12;
        timer = window.setTimeout(() => setCount(count + 1), wait);
      } else {
        timer = window.setTimeout(() => setPhase('export'), 800);
      }
    } else if (phase === 'export') {
      timer = window.setTimeout(() => (picked ? setPhase('sent') : setPicked(true)), picked ? 900 : 1000);
    } else {
      timer = window.setTimeout(() => select((index + 1) % SCENES.length), 2900);
    }

    return () => window.clearTimeout(timer);
  }, [phase, count, picked, paused, index, reduced, tokens]);

  function select(next: number) {
    const total = tokenize(SCENES[next]).length;
    setIndex(next);
    setPaused(false);
    setCount(reduced ? total : 0);
    setPicked(reduced);
    setPhase(reduced ? 'sent' : 'listening');
  }

  function saveNow() {
    setPaused(false);
    setCount(tokens.length);
    setPhase('export');
  }

  const listening = phase === 'listening' && !paused;
  const translating = scene.lines.some((line) => line.original);

  return (
    <div className='stt-demo'>
      <div className='stt-rc' data-phase={phase}>
        {phase === 'sent' ? (
          <div key={index} className='stt-toast' aria-hidden='true'>
            <img src={APP.iconUrl} alt='' />
            <span className='stt-toast-body'>
              <span className='stt-toast-app'>
                Speech to Text <small>now</small>
              </span>
              <strong>Transcript exported</strong>
              <span>{fileName(scene)}</span>
            </span>
          </div>
        ) : null}

        <div className='stt-rc-bar'>
          <span className='stt-rc-file'>
            <FileText size={16} strokeWidth={2.2} aria-hidden='true' />
            <span>{scene.title}</span>
          </span>
          <span className='stt-rc-lang'>{scene.status}</span>
        </div>

        <p className='stt-sr'>
          Example transcript, {scene.title}: {scene.lines.map((line) => line.text).join(' ')}
        </p>

        <div ref={transcript} className={full ? 'stt-rc-text is-full' : 'stt-rc-text'} aria-hidden='true'>
          <div key={index}>
            {scene.lines.map((line, lineIndex) => {
              const lineTokens = tokens.filter((token) => token.line === lineIndex);
              const first = lineTokens[0].index;
              const started = first < count || (first === count && listening);
              if (!started) return null;
              return (
                <div key={lineIndex} className='stt-rc-line'>
                  <span className='stt-rc-label'>{line.label ?? clock(at(first))}</span>
                  <div>
                    {line.original ? <span className='stt-rc-original'>{line.original}</span> : null}
                    <p>
                      {lineTokens
                        .filter((token) => token.index < count)
                        .map((token) => (
                          <span key={token.index} className='stt-rc-word'>
                            {token.word}{' '}
                          </span>
                        ))}
                      {phase === 'listening' &&
                      lineTokens.some((token) => token.index === count - 1 || (count === 0 && token.index === 0)) ? (
                        <span className='stt-caret' />
                      ) : null}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className='stt-rc-deck'>
          <div className='stt-rc-meter' aria-hidden='true'>
            <span className={listening ? 'stt-rc-live is-on' : 'stt-rc-live'}>
              <i />
              {phase === 'listening' ? (paused ? 'Paused' : 'Live') : 'Saved'}
            </span>
            <span className='stt-rc-timer'>
              <Timecode value={clock(at(count))} />
            </span>
            <span className={listening ? 'stt-rc-wave' : 'stt-rc-wave is-idle'}>
              {BARS.map((bar, i) => (
                <i
                  key={i}
                  style={
                    {
                      '--h': `${bar.height}%`,
                      '--d': `${bar.duration}s`,
                      '--delay': `${bar.delay}s`,
                    } as CSSProperties
                  }
                />
              ))}
            </span>
          </div>
          <div className='stt-rc-controls'>
            <button
              type='button'
              className='stt-rc-btn stt-rc-pause'
              onClick={() => setPaused(!paused)}
              disabled={phase !== 'listening'}
              aria-label={paused ? 'Resume example' : 'Pause example'}
            >
              {paused ? <Play size={15} fill='currentColor' /> : <Pause size={15} fill='currentColor' />}
              {paused ? 'Resume' : 'Pause'}
            </button>
            <button type='button' className='stt-rc-btn stt-rc-save' onClick={saveNow} disabled={phase !== 'listening'}>
              Save
            </button>
          </div>
        </div>

        <div className='stt-rc-export' aria-hidden={phase === 'listening'}>
          <strong className='stt-rc-export-title'>
            Export
            <span>{translating ? 'Transcribed into English' : scene.title}</span>
          </strong>
          <div className='stt-rc-files'>
            {FORMATS.map((format) => (
              <span key={format.ext} className={picked && format.ext === scene.format ? 'stt-file is-picked' : 'stt-file'}>
                <span className='stt-file-page'>{format.ext}</span>
                {picked && format.ext === scene.format ? <Check className='stt-file-check' size={14} strokeWidth={3} /> : null}
              </span>
            ))}
          </div>
          <div className='stt-rc-export-actions'>
            <span>Cancel</span>
            <span className={phase === 'sent' ? 'is-pressed' : undefined}>Export</span>
          </div>
        </div>
      </div>

      <div className='stt-tabs' role='tablist' aria-label='Example transcripts'>
        {SCENES.map((item, i) => (
          <button
            key={item.tab}
            type='button'
            role='tab'
            aria-selected={i === index}
            className='stt-tab'
            onClick={() => select(i)}
          >
            <span>0{i + 1}</span>
            {item.tab}
          </button>
        ))}
      </div>

      <p className='stt-rc-note'>Example. Your recordings become your own transcripts.</p>
    </div>
  );
}
