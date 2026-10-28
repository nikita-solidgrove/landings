import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Check, ImageIcon, Info, X, ZapOff, TriangleAlert, Plus } from 'lucide-react';
import { prefersReducedMotion } from '../../shared/motion';
import { APP, SCENES, SPOTTED_LEAF, SPOTTED_THUMB, photo, type Scene } from './content';
import { CareIcon } from './CareIcon';

type Phase = 'aim' | 'lock' | 'scan' | 'named' | 'result';

const NEXT: Record<Phase, { next: Phase | null; ms: number }> = {
  aim: { next: 'lock', ms: 1100 },
  lock: { next: 'scan', ms: 650 },
  scan: { next: 'named', ms: 1500 },
  named: { next: 'result', ms: 1300 },
  result: { next: null, ms: 5600 },
};

/** Total time of one scene, for the progress bar under its thumbnail. */
const SCENE_MS = Object.values(NEXT).reduce((sum, step) => sum + step.ms, 0);

/** Where the twine sags above each of the three tags (px from the top of the row). */
const TWINE_Y = [8, 13, 8];

/** Where the brackets wait before they lock on: [left, top, width, height] in %. */
const AIM: Scene['target'] = [12, 14, 76, 62];

function SceneMedia({ scene, className }: { scene: Scene; className: string }) {
  if (scene.id === 'leaf') return <div className={className} style={SPOTTED_LEAF} />;
  return <img className={className} src={scene.id === 'fig' ? photo('fig', 640, 800) : photo('clover', 640, 800, [0.62, 0.62])} alt='' />;
}

function SceneThumb({ scene }: { scene: Scene }) {
  if (scene.id === 'leaf') return <span className='pid-thumb' style={SPOTTED_THUMB} />;
  const src = scene.id === 'fig' ? photo('fig', 120, 120, [0.4, 0.4]) : photo('clover', 120, 120, [0.62, 0.62]);
  return <img className='pid-thumb' src={src} alt='' />;
}

/**
 * The app's camera as a looping example: brackets find the plant and lock on, the plant gets its
 * name, then a result sheet slides up with what the app gives you (care plan, info or a fix).
 */
