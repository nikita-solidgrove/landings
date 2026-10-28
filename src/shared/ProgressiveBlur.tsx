import type { CSSProperties } from 'react';
import './progressive-blur.css';

type Props = {
  /** Number of stacked blur layers. More layers give a smoother falloff. */
  layers?: number;
  /** Blur radius (px) of the strongest layer, at the solid edge. */
  maxBlur?: number;
  /** Edge where the blur is strongest. */
  edge?: 'top' | 'bottom';
  className?: string;
};

/**
 * Blur that fades out gradually instead of ending at a hard line (the aiby.com header).
 *
 * Stacks `layers` backdrop-filter layers with doubling blur radii. Each layer is masked to a band
 * that starts further toward the solid edge, so the strongest blur only shows right at the edge
 * and the weakest one reaches furthest out. No ancestor may set filter, opacity < 1, mask or
 * backdrop-filter, or the layers only see that ancestor instead of the page behind it.
 */
export function ProgressiveBlur({ layers = 6, maxBlur = 16, edge = 'top', className }: Props) {
  const direction = edge === 'top' ? 'to top' : 'to bottom';
  const step = 100 / layers;

  return (
    <div className={['progressive-blur', className].filter(Boolean).join(' ')} aria-hidden='true'>
      {Array.from({ length: layers }, (_, i) => {
        const blur = maxBlur / 2 ** (layers - 1 - i);
        const start = i * step;
        const mask = `linear-gradient(${direction}, transparent ${start}%, #000 ${start + step}%)`;
        const style: CSSProperties = {
          zIndex: i + 1,
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
          maskImage: mask,
          WebkitMaskImage: mask,
        };
        return <div key={i} className='progressive-blur-layer' style={style} />;
      })}
    </div>
  );
}
