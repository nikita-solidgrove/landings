import type { CSSProperties, ReactNode } from 'react';
import { FACES, groupUrl, isGroupShot, photo, type Box, type Focus, type Shot } from './content';

const GROUP_ASPECT = 16 / 9;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Where the whole group photo sits inside a frame of `aspect` (width / height) so that `focus` is
 * as close to the center as the zoom allows without showing an edge. Face boxes are in percent of
 * the whole photo, so anything placed inside this box lines up with the faces.
 */
export function canvasBox(aspect: number, focus: Focus): CSSProperties {
  const frameH = 1 / aspect;
  let w = GROUP_ASPECT > aspect ? frameH * GROUP_ASPECT : 1;
  let h = GROUP_ASPECT > aspect ? frameH : 1 / GROUP_ASPECT;
  w *= focus.z;
  h *= focus.z;
  const x = clamp(0.5 - focus.x * w, 1 - w, 0);
  const y = clamp(frameH / 2 - focus.y * h, frameH - h, 0);
  return { left: `${x * 100}%`, top: `${(y / frameH) * 100}%`, width: `${w * 100}%`, height: `${(h / frameH) * 100}%` };
}

export const faceClip = (box: Box) =>
  `inset(${box.y}% ${100 - box.x - box.w}% ${100 - box.y - box.h}% ${box.x}% round 3px)`;

export const boxStyle = (box: Box): CSSProperties => ({
  left: `${box.x}%`,
  top: `${box.y}%`,
  width: `${box.w}%`,
  height: `${box.h}%`,
});

type Props = {
  shot: Shot;
  /** Frame width / height; 35 mm frames are 3:2. */
  aspect?: number;
  /** Pixel width requested from the CDN for single photos. */
  width?: number;
  lazy?: boolean;
  /** Drawn on top of a group shot, in the photo's own coordinates (e.g. a face box). */
  children?: ReactNode;
};

/** A black-and-white exposure; in a group shot the matched person's face stays in color. */
export function ShotImage({ shot, aspect = 1.5, width = 360, lazy, children }: Props) {
  const loading = lazy ? 'lazy' : undefined;

  if (isGroupShot(shot.photo)) {
    const focus = typeof shot.focus === 'object' ? shot.focus : { x: 0.5, y: 0.5, z: 1 };
    const src = groupUrl(shot.photo);
    const face = shot.match ? FACES[shot.photo][shot.match] : null;
    return (
      <span className='fmp-shot'>
        <span className='fmp-canvas' style={canvasBox(aspect, focus)}>
          <img className='fmp-shot-gray' src={src} alt='' loading={loading} decoding='async' />
          {face ? (
            <img className='fmp-shot-face' src={src} alt='' loading={loading} decoding='async' style={{ clipPath: faceClip(face) }} />
          ) : null}
          {children}
        </span>
      </span>
    );
  }

  const src = photo(shot.photo, width, Math.round(width / aspect), shot.focus);
  return (
    <span className='fmp-shot' data-vary={shot.vary ? '' : undefined}>
      <img className='fmp-shot-gray' src={src} alt='' loading={loading} decoding='async' />
    </span>
  );
}
