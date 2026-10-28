import '@fontsource-variable/ibm-plex-sans/wdth.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useReveal } from '../../shared/motion';
import { ProgressiveBlur } from '../../shared/ProgressiveBlur';
import { describeOffer, initials, type LandingProps } from '../../shared/offer';
import { ApartmentPlan, TOTAL_AREA, counted, roomArea, useDrawProgress } from './ApartmentPlan';
import {
  APARTMENT,
  APP,
  HISTORY,
  NOTES,
  ROOM_3D,
  SCREENSHOTS,
  SHEETS,
  SPEC,
  USE_CASES,
  photo,
  type SheetId,
} from './content';
import { FloorPlan, ScanDemo } from './ScanDemo';
import './page.css';

/** Order of an element in the hero's entrance; the CSS turns it into a delay. */
const order = (i: number) => ({ '--i': i }) as CSSProperties;
const delay = (ms: number) => ({ '--reveal-delay': `${ms}ms` }) as CSSProperties;

const SHEET_ORDER = Object.keys(SHEETS) as SheetId[];

function Arrow() {
  return (
    <svg className='lid-arrow' viewBox='0 0 20 20' aria-hidden='true'>
      <path d='M2 10h15M11.5 4.5 17 10l-5.5 5.5' />
    </svg>
  );
}

/** The sheet border, drawn by one pen. */
function Frame() {
  return (
    <span className='lid-frame' aria-hidden='true'>
      <span className='lid-frame-t' />
      <span className='lid-frame-r' />
      <span className='lid-frame-b' />
      <span className='lid-frame-l' />
    </span>
  );
}

function CropMarks() {
  return (
    <>
      <span className='lid-crop lid-crop-tl' aria-hidden='true' />
      <span className='lid-crop lid-crop-tr' aria-hidden='true' />
      <span className='lid-crop lid-crop-bl' aria-hidden='true' />
      <span className='lid-crop lid-crop-br' aria-hidden='true' />
    </>
  );
}

/** Zone numbers along a sheet's top border, one per grid column. */
function Zones() {
  return (
    <ol className='lid-zones' aria-hidden='true'>
      {Array.from({ length: 12 }, (_, i) => (
        <li key={i}>{i + 1}</li>
      ))}
    </ol>
  );
}

/** Section heading: the sheet number and name in mono beside a plain sentence-case heading. */
function SheetHead({ sheet, id, title, lead }: { sheet: SheetId; id: string; title: string; lead?: string }) {
  const { no, name } = SHEETS[sheet];
  return (
    <div className='lid-head' data-reveal=''>
      <p className='lid-head-no'>
        <span>{no}</span>
        <small>{name}</small>
      </p>
      <div className='lid-head-main'>
        <h2 id={id} className='lid-h2'>
          {title}
        </h2>
        {lead ? <p className='lid-head-lead'>{lead}</p> : null}
      </div>
    </div>
  );
}

/** Detail callout: the detail number over the sheet it is drawn on. */
function Bubble({ n }: { n: number }) {
  return (
    <span className='lid-bubble' aria-hidden='true'>
      <b>{n}</b>
      <i>{SHEETS.tools.no}</i>
    </span>
  );
}

