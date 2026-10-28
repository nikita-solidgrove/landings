import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Smartphone } from 'lucide-react';
import { prefersReducedMotion } from '../../shared/motion';
import { APP, DEVICES, TARGET, WALK, photo } from './content';

type Phase = 'scan' | 'closer' | 'relax';

const PHASES: { id: Phase; ch: string; name: string; ms: number }[] = [
  { id: 'scan', ch: 'CH 01', name: 'Scan', ms: 6400 },
  { id: 'closer', ch: 'CH 02', name: 'Magnetometer', ms: 6000 },
  { id: 'relax', ch: 'CH 03', name: 'Room', ms: 5400 },
];

/** One turn of the sweep. A device shows up the moment the sweep first passes over it. */
const SWEEP_MS = 3600;
const WALK_MS = 4400;

/** Bearing of a point in the dial (percent), clockwise from the top. */
const bearing = (x: number, y: number) => ((Math.atan2(x - 50, 50 - y) * 180) / Math.PI + 360) % 360;
const sweptAt = (x: number, y: number) => Math.round((bearing(x, y) / 360) * SWEEP_MS);

/** Your own phone is at the center and shows up first; everything else when the sweep reaches it. */
const FOUND_AT = DEVICES.map((device) => (device.kind === 'phone' ? 320 : sweptAt(device.x, device.y) + 60));
const UNKNOWN = DEVICES.findIndex((device) => device.kind === 'unknown');
const PHONE = DEVICES.findIndex((device) => device.kind === 'phone');

/** The tick ring around the dial: every 5°, longer every 30°. */
const TICKS = Array.from({ length: 72 }, (_, i) => i * 5);

function pointAt(p: number): [number, number] {
  const segments = WALK.length - 1;
  const at = Math.min(segments - 0.0001, Math.max(0, p) * segments);
  const i = Math.floor(at);
  const t = at - i;
  const [x1, y1] = WALK[i];
  const [x2, y2] = WALK[i + 1];
  return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];
}

/** Footsteps along the walk, shown as you pass them. */
const STEPS = Array.from({ length: 15 }, (_, i) => ({ at: i / 14, point: pointAt(i / 14) }));

/** Magnetometer reading in µT while walking: near the usual background, climbing close to the screen. */
const reading = (p: number, wobble: number) => 46 + 118 * p ** 2.2 + wobble;
const PEAK = reading(1, 0);

/** Needle angle on a 0–200 µT half dial. */
const needle = (value: number) => -90 + Math.max(0, Math.min(1, value / 200)) * 180;

const place = (x: number, y: number) => ({ left: `${x}%`, top: `${y}%` }) as CSSProperties;

/**
 * The app's core moment as a looping example on a radar scope: the sweep finds what's on the room's
 * Wi-Fi and Bluetooth, the magnetometer takes a closer look at the one unknown device while you walk
 * toward it, then the room is checked and warms up. The readouts beside the dial are the steps.
 */
