// Facts come from the App Store listing (see creatives/apps/findmypix/NOTES.md).
// Search results in the demo are illustrations and are labelled "Example" on the page.

export const APP = {
  name: 'FindMyPix',
  fullName: 'FindMyPix: Find You on the Web',
  developer: 'PaoApps',
  legalName: 'PAO APPS PTE. LTD.',
  iconUrl:
    'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/48/8b/6a/488b6ab1-392f-7772-81da-521d8a055aef/AppIcon-0-0-1x_U007ephone-0-1-0-85-220.jpeg/256x256bb.webp',
  privacyUrl: 'https://www.getpaoapps.com/privacy',
  termsUrl: 'https://www.getpaoapps.com/terms',
};

const shot = (path: string) => `https://is1-ssl.mzstatic.com/image/thumb/${path}/600x0w.webp`;

/** The App Store screenshots, in the order of a search: photo → analysis → matches → source. */
export const SCREENS = {
  photo: shot('PurpleSource211/v4/84/ff/c7/84ffc777-4701-b15d-ce21-174a541a31f6/EN-15Pro-2.png'),
  analyzing: shot('PurpleSource211/v4/fc/9e/01/fc9e01e3-0f35-7953-f5f0-1d1d837351a6/EN-15Pro-3.png'),
  matches: shot('PurpleSource211/v4/eb/41/e3/eb41e343-7e28-9fe4-ed1c-1e72220a3c31/EN-15Pro-1.png'),
  source: shot('PurpleSource221/v4/9f/96/e6/9f96e600-de40-9456-9bd9-094d39b1d05b/EN-15Pro-4.png'),
};

// Free Unsplash photos (Unsplash License), cropped by the CDN to the size each spot needs.
const PHOTO_IDS = {
  // Two shots of the same group of friends: the demo finds each face in both.
  park: '1758275557354-00904e39c6da',
  parkTwo: '1758275557315-2685e63fa8d2',
  friendsWave: '1752650143737-71844bd21c83',
  portraitLaugh: '1623717217554-72ca676de535',
  laptopCafe: '1503945438517-f65904a52ce6',
  closeSmile: '1567516364473-233c4b6fcfbe',
  monoSmile: '1562337404-3044c84ac061',
  studioMan: '1592234789031-94bf65f630ed',
  grin: '1790575169445-16361a80bfb3',
  outdoorMan: '1758874383973-83166565759c',
  peace: '1758613171720-74768b04e2a1',
  photographer: '1653851794739-5f4eab419938',
  selfieGroup: '1559026432-016825fa59df',
  crowd: '1663162550974-aaf76bcdeedf',
  trio: '1638727894670-17ff3b7eff9d',
  rooftop: '1758272133719-959319bc2364',
  nightCamera: '1551780165-f2a8e6d86eb8',
  cameraBack: '1740265556009-796449091cf8',
};

export type PhotoName = keyof typeof PHOTO_IDS;

/** Point of a photo the crop centers on (0–1) and how far it zooms in. */
export type Focus = { x: number; y: number; z: number };

export function photo(name: PhotoName, width: number, height = width, focus?: Focus | 'faces') {
  const base = `https://images.unsplash.com/photo-${PHOTO_IDS[name]}?w=${width}&h=${height}&fit=crop&auto=format&q=72`;
  if (!focus) return base;
  if (focus === 'faces') return `${base}&crop=faces&facepad=2`;
  return `${base}&crop=focalpoint&fp-x=${focus.x}&fp-y=${focus.y}&fp-z=${focus.z}`;
}

/** Face position inside a group photo, in percent of the full frame (both shots are 16:9). */
export type Box = { x: number; y: number; w: number; h: number };

export type Person = 'glasses' | 'red' | 'beard';
export type GroupShot = 'park' | 'parkTwo';

export const isGroupShot = (name: PhotoName): name is GroupShot => name === 'park' || name === 'parkTwo';

/** Group shots load once at this size and are panned and zoomed in CSS (face boxes stay valid). */
export const groupUrl = (name: GroupShot) => photo(name, 1280, 720);

export const FACES: Record<GroupShot, Record<Person, Box>> = {
  park: {
    beard: { x: 24.7, y: 35.9, w: 10, h: 24.2 },
    red: { x: 42.7, y: 41.2, w: 11.8, h: 27.5 },
    glasses: { x: 64.1, y: 42.3, w: 11.8, h: 23.9 },
  },
  parkTwo: {
    beard: { x: 34.7, y: 31, w: 8.2, h: 23.1 },
    red: { x: 25.6, y: 41.2, w: 10.5, h: 19.4 },
    glasses: { x: 64.7, y: 32.3, w: 13, h: 33.9 },
  },
};