export function LidarRoomScannerPage({ offer, creator, onStart }: LandingProps) {
  const root = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);
  const heroCta = useRef<HTMLButtonElement>(null);
  const finalDrawing = useRef<HTMLDivElement>(null);
  const [showDock, setShowDock] = useState(false);
  const [headerStuck, setHeaderStuck] = useState(false);
  const [headerTone, setHeaderTone] = useState<'light' | 'dark'>('light');
  const [sheet, setSheet] = useState<SheetId>('scan');
  const terms = describeOffer(offer);
  const drawn = useDrawProgress(finalDrawing);
  const share = counted(drawn);

  useReveal(root);

  useEffect(() => {
    // The tint shows once content scrolls under the header (the creator ribbon scrolls away first),
    // turns dark with light text over sections marked data-header="dark", and the strip names the
    // sheet under it.
    const onScroll = () => {
      const box = header.current?.getBoundingClientRect();
      if (!box) return;
      setHeaderStuck(window.scrollY > 4 && box.top <= 0);
      const under = document.elementFromPoint(window.innerWidth / 2, box.bottom + 1);
      setHeaderTone(under?.closest('[data-header="dark"]') ? 'dark' : 'light');
      const id = under?.closest<HTMLElement>('[data-sheet]')?.dataset.sheet as SheetId | undefined;
      if (id && id in SHEETS) setSheet(id);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const target = heroCta.current;
    if (!target) return;
    // Only once the visitor has scrolled past the hero button, not while it is still below the fold.
    const observer = new IntersectionObserver(([entry]) =>
      setShowDock(!entry.isIntersecting && entry.boundingClientRect.top < 0),
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const price = terms.today ? (
    <p className='lid-price'>
      <strong>{terms.today}</strong> <s>{terms.regular}</s> <span>first payment</span>
    </p>
  ) : null;

  return (
    <div className='lid' ref={root}>
      <div className='lid-cols' aria-hidden='true'>
        <div className='lid-wrap' />
      </div>

      {creator && offer.discountPercent ? (
        <div className='lid-ribbon'>
          <div className='lid-wrap lid-ribbon-row'>
            {creator.avatarUrl ? (
              <img src={creator.avatarUrl} alt='' className='lid-avatar' />
            ) : (
              <span className='lid-avatar' aria-hidden='true'>
                {initials(creator.name)}
              </span>
            )}
            <p>
              <strong>{creator.name}</strong> picked this app for you
            </p>
            <span className='lid-ribbon-deal'>−{offer.discountPercent}% today</span>
          </div>
        </div>
      ) : null}

      <header ref={header} className='lid-header' data-stuck={headerStuck} data-tone={headerTone}>
        <div className='lid-header-backdrop' aria-hidden='true'>
          <ProgressiveBlur layers={6} maxBlur={18} />
          <div className='lid-header-tint lid-header-tint-light' />
          <div className='lid-header-tint lid-header-tint-dark' />
        </div>
        <div className='lid-wrap lid-header-row'>
          <a href='#top' className='lid-identity'>
            <img src={APP.iconUrl} alt='' width={28} height={28} />
            <strong>{APP.name}</strong>
          </a>
          <p className='lid-header-sheet' aria-hidden='true'>
            <b>{SHEETS[sheet].no}</b>
            <span>{SHEETS[sheet].name}</span>
            <small>
              {SHEET_ORDER.indexOf(sheet) + 1}/{SHEET_ORDER.length}
            </small>
          </p>
          <button type='button' className='lid-header-cta' onClick={onStart}>
            Start scanning
            <Arrow />
          </button>
        </div>
      </header>

      <main id='top'>
        {/* A-101: the scan demo is the drawing; headline and price sit in the title block. */}
        <section className='lid-hero' data-sheet='scan' aria-labelledby='lid-title'>
          <div className='lid-wrap'>
            <div className='lid-sheet lid-sheet-intro'>
              <Frame />
              <CropMarks />
              <Zones />
              <div className='lid-sheet-grid'>
                <div className='lid-sheet-drawing'>
                  <ScanDemo />
                </div>

                <div className='lid-sheet-side lid-notes lid-intro' style={order(4)}>
                  <p className='lid-cell-label'>General notes</p>
                  <ol>
                    {NOTES.map((note, i) => (
                      <li key={note}>
                        <span>{i + 1}.</span>
                        {note}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className='lid-titleblock'>
                  <h1 id='lid-title' className='lid-h1 lid-intro' style={order(0)}>
                    <span>Scan a room.</span> <span>Get the floor plan.</span>
                  </h1>
                  <p className='lid-lead lid-intro' style={order(1)}>
                    Walk your iPhone around the room. LiDAR measures the walls, and the app draws a floor plan you
                    can save and export as PDF or USDZ.
                  </p>
                  <div className='lid-offer lid-intro' style={order(2)}>
                    {price}
                    <button ref={heroCta} type='button' className='lid-cta lid-cta-block' onClick={onStart}>
                      Scan my first room
                      <Arrow />
                    </button>
                    <p className='lid-terms'>{terms.terms}</p>
                  </div>
                </div>

                <dl className='lid-tb-meta lid-intro' style={order(3)}>
                  <div>
                    <dt>Project</dt>
                    <dd>Your room</dd>
                  </div>
                  <div>
                    <dt>Units</dt>
                    <dd>ft · in</dd>
                  </div>
                  <div className='lid-tb-sheet'>
                    <dt>Sheet</dt>
                    <dd>{SHEETS.scan.no}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </section>

        {/* A-102: the tools as numbered details on one sheet */}
        <section className='lid-section' data-sheet='tools' aria-labelledby='lid-tools-title'>
          <div className='lid-wrap'>
            <SheetHead
              sheet='tools'
              id='lid-tools-title'
              title='Put the tape measure away.'
              lead='Whole rooms in 3D, single walls and doors in AR, and every result saved and ready to send.'
            />

            <div className='lid-details'>
              <article className='lid-detail lid-detail-room' data-reveal=''>
                <div className='lid-detail-media'>
                  <img src={ROOM_3D} alt='3D room layout with wall measurements, from the app' loading='lazy' />
                </div>
                <div className='lid-detail-cap'>
                  <Bubble n={1} />
                  <div>
                    <h3>Room Plan 3D: the whole room, in 3D.</h3>
                    <p>Scan a room into a 3D layout with accurate dimensions, then switch to the 2D floor plan.</p>
                  </div>
                </div>
              </article>

              <article className='lid-detail lid-detail-ruler' data-reveal='' style={delay(80)}>
                <div className='lid-detail-media'>
                  <svg
                    viewBox='150 140 600 400'
                    preserveAspectRatio='xMidYMid slice'
                    role='img'
                    aria-label='Example: a sofa measured with the AR ruler'
                  >
                    <image className='lid-cool' href={photo('livingRoom', 900, 600)} width='900' height='600' />
                    <g className='lid-mark'>
                      <line x1='236' y1='360' x2='668' y2='360' />
                      <line x1='236' y1='338' x2='236' y2='382' />
                      <line x1='668' y1='338' x2='668' y2='382' />
                      <line x1='226' y1='370' x2='246' y2='350' />
                      <line x1='658' y1='370' x2='678' y2='350' />
                      <rect x='402' y='338' width='100' height='44' />
                      <text x='452' y='369'>7'4"</text>
                    </g>
                  </svg>
                </div>
                <div className='lid-detail-cap'>
                  <Bubble n={2} />
                  <div>
                    <h3>A ruler in your phone.</h3>
                    <p>Measure distances in AR: tap one end, tap the other, read the length.</p>
                  </div>
                </div>
              </article>

              <article className='lid-detail lid-detail-area' data-reveal='' style={delay(160)}>
                <div className='lid-detail-media'>
                  <svg
                    viewBox='166 206 292 219'
                    preserveAspectRatio='xMidYMid slice'
                    role='img'
                    aria-label='Example: a door measured with Area'
                  >
                    <image className='lid-cool' href={photo('doorRoom', 900, 600)} width='900' height='600' />
                    <g className='lid-mark lid-mark-area'>
                      <polygon points='281,235 343,235 343,382 281,382' />
                      <rect className='lid-mark-corner' x='278' y='232' width='6' height='6' />
                      <rect className='lid-mark-corner' x='340' y='232' width='6' height='6' />
                      <rect className='lid-mark-corner' x='340' y='379' width='6' height='6' />
                      <rect className='lid-mark-corner' x='278' y='379' width='6' height='6' />
                      <rect x='274' y='296' width='76' height='24' />
                      <text x='312' y='312'>17.8 ft²</text>
                    </g>
                  </svg>
                  <span className='lid-mini-seg' aria-hidden='true'>
                    <span>Segment</span>
                    <span className='is-on'>Area</span>
                  </span>
                </div>
                <div className='lid-detail-cap'>
                  <Bubble n={3} />
                  <div>
                    <h3>Area in one touch.</h3>
                    <p>Outline a wall, a floor or a door and get its surface area.</p>
                  </div>
                </div>
              </article>

              <article className='lid-detail lid-detail-export' data-reveal='' style={delay(80)}>
                <div className='lid-detail-media lid-files'>
                  <span className='lid-file'>
                    <span className='lid-file-sheet'>
                      <FloorPlan className='lid-plan-mini' />
                    </span>
                    <span className='lid-file-name'>Living room.pdf</span>
                  </span>
                  <span className='lid-file'>
                    <span className='lid-file-sheet'>
                      <svg viewBox='0 0 120 100' className='lid-cube' aria-hidden='true'>
                        <path d='M60 12 L100 32 L100 72 L60 92 L20 72 L20 32 Z' />
                        <path d='M20 32 L60 52 L100 32 M60 52 L60 92' />
                      </svg>
                    </span>
                    <span className='lid-file-name'>Living room.usdz</span>
                  </span>
                </div>
                <div className='lid-detail-cap'>
                  <Bubble n={4} />
                  <div>
                    <h3>PDF or USDZ.</h3>
                    <p>Send the plan to a contractor, a landlord or yourself.</p>
                  </div>
                </div>
              </article>

              <article className='lid-detail lid-detail-history' data-reveal='' style={delay(160)}>
                <div className='lid-detail-media lid-history'>
                  <ul aria-label='Example measurement history'>
                    {HISTORY.map((item) => (
                      <li key={item.name}>
                        <span className='lid-history-thumb' aria-hidden='true' />
                        <span>
                          <strong>{item.name}</strong>
                          <small>{item.meta}</small>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className='lid-detail-cap'>
                  <Bubble n={5} />
                  <div>
                    <h3>Every scan, kept.</h3>
                    <p>Open and manage your saved scans in Measurement History.</p>
                  </div>
                </div>
              </article>

              <article className='lid-detail lid-detail-ai' data-reveal=''>
                <div className='lid-detail-media'>
                  <img className='lid-cool' src={photo('archedRoom', 900, 600)} alt='' loading='lazy' />
                  <span className='lid-mini-seg lid-mini-seg-top' aria-hidden='true'>
                    <span>Before</span>
                    <span className='is-on'>After</span>
                  </span>
                </div>
                <div className='lid-detail-cap'>
                  <Bubble n={6} />
                  <div>
                    <h3>New: AI Design. Try a new look first.</h3>
                    <p>
                      Start with a photo of your room, explore interior styles, change walls and floors, add or
                      remove objects. Compare before and after.
                    </p>
                  </div>
                </div>
              </article>
            </div>
            <p className='lid-note'>Measurements in the pictures are examples.</p>
          </div>
        </section>

        {/* A-103: how it works, on the one blueprint sheet */}
        <section className='lid-section lid-seq' data-header='dark' data-sheet='sequence' aria-labelledby='lid-seq-title'>
          <div className='lid-cols lid-cols-light' aria-hidden='true'>
            <div className='lid-wrap' />
          </div>
          <div className='lid-wrap'>
            <SheetHead sheet='sequence' id='lid-seq-title' title='Three moves to a floor plan.' />
            <div className='lid-chain' data-reveal='' aria-hidden='true'>
              {['Open', 'Walk', 'Save'].map((label, n) => (
                <span key={label} className='lid-chain-seg' style={{ '--n': n } as CSSProperties}>
                  <em>{label}</em>
                  {n === 2 ? <i /> : null}
                </span>
              ))}
            </div>
            <ol className='lid-steps'>
              <li data-reveal='' style={delay(0)}>
                <svg className='lid-step-art' viewBox='0 0 240 160' aria-hidden='true'>
                  <rect x='82' y='10' width='76' height='140' rx='12' />
                  <path className='lid-sd' d='M98 34 L120 42 L142 32 M120 42 L120 104 M98 116 L120 104 L142 118' pathLength={1} />
                  <line className='lid-step-beam' x1='90' y1='70' x2='150' y2='70' />
                </svg>
                <span className='lid-step-no'>01</span>
                <h3>Open Room Plan 3D</h3>
                <p>Point your iPhone or iPad at a wall of the room you want to scan.</p>
              </li>
              <li data-reveal='' style={delay(140)}>
                <svg className='lid-step-art' viewBox='0 0 240 160' aria-hidden='true'>
                  <rect className='lid-step-ghost' x='40' y='18' width='160' height='124' />
                  <path className='lid-sd' d='M40 142 V18 H200 V96' pathLength={1} />
                  <path
                    className='lid-sd lid-step-walk'
                    d='M84 118 C 70 80, 100 50, 140 54 S 176 92, 160 112'
                    pathLength={1}
                  />
                  <circle className='lid-step-phone' cx='160' cy='112' r='5' />
                </svg>
                <span className='lid-step-no'>02</span>
                <h3>Walk around the room</h3>
                <p>LiDAR maps the walls and measures them as you go.</p>
              </li>
              <li data-reveal='' style={delay(280)}>
                <svg className='lid-step-art' viewBox='0 0 240 160' aria-hidden='true'>
                  <rect className='lid-step-paper' x='62' y='8' width='116' height='144' />
                  <path className='lid-sd' d='M82 44 V128 H158 V44 Z' pathLength={1} />
                  <path className='lid-step-dim' d='M82 30 H158 M82 25 V35 M158 25 V35' />
                  <rect className='lid-step-tag' x='98' y='78' width='44' height='16' />
                </svg>
                <span className='lid-step-no'>03</span>
                <h3>Save, then export</h3>
                <p>Get the plan with wall lengths, area and room height. Keep it, or export a PDF or USDZ.</p>
              </li>
            </ol>
          </div>
        </section>

        {/* A-104: use cases as numbered photo plates */}
        <section className='lid-section' data-sheet='uses' aria-labelledby='lid-uses-title'>
          <div className='lid-wrap'>
            <SheetHead
              sheet='uses'
              id='lid-uses-title'
              title='Measure first. Then buy, build, move.'
              lead='For renovation, furnishing, interior planning, home projects and quick surveys.'
            />
            <div className='lid-plates'>
              {[0, 1].map((column) => (
                <div key={column} className='lid-plates-col'>
                  {USE_CASES.map((item, i) =>
                    i % 2 === column ? (
                      <div
                        key={item.title}
                        className='lid-plate-cell'
                        data-reveal=''
                        style={{ order: i, ...delay(column * 120) }}
                      >
                        <button type='button' className='lid-plate' onClick={onStart}>
                          <span className='lid-dim' aria-hidden='true'>
                            {item.tag}
                          </span>
                          <span className='lid-plate-media'>
                            <img src={photo(item.photo, 960, 720)} alt='' loading='lazy' />
                            <span className='lid-plate-go' aria-hidden='true'>
                              <Arrow />
                            </span>
                          </span>
                          <span className='lid-plate-fig'>
                            Fig. {i + 2} — {item.fig}
                          </span>
                          <span className='lid-plate-title'>{item.title}</span>
                          <span className='lid-plate-text'>{item.text}</span>
                        </button>
                      </div>
                    ) : null,
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* A-105: the App Store screenshots */}
        <section className='lid-section' data-sheet='screens' aria-labelledby='lid-shots-title'>
          <div className='lid-wrap'>
            <SheetHead
              sheet='screens'
              id='lid-shots-title'
              title='Straight from the App Store.'
              lead='3D rooms, the AR ruler, floor plans and area, as they look on your iPhone.'
            />
            <div className='lid-screens' tabIndex={0} aria-label='App screenshots'>
              {SCREENSHOTS.map((item, i) => (
                <figure key={item.url} className='lid-screen' data-reveal='' style={delay(i * 90)}>
                  <span className='lid-screen-frame'>
                    <CropMarks />
                    <img
                      src={item.url}
                      alt={`${APP.name} screenshot: ${item.caption}`}
                      loading='lazy'
                      width={300}
                      height={649}
                    />
                  </span>
                  <figcaption>
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    {item.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* A-106: the FAQ as a numbered specification */}
        <section className='lid-section' data-sheet='spec' aria-labelledby='lid-spec-title'>
          <div className='lid-wrap'>
            <SheetHead sheet='spec' id='lid-spec-title' title='Before your first scan.' />
            <div className='lid-spec'>
              {SPEC.map((group, g) => (
                <div key={group.title} className='lid-spec-group' data-reveal=''>
                  <h3 className='lid-spec-title'>
                    <span>{g + 1}</span>
                    <span>{group.title}</span>
                  </h3>
                  <dl>
                    {group.items.map((item, i) => (
                      <div key={item.question} className='lid-spec-item'>
                        <dt>
                          <span className='lid-spec-no'>
                            {g + 1}.{i + 1}
                          </span>
                          <span className='lid-spec-q'>{item.question}</span>
                        </dt>
                        <dd>{item.answer}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* A-107: the whole floor plan; the call sits in its title block */}
        <section className='lid-section lid-final' data-sheet='plan' aria-labelledby='lid-final-title'>
          <div className='lid-wrap'>
            <div className='lid-sheet lid-sheet-reveal' data-reveal=''>
              <Frame />
              <CropMarks />
              <Zones />
              <div className='lid-sheet-grid'>
                <div className='lid-sheet-drawing' ref={finalDrawing}>
                  <p className='lid-fig'>
                    <span>Fig. 6</span> Example plan, four rooms
                  </p>
                  <ApartmentPlan progress={drawn} />
                </div>

                <div className='lid-sheet-side'>
                  <p className='lid-cell-label'>Room schedule, example</p>
                  <table className='lid-rooms'>
                    <thead>
                      <tr>
                        <th scope='col'>No.</th>
                        <th scope='col'>Room</th>
                        <th scope='col'>Area</th>
                      </tr>
                    </thead>
                    <tbody>
                      {APARTMENT.map((room) => (
                        <tr key={room.no}>
                          <td>{room.no}</td>
                          <td>{room.name}</td>
                          <td>{(roomArea(room.widthIn, room.lengthIn) * share).toFixed(1)} ft²</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td />
                        <td>Total</td>
                        <td>
                          <span className='lid-rooms-total'>{(TOTAL_AREA * share).toFixed(1)} ft²</span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className='lid-titleblock'>
                  <h2 id='lid-final-title' className='lid-h1'>
                    Your floor plan is one scan away.
                  </h2>
                  <p className='lid-lead'>Measure it once. Keep the plan.</p>
                  <div className='lid-offer'>
                    {price}
                    <button type='button' className='lid-cta lid-cta-block' onClick={onStart}>
                      Scan my first room
                      <Arrow />
                    </button>
                    <p className='lid-terms'>{terms.terms}</p>
                  </div>
                </div>

                <dl className='lid-tb-meta'>
                  <div>
                    <dt>Project</dt>
                    <dd>Your home</dd>
                  </div>
                  <div>
                    <dt>Units</dt>
                    <dd>ft · in</dd>
                  </div>
                  <div className='lid-tb-sheet'>
                    <dt>Sheet</dt>
                    <dd>{SHEETS.plan.no}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className='lid-footer' data-sheet='plan'>
        <div className='lid-wrap'>
          <div className='lid-footer-row'>
            <p>
              {APP.fullName} is developed by {APP.legalName} 3D scanning needs a device with a LiDAR sensor.
              Payment details are processed securely by our payment provider. Photos: Unsplash.
            </p>
            <nav aria-label='Legal'>
              <a href={APP.privacyUrl} target='_blank' rel='noopener noreferrer'>
                Privacy Policy
              </a>
              <a href={APP.termsUrl} target='_blank' rel='noopener noreferrer'>
                Terms of Use
              </a>
            </nav>
          </div>
        </div>
      </footer>

      <div className={showDock ? 'lid-dock is-visible' : 'lid-dock'} aria-hidden={!showDock}>
        <img src={APP.iconUrl} alt='' width={36} height={36} />
        <span className='lid-dock-text'>
          <strong>{terms.today ?? terms.regular}</strong>
          <small>{terms.today ? `then ${terms.regular}` : 'Cancel anytime'}</small>
        </span>
        <button type='button' className='lid-cta lid-cta-small' onClick={onStart} tabIndex={showDock ? 0 : -1}>
          Start scanning
          <Arrow />
        </button>
      </div>
    </div>
  );
}
