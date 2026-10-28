// Facts come from the App Store listing (see creatives/apps/plant-id/NOTES.md).
// Plant names, care values and the diagnosis in the demo are examples and are labelled on the page.
import type { CSSProperties } from 'react';

export const APP = {
  name: 'Plant Identifier',
  fullName: 'Plant Identifier・Care & Health',
  developer: 'PaoApps',
  legalName: 'PAO APPS PTE. LTD.',
  iconUrl:
    'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/6e/b0/1b/6eb01b3b-a2f7-70ae-c63b-0e658ae63a0c/AppIcon-0-0-1x_U007ephone-0-1-0-85-220.jpeg/200x200Icon.ApSiOS01-75.webp',
  privacyUrl: 'https://www.getpaoapps.com/privacy',
  termsUrl: 'https://www.getpaoapps.com/terms',
  /** US App Store, collected 2026-10-26 (72 ratings: 57×5, 11×4, 3×3, 0×2, 1×1). */
  rating: '4.7',
  ratingCount: 72,
};

const SHOT_PATHS = [
  'PurpleSource221/v4/88/81/6c/88816c77-f37d-05a3-e00d-e13e79742a87/EN-13Pro-1.png',
  'PurpleSource221/v4/6e/7e/e3/6e7ee3f2-7bee-895a-bf64-cc79e8984202/EN-13Pro-2.png',
  'PurpleSource211/v4/57/f9/05/57f9053e-9822-c95b-7287-0456d924caca/EN-13Pro-3.png',
  'PurpleSource211/v4/c2/4a/9c/c24a9ccc-fc0b-1d2b-b63d-0e56ca9a7c28/EN-13Pro-4.png',
  'PurpleSource211/v4/db/51/ef/db51efbc-13db-e79c-8897-83956d28d127/EN-13Pro-5.png',
];

const shot = (index: number, size = '600x0w') =>
  `https://is1-ssl.mzstatic.com/image/thumb/${SHOT_PATHS[index]}/${size}.webp`;

/** The five store screenshots, in store order, with the headline each one carries. */
export const SCREENSHOTS = [
  { url: shot(0), title: 'Identify Any Plant', note: 'The camera names a dahlia', alt: 'Identify Any Plant: the camera names a dahlia, Dahlia pinnata' },
  { url: shot(1), title: 'Diagnose Disease', note: 'A leaf with Alternaria', alt: 'Diagnose Disease: the camera finds Alternaria on a leaf' },
  { url: shot(2), title: 'Improve Your Plant Care', note: 'Before and after care', alt: 'Improve Your Plant Care: a plant before and after' },
  { url: shot(3), title: 'Set Care Reminders', note: 'Water, mist, rotate, feed', alt: 'Set Care Reminders: watering, misting, rotating and fertilizing' },
  { url: shot(4), title: 'Organise Your Greens', note: 'The My Plants list', alt: 'Organise Your Greens: the My Plants list' },
];

/*
 * Crops of the store screenshots (the app's own example images). Coordinates are in a 924×2000
 * space, the screenshot scaled to 924px wide. The element gets the crop's aspect ratio.
 */
const SPACE_W = 924;
const SPACE_H = 2000;

export function shotCrop(index: number, x: number, y: number, w: number, h: number): CSSProperties {
  return {
    backgroundImage: `url(${shot(index, '1290x0w')})`,
    backgroundSize: `${(SPACE_W / w) * 100}% auto`,
    backgroundPosition: `${(x / (SPACE_W - w)) * 100}% ${(y / (SPACE_H - h)) * 100}%`,
    backgroundRepeat: 'no-repeat',
    aspectRatio: `${w} / ${h}`,
  };
}

/** The spotted leaf from the app's "Diagnose Disease" screenshot, without its UI overlay. */
export const SPOTTED_LEAF = shotCrop(1, 312, 940, 376, 470);
/** The round thumbnail from the same screenshot's "Diseases Found! Alternaria" card. */
export const SPOTTED_THUMB = shotCrop(1, 49, 735, 156, 156);

