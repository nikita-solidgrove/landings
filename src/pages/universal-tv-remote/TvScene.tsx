import type { SceneId } from './content';

/**
 * The "programs" on the demo TV: flat poster illustrations drawn in CSS and sized in container
 * units, so the same scene works full screen and as a small tile.
 */
export function TvScene({ id }: { id: SceneId }) {
  switch (id) {
    case 'coast':
      return (
        <div className='tvr-scene tvr-scene-coast' aria-hidden='true'>
          <i className='tvr-sc-sun' />
          <i className='tvr-sc-sea'>
            <b />
            <b />
            <b />
            <b />
          </i>
          <i className='tvr-sc-glint' />
          <i className='tvr-sc-boat' />
        </div>
      );
    case 'city':
      return (
        <div className='tvr-scene tvr-scene-city' aria-hidden='true'>
          <i className='tvr-sc-moon' />
          <i className='tvr-sc-tower' />
          <span className='tvr-sc-skyline'>
            <b />
            <b />
            <b />
            <b />
            <b />
            <b />
          </span>
          <i className='tvr-sc-road' />
        </div>
      );
    case 'match':
      return (
        <div className='tvr-scene tvr-scene-match' aria-hidden='true'>
          <i className='tvr-sc-lines' />
          <i className='tvr-sc-circle' />
          <i className='tvr-sc-box tvr-sc-box-l' />
          <i className='tvr-sc-box tvr-sc-box-r' />
          <i className='tvr-sc-ball' />
          <span className='tvr-sc-score'>
            HOM <b>1–0</b> AWY
          </span>
        </div>
      );
    case 'peaks':
      return (
        <div className='tvr-scene tvr-scene-peaks' aria-hidden='true'>
          <i className='tvr-sc-cloud' />
          <i className='tvr-sc-cloud tvr-sc-cloud-2' />
          <span className='tvr-sc-range'>
            <b />
            <b />
            <b />
          </span>
          <i className='tvr-sc-lake' />
          <span className='tvr-sc-range tvr-sc-mirror'>
            <b />
            <b />
            <b />
          </span>
        </div>
      );
  }
}
