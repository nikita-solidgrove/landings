import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { prefersReducedMotion } from '../../shared/motion';
import { DAY_LABELS, DEFAULT_ACTIVE, PRESETS, clock, range, type Preset } from './content';
import { SKY, arcPath, polar } from './dial';

type DayType = 'weekday' | 'weekend';

const DAY_MS = 26000; // one sweep of the hand around the day
const SWEEP_FROM = 17 * 60; // the hand starts at 5 PM
const SIZE = 400;
const C = SIZE / 2;
const LANES = [{ r: 146, w: 28 }, { r: 110, w: 20 }];

// Left of the dial the morning side of the day, right of it the evening side (the dial has noon on top).
const LEFT = ['morning-window', 'deep-work', 'lunch-break', 'weekend-time'];
const RIGHT = ['study-block', 'dinner-table', 'wind-down', 'night-lock'];
const byId = (id: string) => PRESETS.find((p) => p.id === id)!;

const runsOn = (preset: Preset, day: DayType) =>
  preset.days === 'every' || (preset.days === 'weekdays' ? day === 'weekday' : day === 'weekend');

/** Minute intervals in [0, 1440) for a block, splitting overnight ones in two. */
const spans = (p: Preset): [number, number][] =>
  p.end > p.start ? [[p.start, p.end]] : [[p.start, 1440], [0, p.end]];

const covers = (p: Preset, minute: number) => spans(p).some(([a, b]) => minute >= a && minute < b);

const overlaps = (a: Preset, b: Preset) =>
  spans(a).some(([a1, a2]) => spans(b).some(([b1, b2]) => a1 < b2 && b1 < a2));