// Free Unsplash photos (Unsplash License), cropped by the CDN to the size each spot needs.
const PHOTO_IDS = {
  fig: '1652366358812-6fde6d1f1caf',
  clover: '1591036272701-154262f9fee5',
  watering: '1673853233647-17ebc2d71b5f',
  livingRoom: '1617202009609-74a52df21011',
  wildflowers: '1675794211734-6033ed90ecd2',
  homeWindow: '1766736702134-8bf26e5c216a',
  whiteFlowers: '1645111094156-fc33bbf48b2e',
  vegBed: '1747339385292-d58fdff13938',
  trees: '1565182162105-399fd4c44600',
};

export type PhotoName = keyof typeof PHOTO_IDS;

export function photo(name: PhotoName, width: number, height = width, focus?: [number, number]) {
  const crop = focus ? `&crop=focalpoint&fp-x=${focus[0]}&fp-y=${focus[1]}` : '';
  return `https://images.unsplash.com/photo-${PHOTO_IDS[name]}?w=${width}&h=${height}&fit=crop${crop}&auto=format&q=72`;
}

/* ---------- Hero demo: three example snaps ---------- */

export type CareTone = 'water' | 'mist' | 'rotate' | 'feed' | 'light' | 'info' | 'alert';

export type Scene = {
  id: string;
  mode: 'Identify' | 'Diagnose';
  /** Thumbnail caption under the viewfinder. */
  label: string;
  /** Where the focus brackets lock, in % of the viewfinder: [left, top, width, height]. */
  target: [number, number, number, number];
  /** Point the photo zooms around once the sheet is up (defaults to the target's center), in %. */
  zoom?: [number, number];
  name: string;
  latin: string;
  sheetTitle: string;
  rows: { tone: CareTone; label: string; value: string }[];
  /** Notification that drops in once the result is shown. */
  toast?: { title: string; text: string };
  action: string;
};

export const SCENES: Scene[] = [
  {
    id: 'fig',
    mode: 'Identify',
    label: 'Window',
    target: [8, 14, 58, 52],
    name: 'Fiddle-leaf fig',
    latin: 'Ficus lyrata',
    sheetTitle: 'Care plan',
    rows: [
      { tone: 'water', label: 'Watering', value: 'Every 7 days' },
      { tone: 'light', label: 'Light', value: 'Bright, indirect' },
      { tone: 'feed', label: 'Fertilizing', value: 'Monthly, spring to summer' },
    ],
    toast: { title: 'Watering', text: 'Time to water your Fiddle-leaf fig.' },
    action: 'Reminder on',
  },
  {
    id: 'clover',
    mode: 'Identify',
    label: 'Meadow',
    target: [40, 36, 48, 34],
    name: 'Red clover',
    latin: 'Trifolium pratense',
    sheetTitle: 'About this plant',
    rows: [
      { tone: 'info', label: 'Type', value: 'Wildflower, perennial' },
      { tone: 'light', label: 'Light', value: 'Full sun' },
      { tone: 'water', label: 'Water', value: 'Moderate' },
    ],
    action: 'Add to My Plants',
  },
  {
    id: 'leaf',
    mode: 'Diagnose',
    label: 'Leaf spots',
    target: [6, 20, 70, 58],
    zoom: [34, 24],
    name: 'Disease found',
    latin: 'Alternaria',
    sheetTitle: 'What to do',
    rows: [
      { tone: 'alert', label: 'Step 1', value: 'Remove the spotted leaves' },
      { tone: 'water', label: 'Step 2', value: 'Water the soil, keep leaves dry' },
      { tone: 'rotate', label: 'Step 3', value: 'Give it more air and light' },
    ],
    action: 'Save to history',
  },
];

