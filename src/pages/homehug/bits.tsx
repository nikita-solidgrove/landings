import type { CSSProperties, ReactNode } from 'react';
import { ArrowUpRight, Bell, Check, Repeat } from 'lucide-react';
import { FAMILY, MEMBERS, type Mark, type MemberId, type Todo } from './content';

/** A family color, or grape/plum for HomeHug's own magnets. */
export type Tone = MemberId | 'grape' | 'plum';

const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(' ');

/** Rotation for notes, polaroids and magnets; the CSS reads it as `--tilt`. */
export const tilt = (deg: number, extra?: CSSProperties) => ({ '--tilt': `${deg}deg`, ...extra }) as CSSProperties;

/** A family member's round initial in their own color. */
export function Avatar({ who, size = 'md' }: { who: MemberId; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span className={`hh-avatar hh-avatar-${size} hh-who-${who}`} title={FAMILY[who]} aria-label={FAMILY[who]}>
      {FAMILY[who][0]}
    </span>
  );
}

export function Family({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return (
    <span className='hh-family' aria-label={`Family: ${MEMBERS.map((id) => FAMILY[id]).join(', ')}`}>
      {MEMBERS.map((id) => (
        <Avatar key={id} who={id} size={size} />
      ))}
    </span>
  );
}

export function CheckBox({ done }: { done?: boolean }) {
  return (
    <span className={done ? 'hh-check is-done' : 'hh-check'} aria-hidden='true'>
      <Check size={12} strokeWidth={3.5} />
    </span>
  );
}

export function MarkIcon({ mark }: { mark?: Mark }) {
  if (mark === 'bell') return <Bell className='hh-mark hh-mark-bell' size={14} fill='currentColor' aria-label='Reminder' />;
  if (mark === 'repeat') return <Repeat className='hh-mark' size={14} strokeWidth={2.5} aria-label='Repeats' />;
  if (mark === 'link') return <ArrowUpRight className='hh-mark' size={15} strokeWidth={2.5} aria-label='Has a link' />;
  return null;
}

/** One to-do row in the app's shape: checkbox, title, marks, who it's for. */
export function TodoRow({ todo, flash }: { todo: Todo; flash?: 'land' | 'tick' }) {
  const classes = cx('hh-todo', todo.done && 'is-done', flash && `is-${flash}`);
  return (
    <li className={classes}>
      <CheckBox done={todo.done} />
      <span className='hh-todo-title'>
        {todo.title}
        {todo.meta ? <small>{todo.meta}</small> : null}
      </span>
      <MarkIcon mark={todo.mark} />
      <Avatar who={todo.who} size='sm' />
    </li>
  );
}

/** A round fridge magnet. */
export function Magnet({ tone = 'anna', className }: { tone?: Tone; className?: string }) {
  return <span className={cx('hh-magnet', `hh-who-${tone}`, className)} aria-hidden='true' />;
}

type NoteProps = {
  /** Paper color: a family member's tint, or plain paper. */
  paper?: MemberId | 'plain';
  /** Magnet color; `false` for none. */
  magnet?: Tone | false;
  deg?: number;
  className?: string;
  sheetClassName?: string;
  style?: CSSProperties;
  reveal?: number;
  as?: 'div' | 'li';
  children: ReactNode;
};

/**
 * A paper note with a folded corner, held by a magnet. The wrapper carries the rotation and the
 * shadow (a drop-shadow, so it follows the cut corner); the sheet carries the paper.
 */
export function Note({
  paper = 'plain',
  magnet = 'grape',
  deg = 0,
  className,
  sheetClassName,
  style,
  reveal,
  as: Tag = 'div',
  children,
}: NoteProps) {
  const revealed = reveal !== undefined;
  const css = tilt(deg, revealed ? ({ '--reveal-delay': `${reveal}ms`, ...style } as CSSProperties) : style);
  return (
    <Tag
      className={cx('hh-note', paper !== 'plain' && `hh-paper-${paper}`, revealed && 'hh-drop', className)}
      style={css}
      {...(revealed ? { 'data-reveal': '' } : {})}
    >
      {magnet ? <Magnet tone={magnet} /> : null}
      <div className={cx('hh-note-sheet', sheetClassName)}>{children}</div>
    </Tag>
  );
}

/** Every section heading sits on a note held by one magnet. */
export function HeadNote({
  id,
  magnet,
  deg = -1.2,
  align = 'start',
  text,
  children,
}: {
  id: string;
  magnet: Tone;
  deg?: number;
  align?: 'start' | 'center';
  text?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={`hh-head hh-head-${align}`}>
      <Note magnet={magnet} deg={deg} reveal={0} className='hh-head-note'>
        <h2 id={id} className='hh-title'>
          {children}
        </h2>
      </Note>
      {text ? (
        <p className='hh-head-text' data-reveal='' style={{ '--reveal-delay': '160ms' } as CSSProperties}>
          {text}
        </p>
      ) : null}
    </div>
  );
}

/** A photo print held by a magnet or a strip of tape. */
export function Polaroid({
  src,
  alt = '',
  deg = 0,
  pin = 'magnet',
  magnet = 'anna',
  className,
  style,
  lazy = true,
}: {
  src: string;
  alt?: string;
  deg?: number;
  pin?: 'magnet' | 'tape';
  magnet?: Tone;
  className?: string;
  style?: CSSProperties;
  lazy?: boolean;
}) {
  return (
    <figure className={cx('hh-polaroid', className)} style={tilt(deg, style)} aria-hidden={alt ? undefined : true}>
      {pin === 'tape' ? <span className='hh-tape' aria-hidden='true' /> : <Magnet tone={magnet} />}
      <img src={src} alt={alt} loading={lazy ? 'lazy' : undefined} />
    </figure>
  );
}
