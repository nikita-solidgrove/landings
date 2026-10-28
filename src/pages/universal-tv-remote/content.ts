// Facts come from the App Store listing (see creatives/apps/universal-tv-remote/NOTES.md).
// TV programs, channel numbers and searches in the demo are illustrations, labelled "Example" on the page.

export const APP = {
  name: 'Universal TV Remote Control',
  shortName: 'Universal TV Remote',
  developer: 'PaoApps',
  legalName: 'PAO APPS PTE. LTD.',
  iconUrl:
    'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/3d/77/c6/3d77c66c-35a7-fc1b-72f1-c3863347d85f/Placeholder.mill/256x256bb.webp',
  privacyUrl: 'https://www.getpaoapps.com/privacy',
  termsUrl: 'https://www.getpaoapps.com/terms',
};

/** US App Store, collected 2026-10-26. */
export const RATING = { value: '4.6', count: 250 };

/** Brands named in the listing ("over 100 TV brands including …"). Hisense is left out, see NOTES.md. */
export const BRANDS = ['Samsung', 'LG', 'Sony', 'TCL', 'Roku', 'Panasonic', 'Philips', 'Toshiba'];

/** Smart TV systems named in the listing. */
export const SYSTEMS = ['Roku TV', 'webOS', 'Tizen'];

const shot = (path: string) => `https://is1-ssl.mzstatic.com/image/thumb/${path}/600x0w.webp`;

/**
 * The App Store screenshots in the store's order, with the headline each one carries. The first one
 * ("Support for Most TV Models", EN-13Pro-2) is left out: it is a stack of TV brand logos.
 */
export const SCREENSHOTS = [
  { url: shot('PurpleSource211/v4/8d/22/3b/8d223bca-294c-41b3-01e6-177e0702a6b0/EN-13Pro-1.png'), alt: 'The universal TV remote screen', legend: 'Remote' },
  { url: shot('PurpleSource211/v4/47/1a/58/471a5881-4580-129a-5175-9c0ae942e772/EN-13Pro-3.png'), alt: 'Keyboard and touchpad', legend: 'Keyboard · Touchpad' },
  { url: shot('PurpleSource211/v4/39/dc/48/39dc486c-8615-aab2-836c-58d07edfa55c/EN-13Pro-4.png'), alt: 'Easy connection to your TV', legend: 'Connect' },
  { url: shot('PurpleSource221/v4/a3/b4/09/a3b409b1-5410-ab40-7be6-54d9520ca077/EN-13Pro-5.png'), alt: 'Advanced navigation', legend: 'Navigation' },
];

// Free Unsplash photos (Unsplash License), cropped by the CDN to the size each spot needs.
const PHOTO_IDS = {
  sofaBack: '1692188071339-2825a8a997f1',
  popcorn: '1665827491450-c6f329f2285c',
  gameNight: '1772724317465-1b229eab9c07',
  cabin: '1680634326749-40efc7e1a7f4',
  couple: '1665827488591-ddd6775bca13',
};

export type PhotoName = keyof typeof PHOTO_IDS;

export function photo(name: PhotoName, width: number, height = width) {
  return `https://images.unsplash.com/photo-${PHOTO_IDS[name]}?w=${width}&h=${height}&fit=crop&auto=format&q=72`;
}

/** Programs in the demo: flat illustrations drawn in CSS, never real shows or channels. */
export const SCENES = [
  { id: 'coast', title: 'Sunset Coast' },
  { id: 'city', title: 'City Lights' },
  { id: 'match', title: 'Match Day' },
  { id: 'peaks', title: 'Alpine Lake' },
] as const;

export type SceneId = (typeof SCENES)[number]['id'];

/** The channel number decides the program, so any number typed on the keypad shows something. */
export const sceneFor = (channel: number) => SCENES[channel % SCENES.length];

export type Overlay = 'volume' | 'mute' | 'channel' | 'play' | 'source' | 'tools' | 'cursor';

