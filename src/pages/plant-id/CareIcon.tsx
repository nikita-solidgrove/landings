import { Droplet, Leaf, RotateCw, SprayCan, Sprout, Sun, TriangleAlert } from 'lucide-react';
import type { CareTone } from './content';

const ICONS = {
  water: Droplet,
  mist: SprayCan,
  rotate: RotateCw,
  feed: Sprout,
  light: Sun,
  info: Leaf,
  alert: TriangleAlert,
} as const;

/** A care action in the app's colors (blue water, purple mist, orange rotate, pink fertilize). */
export function CareIcon({ tone, size = 16 }: { tone: CareTone; size?: number }) {
  const Icon = ICONS[tone];
  return (
    <span className={`pid-care pid-care-${tone}`} aria-hidden='true'>
      <Icon size={size} strokeWidth={2.4} />
    </span>
  );
}
