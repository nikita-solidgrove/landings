import type { CSSProperties } from 'react';
import { SIDES, coinSrc, type SideName } from './content';

/** Two crop sizes only, so the same coin is fetched once for every small spot and once for every large one. */
const tier = (size: number) => (size <= 200 ? 200 : 640);

/** A real coin cut out of a photo and turned upright. */
export function CoinFace({ side, size = 640, className }: { side: SideName; size?: number; className?: string }) {
  return (
    <span className={['coin-face', className].filter(Boolean).join(' ')}>
      <img src={coinSrc(side, tier(size))} alt='' style={{ '--turn': `${SIDES[side].turn}deg` } as CSSProperties} />
    </span>
  );
}