/* ---------- Reminders, as in the app's "Set Care Reminders" screenshot ---------- */

export const REMINDERS: { tone: CareTone; label: string; plant: string; every: string }[] = [
  { tone: 'water', label: 'Watering', plant: 'Peace Lily', every: 'Every 7 days' },
  { tone: 'mist', label: 'Misting', plant: 'Snake Plant', every: 'Every 10 days' },
  { tone: 'rotate', label: 'Rotating', plant: 'Golden Pothos', every: 'Every 14 days' },
  { tone: 'feed', label: 'Fertilizing', plant: 'Peace Lily', every: 'Every 10 days' },
];

/* ---------- My Plants, the four plants from the app's "Organise Your Greens" screenshot ---------- */

export const MY_PLANTS: { name: string; latin: string; thumb: CSSProperties; care: CareTone[] }[] = [
  { name: 'Peace Lily', latin: 'Spathiphyllum wallisii', thumb: shotCrop(4, 93, 838, 254, 254), care: ['water', 'feed'] },
  { name: 'Golden Pothos', latin: 'Epipremnum aureum', thumb: shotCrop(4, 165, 1145, 185, 185), care: ['water', 'mist', 'rotate'] },
  { name: 'Snake Plant', latin: 'Sansevieria trifasciata', thumb: shotCrop(4, 165, 1386, 185, 185), care: ['mist', 'rotate'] },
  { name: 'Dragon Tree', latin: 'Dracaena marginata', thumb: shotCrop(4, 167, 1624, 182, 182), care: ['water', 'mist'] },
];

/* ---------- Where it works: the listing's "houseplants, herbs, flowers, trees, and wild plants" ---------- */

export const PLACES: { title: string; latin: string; text: string; photo: PhotoName; focus?: [number, number] }[] = [
  { title: 'Houseplants', latin: 'on the windowsill', text: 'The windowsill jungle, one name at a time.', photo: 'homeWindow', focus: [0.5, 0.6] },
  { title: 'Herbs & veg', latin: 'in the bed', text: 'Seedlings in the bed, herbs on the balcony.', photo: 'vegBed' },
  { title: 'Flowers', latin: 'by the fence', text: 'That bloom you walk past and always wonder about.', photo: 'whiteFlowers', focus: [0.72, 0.5] },
  { title: 'Trees & wild plants', latin: 'on the trail', text: 'Park, trail or meadow: snap it and keep walking.', photo: 'trees', focus: [0.5, 0.62] },
];

/* ---------- How it works ---------- */

export const STEPS = [
  { title: 'Snap or upload', text: 'Take a photo with the camera or pick one from your gallery.' },
  { title: 'Get the name and care', text: 'The plant’s name, its info and care tips, with watering and fertilizing advice.' },
  { title: 'Stay on schedule', text: 'Set reminders to water, mist and fertilize. Run a health check when a leaf looks off.' },
];

export const FAQ = [
  {
    question: 'What can it identify?',
    answer:
      'Plants, flowers, trees and leaves, from houseplants and herbs to wild plants on a hike. The app recognizes over 30,000 species.',
  },
  {
    question: 'Do I have to take a new photo?',
    answer: 'No. Use the camera, or pick a photo you already have in your gallery.',
  },
  {
    question: 'How does the health check work?',
    answer:
      'Snap the leaf or plant that looks off. The app checks the photo for common plant diseases and gives you care recommendations.',
  },
  {
    question: 'What can I set reminders for?',
    answer:
      'Watering, misting and fertilizing, on your own schedule for every plant, with notifications so you never miss one.',
  },
  {
    question: 'I’m a beginner. Is that okay?',
    answer:
      'Yes. Every plant comes with care tips and watering and fertilizing advice, plus beginner gardening advice and expert articles.',
  },
  {
    question: 'How do I get access after paying?',
    answer: 'Right after checkout we show you how to get Plant Identifier with your subscription unlocked.',
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
