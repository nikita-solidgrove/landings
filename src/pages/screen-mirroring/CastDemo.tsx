import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import {
  Cast,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Globe,
  Images,
  Lock,
  Pause,
  RefreshCw,
  ScreenShare,
  Settings,
  SquarePlay,
  Tv,
  Video,
  Wifi,
  Image as ImageIcon,
} from 'lucide-react';
import { prefersReducedMotion } from '../../shared/motion';
import { APP, DEMO_TV, DEVICES, FEATURES, GALLERY, ON_TV, photo } from './content';

type Mode = 'photos' | 'video' | 'mirror';
type Screen = 'connect' | 'home' | 'gallery' | 'preview' | 'browser';
type TvState = 'off' | 'ready' | 'photo' | 'video' | 'mirror';

type Beat = {
  screen: Screen;
  tv: TvState;
  ms: number;
  mode: Mode | null;
  caption: string;
  /** Device list: 0 searching, 1 tapping the TV, 2 connected. */
  connect?: 0 | 1 | 2;
  /** Home tile being tapped. */
  tap?: 'mirror' | 'gallery';
  /** Gallery item selected and sent to the TV. */
  pick?: number;
  fly?: boolean;
};

const VIDEO = GALLERY.findIndex((item) => item.video);

const BEATS: Beat[] = [
  { screen: 'connect', connect: 0, tv: 'off', ms: 1500, mode: null, caption: 'The app finds the TVs on your Wi‑Fi' },
  { screen: 'connect', connect: 1, tv: 'off', ms: 1000, mode: null, caption: 'Tap your TV' },
  { screen: 'connect', connect: 2, tv: 'ready', ms: 1700, mode: null, caption: 'Connected in one tap' },
  { screen: 'home', tap: 'gallery', tv: 'ready', ms: 1300, mode: 'photos', caption: 'Choose what to show' },
  { screen: 'gallery', tv: 'ready', ms: 900, mode: 'photos', caption: 'Open your gallery' },
  { screen: 'gallery', pick: 0, fly: true, tv: 'photo', ms: 2700, mode: 'photos', caption: 'Tap a photo. It fills the TV.' },
  { screen: 'gallery', pick: 1, fly: true, tv: 'photo', ms: 2700, mode: 'photos', caption: 'Everyone sees it at once' },
  { screen: 'gallery', pick: VIDEO, fly: true, tv: 'video', ms: 1300, mode: 'video', caption: 'Videos too' },
  { screen: 'preview', pick: VIDEO, tv: 'video', ms: 5200, mode: 'video', caption: 'Play it on the big screen' },
  { screen: 'home', tap: 'mirror', tv: 'ready', ms: 1300, mode: 'mirror', caption: 'Or mirror your whole screen' },
  { screen: 'browser', tv: 'mirror', ms: 6000, mode: 'mirror', caption: 'Your whole screen, in real time' },
];

const LOOP_START = 3;
const TAB_START: Record<Mode, number> = { photos: 4, video: 7, mirror: 9 };
/** Without motion, each tab shows its finished state. */
const TAB_STILL: Record<Mode, number> = { photos: 5, video: 8, mirror: 10 };
const TABS: { mode: Mode; label: string }[] = [
  { mode: 'photos', label: 'Photos' },
  { mode: 'video', label: 'Video' },
  { mode: 'mirror', label: 'Mirror' },
];

/** What is on the TV right now, so the room light and the faces follow it. */
function glowFor(beat: Beat, shown: number) {
  if (beat.tv === 'photo' || beat.tv === 'video') return GALLERY[shown].glow;
  if (beat.tv === 'mirror') return '#e9e2d4';
  if (beat.tv === 'ready') return '#3d6ff2';
  return '#1a2650';
}

