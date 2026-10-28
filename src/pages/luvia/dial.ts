import { useSyncExternalStore } from 'react';

/*
 * Every dial on the page reads the day the same way: noon at the top, midnight at the bottom,
 * sunrise on the left and sunset on the right, so the upper half is day and the lower half night.
 */

/** Angle in radians (SVG space, y down) of a minute of the day. */
const angleOf = (minute: number) => (minute / 1440) * Math.PI * 2 + Math.PI / 2;

export function polar(center: number, minute: number, r: number): [number, number] {
  const angle = angleOf(minute);
  return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
}

/** Clockwise arc from `start` to `end` (minutes; an end before the start wraps past midnight). */
export function arcPath(center: number, start: number, end: number, r: number) {
  const length = (end - start + 1440) % 1440 || 1440;
  const [x1, y1] = polar(center, start, r);
  const [x2, y2] = polar(center, start + length - 0.01, r);
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${length > 720 ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

/** CSS rotation (degrees clockwise from the top) that points at a minute of the day. */
export const turnOf = (minute: number) => ((minute - 720) / 1440) * 360;

export const hhmm = (minute: number) => {
  const m = ((Math.round(minute) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

export const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
};

const hm = (h: number, m = 0) => h * 60 + m;

/** The sky around the dial, in flat steps that match the page's section colors. */
export const SKY: { from: number; to: number; tone: 'night' | 'twilight' | 'coral' | 'apricot' | 'honey' }[] = [
  { from: hm(19, 30), to: hm(4, 30), tone: 'night' },
  { from: hm(4, 30), to: hm(5, 30), tone: 'twilight' },
  { from: hm(5, 30), to: hm(6, 30), tone: 'coral' },
  { from: hm(6, 30), to: hm(8), tone: 'apricot' },
  { from: hm(8), to: hm(16), tone: 'honey' },
  { from: hm(16), to: hm(17, 30), tone: 'apricot' },
  { from: hm(17, 30), to: hm(18, 30), tone: 'coral' },
  { from: hm(18, 30), to: hm(19, 30), tone: 'twilight' },
];

/** A few stars inside the night part of a band: minute of the day and offset from the band's middle. */
export const STARS: [number, number][] = [
  [hm(20, 20), -6],
  [hm(21, 10), 7],
  [hm(22, 5), -3],
  [hm(23, 15), 8],
  [hm(0, 5), -7],
  [hm(0, 55), 4],
  [hm(1, 50), -5],
  [hm(2, 45), 7],
  [hm(3, 40), -2],
];

/*
 * The page clock: the page is one day, so scrolling moves time forward. Sections carry a
 * `data-time`; the page sets the clock from the scroll position and the dials read it.
 */
let current = hm(6);
const listeners = new Set<() => void>();

export const dayClock = {
  get: () => current,
  set(minute: number) {
    if (minute === current) return;
    current = minute;
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export const useDayClock = () => useSyncExternalStore(dayClock.subscribe, dayClock.get, dayClock.get);