export function RoomScope() {
  const reduced = prefersReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<Phase>(reduced ? 'relax' : 'scan');
  const [cycle, setCycle] = useState(0);
  const [seen, setSeen] = useState<boolean[]>(() => DEVICES.map(() => reduced));
  const [walk, setWalk] = useState(reduced ? 1 : 0);
  const [wobble, setWobble] = useState(0);
  const running = !reduced && visible;

  // Off screen the loop rests; it picks up again from the start of the current step.
  useEffect(() => {
    const element = root.current;
    if (!element || reduced) return;
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting) setCycle((n) => n + 1);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [reduced]);

  // Next step when this one has played out; the loop starts over after the room is checked.
  useEffect(() => {
    if (!running) return;
    const index = PHASES.findIndex((item) => item.id === phase);
    const timer = window.setTimeout(() => {
      setPhase(PHASES[(index + 1) % PHASES.length].id);
      setCycle((n) => n + 1);
    }, PHASES[index].ms);
    return () => window.clearTimeout(timer);
  }, [phase, cycle, running]);

  // Devices show up as the sweep passes them.
  useEffect(() => {
    if (phase !== 'scan' || !running) {
      setSeen(DEVICES.map(() => true));
      return;
    }
    setSeen(DEVICES.map(() => false));
    const timers = FOUND_AT.map((ms, i) =>
      window.setTimeout(() => setSeen((prev) => prev.map((value, j) => value || j === i)), ms),
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [phase, cycle, running]);

  // The walk toward the screen drives the magnetometer.
  useEffect(() => {
    if (phase !== 'closer' || !running) {
      setWalk(1);
      return;
    }
    setWalk(0);
    const started = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const p = Math.min(1, Math.max(0, (now - started - 300) / WALK_MS));
      setWalk(p);
      setWobble(Math.sin(now / 90) * 1.4 + Math.sin(now / 37) * 0.7);
      if (p < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [phase, cycle, running]);

  function select(next: Phase) {
    setPhase(next);
    setCycle((n) => n + 1);
  }

  const [youX, youY] = phase === 'scan' ? WALK[0] : pointAt(phase === 'closer' ? walk : 1);
  const scanDone = seen.every(Boolean);
  const wifi = DEVICES.filter((device, i) => seen[i] && device.via === 'Wi-Fi').length;
  const bluetooth = DEVICES.filter((device, i) => seen[i] && device.via === 'Bluetooth').length;
  const value = phase === 'closer' ? reading(walk, walk < 1 ? wobble : 0) : PEAK;
  const walking = phase === 'closer' && walk < 1;

  const message =
    phase === 'scan'
      ? scanDone
        ? 'One unknown device. Take a closer look.'
        : 'Sweeping Wi-Fi and Bluetooth…'
      : phase === 'closer'
        ? walking
          ? 'Walk slowly. The reading climbs near electronics.'
          : 'Strongest by the screen above the bed: the room’s TV.'
        : 'The unknown one was the room’s TV. Time to unpack.';

  return (
    <div
      ref={root}
      className='dd-scope'
      data-phase={phase}
      data-paused={running ? undefined : ''}
      aria-label='Example of a room check with the app'
    >
      <div className='dd-dial'>
        <span className='dd-dial-field' aria-hidden='true'>
          <i />
          <i />
          <i />
          <i />
        </span>

        <DialScale />

        <div className='dd-face'>
          <img src={photo('hotelRoom', 900, 900)} alt='An example hotel room' width={900} height={900} />
          <span className='dd-face-night' aria-hidden='true' />

          <svg className='dd-face-grid' viewBox='0 0 100 100' aria-hidden='true'>
            <circle cx={50} cy={50} r={16.5} />
            <circle cx={50} cy={50} r={33} />
            <line x1={0} y1={50} x2={100} y2={50} />
            <line x1={50} y1={0} x2={50} y2={100} />
            {phase !== 'scan'
              ? STEPS.map((step) => (
                  <circle
                    key={step.at}
                    className={step.at <= walk ? 'dd-step is-on' : 'dd-step'}
                    cx={step.point[0]}
                    cy={step.point[1]}
                    r={0.75}
                  />
                ))
              : null}
          </svg>

          {phase === 'scan' ? <span key={`sweep-${cycle}`} className='dd-sweep' aria-hidden='true' /> : null}

          {phase !== 'scan' ? (
            <span
              className='dd-target'
              style={{ ...place(...TARGET), '--heat': phase === 'closer' ? walk : 1 } as CSSProperties}
              aria-hidden='true'
            >
              <i />
              <i />
            </span>
          ) : null}

          {DEVICES.map((device, i) => {
            if (device.kind === 'phone') return null;
            const unknown = device.kind === 'unknown';
            const label = unknown && phase === 'relax' ? 'The room’s TV' : device.name;
            return (
              <span
                key={`${device.name}-${cycle}`}
                className={[
                  'dd-blip',
                  `is-${device.kind}`,
                  seen[i] ? 'is-seen' : '',
                  device.tag === 'left' ? 'is-left' : '',
                ].join(' ')}
                style={{ ...place(device.x, device.y), '--ping': `${sweptAt(device.x, device.y)}ms` } as CSSProperties}
                aria-hidden='true'
              >
                <i />
                <b>
                  {label}
                  {unknown && phase !== 'relax' ? <em>?</em> : null}
                </b>
              </span>
            );
          })}

          <span className={seen[PHONE] && phase === 'scan' ? 'dd-you is-tagged' : 'dd-you'} style={place(youX, youY)} aria-hidden='true'>
            <Smartphone size={14} strokeWidth={2.4} />
            <b>My Phone</b>
          </span>
        </div>

        {phase === 'relax' && !reduced ? (
          <div key={`toast-${cycle}`} className='dd-toast' aria-hidden='true'>
            <img src={APP.iconUrl} alt='' />
            <span>
              <small>{APP.name} · now</small>
              <strong>Room check done</strong>
              <small>Wi-Fi, Bluetooth, magnetometer</small>
            </span>
          </div>
        ) : null}
      </div>

      <div className='dd-scope-side'>
        <div className='dd-readouts' role='tablist' aria-label='Room check steps'>
          {PHASES.map((item, index) => {
            const active = item.id === phase;
            const done = PHASES.findIndex((p) => p.id === phase) > index;
            return (
              <button
                key={item.id}
                type='button'
                role='tab'
                aria-selected={active}
                className='dd-ro'
                data-state={active ? 'active' : done ? 'done' : 'idle'}
                onClick={() => select(item.id)}
              >
                <span className='dd-ro-head'>
                  <i className='dd-led' />
                  <span>{item.ch}</span>
                  <span className='dd-ro-name'>{item.name}</span>
                </span>

                {item.id === 'scan' ? (
                  <>
                    <span className='dd-ro-value'>
                      {phase === 'scan' ? wifi + bluetooth : DEVICES.length}
                      <small>found</small>
                    </span>
                    <span className='dd-ro-sub'>
                      {phase !== 'scan' || seen[UNKNOWN] ? (
                        <span className='dd-ro-flag'>1 unknown</span>
                      ) : (
                        `Wi-Fi ${wifi} · BT ${bluetooth}`
                      )}
                    </span>
                  </>
                ) : null}

                {item.id === 'closer' ? (
                  <>
                    <span className='dd-ro-value'>
                      {phase === 'scan' ? '––.––' : value.toFixed(2)}
                      <small>µT</small>
                    </span>
                    <span className='dd-ro-gauge' aria-hidden='true'>
                      <svg viewBox='0 0 60 34'>
                        <path d='M 6 30 A 24 24 0 0 1 54 30' />
                      </svg>
                      <i style={{ rotate: `${needle(phase === 'scan' ? 0 : value)}deg` }} />
                    </span>
                  </>
                ) : null}

                {item.id === 'relax' ? (
                  <>
                    <span className='dd-ro-value'>{phase === 'relax' ? 'checked' : '––'}</span>
                    <span className='dd-ro-sub'>{phase === 'relax' ? 'Wi-Fi · BT · µT' : 'after the sweep'}</span>
                  </>
                ) : null}

                {active && running ? (
                  <i key={cycle} className='dd-ro-bar' style={{ animationDuration: `${item.ms}ms` }} aria-hidden='true' />
                ) : null}
              </button>
            );
          })}
        </div>

        <p className='dd-scope-msg' aria-live='polite'>
          <span key={message}>{message}</span>
        </p>
      </div>

      <p className='dd-scope-note'>Example. What a scan shows depends on the place and the devices around you.</p>
    </div>
  );
}

/** The dial's tick ring with the rim and the green "checked" ring that closes around it. */
export function DialScale() {
  return (
    <svg className='dd-dial-scale' viewBox='0 0 400 400' aria-hidden='true'>
      {TICKS.map((deg) => (
        <line
          key={deg}
          x1={200}
          y1={deg % 30 === 0 ? 3 : 9}
          x2={200}
          y2={17}
          transform={`rotate(${deg} 200 200)`}
          className={deg % 90 === 0 ? 'is-major' : deg % 30 === 0 ? 'is-mid' : undefined}
        />
      ))}
      <circle className='dd-dial-rim' cx={200} cy={200} r={176} />
      <circle className='dd-dial-done' cx={200} cy={200} r={176} pathLength={100} />
    </svg>
  );
}