export type DemoMatch = {
  shot: GroupShot;
  person: Person;
  box: Box;
  /** How far the thumbnail zooms in on the face; more for a cropped repost. */
  zoom: number;
  /** A generic kind of site, never a real brand. */
  site: string;
  similarity: number;
};

export type DemoSubject = {
  label: string;
  selfie: { photo: PhotoName; focus: Focus };
  matches: DemoMatch[];
};

const match = (person: Person, shot: GroupShot, site: string, similarity: number, zoom = 1.6): DemoMatch => ({
  shot,
  person,
  box: FACES[shot][person],
  zoom,
  site,
  similarity,
});

export const DEMO_SUBJECTS: DemoSubject[] = [
  {
    label: 'Example face 1',
    selfie: { photo: 'parkTwo', focus: { x: 0.712, y: 0.5, z: 2.3 } },
    matches: [
      match('glasses', 'park', 'Social network', 96),
      match('glasses', 'parkTwo', 'Photo blog', 88),
      match('glasses', 'park', 'Forum', 74, 2.8),
    ],
  },
  {
    label: 'Example face 2',
    selfie: { photo: 'park', focus: { x: 0.485, y: 0.54, z: 3 } },
    matches: [
      match('red', 'park', 'Event gallery', 98),
      match('red', 'park', 'Photo blog', 91, 2.8),
      match('red', 'parkTwo', 'Social network', 83),
    ],
  },
  {
    label: 'Example face 3',
    selfie: { photo: 'park', focus: { x: 0.297, y: 0.47, z: 3 } },
    matches: [
      match('beard', 'parkTwo', 'Social network', 92),
      match('beard', 'park', 'Photo blog', 81, 2.8),
      match('beard', 'park', 'Forum', 67),
    ],
  },
];

/** The badge colors the app uses for similarity: green, orange, yellow, red. */
export function similarityTone(value: number) {
  if (value >= 90) return 'high';
  if (value >= 70) return 'good';
  if (value >= 50) return 'fair';
  return 'low';
}

export const REASONS: { title: string; text: string; photo: PhotoName }[] = [
  {
    title: 'Where else am I?',
    text: 'Discover where else your likeness appears: group shots, old posts, pages you never saw.',
    photo: 'friendsWave',
  },
  {
    title: 'Who is using my photos?',
    text: 'Spot unknown or unauthorized use of your pictures and see the page each one is on.',
    photo: 'portraitLaugh',
  },
  {
    title: 'What does the web show?',
    text: 'Keep an eye on your online image presence and run a new search whenever you like.',
    photo: 'laptopCafe',
  },
];

export const STEPS = [
  { title: 'Provide a photo', text: 'Take a selfie in the app or pick a portrait from your photos.', screen: SCREENS.photo },
  { title: 'Let AI search', text: 'FindMyPix reads your face and searches publicly available sources.', screen: SCREENS.analyzing },
  { title: 'See your matches', text: 'Every result shows a similarity score, so you know how close it is.', screen: SCREENS.matches },
  { title: 'Open the source', text: 'Tap a match to open the page where that photo was found.', screen: SCREENS.source },
];

export const PRIVACY = [
  { title: 'Processed securely', text: 'Your image is processed securely, with no external websites involved.' },
  { title: 'Public sources only', text: 'Matches come from publicly available sources on the web.' },
  {
    title: 'Not linked to you',
    text: 'The App Store privacy label lists usage data and diagnostics, not linked to your identity.',
  },
];

export const FAQ = [
  {
    question: 'What kind of photo should I use?',
    answer: 'A selfie or a portrait where your face is clearly visible. Take one with the camera or pick one from your photo library.',
  },
  {
    question: 'Where does FindMyPix look?',
    answer: 'It uses face recognition to search for visual matches of your face in publicly available sources on the web.',
  },
  {
    question: 'How do I know a match is really me?',
    answer: 'Every match comes with a similarity score, and you can open its source page to see the photo where it was posted.',
  },
  {
    question: 'Will it find every photo of me?',
    answer: 'No search can promise that. FindMyPix looks at publicly available sources, so photos that are not public will not show up.',
  },
  {
    question: 'Is my photo safe?',
    answer:
      'Your image is processed securely, with no external websites involved. The App Store privacy label lists usage data and diagnostics, not linked to you.',
  },
  {
    question: 'How many searches can I run?',
    answer: 'The subscription includes unlimited searches, so you can check again whenever you like.',
  },
  {
    question: 'How do I get access after paying?',
    answer: 'Right after checkout we show you how to get FindMyPix with your subscription unlocked.',
  },
  {
    question: 'Which devices does it work on?',
    answer: 'iPhone with iOS 15.0 or later.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes. Cancel from your account, and you keep access until the paid period ends.',
  },
];