/** The app's core moment as a looping example: pick the TV, then a photo, a video, the whole screen. */
export function CastDemo() {
  const reduced = prefersReducedMotion();
  const [index, setIndex] = useState(reduced ? TAB_STILL.photos : 0);
  const [cycle, setCycle] = useState(0);
  const [second, setSecond] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const flyer = useRef<HTMLImageElement>(null);
  const beat = BEATS[index];

  // The last gallery item sent to the TV stays there until something else replaces it.
  const shown = beat.pick ?? 0;

  useEffect(() => {
    if (reduced) return;
    const timer = window.setTimeout(() => {
      const next = index + 1 < BEATS.length ? index + 1 : LOOP_START;
      if (next === LOOP_START) setCycle((c) => c + 1);
      setIndex(next);
    }, beat.ms);
    return () => window.clearTimeout(timer);
  }, [index, beat.ms, reduced]);

  // Seconds counter for the playing video, shared by the phone and the TV.
  useEffect(() => {
    setSecond(0);
    if (beat.screen !== 'preview' || reduced) return;
    const timer = window.setInterval(() => setSecond((s) => Math.min(s + 1, 24)), 1000);
    return () => window.clearInterval(timer);
  }, [index, cycle, beat.screen, reduced]);

  // The tapped picture flies from its thumbnail on the phone onto the TV.
  useLayoutEffect(() => {
    const box = stage.current;
    const img = flyer.current;
    if (!beat.fly || beat.pick === undefined || reduced || !box || !img) return;
    const thumb = box.querySelector(`[data-thumb="${beat.pick}"]`);
    const tv = screen.current;
    if (!thumb || !tv) return;

    const origin = box.getBoundingClientRect();
    const a = thumb.getBoundingClientRect();
    const b = tv.getBoundingClientRect();
    const rect = (r: DOMRect, lift = 0) => ({
      left: `${r.left - origin.left}px`,
      top: `${r.top - origin.top - lift}px`,
      width: `${r.width}px`,
      height: `${r.height}px`,
    });
    const mid = new DOMRect((a.left + b.left) / 2, (a.top + b.top) / 2, (a.width + b.width) / 2, (a.height + b.height) / 2);

    img.src = photo(GALLERY[beat.pick].photo, 960, 540);
    const animation = img.animate(
      [
        { ...rect(a), opacity: 1, borderRadius: '6px', offset: 0 },
        { ...rect(mid, origin.height * 0.12), opacity: 1, borderRadius: '6px', offset: 0.45 },
        { ...rect(b), opacity: 1, borderRadius: '3px', offset: 0.78 },
        { ...rect(b), opacity: 0, borderRadius: '3px', offset: 1 },
      ],
      { duration: 1250, easing: 'ease-in-out', delay: 250, fill: 'both' },
    );
    return () => animation.cancel();
  }, [index, cycle, beat.fly, beat.pick, reduced]);

  function select(mode: Mode) {
    setIndex(reduced ? TAB_STILL[mode] : TAB_START[mode]);
    setCycle((c) => c + 1);
  }

  const glow = glowFor(beat, shown);
  const playing = beat.screen === 'preview';

  return (
    <div
      ref={stage}
      className='smr-stage'
      data-tv={beat.tv}
      style={{ '--glow': glow } as CSSProperties}
      aria-label='Example: casting from an iPhone to a TV'
    >
      <div className='smr-stage-screens'>
        {/* The light the picture throws on the wall: the picture itself, blurred. */}
        <div className='smr-ambient' aria-hidden='true'>
          {ON_TV.map((i) => (
            <img
              key={i}
              src={photo(GALLERY[i].photo, 160, 90)}
              alt=''
              className={(beat.tv === 'photo' || beat.tv === 'video') && shown === i ? 'is-on' : undefined}
            />
          ))}
        </div>

        <div className='smr-tv'>
          <div ref={screen} className='smr-tv-screen'>
            <div className={beat.tv === 'off' ? 'smr-tv-layer smr-tv-off is-on' : 'smr-tv-layer smr-tv-off'} />
            <div className={beat.tv === 'ready' ? 'smr-tv-layer smr-tv-ready is-on' : 'smr-tv-layer smr-tv-ready'}>
              <img src={APP.iconUrl} alt='' />
              <strong>Ready to cast</strong>
              <span>{DEMO_TV}</span>
            </div>
            {ON_TV.map((i) => (
              <div
                key={i}
                className={
                  (beat.tv === 'photo' || beat.tv === 'video') && shown === i ? 'smr-tv-layer smr-tv-photo is-on' : 'smr-tv-layer smr-tv-photo'
                }
              >
                <img
                  key={playing && i === VIDEO ? `play-${cycle}` : 'still'}
                  src={photo(GALLERY[i].photo, 1280, 720)}
                  alt=''
                  className={playing && i === VIDEO ? 'smr-kenburns' : undefined}
                />
              </div>
            ))}
            {beat.tv === 'video' ? (
              <div className='smr-tv-controls' key={`controls-${index}-${cycle}`}>
                <span className={playing ? 'smr-bar is-playing' : 'smr-bar'}>
                  <i />
                </span>
                <span className='smr-tv-time'>
                  0:{String(second).padStart(2, '0')} / {GALLERY[VIDEO].video}
                </span>
              </div>
            ) : null}
            <div className={beat.tv === 'mirror' ? 'smr-tv-layer smr-tv-mirror is-on' : 'smr-tv-layer smr-tv-mirror'}>
              <div className='smr-mirror-box'>
                {beat.tv === 'mirror' ? <BrowserScreen key={`tv-${cycle}`} withStatus /> : null}
              </div>
            </div>
          </div>
        </div>

        <div className='smr-device smr-phone'>
          <div className='smr-phone-screen' data-web={beat.screen === 'browser'}>
            <StatusBar />
            <span className='smr-island' aria-hidden='true' />

            <div className={beat.screen === 'connect' ? 'smr-ps is-on' : 'smr-ps'}>
              <ConnectScreen phase={beat.connect ?? 2} />
            </div>
            <div className={beat.screen === 'home' ? 'smr-ps is-on' : 'smr-ps'}>
              <HomeScreen tap={beat.screen === 'home' ? beat.tap : undefined} />
            </div>
            <div className={beat.screen === 'gallery' ? 'smr-ps is-on' : 'smr-ps'}>
              <GalleryScreen pick={beat.screen === 'gallery' ? beat.pick : undefined} />
            </div>
            <div className={beat.screen === 'preview' ? 'smr-ps is-on' : 'smr-ps'}>
              <PreviewScreen key={beat.screen === 'preview' ? `play-${cycle}` : 'idle'} playing={playing} second={second} />
            </div>
            <div className={beat.screen === 'browser' ? 'smr-ps smr-ps-web is-on' : 'smr-ps smr-ps-web'}>
              {beat.screen === 'browser' ? <BrowserScreen key={`phone-${cycle}`} /> : null}
            </div>

            {beat.connect === 2 ? (
              <div className='smr-banner' key={cycle}>
                <img src={APP.iconUrl} alt='' />
                <span>
                  <strong>Connected</strong>
                  <small>{DEMO_TV}</small>
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <img ref={flyer} className='smr-flyer' alt='' aria-hidden='true' />
      </div>

      <div className='smr-stage-foot'>
        <div className='smr-tabs' role='tablist' aria-label='What to cast'>
          {TABS.map((tab) => (
            <button
              key={tab.mode}
              type='button'
              role='tab'
              aria-selected={beat.mode === tab.mode}
              className='smr-tab'
              onClick={() => select(tab.mode)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <p className='smr-caption' aria-live='polite'>
          <span>Example</span> {beat.caption}
        </p>
      </div>
    </div>
  );
}

export function StatusBar() {
  return (
    <div className='smr-status' aria-hidden='true'>
      <span>9:41</span>
      <span className='smr-status-icons'>
        <i className='smr-signal'>
          <b />
          <b />
          <b />
          <b />
        </i>
        <Wifi strokeWidth={3} />
        <i className='smr-battery' />
      </span>
    </div>
  );
}

function ConnectScreen({ phase }: { phase: 0 | 1 | 2 }) {
  const status = (name: string) => {
    if (name !== DEMO_TV) return 'Not connected';
    return phase === 0 ? 'Not connected' : phase === 1 ? 'Connecting…' : 'Connected';
  };
  return (
    <div className='smr-app'>
      <div className='smr-app-bar'>
        <span className='smr-app-round'>
          <ChevronLeft />
        </span>
      </div>
      <p className='smr-app-title'>Connect Your Device</p>
      <p className='smr-app-sub'>Select your TV from the list below</p>
      <p className='smr-app-note'>
        <Wifi /> Same Wi‑Fi network as your phone
      </p>
      <ul className='smr-devices'>
        {DEVICES.map((name, i) => (
          <li
            key={name}
            style={{ '--i': i } as CSSProperties}
            className={[
              name === DEMO_TV && phase === 1 ? 'is-tapped' : '',
              name === DEMO_TV && phase === 2 ? 'is-connected' : '',
            ].join(' ')}
          >
            <span>
              <strong>{name}</strong>
              <small>{status(name)}</small>
            </span>
            <ChevronRight />
          </li>
        ))}
      </ul>
      <p className={phase === 0 ? 'smr-refresh is-searching' : 'smr-refresh'}>
        <RefreshCw /> {phase === 0 ? 'Searching…' : 'Refresh'}
      </p>
    </div>
  );
}

const TILE_ICONS = [ScreenShare, Images, Tv, Video, ImageIcon, SquarePlay];
const TILE_SUBS = ['Mirror your screen', 'Share your photos and videos', 'Watch IPTV', 'Cast from websites', 'Cast from websites', 'Watch YouTube'];

export function HomeScreen({ tap, focus }: { tap?: 'mirror' | 'gallery'; focus?: number }) {
  const tile = (i: number, wide = false) => {
    const Icon = TILE_ICONS[i];
    const tapped = (tap === 'mirror' && i === 0) || (tap === 'gallery' && i === 1);
    return (
      <span
        key={i}
        className={['smr-tile', wide ? 'smr-tile-wide' : '', tapped ? 'is-tapped' : '', focus === i ? 'is-focus' : ''].join(' ')}
        style={{ '--c': FEATURES[i].color } as CSSProperties}
      >
        <i>
          <Icon />
        </i>
        <span>
          <strong>{FEATURES[i].name}</strong>
          <small>{TILE_SUBS[i]}</small>
        </span>
      </span>
    );
  };
  return (
    <div className='smr-app'>
      <div className='smr-app-bar'>
        <span className='smr-app-round'>
          <Settings />
        </span>
        <strong>{DEMO_TV}</strong>
        <span className='smr-app-cast'>
          <Cast />
        </span>
      </div>
      <div className='smr-tiles'>
        {tile(0, true)}
        {tile(1, true)}
      </div>
      <p className='smr-app-label'>Cast from the Web</p>
      <div className='smr-tiles smr-tiles-grid'>{[2, 3, 4, 5].map((i) => tile(i))}</div>
    </div>
  );
}

function GalleryScreen({ pick }: { pick?: number }) {
  return (
    <div className='smr-app'>
      <div className='smr-app-bar'>
        <span className='smr-app-round'>
          <ChevronLeft />
        </span>
        <span className='smr-album'>
          Recents <ChevronDown />
        </span>
        <span className='smr-app-cast'>
          <Cast />
        </span>
      </div>
      <div className='smr-thumbs'>
        {GALLERY.map((item, i) => (
          <span key={item.photo} data-thumb={i} className={pick === i ? 'is-picked' : undefined}>
            <img src={photo(item.photo, 180)} alt='' />
            {item.video ? <small>{item.video}</small> : null}
          </span>
        ))}
        {/* Older shots further down the gallery: the same pictures, cropped in closer. */}
        {GALLERY.slice(3, 6).map((item) => (
          <span key={`more-${item.photo}`} className='smr-thumb-more'>
            <img src={photo(item.photo, 180)} alt='' />
          </span>
        ))}
      </div>
    </div>
  );
}

function PreviewScreen({ playing, second }: { playing: boolean; second: number }) {
  const item = GALLERY[VIDEO];
  return (
    <div className='smr-app'>
      <div className='smr-app-bar'>
        <span className='smr-app-round'>
          <ChevronDown />
        </span>
        <strong>Preview</strong>
        <span className='smr-app-cast'>
          <Cast />
        </span>
      </div>
      <div className='smr-preview'>
        <img src={photo(item.photo, 480, 640)} alt='' className={playing ? 'smr-kenburns' : undefined} />
        <span className='smr-preview-pause'>
          <Pause fill='currentColor' />
        </span>
      </div>
      <span className={playing ? 'smr-bar is-playing' : 'smr-bar'}>
        <i />
      </span>
      <p className='smr-preview-times'>
        <span>0:{String(second).padStart(2, '0')}</span>
        <span>{item.video}</span>
      </p>
      <div className='smr-strip'>
        {GALLERY.slice(0, 6).map((g) => (
          <img key={g.photo} src={photo(g.photo, 120)} alt='' />
        ))}
      </div>
    </div>
  );
}

/** An example web page, mirrored: the same component renders on the phone and on the TV. */
function BrowserScreen({ withStatus = false }: { withStatus?: boolean }) {
  return (
    <div className='smr-web'>
      {withStatus ? <StatusBar /> : null}
      <div className='smr-web-scroll'>
        <div className='smr-web-map'>
          <i className='smr-web-route' />
          <b style={{ left: '14%', top: '62%' }} />
          <b style={{ left: '48%', top: '30%' }} />
          <b style={{ left: '80%', top: '58%' }} />
        </div>
        <p className='smr-web-kicker'>Our summer trip</p>
        <p className='smr-web-title'>Four days by the sea</p>
        {[
          ['Day 1', 'Old town walk', '#e8833a'],
          ['Day 2', 'Beach and boat tour', '#2a8fd6'],
          ['Day 3', 'Market and the long lunch', '#2fae6a'],
          ['Day 4', 'Train home', '#8a63d2'],
        ].map(([day, plan, color]) => (
          <div key={day} className='smr-web-day' style={{ '--c': color } as CSSProperties}>
            <small>{day}</small>
            <strong>{plan}</strong>
          </div>
        ))}
        <p className='smr-web-kicker'>Packing list</p>
        <ul className='smr-web-list'>
          {[
            ['Sunscreen', true],
            ['Snorkels', true],
            ['Chargers', false],
            ['Beach towels', false],
          ].map(([item, done]) => (
            <li key={String(item)} className={done ? 'is-done' : undefined}>
              <i />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className='smr-web-bar'>
        <Lock />
        <span>trip plan</span>
        <Globe />
      </div>
    </div>
  );
}
