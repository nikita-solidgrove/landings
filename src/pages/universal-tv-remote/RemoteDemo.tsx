import { useEffect, useMemo, useReducer, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import {
  ChevronRight,
  CircleDot,
  Delete,
  Grid3x3,
  House,
  Info,
  Keyboard,
  ListIndentIncrease,
  MousePointer2,
  Pause,
  Play,
  Power,
  Search,
  Settings,
  SquareMousePointer,
  Tv,
  Undo2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { prefersReducedMotion } from '../../shared/motion';
import { SCENES, TOUR_LABELS, TOUR_LEGENDS, sceneFor, type Overlay, type TourLabel } from './content';
import { TvScene } from './TvScene';

/* ---------- TV state ---------- */

type Screen = 'live' | 'home' | 'search';
type Arrow = 'up' | 'down' | 'left' | 'right';

type TvState = {
  on: boolean;
  channel: number;
  volume: number;
  muted: boolean;
  paused: boolean;
  screen: Screen;
  /** Highlighted item on the home or search screen; -1 is the search field on home. */
  focus: number;
  query: string;
  digits: string;
  source: number;
  overlay: Overlay | null;
  /** Bumped on every overlay so the same overlay can restart its timer. */
  flash: number;
  cursor: { x: number; y: number };
};

type Action =
  | { type: 'power' }
  | { type: 'wake' }
  | { type: 'volume'; delta: 1 | -1 }
  | { type: 'mute' }
  | { type: 'channel'; delta: 1 | -1 }
  | { type: 'digit'; value: string }
  | { type: 'commit' }
  | { type: 'play' }
  | { type: 'home' }
  | { type: 'back' }
  | { type: 'arrow'; dir: Arrow }
  | { type: 'ok' }
  | { type: 'source' }
  | { type: 'tools' }
  | { type: 'search' }
  | { type: 'type'; char: string }
  | { type: 'erase' }
  | { type: 'cursor'; dx: number; dy: number }
  | { type: 'clear' };

const INITIAL: TvState = {
  on: true,
  channel: 4,
  volume: 24,
  muted: false,
  paused: false,
  screen: 'live',
  focus: 0,
  query: '',
  digits: '',
  source: 0,
  overlay: null,
  flash: 0,
  cursor: { x: 50, y: 55 },
};

const SOURCES = ['TV', 'HDMI 1', 'HDMI 2'];
const TOOLS = ['Picture mode', 'Sound mode', 'Sleep timer'];
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const searchResults = (query: string) => {
  const q = query.trim().toLowerCase();
  return q ? SCENES.filter((scene) => scene.title.toLowerCase().includes(q)) : [...SCENES];
};

/** The channel nearest to the current one that shows the scene at `index`. */
const channelFor = (current: number, index: number) => {
  const base = current - (current % SCENES.length) + index;
  return base < 1 ? base + SCENES.length : base;
};

function show(state: TvState, overlay: Overlay | null, patch: Partial<TvState> = {}): TvState {
  return { ...state, ...patch, overlay, flash: state.flash + 1 };
}

function reducer(state: TvState, action: Action): TvState {
  if (action.type === 'power') return { ...INITIAL, on: !state.on, channel: state.channel, volume: state.volume, flash: state.flash + 1 };
  if (action.type === 'wake') return { ...INITIAL, channel: state.channel, volume: 24, cursor: state.cursor, flash: state.flash + 1 };
  if (action.type === 'clear') return { ...state, overlay: null };
  if (!state.on) return state;

  switch (action.type) {
    case 'volume':
      return show(state, 'volume', { volume: clamp(state.volume + action.delta * 2, 0, 100), muted: false });
    case 'mute':
      return show(state, 'mute', { muted: !state.muted });
    case 'channel':
      return show(state, 'channel', { channel: clamp(state.channel + action.delta, 1, 999), screen: 'live', paused: false, digits: '' });
    case 'digit':
      return show(state, 'channel', { digits: (state.digits + action.value).slice(-3) });
    case 'commit': {
      const channel = Number(state.digits);
      if (!state.digits) return state;
      return show(state, 'channel', { channel: channel > 0 ? channel : state.channel, digits: '', screen: 'live', paused: false });
    }
    case 'play':
      return show(state, state.paused ? 'play' : null, { paused: !state.paused, screen: 'live' });
    case 'home':
      return show(state, null, { screen: 'home', focus: state.channel % SCENES.length });
    case 'back':
      if (state.screen === 'search') return show(state, null, { screen: 'home', focus: -1 });
      return show(state, null, { screen: 'live' });
    case 'arrow':
      return arrow(state, action.dir);
    case 'ok':
      return ok(state);
    case 'source':
      return show(state, 'source', { source: state.overlay === 'source' ? (state.source + 1) % SOURCES.length : state.source });
    case 'tools':
      return show(state, 'tools');
    case 'search':
      return show(state, null, { screen: 'search', query: '', focus: 0, paused: false });
    case 'type':
      return show(state, null, { screen: 'search', query: (state.screen === 'search' ? state.query + action.char : action.char).slice(0, 16), focus: 0 });
    case 'erase':
      return show(state, null, { screen: 'search', query: state.query.slice(0, -1), focus: 0 });
    case 'cursor': {
      const x = clamp(state.cursor.x + action.dx, 3, 97);
      const y = clamp(state.cursor.y + action.dy, 4, 94);
      const patch: Partial<TvState> = { cursor: { x, y } };
      // On the home screen the pointer highlights whatever it is over: the search field or a tile.
      if (state.screen === 'home') patch.focus = y < 34 ? -1 : clamp(Math.floor((x - 6) / 22), 0, SCENES.length - 1);
      return { ...state, ...patch };
    }
  }
  return state;
}

function arrow(state: TvState, dir: Arrow): TvState {
  if (state.screen === 'live') {
    if (dir === 'up' || dir === 'down') return reducer(state, { type: 'channel', delta: dir === 'up' ? 1 : -1 });
    return show(state, null, { screen: 'home', focus: state.channel % SCENES.length });
  }
  if (state.screen === 'home') {
    if (dir === 'up') return { ...state, focus: -1 };
    if (dir === 'down') return { ...state, focus: Math.max(0, state.focus) };
    if (state.focus < 0) return state;
    return { ...state, focus: clamp(state.focus + (dir === 'left' ? -1 : 1), 0, SCENES.length - 1) };
  }
  const count = searchResults(state.query).length;
  if (!count) return state;
  return { ...state, focus: clamp(state.focus + (dir === 'left' || dir === 'up' ? -1 : 1), 0, count - 1) };
}

function ok(state: TvState): TvState {
  if (state.screen === 'home') {
    if (state.focus < 0) return show(state, null, { screen: 'search', query: '', focus: 0 });
    return show(state, 'channel', { screen: 'live', channel: channelFor(state.channel, state.focus), paused: false });
  }
  if (state.screen === 'search') {
    const pick = searchResults(state.query)[state.focus];
    if (!pick) return state;
    const index = SCENES.findIndex((scene) => scene.id === pick.id);
    return show(state, 'channel', { screen: 'live', channel: channelFor(state.channel, index), paused: false });
  }
  if (state.overlay === 'source' || state.overlay === 'tools') return show(state, null);
  return show(state, 'channel');
}

/* ---------- Tour ---------- */

type Tab = 'connect' | 'remote' | 'touchpad' | 'keyboard' | 'keypad';
type ConnectPhase = 'scanning' | 'found' | 'connected';
type Step = { wait: number; label?: TourLabel; run?: () => void };

const SEARCH_EXAMPLE = 'city';
const KEY_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
const KEYPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const FOUND_TVS = [
  { name: 'Samsung TV', room: 'Living room' },
  { name: 'LG TV', room: 'Bedroom' },
  { name: 'Sony TV', room: 'Kitchen' },
];

/** Where the tour starts over after the first loop (the connection is shown only once). */
const LOOP_START = 3;
const RESUME_MS = 14000;

const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(' ');

/**
 * The centerpiece, shot like a product photo: a TV and its soundbar behind, the phone with the app's
 * remote standing in front of them. `children` is printed beside the phone (the brand plate).
 */
export function RemoteDemo({ children }: { children?: ReactNode }) {
  const reduced = useMemo(prefersReducedMotion, []);
  const root = useRef<HTMLDivElement>(null);
  const [tv, dispatch] = useReducer(reducer, INITIAL);
  const [tab, setTab] = useState<Tab>(reduced ? 'remote' : 'connect');
  const [phase, setPhase] = useState<ConnectPhase>(reduced ? 'connected' : 'scanning');
  const [pressed, setPressed] = useState<string | null>(null);
  const [label, setLabel] = useState<TourLabel | null>(reduced ? null : 'connect');
  const [touring, setTouring] = useState(!reduced);
  const [visible, setVisible] = useState(false);
  const stepIndex = useRef(0);
  const resumeTimer = useRef(0);
  const pressTimer = useRef(0);

  const flashKey = (id: string) => {
    setPressed(id);
    window.clearTimeout(pressTimer.current);
    pressTimer.current = window.setTimeout(() => setPressed(null), 260);
  };

  const steps = useMemo<Step[]>(() => {
    const press = (id: string, action: Action) => () => {
      flashKey(id);
      dispatch(action);
    };
    const repeat = (times: number, wait: number, step: Omit<Step, 'wait'>) =>
      Array.from({ length: times }, (): Step => ({ wait, ...step }));

    return [
      { wait: 1500, label: 'connect', run: () => setPhase('found') },
      { wait: 1000, run: () => flashKey('tv-0') },
      { wait: 260, run: () => setPhase('connected') },
      // LOOP_START: everything below repeats.
      { wait: 900, label: 'volume', run: () => { setTab('remote'); dispatch({ type: 'wake' }); } },
      ...repeat(4, 380, { run: press('vol-up', { type: 'volume', delta: 1 }) }),
      { wait: 1300, label: 'channel', run: press('ch-up', { type: 'channel', delta: 1 }) },
      { wait: 1700, run: press('ch-up', { type: 'channel', delta: 1 }) },
      { wait: 1700, label: 'menus', run: press('home', { type: 'home' }) },
      { wait: 750, run: press('right', { type: 'arrow', dir: 'right' }) },
      { wait: 550, run: press('right', { type: 'arrow', dir: 'right' }) },
      { wait: 650, run: press('ok', { type: 'ok' }) },
      { wait: 1800, label: 'search', run: () => { flashKey('tab-keyboard'); setTab('keyboard'); dispatch({ type: 'search' }); } },
      ...SEARCH_EXAMPLE.split('').map((char, i): Step => ({ wait: i ? 170 : 700, run: press(`key-${char}`, { type: 'type', char }) })),
      { wait: 900, run: press('key-go', { type: 'ok' }) },
      { wait: 1700, label: 'play', run: () => { setTab('remote'); } },
      { wait: 500, run: press('play', { type: 'play' }) },
      { wait: 1500, run: press('play', { type: 'play' }) },
      { wait: 1200, label: 'mute', run: press('mute', { type: 'mute' }) },
      { wait: 1400, run: press('mute', { type: 'mute' }) },
      { wait: 1000, label: 'power', run: press('power', { type: 'power' }) },
      { wait: 1900, run: press('power', { type: 'power' }) },
      { wait: 1500 },
    ];
  }, []);

  // Runs the tour only while the stage is on screen and the visitor isn't driving.
  useEffect(() => {
    const target = root.current;
    if (!target || reduced) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(target);
    return () => observer.disconnect();
  }, [reduced]);

  useEffect(() => {
    if (!touring || !visible) return;
    let timer = 0;
    const tick = () => {
      const step = steps[stepIndex.current];
      if (step.label) setLabel(step.label);
      step.run?.();
      stepIndex.current = stepIndex.current + 1 >= steps.length ? LOOP_START : stepIndex.current + 1;
      timer = window.setTimeout(tick, steps[stepIndex.current].wait);
    };
    timer = window.setTimeout(tick, steps[stepIndex.current].wait);
    return () => window.clearTimeout(timer);
  }, [touring, visible, steps]);

  // Overlays fade after a moment, like on a real TV; menus stay up a little longer.
  useEffect(() => {
    if (!tv.overlay || tv.overlay === 'cursor') return;
    const timer = window.setTimeout(() => dispatch({ type: 'clear' }), tv.overlay === 'source' || tv.overlay === 'tools' ? 2600 : 1900);
    return () => window.clearTimeout(timer);
  }, [tv.overlay, tv.flash]);

  // Typed channel numbers switch after a short pause.
  useEffect(() => {
    if (!tv.digits) return;
    const timer = window.setTimeout(() => dispatch({ type: 'commit' }), 1100);
    return () => window.clearTimeout(timer);
  }, [tv.digits]);

  useEffect(
    () => () => {
      window.clearTimeout(resumeTimer.current);
      window.clearTimeout(pressTimer.current);
    },
    [],
  );

  /** The visitor takes over: the tour stops and comes back after a quiet while. */
  const takeOver = () => {
    setTouring(false);
    setLabel(null);
    setPhase('connected');
    window.clearTimeout(resumeTimer.current);
    if (reduced) return;
    resumeTimer.current = window.setTimeout(() => {
      stepIndex.current = LOOP_START;
      setTouring(true);
    }, RESUME_MS);
  };

  const press = (id: string, action: Action) => () => {
    takeOver();
    if (tab === 'connect') setTab('remote');
    flashKey(id);
    dispatch(action);
  };

  const openTab = (next: Tab) => () => {
    takeOver();
    flashKey(`tab-${next}`);
    setTab(next);
    if (next === 'keyboard') dispatch({ type: 'search' });
  };

  const scene = sceneFor(tv.channel);
  const caption = touring && label ? TOUR_LABELS[label] : 'Your turn: tap any button';

  return (
    <div className='tvr-demo' ref={root} data-touring={touring}>
      <div className='tvr-set'>
        <TvScreen tv={tv} showCursor={tab === 'touchpad'} />
        <div className='tvr-soundbar' aria-hidden='true'>
          <i
            key={tv.overlay === 'volume' || tv.overlay === 'mute' ? tv.flash : 'idle'}
            className='tvr-soundbar-led'
            data-on={tv.on}
            data-blink={tv.overlay === 'volume' || tv.overlay === 'mute'}
          />
        </div>
      </div>

      <div className='tvr-demo-legend'>
        <p className='tvr-caption' aria-live='polite'>
          <span className='tvr-caption-tag'>Example</span>
          <span key={caption} className='tvr-caption-text'>{caption}</span>
          <small>{touring ? 'Tap the phone to try it yourself' : 'Every button on the phone works'}</small>
          <span className='tvr-sr'>Now on the TV: channel {tv.channel}, {scene.title}{tv.on ? '' : ', switched off'}.</span>
        </p>
        <ol className='tvr-tour' aria-hidden='true'>
          {(Object.keys(TOUR_LEGENDS) as TourLabel[]).map((key) => (
            <li key={key} className={cx(touring && label === key && 'is-on')}>
              <i />
              {TOUR_LEGENDS[key]}
            </li>
          ))}
        </ol>
      </div>

      <div className='tvr-phone-wrap'>
        <div className='tvr-phone' role='group' aria-label='Example remote. The buttons control the TV above.'>
          <div className='tvr-phone-screen'>
            <div className='tvr-status' aria-hidden='true'>
              <span>9:41</span>
              <i className='tvr-island' />
              <span className='tvr-status-icons'>
                <i className='tvr-bars' />
                <i className='tvr-battery' />
              </span>
            </div>

            {tab === 'connect' ? (
              <ConnectView phase={phase} pressed={pressed} onPick={press('tv-0', { type: 'clear' })} />
            ) : (
              <>
                <div className='tvr-app-head'>
                  <span className='tvr-app-tv' aria-hidden='true'>
                    <Tv />
                    <i />
                  </span>
                  <strong>Connected</strong>
                  <Key id='power' label='Power' pressed={pressed} onPress={press('power', { type: 'power' })} className='tvr-key-power'>
                    <Power />
                  </Key>
                </div>

                <div className='tvr-app-body'>
                  {tab === 'remote' ? <RemoteView pressed={pressed} press={press} /> : null}
                  {tab === 'keyboard' ? <KeyboardView query={tv.query} pressed={pressed} press={press} /> : null}
                  {tab === 'keypad' ? <KeypadView digits={tv.digits} channel={tv.channel} pressed={pressed} press={press} /> : null}
                  {tab === 'touchpad' ? <TouchpadView dispatch={dispatch} onUse={takeOver} /> : null}
                </div>

                <nav className='tvr-tabs' aria-label='Remote modes'>
                  {(
                    [
                      ['remote', 'Remote', <CircleDot key='i' />],
                      ['touchpad', 'Touchpad', <SquareMousePointer key='i' />],
                      ['keyboard', 'Keyboard', <Keyboard key='i' />],
                      ['keypad', 'Keypad', <Grid3x3 key='i' />],
                    ] as const
                  ).map(([id, name, icon]) => (
                    <button
                      key={id}
                      type='button'
                      className={cx('tvr-tab', tab === id && 'is-active', pressed === `tab-${id}` && 'is-pressed')}
                      aria-pressed={tab === id}
                      onClick={openTab(id)}
                    >
                      {icon}
                      <span>{name}</span>
                    </button>
                  ))}
                  <span className='tvr-tab tvr-tab-static' aria-hidden='true'>
                    <Settings />
                    <span>Settings</span>
                  </span>
                </nav>
              </>
            )}
          </div>
        </div>
      </div>

      {children ? <div className='tvr-demo-side'>{children}</div> : null}
    </div>
  );
}

/* ---------- TV ---------- */

function TvScreen({ tv, showCursor }: { tv: TvState; showCursor: boolean }) {
  const scene = sceneFor(tv.channel);
  const results = searchResults(tv.query);

  return (
    <div className='tvr-tv' data-on={tv.on}>
      <div className='tvr-tv-screen' data-paused={tv.paused}>
        <div key={tv.channel} className='tvr-tv-program'>
          <TvScene id={scene.id} />
        </div>

        {tv.screen === 'home' ? (
          <div className='tvr-tv-menu'>
            <div className='tvr-menu-top'>
              <span className={cx('tvr-menu-search', tv.focus < 0 && 'is-focus')}>
                <Search /> Search
              </span>
              <span className='tvr-menu-clock'>8:30 PM</span>
            </div>
            <p className='tvr-menu-label'>Continue watching</p>
            <div className='tvr-menu-row'>
              {SCENES.map((item, i) => (
                <span key={item.id} className={cx('tvr-tile', tv.focus === i && 'is-focus')}>
                  <span className='tvr-tile-art'>
                    <TvScene id={item.id} />
                  </span>
                  <span className='tvr-tile-name'>{item.title}</span>
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {tv.screen === 'search' ? (
          <div className='tvr-tv-menu tvr-tv-search'>
            <span className='tvr-search-field'>
              <Search />
              <span>{tv.query}</span>
              <i className='tvr-search-caret' />
              {tv.query ? null : <span className='tvr-search-hint'>Search</span>}
            </span>
            <p className='tvr-menu-label'>{tv.query ? `Results for “${tv.query}”` : 'Suggestions'}</p>
            <div className='tvr-menu-row'>
              {results.length ? (
                results.map((item, i) => (
                  <span key={item.id} className={cx('tvr-tile', tv.focus === i && 'is-focus')}>
                    <span className='tvr-tile-art'>
                      <TvScene id={item.id} />
                    </span>
                    <span className='tvr-tile-name'>{item.title}</span>
                  </span>
                ))
              ) : (
                <span className='tvr-search-none'>Nothing found. Try “sunset”.</span>
              )}
            </div>
          </div>
        ) : null}

        {tv.overlay === 'channel' && tv.screen === 'live' ? (
          <div key={tv.flash} className='tvr-osd tvr-osd-channel'>
            <strong>{tv.digits ? tv.digits.padEnd(3, '–') : tv.channel}</strong>
            <span>
              {tv.digits ? 'Channel' : scene.title}
              <small>{tv.digits ? 'Enter number' : 'Live'}</small>
            </span>
          </div>
        ) : null}

        {tv.overlay === 'volume' ? (
          <div key={tv.flash} className='tvr-osd tvr-osd-volume'>
            <Volume2 />
            <span className='tvr-osd-bar'>
              <i style={{ width: `${tv.volume}%` }} />
            </span>
            <b>{tv.volume}</b>
          </div>
        ) : null}

        {tv.overlay === 'mute' ? (
          <div key={tv.flash} className='tvr-osd tvr-osd-mute'>
            {tv.muted ? <VolumeX /> : <Volume2 />}
            <span>{tv.muted ? 'Mute' : `Volume ${tv.volume}`}</span>
          </div>
        ) : null}

        {tv.muted && tv.overlay !== 'mute' ? (
          <span className='tvr-osd-muted' aria-hidden='true'>
            <VolumeX />
          </span>
        ) : null}

        {tv.paused ? (
          <span className='tvr-osd-center' aria-hidden='true'>
            <Pause />
          </span>
        ) : tv.overlay === 'play' ? (
          <span key={tv.flash} className='tvr-osd-center tvr-osd-fade' aria-hidden='true'>
            <Play />
          </span>
        ) : null}

        {tv.overlay === 'source' || tv.overlay === 'tools' ? (
          <div key={tv.overlay} className='tvr-osd tvr-osd-panel'>
            <p>{tv.overlay === 'source' ? 'Source' : 'Tools'}</p>
            {(tv.overlay === 'source' ? SOURCES : TOOLS).map((item, i) => (
              <span key={item} className={cx(tv.overlay === 'source' && i === tv.source && 'is-focus')}>
                {item}
                {tv.overlay === 'tools' ? <ChevronRight /> : null}
              </span>
            ))}
          </div>
        ) : null}

        {showCursor && tv.on ? (
          <span className='tvr-cursor' style={{ left: `${tv.cursor.x}%`, top: `${tv.cursor.y}%` }} aria-hidden='true'>
            <MousePointer2 />
          </span>
        ) : null}

        <span className='tvr-tv-off' aria-hidden='true' />
        <span className='tvr-tv-gloss' aria-hidden='true' />
      </div>
      <span className='tvr-tv-led' aria-hidden='true' />
    </div>
  );
}

/* ---------- Phone views ---------- */

type Press = (id: string, action: Action) => () => void;

function Key({
  id,
  label,
  pressed,
  onPress,
  className,
  children,
}: {
  id: string;
  label: string;
  pressed: string | null;
  onPress: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button type='button' className={cx('tvr-key', className, pressed === id && 'is-pressed')} aria-label={label} onClick={onPress}>
      {children}
    </button>
  );
}

function ConnectView({ phase, pressed, onPick }: { phase: ConnectPhase; pressed: string | null; onPick: () => void }) {
  return (
    <div className='tvr-connect'>
      <div className='tvr-connect-head' aria-hidden='true'>
        <span className='tvr-key-ghost'>
          <X />
        </span>
        <strong>Add TV Device</strong>
        <span className='tvr-key-ghost'>
          <Info />
        </span>
      </div>
      <span className={cx('tvr-connect-icon', phase === 'scanning' && 'is-scanning')} aria-hidden='true'>
        <Tv />
      </span>
      <p className='tvr-connect-title'>{phase === 'scanning' ? 'Searching for TV…' : phase === 'found' ? 'TVs found' : 'Connected'}</p>
      <p className='tvr-connect-note'>Make sure your phone and TV are on the same Wi-Fi network</p>
      <div className='tvr-connect-list'>
        {phase === 'scanning'
          ? null
          : FOUND_TVS.map((item, i) => (
              <button
                key={item.name}
                type='button'
                className={cx('tvr-found', pressed === `tv-${i}` && 'is-pressed')}
                style={{ '--i': i } as CSSProperties}
                onClick={onPick}
              >
                <span>
                  {item.name}
                  <small className={i === 0 && phase === 'connected' ? 'is-on' : undefined}>
                    {i === 0 && phase === 'connected' ? 'Connected' : item.room}
                  </small>
                </span>
                <ChevronRight aria-hidden='true' />
              </button>
            ))}
      </div>
    </div>
  );
}

function RemoteView({ pressed, press }: { pressed: string | null; press: Press }) {
  return (
    <div className='tvr-remote'>
      <div className='tvr-seg'>
        <Key id='tools' label='Tools' pressed={pressed} onPress={press('tools', { type: 'tools' })}>TOOLS</Key>
        <Key id='source' label='Source' pressed={pressed} onPress={press('source', { type: 'source' })}>SOURCE</Key>
        <Key id='exit' label='Exit' pressed={pressed} onPress={press('exit', { type: 'back' })}>EXIT</Key>
      </div>

      <div className='tvr-cluster'>
        <div className='tvr-rocker'>
          <Key id='vol-up' label='Volume up' pressed={pressed} onPress={press('vol-up', { type: 'volume', delta: 1 })}>+</Key>
          <span aria-hidden='true'>VOL</span>
          <Key id='vol-down' label='Volume down' pressed={pressed} onPress={press('vol-down', { type: 'volume', delta: -1 })}>−</Key>
        </div>
        <div className='tvr-cluster-mid'>
          <Key id='menu' label='Menu' pressed={pressed} onPress={press('menu', { type: 'home' })} className='tvr-key-round'>
            <ListIndentIncrease />
          </Key>
          <Key id='mute' label='Mute' pressed={pressed} onPress={press('mute', { type: 'mute' })} className='tvr-key-round'>
            <VolumeX />
          </Key>
        </div>
        <div className='tvr-rocker'>
          <Key id='ch-up' label='Channel up' pressed={pressed} onPress={press('ch-up', { type: 'channel', delta: 1 })}>+</Key>
          <span aria-hidden='true'>CH</span>
          <Key id='ch-down' label='Channel down' pressed={pressed} onPress={press('ch-down', { type: 'channel', delta: -1 })}>−</Key>
        </div>
      </div>

      <div className='tvr-row'>
        <Key id='back' label='Back' pressed={pressed} onPress={press('back', { type: 'back' })} className='tvr-key-round'>
          <Undo2 />
        </Key>
        <Key id='home' label='Home' pressed={pressed} onPress={press('home', { type: 'home' })} className='tvr-key-round'>
          <House />
        </Key>
        <Key id='play' label='Play or pause' pressed={pressed} onPress={press('play', { type: 'play' })} className='tvr-key-round'>
          <span className='tvr-playpause'>
            <Play />
            <Pause />
          </span>
        </Key>
      </div>

      <div className='tvr-dpad'>
        {(['up', 'right', 'down', 'left'] as const).map((dir) => (
          <Key
            key={dir}
            id={dir}
            label={`Arrow ${dir}`}
            pressed={pressed}
            onPress={press(dir, { type: 'arrow', dir })}
            className={`tvr-dpad-${dir}`}
          >
            <i />
          </Key>
        ))}
        <Key id='ok' label='OK' pressed={pressed} onPress={press('ok', { type: 'ok' })} className='tvr-dpad-ok'>
          <span>OK</span>
        </Key>
      </div>
    </div>
  );
}

function KeyboardView({ query, pressed, press }: { query: string; pressed: string | null; press: Press }) {
  return (
    <div className='tvr-keyboard'>
      <p className='tvr-view-title'>Type on your TV</p>
      <span className='tvr-kb-field'>
        {query}
        <i className='tvr-search-caret' />
        {query ? null : <span className='tvr-kb-hint'>Search on TV</span>}
      </span>
      <div className='tvr-kb'>
        {KEY_ROWS.map((row, r) => (
          <div key={row} className='tvr-kb-row'>
            {row.split('').map((char) => (
              <Key key={char} id={`key-${char}`} label={char} pressed={pressed} onPress={press(`key-${char}`, { type: 'type', char })}>
                {char}
              </Key>
            ))}
            {r === 2 ? (
              <Key id='key-erase' label='Delete' pressed={pressed} onPress={press('key-erase', { type: 'erase' })} className='tvr-kb-wide'>
                <Delete />
              </Key>
            ) : null}
          </div>
        ))}
        <div className='tvr-kb-row'>
          <Key id='key-space' label='Space' pressed={pressed} onPress={press('key-space', { type: 'type', char: ' ' })} className='tvr-kb-space'>
            space
          </Key>
          <Key id='key-go' label='Search' pressed={pressed} onPress={press('key-go', { type: 'ok' })} className='tvr-kb-go'>
            Search
          </Key>
        </div>
      </div>
    </div>
  );
}

function KeypadView({ digits, channel, pressed, press }: { digits: string; channel: number; pressed: string | null; press: Press }) {
  return (
    <div className='tvr-keypad'>
      <p className='tvr-view-title'>
        Channel <b>{digits || channel}</b>
      </p>
      <div className='tvr-keypad-grid'>
        {KEYPAD.map((digit) => (
          <Key key={digit} id={`digit-${digit}`} label={digit} pressed={pressed} onPress={press(`digit-${digit}`, { type: 'digit', value: digit })}>
            {digit}
          </Key>
        ))}
        <Key id='digit-back' label='Back' pressed={pressed} onPress={press('digit-back', { type: 'back' })}>
          <Undo2 />
        </Key>
        <Key id='digit-0' label='0' pressed={pressed} onPress={press('digit-0', { type: 'digit', value: '0' })}>0</Key>
        <Key id='digit-ok' label='OK' pressed={pressed} onPress={press('digit-ok', { type: 'commit' })} className='tvr-keypad-ok'>
          OK
        </Key>
      </div>
    </div>
  );
}

function TouchpadView({ dispatch, onUse }: { dispatch: (action: Action) => void; onUse: () => void }) {
  const last = useRef<{ x: number; y: number; moved: number } | null>(null);
  const [ripple, setRipple] = useState<{ x: number; y: number; n: number } | null>(null);

  const onDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    last.current = { x: event.clientX, y: event.clientY, moved: 0 };
    onUse();
  };

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!last.current) return;
    const box = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - last.current.x;
    const dy = event.clientY - last.current.y;
    last.current = { x: event.clientX, y: event.clientY, moved: last.current.moved + Math.abs(dx) + Math.abs(dy) };
    dispatch({ type: 'cursor', dx: (dx / box.width) * 120, dy: (dy / box.height) * 120 });
  };

  const onUp = (event: PointerEvent<HTMLDivElement>) => {
    if (last.current && last.current.moved < 6) {
      const box = event.currentTarget.getBoundingClientRect();
      setRipple({ x: event.clientX - box.left, y: event.clientY - box.top, n: Date.now() });
      dispatch({ type: 'ok' });
    }
    last.current = null;
  };

  return (
    <div className='tvr-touch'>
      <p className='tvr-view-title'>Drag to move, tap to select</p>
      <div
        className='tvr-pad'
        role='application'
        aria-label='Touchpad: drag to move the pointer on the TV, tap to select'
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => (last.current = null)}
      >
        <i className='tvr-pad-corner' />
        <i className='tvr-pad-corner' />
        <i className='tvr-pad-corner' />
        <i className='tvr-pad-corner' />
        <span className='tvr-pad-rings' aria-hidden='true'>
          <i />
          <i />
          <i />
        </span>
        {ripple ? <span key={ripple.n} className='tvr-pad-tap' style={{ left: ripple.x, top: ripple.y }} /> : null}
      </div>
    </div>
  );
}
