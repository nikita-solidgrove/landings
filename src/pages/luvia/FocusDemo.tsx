import { useEffect, useState, type CSSProperties } from 'react';
import {
  BookOpen,
  Camera,
  Clapperboard,
  Gamepad2,
  Heart,
  Laugh,
  Lock,
  Map,
  MessageCircle,
  MessagesSquare,
  Newspaper,
  Phone,
  Play,
  Radio,
  ShoppingBag,
  StickyNote,
  Tv,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { prefersReducedMotion } from '../../shared/motion';
import { APP, DURATIONS } from './content';

type Tile = { name: string; icon: LucideIcon; bg: string; fg?: string; badge?: number };

// Generic stand-ins for the apps people block; no real brands.
const DISTRACTIONS: Tile[] = [
  { name: 'Social', icon: Camera, bg: '#e8467c', badge: 4 },
  { name: 'Clips', icon: Clapperboard, bg: '#16182f', badge: 9 },
  { name: 'Videos', icon: Play, bg: '#ff3b30' },
  { name: 'Chat', icon: MessageCircle, bg: '#2aa5f0', badge: 12 },
  { name: 'Shop', icon: ShoppingBag, bg: '#ff8a1f', badge: 2 },
  { name: 'Games', icon: Gamepad2, bg: '#7b54ff' },
  { name: 'News', icon: Newspaper, bg: '#4c5bd4', badge: 6 },
  { name: 'Stream', icon: Tv, bg: '#d81e2c' },
  { name: 'Forum', icon: MessagesSquare, bg: '#ff5a1f', badge: 3 },
  { name: 'Dating', icon: Heart, bg: '#ff4f8b' },
  { name: 'Live', icon: Radio, bg: '#9b5cff', badge: 1 },
  { name: 'Memes', icon: Laugh, bg: '#ffd23f', fg: '#16182f' },
];

// What stays open: the allowlist from the listing (and the app's own screenshot).
const ALLOWED: Tile[] = [
  { name: 'Phone', icon: Phone, bg: '#34c759' },
  { name: 'Maps', icon: Map, bg: '#3f8cff' },
  { name: 'Notes', icon: StickyNote, bg: '#ffd23f', fg: '#16182f' },
  { name: 'Books', icon: BookOpen, bg: '#ff8a1f' },
];

// One loop of the example, in milliseconds.
const SHEET_IN = 1800;
const PICK_25 = 2700;
const PRESS = 3500;
const LOCK_START = 3900;
const LOCK_STEP = 70;
const COUNT_START = 4500;
const COUNT_END = 11500;
const TAP_AT = 7000;
const TAP_END = 8800;
const DONE = 11500;
const LOOP = 14800;
const SESSION_MIN = 25;
const BADGE_BUMPS = [600, 1300];

const phaseAt = (t: number) => (t < SHEET_IN ? 'idle' : t < LOCK_START ? 'sheet' : t < DONE ? 'focus' : 'done');

export function FocusDemo() {
  const reduced = prefersReducedMotion();
  const [t, setT] = useState(reduced ? 9300 : 0);

  useEffect(() => {
    if (reduced) return;
    const started = performance.now();
    const timer = window.setInterval(() => setT((performance.now() - started) % LOOP), 100);
    return () => window.clearInterval(timer);
  }, [reduced]);

  const phase = phaseAt(t);
  const picked = t < PICK_25 ? 0 : 1;
  const pressed = t >= PRESS && t < LOCK_START;
  const bumps = BADGE_BUMPS.filter((at) => t >= at).length;

  const progress = Math.min(1, Math.max(0, (t - COUNT_START) / (COUNT_END - COUNT_START)));
  const left = Math.ceil(SESSION_MIN * 60 * (1 - progress));
  const timeLeft = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  const tapping = phase === 'focus' && t >= TAP_AT && t < TAP_END;

  return (
    <div className='lv-phone' role='img' aria-label='Example: a Quick Focus session blocks twelve distracting apps for 25 minutes while Phone, Maps, Notes and Books stay open'>
      <div className='lv-phone-screen' data-phase={phase}>
        <span className='lv-island' aria-hidden='true' />
        <div className='lv-status' aria-hidden='true'>
          <span>9:41</span>
          <span className='lv-status-icons'>
            <i />
            <i />
            <i />
          </span>
        </div>

        <div className='lv-phone-top'>
          <div className='lv-clock-widget'>
            <strong>9:41</strong>
            <span>Tuesday</span>
          </div>
          <div className='lv-session'>
            <span className='lv-ring' style={{ '--p': progress } as CSSProperties}>
              <Zap size={16} fill='currentColor' />
            </span>
            <span className='lv-session-text'>
              <small>Quick Focus</small>
              <strong>{timeLeft}</strong>
            </span>
            <span className='lv-session-pill' aria-hidden='true'>
              <Lock size={11} strokeWidth={3} /> 12
            </span>
          </div>
        </div>

        <div className='lv-apps'>
          {DISTRACTIONS.map((tile, i) => {
            const locked = (phase === 'focus' && t >= LOCK_START + i * LOCK_STEP) || (reduced && phase === 'focus');
            const badge = tile.badge ? tile.badge + (i % 3 === 0 ? bumps * (i + 1) : 0) : 0;
            return (
              <span
                key={tile.name}
                className='lv-app'
                data-locked={locked || undefined}
                data-tapped={(tapping && i === 1) || undefined}
              >
                <span className='lv-app-icon' style={{ background: tile.bg, color: tile.fg ?? '#fff' }}>
                  <tile.icon size={22} strokeWidth={2.2} />
                </span>
                {badge ? <span className='lv-app-badge'>{badge}</span> : null}
                <span className='lv-app-lock'>
                  <Lock size={12} strokeWidth={3} />
                </span>
                <span className='lv-app-name'>{tile.name}</span>
              </span>
            );
          })}
          {tapping ? (
            <span className='lv-blocked-tip' aria-hidden='true'>
              Blocked during Quick Focus
            </span>
          ) : null}
        </div>

        <span className='lv-allowed-label' aria-hidden='true'>
          Always allowed
        </span>
        <div className='lv-phone-dock'>
          {ALLOWED.map((tile) => (
            <span key={tile.name} className='lv-app lv-app-allowed'>
              <span className='lv-app-icon' style={{ background: tile.bg, color: tile.fg ?? '#fff' }}>
                <tile.icon size={22} strokeWidth={2.2} />
              </span>
            </span>
          ))}
        </div>

        <div className='lv-sheet' aria-hidden='true'>
          <span className='lv-sheet-grip' />
          <strong className='lv-sheet-title'>
            <Zap size={16} fill='currentColor' /> Quick Focus
          </strong>
          <span className='lv-sheet-sub'>Block distractions right now</span>
          <span className='lv-segment'>
            {DURATIONS.map((item, i) => (
              <span key={item.label} data-on={i === picked || undefined}>
                {item.minutes ? item.label : '∞'}
              </span>
            ))}
          </span>
          <span className='lv-sheet-button' data-pressed={pressed || undefined}>
            Start focus
          </span>
        </div>

        <div className='lv-notice' aria-hidden='true'>
          <img src={APP.iconUrl} alt='' />
          <span>
            <strong>
              Focus session complete <small>now</small>
            </strong>
            <span>25 minutes done. Your apps are open again.</span>
          </span>
        </div>

        <span className='lv-home-bar' aria-hidden='true' />
      </div>
    </div>
  );
}