/* ---------- Contact sheets ---------- */

/**
 * One frame on a contact sheet. Group shots pan and zoom to `focus` (x, y as 0–1 of the photo, z
 * zoom) so the hand-measured face boxes stay valid; other photos are cropped by the CDN. `match`
 * colors that person's face; `vary` is the next exposure of the same scene (same file, reframed).
 */
export type Shot = { photo: PhotoName; focus?: Focus | 'faces'; match?: Person; vary?: boolean };

const s = (photo: PhotoName, extra: Omit<Shot, 'photo'> = {}): Shot => ({ photo, ...extra });
const again = (photo: PhotoName, extra: Omit<Shot, 'photo'> = {}): Shot => ({ photo, vary: true, ...extra });

/** The same person (red sweater) in three frames: the matches the sheet circles. */
const YOU_WIDE: Shot = { photo: 'park', focus: { x: 0.486, y: 0.55, z: 1.12 }, match: 'red' };
const YOU_LEFT: Shot = { photo: 'parkTwo', focus: { x: 0.31, y: 0.5, z: 1.7 }, match: 'red' };
const YOU_CLOSE: Shot = { photo: 'park', focus: { x: 0.486, y: 0.55, z: 2.1 }, match: 'red' };

/** The hero's roll: four strips of nine frames (36 exposures). */
export const SHEET: Shot[][] = [
  [
    s('closeSmile'), again('closeSmile'), s('crowd'), again('crowd'), s('studioMan'), again('studioMan'),
    YOU_WIDE, s('grin'), again('grin'),
  ],
  [
    s('peace', { focus: 'faces' }), again('peace', { focus: 'faces' }), s('trio', { focus: 'faces' }),
    again('trio', { focus: 'faces' }), s('outdoorMan'), again('outdoorMan'), s('monoSmile'), YOU_LEFT,
    s('rooftop', { focus: 'faces' }),
  ],
  [
    s('friendsWave', { focus: 'faces' }), again('friendsWave', { focus: 'faces' }), s('laptopCafe'),
    again('laptopCafe'), s('portraitLaugh'), YOU_CLOSE, again('portraitLaugh'), s('nightCamera'),
    again('nightCamera'),
  ],
  [
    again('rooftop', { focus: 'faces' }), s('photographer'), again('photographer'), s('cameraBack'),
    again('cameraBack'), s('selfieGroup', { focus: 'faces' }), again('selfieGroup', { focus: 'faces' }),
    again('monoSmile'), s('closeSmile', { vary: true }),
  ],
];

/** Where the loupe rests when nobody moves it: [strip, frame] on wide and narrow screens. */
export const LOUPE_REST = { wide: [1, 7], narrow: [0, 6] } as const;

/** The strip that runs behind the three loupes of "Why people look". */
export const WHY_STRIP: Shot[] = [
  s('studioMan'), s('crowd'), s('friendsWave', { focus: 'faces' }), s('grin'), s('outdoorMan'),
  s('portraitLaugh'), s('trio', { focus: 'faces' }), s('monoSmile'), s('laptopCafe'), s('closeSmile'),
  s('photographer'), s('rooftop', { focus: 'faces' }), s('peace', { focus: 'faces' }), s('cameraBack'),
];

/** The last sheet: three strips of five, one frame circled. */
export const FINAL_SHEET: Shot[][] = [
  [s('grin'), again('grin'), s('trio', { focus: 'faces' }), s('studioMan'), again('studioMan')],
  [s('peace', { focus: 'faces' }), s('monoSmile'), again('monoSmile'), s('crowd'), YOU_CLOSE],
  [s('closeSmile'), s('outdoorMan'), again('outdoorMan'), s('selfieGroup', { focus: 'faces' }), s('laptopCafe')],
];

/** Hero proof points, printed like film-edge text. */
export const PROOF = ['Selfie or portrait', 'Publicly available sources', 'Similarity score on every match'];

/** Frame numbers of the sections; the header's counter shows the one under it. */
export const FRAMES = {
  hero: { no: '01', name: 'Contact sheet' },
  search: { no: '08A', name: 'The search' },
  why: { no: '14', name: 'Why people look' },
  how: { no: '19A', name: 'How it works' },
  privacy: { no: '23', name: 'Privacy' },
  faq: { no: '27A', name: 'Questions' },
  final: { no: '36', name: 'Your turn' },
} as const;