/** The app's presets on a 24-hour dial: switch them on and see the day they guard. */
export function ScheduleDial() {
  const reduced = prefersReducedMotion();
  const [day, setDay] = useState<DayType>('weekday');
  const [active, setActive] = useState<string[]>(DEFAULT_ACTIVE);
  const [focus, setFocus] = useState<string | null>(null);
  const [minute, setMinute] = useState(reduced ? 22 * 60 + 30 : SWEEP_FROM);

  useEffect(() => {
    if (reduced) return;
    const started = performance.now();
    const timer = window.setInterval(() => {
      const elapsed = (performance.now() - started) % DAY_MS;
      setMinute(Math.floor(SWEEP_FROM + (elapsed / DAY_MS) * 1440) % 1440);
    }, 80);
    return () => window.clearInterval(timer);
  }, [reduced]);

  const today = useMemo(() => PRESETS.filter((p) => active.includes(p.id) && runsOn(p, day)), [active, day]);

  // Blocks that overlap go to an inner lane, so each one stays visible.
  const lanes = useMemo(() => {
    const placed: { preset: Preset; lane: number }[] = [];
    for (const preset of [...today].sort((a, b) => a.start - b.start)) {
      const lane = LANES.findIndex((_, i) => !placed.some((item) => item.lane === i && overlaps(item.preset, preset)));
      placed.push({ preset, lane: lane === -1 ? LANES.length - 1 : lane });
    }
    return placed;
  }, [today]);

  const guarded = useMemo(() => {
    let total = 0;
    for (let m = 0; m < 1440; m += 5) if (today.some((p) => covers(p, m))) total += 5;
    return total;
  }, [today]);

  const running = today.filter((p) => covers(p, minute));
  const [handX, handY] = polar(C, minute, 170);
  const [tailX, tailY] = polar(C, minute, 92);
  const hours = Math.floor(guarded / 60);
  const minutes = guarded % 60;

  const toggle = (id: string) =>
    setActive((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));

  const list = (ids: string[], side: 'left' | 'right') => (
    <ul className={`lv-preset-list is-${side}`}>
      {ids.map(byId).map((preset) => {
        const on = active.includes(preset.id);
        const idle = on && !runsOn(preset, day);
        return (
          <li key={preset.id}>
            <button
              type='button'
              role='switch'
              aria-checked={on}
              className='lv-preset'
              data-idle={idle || undefined}
              onClick={() => toggle(preset.id)}
              onPointerEnter={() => setFocus(preset.id)}
              onPointerLeave={() => setFocus(null)}
              onFocus={() => setFocus(preset.id)}
              onBlur={() => setFocus(null)}
            >
              <span className='lv-preset-emoji' style={{ '--tint': preset.color } as CSSProperties} aria-hidden='true'>
                {preset.emoji}
              </span>
              <span className='lv-preset-text'>
                <strong>{preset.title}</strong>
                <small>
                  {range(preset)} · {DAY_LABELS[preset.days]}
                </small>
              </span>
              <span className='lv-switch' style={{ '--on': preset.color } as CSSProperties} aria-hidden='true' />
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className='lv-schedule'>
      <div className='lv-day-switch' role='group' aria-label='Day type'>
        {(['weekday', 'weekend'] as DayType[]).map((item) => (
          <button key={item} type='button' aria-pressed={day === item} onClick={() => setDay(item)}>
            {item === 'weekday' ? 'Weekday' : 'Weekend'}
          </button>
        ))}
      </div>

      <div className='lv-schedule-grid'>
        {list(LEFT, 'left')}

        <div className='lv-dial-wrap'>
          <svg
            className='lv-dial'
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            role='img'
            aria-label={`Example ${day}: apps blocked ${hours} hours ${minutes ? `${minutes} minutes ` : ''}by the presets switched on`}
          >
            {SKY.map((step) => (
              <path key={step.from} d={arcPath(C, step.from + 4, step.to - 4, 192)} strokeWidth={5} className={`lv-dial-sky lv-sky-${step.tone}`} />
            ))}
            {Array.from({ length: 96 }, (_, i) => {
              const major = i % 4 === 0;
              const [x1, y1] = polar(C, i * 15, major ? 172 : 176);
              const [x2, y2] = polar(C, i * 15, 181);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className={major ? 'lv-tick is-major' : 'lv-tick'} />;
            })}
            {LANES.map((lane) => (
              <circle key={lane.r} cx={C} cy={C} r={lane.r} strokeWidth={lane.w} className='lv-lane' />
            ))}
            {lanes.map(({ preset, lane }) => (
              <path
                key={preset.id}
                d={arcPath(C, preset.start, preset.end, LANES[lane].r)}
                strokeWidth={LANES[lane].w}
                stroke={preset.color}
                pathLength={1}
                className='lv-arc'
                data-dim={(focus && focus !== preset.id) || undefined}
              />
            ))}
            {[0, 12].map((hour) => {
              const [x, y] = polar(C, hour * 60, 76);
              return (
                <text key={hour} x={x} y={y} className='lv-dial-hour' textAnchor='middle' dominantBaseline='central'>
                  {`${String(hour).padStart(2, '0')}:00`}
                </text>
              );
            })}
            <line x1={tailX} y1={tailY} x2={handX} y2={handY} className='lv-hand' />
            <circle cx={handX} cy={handY} r={7} className='lv-hand-tip' />
          </svg>
          <div className='lv-dial-center' aria-hidden='true'>
            <strong>{clock(Math.floor(minute / 5) * 5)}</strong>
            <span data-on={running.length > 0 || undefined}>{running.length ? `${running[0].title} on` : 'Apps open'}</span>
          </div>
        </div>

        {list(RIGHT, 'right')}
      </div>

      <p className='lv-guarded'>
        {guarded ? (
          <>
            <strong>
              {hours}h{minutes ? ` ${minutes}m` : ''}
            </strong>{' '}
            blocked automatically every {day}. Default preset times; change any of them.
          </>
        ) : (
          <>Switch on a preset to plan your {day}.</>
        )}
      </p>
    </div>
  );
}
