import { useEffect, useState } from 'react';
import {
  BatteryFull,
  ChevronLeft,
  CircleDot,
  Grid3x3,
  Lock,
  MessageCircle,
  Mic,
  Phone,
  PhoneOff,
  SendHorizontal,
  Signal,
  Volume2,
  Wifi,
} from 'lucide-react';
import { prefersReducedMotion } from '../../shared/motion';
import { initials } from '../../shared/offer';
import { APP, LINE, SCENES, photo, type CallEvent, type Scene, type TextEvent } from './content';
import { TypeIn } from './parts';

/*
 * The hero demo: one iPhone on the seam between your own line and the second one. The page lays
 * the pieces out (tabs, phone, where the number was shared, what stayed private); this file runs
 * the scenes.
 *
 * share → the second number is handed out (or, abroad, you are on hotel Wi-Fi)
 * alert → a text lands on the lock screen, or the call screen comes up
 * live  → the chat opens and the reply is typed, or the call is connected
 * done  → reply sent from the second line / call running; then the next scene
 */
export type Phase = 'share' | 'alert' | 'live' | 'done';

const SHARE_MS = 1500;
const ALERT_MS = 2100;
const TYPE_MS = 48;
const CALL_LIVE_MS = 2600;
const DONE_MS = 2800;

export type SceneState = {
  index: number;
  scene: Scene;
  phase: Phase;
  typed: number;
  seconds: number;
  select: (next: number) => void;
};