export function PlantScanner() {
  const reduced = prefersReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>(reduced ? 'result' : 'aim');
  const [visible, setVisible] = useState(true);
  const scene = SCENES[index];

  useEffect(() => {
    // Pause while the demo is off screen, so it starts where the visitor can see it.
    const element = box.current;
    if (!element || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !visible) return;
    const step = NEXT[phase];
    const timer = window.setTimeout(() => {
      if (step.next) setPhase(step.next);
      else {
        setIndex((index + 1) % SCENES.length);
        setPhase('aim');
      }
    }, step.ms);
    return () => window.clearTimeout(timer);
  }, [phase, index, reduced, visible]);

  function select(next: number) {
    setIndex(next);
    setPhase(reduced ? 'result' : 'aim');
  }

  const [x, y, w, h] = phase === 'aim' ? AIM : scene.target;
  const frame = { '--x': `${x}%`, '--y': `${y}%`, '--w': `${w}%`, '--h': `${h}%` } as CSSProperties;
  // Once the sheet is up, the photo zooms around the plant and lifts it to the top quarter, scaled
  // enough that it still reaches the bottom edge.
  const [tx, ty, tw, th] = scene.target;
  const [cx, cy] = scene.zoom ?? [tx + tw / 2, ty + th / 2];
  const zoom = {
    '--zo': `${cx}% ${cy}%`,
    '--zs': Math.max(1.25, 78 / (100 - cy)).toFixed(3),
    '--zt': `${24 - cy}%`,
  } as CSSProperties;
  const diagnose = scene.mode === 'Diagnose';
  const status =
    phase === 'aim' ? 'Hold steady' : diagnose ? 'Checking leaf health…' : 'Identifying your plant…';

  return (
    <div className='pid-scanner' ref={box}>
      <div
        className='pid-vf'
        data-phase={phase}
        data-mode={scene.mode}
        aria-label={`Example: the app ${diagnose ? 'checks a spotted leaf' : `identifies ${scene.name}`}`}
        role='img'
      >
        <div className='pid-vf-media' style={zoom} aria-hidden='true'>
          {SCENES.map((item, i) => (
            <SceneMedia key={item.id} scene={item} className={i === index ? 'pid-vf-photo is-active' : 'pid-vf-photo'} />
          ))}
        </div>

        <div className='pid-vf-top' aria-hidden='true'>
          <span className='pid-vf-round'><ZapOff size={17} /></span>
          <span className='pid-seg' data-mode={scene.mode}>
            <span>Identify</span>
            <span>Diagnose</span>
          </span>
          <span className='pid-vf-round'><X size={18} /></span>
        </div>

        <div className='pid-brackets' style={frame} aria-hidden='true'>
          <i /><i /><i /><i />
          <span className='pid-sweep' />
        </div>

        <div className='pid-status' aria-hidden='true'>
          <span className='pid-status-dot' />
          {status}
        </div>

        <div key={`chip-${index}`} className={diagnose ? 'pid-chip is-alert' : 'pid-chip'} style={frame} aria-hidden='true'>
          <SceneThumb scene={scene} />
          <span>
            <strong>
              {diagnose ? <TriangleAlert size={15} strokeWidth={2.6} /> : null}
              {scene.name}
            </strong>
            <small>{scene.latin}</small>
          </span>
        </div>

        <div className='pid-vf-controls' aria-hidden='true'>
          <span className='pid-vf-round'><ImageIcon size={18} /></span>
          <span className='pid-shutter' />
          <span className='pid-vf-round'><Info size={18} /></span>
        </div>

        <div key={`sheet-${index}`} className='pid-sheet'>
          <span className='pid-sheet-handle' aria-hidden='true' />
          <div className='pid-sheet-head'>
            <SceneThumb scene={scene} />
            <span className='pid-sheet-name'>
              <strong className={diagnose ? 'is-alert' : undefined}>{diagnose ? `${scene.name}: ${scene.latin}` : scene.name}</strong>
              <small>{diagnose ? 'Care recommendations' : scene.latin}</small>
            </span>
          </div>
          <div className='pid-sheet-title'>
            <span>{scene.sheetTitle}</span>
            <span className={scene.toast ? 'pid-sheet-action is-on' : 'pid-sheet-action'}>
              {scene.toast ? <Check size={13} strokeWidth={3} /> : <Plus size={13} strokeWidth={3} />}
              {scene.action}
            </span>
          </div>
          <ul className='pid-sheet-rows'>
            {scene.rows.map((row, i) => (
              <li key={row.value} style={{ '--i': i } as CSSProperties}>
                <CareIcon tone={row.tone} size={15} />
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </li>
            ))}
          </ul>
        </div>

        {scene.toast && phase === 'result' ? (
          <div key={`toast-${index}`} className='pid-toast' aria-hidden='true'>
            <img src={APP.iconUrl} alt='' />
            <span>
              <small>
                <b>{APP.name}</b>
                <em>now</em>
              </small>
              <strong>{scene.toast.title}</strong>
              <span>{scene.toast.text}</span>
            </span>
          </div>
        ) : null}
      </div>

      <div className='pid-snaps' role='group' aria-label='Example snaps'>
        <svg className='pid-twine' viewBox='0 0 100 24' preserveAspectRatio='none' aria-hidden='true'>
          <path d='M0 3Q50 23 100 3' />
        </svg>
        {SCENES.map((item, i) => (
          <button
            key={item.id}
            type='button'
            className='pid-snap'
            aria-pressed={i === index}
            onClick={() => select(i)}
            style={{ '--ty': `${TWINE_Y[i]}px`, '--n': i } as CSSProperties}
          >
            <span className='pid-snap-tag'>
              <SceneThumb scene={item} />
              <strong>{item.label}</strong>
              <small>{item.mode}</small>
              {i === index && !reduced ? (
                <span
                  key={index}
                  className='pid-snap-progress'
                  style={{ '--scene-ms': `${SCENE_MS}ms`, animationPlayState: visible ? 'running' : 'paused' } as CSSProperties}
                />
              ) : null}
            </span>
          </button>
        ))}
      </div>
      <p className='pid-demo-note'>Example snaps. Names, care values and fixes depend on your plant.</p>
    </div>
  );
}