/** Steps of the guided tour; each names the control it presses. */
export const TOUR_LABELS = {
  connect: 'Finds your TV on Wi-Fi',
  volume: 'Volume',
  channel: 'Channels',
  menus: 'Menus',
  search: 'Search with the keyboard',
  play: 'Play / pause',
  mute: 'Mute',
  power: 'Power',
} as const;

export type TourLabel = keyof typeof TOUR_LABELS;

/** The same steps as short legends, printed beside the demo with an LED for the current one. */
export const TOUR_LEGENDS: Record<TourLabel, string> = {
  connect: 'Pair over Wi-Fi',
  volume: 'Vol +',
  channel: 'Ch +',
  menus: 'Home · OK',
  search: 'Keyboard',
  play: 'Play / pause',
  mute: 'Mute',
  power: 'Power',
};

/** The listing's connection method. */
export const STEPS = [
  { title: 'Turn on your TV', text: 'Give it at least 30 seconds before it goes to sleep mode.' },
  { title: 'Join the same Wi-Fi', text: 'Your phone and your TV on the same Wi-Fi network.' },
  { title: 'Open the app', text: 'It detects smart TVs on its own. Pick yours and you are in control.' },
];

export const USE_CASES: {
  photo: PhotoName;
  title: string;
  text: string;
  overlay: 'connected' | 'paused' | 'volume' | 'found';
}[] = [
  {
    photo: 'sofaBack',
    title: 'Remote lost in the sofa?',
    text: 'Your phone is already in your hand. Open the app and keep watching.',
    overlay: 'connected',
  },
  {
    photo: 'popcorn',
    title: 'Movie night',
    text: 'Pause for popcorn and pick up where you left off, from the sofa.',
    overlay: 'paused',
  },
  {
    photo: 'gameNight',
    title: 'Game night',
    text: 'Turn it up for the big moment and flip channels at halftime.',
    overlay: 'volume',
  },
  {
    photo: 'cabin',
    title: 'Someone else’s TV',
    text: 'A cabin, a rental, your parents’ place. Over 100 brands, one app.',
    overlay: 'found',
  },
];

/**
 * Real App Store reviews (US), quoted verbatim; empty hides the section. Left empty: the glowing ones
 * are four generic 5★ reviews from four consecutive days (March 2025), and later reviews mention a
 * "free lifetime" offer, so they may not be organic.
 */
export const REVIEWS: { title: string; text: string; author: string }[] = [];

export const FAQ = [
  {
    question: 'Will it work with my TV?',
    answer: `It works with smart TVs on Roku TV, webOS, Tizen and more, from over 100 brands including ${BRANDS.slice(0, -1).join(', ')} and ${BRANDS.at(-1)}. The app finds them automatically.`,
  },
  {
    question: 'Does my TV need to be a smart TV?',
    answer: 'Yes. The app talks to your TV over Wi-Fi, so it needs a smart TV on the same Wi-Fi network as your phone.',
  },
  {
    question: 'Do I have to point my phone at the TV?',
    answer: 'No. It works over Wi-Fi, so there is no need to be close to the TV.',
  },
  {
    question: 'How do I connect?',
    answer: 'Turn on the TV and give it at least 30 seconds, make sure your phone and TV are on the same Wi-Fi network, then open the app. It detects your TV for you.',
  },
  {
    question: 'What can I control?',
    answer: 'Volume, channels, menus, search and play/pause. Besides the remote, the app has a keyboard, a touchpad and a number keypad.',
  },
  {
    question: 'Is it an official Samsung or LG app?',
    answer: `No. ${APP.name} is made by ${APP.developer} and is not an official product of ${BRANDS.slice(0, -1).join(', ')} or ${BRANDS.at(-1)}.`,
  },
  {
    question: 'How do I get access after paying?',
    answer: `Right after checkout we show you how to get ${APP.name} with your subscription unlocked.`,
  },
  {
    question: 'Which devices does it work on?',
    answer: 'iPhone and iPad with iOS 15.0 or later.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes. Cancel from your account, and you keep access until the paid period ends.',
  },
];