export function useScenes(): SceneState {
  const reduced = prefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>(reduced ? 'done' : 'share');
  const [typed, setTyped] = useState(0);
  const [seconds, setSeconds] = useState(reduced ? 14 : 0);

  const scene = SCENES[index];
  const event = scene.event;

  function select(next: number) {
    setIndex(next);
    setTyped(0);
    setSeconds(reduced ? 14 : 0);
    setPhase(reduced ? 'done' : 'share');
  }

  useEffect(() => {
    if (reduced) return;
    let timer: number;

    if (phase === 'share') {
      timer = window.setTimeout(() => setPhase('alert'), SHARE_MS);
    } else if (phase === 'alert') {
      timer = window.setTimeout(() => setPhase('live'), ALERT_MS);
    } else if (phase === 'live') {
      if (event.kind === 'text') {
        const done = typed >= event.reply.length;
        timer = window.setTimeout(
          () => (done ? setPhase('done') : setTyped(typed + 1)),
          typed === 0 ? 900 : done ? 450 : TYPE_MS,
        );
      } else {
        timer = window.setTimeout(() => setPhase('done'), CALL_LIVE_MS);
      }
    } else {
      timer = window.setTimeout(() => select((index + 1) % SCENES.length), DONE_MS);
    }

    return () => window.clearTimeout(timer);
  }, [phase, typed, index, reduced, event]);

  // The call timer runs once a call is connected.
  useEffect(() => {
    if (reduced || event.kind !== 'call' || (phase !== 'live' && phase !== 'done')) return;
    const timer = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, [phase, event.kind, reduced]);

  const typedAll = reduced || phase === 'done' ? (event.kind === 'text' ? event.reply.length : 0) : typed;
  return { index, scene, phase, typed: typedAll, seconds, select };
}

export function SceneTabs({ state }: { state: SceneState }) {
  return (
    <div className='duo-tabs' role='tablist' aria-label='Example: where you use the second number'>
      <span className='duo-tabs-label' aria-hidden='true'>
        Example
      </span>
      {SCENES.map((item, i) => (
        <button
          key={item.id}
          type='button'
          role='tab'
          aria-selected={i === state.index}
          className='duo-tab'
          onClick={() => state.select(i)}
        >
          {item.tab}
        </button>
      ))}
    </div>
  );
}

/** Where the second number was handed out, for the current scene. Its number types in. */
export function ShareCard({ state }: { state: SceneState }) {
  const { scene } = state;
  return (
    <div key={scene.id} className='duo-share'>
      <img src={photo(scene.share.photo, 160)} alt='' width={80} height={80} />
      <span className='duo-share-text'>
        <small>{scene.share.label}</small>
        <strong>{scene.share.title}</strong>
        <TypeIn className='duo-share-line' text={scene.share.line} start={250} />
      </span>
    </div>
  );
}

/** What the scene kept away from your own number. */
export function SceneNote({ state }: { state: SceneState }) {
  return (
    <p key={state.scene.id} className='duo-scene-note' aria-live='polite'>
      <Lock size={15} strokeWidth={2.6} aria-hidden='true' />
      {state.scene.note}
    </p>
  );
}

export function ScenePhone({ state }: { state: SceneState }) {
  const { scene, phase, typed, seconds } = state;
  return (
    <div className='duo-phone-stage' data-phase={phase} aria-label='Example: one iPhone with a second number'>
      <span className={phase === 'alert' ? 'duo-rings is-on' : 'duo-rings'} aria-hidden='true'>
        <i />
        <i />
        <i />
      </span>
      <div className='duo-phone'>
        <div className='duo-screen'>
          <StatusBar />
          <Screen scene={scene} phase={phase} typed={typed} seconds={seconds} />
        </div>
        <span className='duo-island' aria-hidden='true' />
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className='duo-status' aria-hidden='true'>
      <span>9:41</span>
      <span className='duo-status-icons'>
        <Signal size={13} strokeWidth={2.6} />
        <Wifi size={13} strokeWidth={2.6} />
        <BatteryFull size={17} strokeWidth={2} />
      </span>
    </div>
  );
}

function Screen({ scene, phase, typed, seconds }: { scene: Scene; phase: Phase; typed: number; seconds: number }) {
  const event = scene.event;

  if (event.kind === 'text') {
    if (phase === 'share' || phase === 'alert') return <LockScreen event={event} showNew={phase === 'alert'} />;
    return <Chat key={scene.id} event={event} typed={typed} sent={phase === 'done'} />;
  }

  if (phase === 'share') return <LockScreen event={null} showNew={false} />;
  return <Call key={scene.id} event={event} connected={phase !== 'alert'} seconds={seconds} />;
}

function LockScreen({ event, showNew }: { event: TextEvent | null; showNew: boolean }) {
  return (
    <div className='duo-lock'>
      <Lock className='duo-lock-icon' size={14} strokeWidth={2.6} aria-hidden='true' />
      <p className='duo-lock-date'>Saturday, June 14</p>
      <p className='duo-lock-time'>9:41</p>

      <div className='duo-lock-stack'>
        {event && showNew ? (
          <div className='duo-notif duo-notif-new'>
            <img src={APP.iconUrl} alt='' />
            <span className='duo-notif-body'>
              <span className='duo-notif-head'>
                <b>{APP.short}</b>
                <i>now</i>
              </span>
              <strong>
                {event.from} · {event.number}
              </strong>
              <span>{event.message}</span>
              <em className='duo-notif-line is-second'>To your 2nd line {LINE}</em>
            </span>
          </div>
        ) : null}
        <div className='duo-notif'>
          <span className='duo-notif-app' aria-hidden='true'>
            <MessageCircle size={16} fill='currentColor' strokeWidth={0} />
          </span>
          <span className='duo-notif-body'>
            <span className='duo-notif-head'>
              <b>Messages</b>
              <i>8m ago</i>
            </span>
            <strong>Mom</strong>
            <span>Dinner on Sunday? ❤️</span>
            <em className='duo-notif-line'>To your own number</em>
          </span>
        </div>
      </div>
    </div>
  );
}

function Chat({ event, typed, sent }: { event: TextEvent; typed: number; sent: boolean }) {
  const draft = sent ? '' : event.reply.slice(0, typed);

  return (
    <div className='duo-chat'>
      <div className='duo-chat-top'>
        <ChevronLeft size={18} strokeWidth={2.4} aria-hidden='true' />
        <span>Chats</span>
      </div>
      <div className='duo-chat-contact'>
        <span className='duo-chat-avatar' aria-hidden='true'>
          {initials(event.from)}
        </span>
        <strong>{event.from}</strong>
        <small>{event.number}</small>
        <p className='duo-chat-line'>
          <CircleDot size={11} strokeWidth={3} aria-hidden='true' /> Texting from your 2nd line
          <b>{LINE}</b>
        </p>
      </div>

      <div className='duo-chat-thread'>
        <span className='duo-chat-day'>Today 9:41</span>
        <p className='duo-bubble duo-bubble-in'>{event.message}</p>
        {sent ? (
          <>
            <p className='duo-bubble duo-bubble-out'>{event.reply}</p>
            <span className='duo-chat-sent'>Sent from {LINE}</span>
          </>
        ) : null}
      </div>

      <div className='duo-chat-input'>
        <span className={draft ? 'duo-chat-field has-text' : 'duo-chat-field'}>
          {draft || 'Text message'}
          {!sent && draft ? <span className='duo-caret' aria-hidden='true' /> : null}
        </span>
        <span className='duo-chat-send' aria-hidden='true'>
          <SendHorizontal size={15} strokeWidth={2.4} />
        </span>
      </div>
    </div>
  );
}

function Call({ event, connected, seconds }: { event: CallEvent; connected: boolean; seconds: number }) {
  const recording = event.live.icon === 'rec';
  const incoming = event.direction === 'in';
  const clock = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  const status = connected ? clock : incoming ? 'Incoming call…' : 'Calling…';

  return (
    <div className={connected ? 'duo-call is-connected' : 'duo-call'}>
      <span className='duo-call-avatar' aria-hidden='true'>
        {initials(event.who)}
      </span>
      <strong className='duo-call-who'>{event.who}</strong>
      <span className='duo-call-status'>
        {status}
        {connected || !incoming ? <small> · {event.detail}</small> : null}
      </span>
      <p className='duo-chat-line duo-call-line'>
        <CircleDot size={11} strokeWidth={3} aria-hidden='true' /> {incoming ? 'Calling your' : 'Calling from your'} 2nd
        line
        <b>{LINE}</b>
      </p>
      {connected ? (
        <p className={recording ? 'duo-call-live is-rec' : 'duo-call-live'}>
          {recording ? <span className='duo-call-rec-dot' /> : <Wifi size={13} strokeWidth={2.8} />}
          {event.live.text}
        </p>
      ) : null}

      {connected ? (
        <div className='duo-call-pad'>
          <span>
            <i>
              <Mic size={17} />
            </i>
            Mute
          </span>
          <span>
            <i>
              <Grid3x3 size={17} />
            </i>
            Keypad
          </span>
          <span>
            <i>
              <Volume2 size={17} />
            </i>
            Speaker
          </span>
          <span className={recording ? 'is-rec' : undefined}>
            <i>
              <CircleDot size={17} />
            </i>
            {recording ? 'Recording' : 'Record'}
          </span>
          <span className='duo-call-end'>
            <i>
              <PhoneOff size={20} />
            </i>
          </span>
        </div>
      ) : incoming ? (
        <div className='duo-call-answer'>
          <span className='duo-call-decline'>
            <i>
              <PhoneOff size={20} />
            </i>
            Decline
          </span>
          <span className='duo-call-accept'>
            <i>
              <Phone size={20} />
            </i>
            Accept
          </span>
        </div>
      ) : (
        <div className='duo-call-answer is-single'>
          <span className='duo-call-decline'>
            <i>
              <PhoneOff size={20} />
            </i>
            End
          </span>
        </div>
      )}
    </div>
  );
}
