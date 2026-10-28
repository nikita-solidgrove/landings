import { useEffect, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { prefersReducedMotion } from '../../shared/motion';
import { APP, DEMO_SONGS, MODE_LABELS, photo, type DemoSong } from './content';

type Phase = 'typing' | 'creating' | 'playing';

const TYPE_MS = 38;
const CREATE_MS = 2400;
const LINE_MS = 1700;
const STATUSES = ['Writing lyrics', 'Composing the melody', 'Producing the track'];

/** The app's create flow as a looping example: prompt → creating → the finished song. */
export function SongDemo() {
  const reduced = prefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>(reduced ? 'playing' : 'typing');
  const [typed, setTyped] = useState(reduced ? DEMO_SONGS[0].prompt.length : 0);
  const [progress, setProgress] = useState(0);
  const [line, setLine] = useState(0);

  const song = DEMO_SONGS[index];

  useEffect(() => {
    if (reduced) return;
    let timer: number;

    if (phase === 'typing') {
      timer = window.setTimeout(() => {
        if (typed < song.prompt.length) setTyped(typed + 1);
        else setPhase('creating');
      }, typed < song.prompt.length ? TYPE_MS : 500);
    } else if (phase === 'creating') {
      timer = window.setTimeout(() => {
        if (progress < 100) setProgress(Math.min(100, progress + 4));
        else setPhase('playing');
      }, CREATE_MS / 25);
    } else {
      timer = window.setTimeout(() => {
        if (line < song.lyrics.length - 1) setLine(line + 1);
        else select((index + 1) % DEMO_SONGS.length);
      }, LINE_MS);
    }

    return () => window.clearTimeout(timer);
  }, [phase, typed, progress, line, index, reduced, song]);

  function select(next: number) {
    setIndex(next);
    setLine(0);
    setProgress(0);
    setTyped(reduced ? DEMO_SONGS[next].prompt.length : 0);
    setPhase(reduced ? 'playing' : 'typing');
  }

  const status = STATUSES[Math.min(STATUSES.length - 1, Math.floor(progress / (100 / STATUSES.length)))];

  return (
    <div className='asg-demo' aria-label='Example of making a song in the app'>
      <div className='asg-demo-tabs' role='tablist' aria-label='Create modes'>
        {DEMO_SONGS.map((item, i) => (
          <button
            key={item.mode}
            type='button'
            role='tab'
            aria-selected={i === index}
            className='asg-demo-tab'
            onClick={() => select(i)}
          >
            {MODE_LABELS[item.mode].tab}
          </button>
        ))}
      </div>

      <div className='asg-demo-field'>
        <span className='asg-demo-label'>{MODE_LABELS[song.mode].field}</span>
        <div className='asg-demo-prompt'>
          {song.mode === 'image' ? (
            <img className='asg-demo-thumb' src={photo('sunsetWalk', 120)} alt='' aria-hidden='true' />
          ) : null}
          <span className={song.mode === 'image' ? 'asg-demo-file' : 'asg-demo-text'}>
            {song.prompt.slice(0, typed)}
            {phase === 'typing' ? <span className='asg-caret' aria-hidden='true' /> : null}
          </span>
        </div>
        <p className='asg-demo-settings'>{song.chips.join(' · ')}</p>
      </div>

      <div className='asg-demo-result' aria-live='polite'>
        {phase === 'playing' ? (
          <Track key={song.title} song={song} line={line} />
        ) : (
          <div className='asg-demo-creating'>
            <span className='asg-demo-status'>{phase === 'creating' ? `${status}…` : 'Ready when you are'}</span>
            <span className='asg-demo-bar'>
              <span style={{ width: `${phase === 'creating' ? progress : 0}%` }} />
            </span>
          </div>
        )}
      </div>

      {phase === 'playing' ? (
        <div key={index} className='asg-toast' aria-hidden='true'>
          <img src={APP.iconUrl} alt='' />
          <span>
            <strong>Your song is ready</strong>
            <small>“{song.title}”</small>
          </span>
        </div>
      ) : null}

      <p className='asg-demo-note'>Example. Every song you make is new.</p>
    </div>
  );
}

function Track({ song, line }: { song: DemoSong; line: number }) {
  const [playing, setPlaying] = useState(true);

  return (
    <div className='asg-track'>
      <div className='asg-track-head'>
        <div className='asg-cover' aria-hidden='true'>
          <img src={photo(song.cover, 200)} alt='' />
          <span>{song.title}</span>
        </div>
        <div className='asg-track-meta'>
          <strong>{song.title}</strong>
          <span>{song.meta}</span>
          <span className={playing ? 'asg-wave is-playing' : 'asg-wave'} aria-hidden='true'>
            {Array.from({ length: 18 }, (_, i) => <i key={i} style={{ animationDelay: `${(i % 6) * -0.15}s` }} />)}
          </span>
        </div>
        <button
          type='button'
          className='asg-play'
          aria-label={playing ? 'Pause example' : 'Play example'}
          onClick={() => setPlaying(!playing)}
        >
          {playing ? <Pause size={18} fill='currentColor' /> : <Play size={18} fill='currentColor' />}
        </button>
      </div>
      <ol className='asg-lyrics'>
        {song.lyrics.map((text, i) => (
          <li key={text} className={i === line ? 'is-current' : i < line ? 'is-sung' : undefined}>{text}</li>
        ))}
      </ol>
    </div>
  );
}
