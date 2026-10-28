import { useEffect, useState } from 'react';
import { ArrowUp, ArrowUpRight, CalendarDays, ChevronLeft, List } from 'lucide-react';
import { prefersReducedMotion } from '../../shared/motion';
import { Avatar, Family, Magnet, TodoRow } from './bits';
import {
  APP,
  BOARD_GROUPS,
  BOARD_START,
  DEMO_STEPS,
  DEMO_TICK,
  DIARY_SEEDS,
  FAMILY,
  type DemoStep,
  type GroupId,
  type Todo,
} from './content';

type Phase = 'typing' | 'sent' | 'thinking' | 'replied' | 'landed';

const TYPE_MS = 34;
const LAST = DEMO_STEPS.length;

/**
 * The family's week coming together on the fridge door: a note typed into the shared diary, the
 * AI's answer, and the to-do dropping onto the Upcoming planner pad with whoever it belongs to.
 * Loops through the listing's own examples, then someone ticks a grocery off and it starts over.
 */
export function FamilyDemo() {
  const reduced = prefersReducedMotion();
  const [step, setStep] = useState(reduced ? LAST : 0);
  const [phase, setPhase] = useState<Phase>(reduced ? 'landed' : 'typing');
  const [typed, setTyped] = useState(0);
  const [ticked, setTicked] = useState(reduced);
  const [remind, setRemind] = useState<{ key: number; title: string; when: string } | null>(() => {
    // Without motion the reminder simply stays on screen.
    const withReminder = DEMO_STEPS.find((item) => item.remind)?.remind;
    return reduced && withReminder ? { key: 0, ...withReminder } : null;
  });

  const current: DemoStep | undefined = DEMO_STEPS[step];

  useEffect(() => {
    if (reduced) return;
    let timer = 0;
    const after = (ms: number, next: () => void) => {
      timer = window.setTimeout(next, ms);
    };

    if (!current) {
      if (!ticked) after(900, () => setTicked(true));
      else
        after(3400, () => {
          setTicked(false);
          setTyped(0);
          setStep(0);
          setPhase('typing');
        });
    } else if (phase === 'typing') {
      if (typed < current.note.length) after(TYPE_MS, () => setTyped(typed + 1));
      else after(380, () => setPhase('sent'));
    } else if (phase === 'sent') {
      after(450, () => setPhase('thinking'));
    } else if (phase === 'thinking') {
      after(1000, () => setPhase('replied'));
    } else if (phase === 'replied') {
      after(650, () => {
        setPhase('landed');
        if (current.remind) setRemind({ key: Date.now(), ...current.remind });
      });
    } else {
      after(current.remind ? 3200 : 2000, () => {
        setTyped(0);
        setStep(step + 1);
        setPhase('typing');
      });
    }

    return () => window.clearTimeout(timer);
  }, [reduced, current, phase, typed, ticked, step]);

  // Diary: the seed exchange, every finished step, then the one in progress.
  const finished = DEMO_STEPS.slice(0, step);
  const showNote = current && phase !== 'typing';
  const showReply = current && (phase === 'replied' || phase === 'landed');

  // Upcoming: the starting plan plus everything that has landed so far.
  const landed = current && phase === 'landed' ? [...finished, current] : finished;
  const board = buildBoard(landed, ticked);
  const fresh = new Set(current && phase === 'landed' ? current.add.map((todo) => todo.id) : []);
  const flashOf = (id: string) => (fresh.has(id) ? 'land' : !current && ticked && id === DEMO_TICK ? 'tick' : undefined);

  const writer = current?.from ?? DEMO_STEPS[LAST - 1].from;

  return (
    <div className='hh-demo' aria-label='Example: notes in the family diary become the family’s plan'>
      {remind ? (
        <div key={remind.key} className='hh-notify' aria-hidden='true'>
          <img src={APP.iconUrl} alt='' />
          <span className='hh-notify-body'>
            <span className='hh-notify-top'>
              <b>HomeHug</b>
              <small>now</small>
            </span>
            <strong>Reminder: {remind.title}</strong>
            <small>{remind.when}</small>
          </span>
        </div>
      ) : null}

      <div className='hh-phone'>
        <div className='hh-phone-screen'>
          <div className='hh-phone-status' aria-hidden='true'>
            <span>9:41</span>
            <span className='hh-island' />
            <span className='hh-phone-signal'>
              <i />
              <i />
              <i />
            </span>
          </div>
          <div className='hh-phone-bar'>
            <ChevronLeft size={18} aria-hidden='true' />
            <strong>Family diary</strong>
            <Family />
          </div>

          <div className='hh-chat' aria-live='polite'>
            <span className='hh-chat-day'>Today</span>
            {DIARY_SEEDS.flatMap((item, i) => [<Note key={`sn${i}`} step={item} />, <Reply key={`sr${i}`} step={item} />])}
            {/* One flat list with stable keys, so earlier messages never re-mount and re-animate. */}
            {DEMO_STEPS.flatMap((item, i) => {
              const isCurrent = i === step;
              if (i > step) return [];
              const nodes = [];
              if (!isCurrent || showNote) nodes.push(<Note key={`n${i}`} step={item} />);
              if (isCurrent && phase === 'thinking') {
                nodes.push(
                  <div key={`t${i}`} className='hh-reply hh-thinking' aria-label='Thinking'>
                    <i />
                    <i />
                    <i />
                  </div>,
                );
              }
              if (!isCurrent || showReply) nodes.push(<Reply key={`r${i}`} step={item} />);
              return nodes;
            })}
          </div>

          <div className='hh-composer'>
            <Avatar who={writer} size='sm' />
            <span className={current && phase === 'typing' && typed ? 'hh-composer-field is-typing' : 'hh-composer-field'}>
              {current && phase === 'typing' && typed ? (
                <>
                  {current.note.slice(0, typed)}
                  <span className='hh-caret' aria-hidden='true' />
                </>
              ) : (
                'Write in the family diary…'
              )}
            </span>
            <span className='hh-send' aria-hidden='true'>
              <ArrowUp size={16} strokeWidth={3} />
            </span>
          </div>
        </div>
      </div>

      {/* The family's Upcoming list as a magnetic planner pad on the fridge door. */}
      <div className='hh-pad'>
        <Magnet tone='grape' className='hh-pad-magnet' />
        <Magnet tone='kate' className='hh-pad-magnet hh-pad-magnet-r' />
        <div className='hh-pad-head'>
          <span className='hh-pad-title'>
            <CalendarDays size={18} strokeWidth={2.4} aria-hidden='true' />
            Upcoming
          </span>
          <Family />
        </div>
        <div className='hh-pad-body'>
          {BOARD_GROUPS.map((group) => (
            <section key={group.id} className='hh-pad-group'>
              <h4>
                {group.day ? (
                  <>
                    <b>{group.day}</b> {group.label}
                  </>
                ) : (
                  <>
                    <List size={14} strokeWidth={2.6} aria-hidden='true' /> {group.label}
                  </>
                )}
              </h4>
              <ul className={group.id === 'groceries' ? 'hh-todos hh-todos-grid' : 'hh-todos'}>
                {board[group.id].map((todo) => (
                  <TodoRow key={todo.id} todo={todo} flash={flashOf(todo.id)} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>

      <p className='hh-demo-note'>Example family. Notes based on the app’s own examples.</p>
    </div>
  );
}

function buildBoard(steps: DemoStep[], ticked: boolean) {
  const board = Object.fromEntries(
    Object.entries(BOARD_START).map(([id, todos]) => [id, [...todos]]),
  ) as Record<GroupId, Todo[]>;
  for (const step of steps) {
    board[step.group] = step.first ? [...step.add, ...board[step.group]] : [...board[step.group], ...step.add];
  }
  if (ticked) {
    board.groceries = board.groceries.map((todo) => (todo.id === DEMO_TICK ? { ...todo, done: true } : todo));
  }
  return board;
}

function Note({ step }: { step: DemoStep }) {
  return (
    <div className='hh-note-msg'>
      <span className='hh-note-bubble'>
        <small>{FAMILY[step.from]}</small>
        {step.note}
      </span>
      <Avatar who={step.from} size='sm' />
    </div>
  );
}

function Reply({ step }: { step: DemoStep }) {
  return (
    <div className='hh-reply'>
      <span className='hh-reply-action'>
        {step.reply.action}
        <ArrowUpRight size={13} strokeWidth={2.5} aria-hidden='true' />
      </span>
      <span className='hh-reply-title'>
        {step.reply.title} <em>{step.reply.where}</em>
      </span>
    </div>
  );
}
