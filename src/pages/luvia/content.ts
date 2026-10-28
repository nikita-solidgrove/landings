// Facts come from the App Store listing (see creatives/apps/luvia/NOTES.md).
// Demos on the page are illustrations and are labelled "Example".

export const APP = {
  name: 'Luvia',
  storeName: 'Screen Time Control – Luvia',
  subtitle: 'Screen Time Control',
  developer: 'Solid Grove',
  legalName: 'Solid Grove Pte. Ltd.',
  // The icon the App Store page serves (the lookup's artworkUrl512 is a flatter crop of the same art).
  iconUrl:
    'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/84/4a/39/844a39e4-bfc1-761f-fbf2-321dea5ee159/Placeholder.mill/256x256bb.webp',
  privacyUrl: 'https://solidgrove.ai/privacy',
  termsUrl: 'https://solidgrove.ai/terms',
};

const shot = (path: string) => `https://is1-ssl.mzstatic.com/image/thumb/${path}/600x0w.webp`;

export const SCREENSHOTS = [
  { url: shot('PurpleSource211/v4/b4/2e/94/b42e9494-7e33-eadc-fc48-dfe6bc249d59/EN-6.5-1.jpg'), alt: 'Your phone on your terms: apps blocked, focus protected' },
  { url: shot('PurpleSource221/v4/1a/b2/dc/1ab2dc7b-7570-8197-239f-9b7babf5de2a/EN-6.5-2.jpg'), alt: 'Build your routine: Night lock, Deep work and Morning window presets' },
  { url: shot('PurpleSource221/v4/32/8a/b0/328ab08a-282c-c38e-309f-a2c857f39759/EN-6.5-3.jpg'), alt: 'Quick Focus session with blocked apps' },
  { url: shot('PurpleSource221/v4/91/49/4a/91494a2b-319f-abc6-3ec9-d4d8b7ad631f/EN-6.5-4.jpg'), alt: 'Focus today percentage and phone time against a daily goal' },
  { url: shot('PurpleSource211/v4/5c/85/37/5c853713-76fe-ed23-04a5-f9b8569301cf/EN-6.5-5.jpg'), alt: 'Blocklist with Block and Allow Only lists' },
  { url: shot('PurpleSource211/v4/f7/12/01/f7120193-62d2-9197-3278-6d57b0ec7402/EN-6.5-6.jpg'), alt: 'Emergency unblock for a few minutes' },
];

export type Days = 'every' | 'weekdays' | 'weekends';

export type Preset = {
  id: string;
  emoji: string;
  title: string;
  /** Minutes from midnight; an end before the start wraps overnight. */
  start: number;
  end: number;
  days: Days;
  color: string;
};

const h = (hours: number) => hours * 60;

// The eight presets named in the listing, with the app's default windows (Night lock, Deep work,
// Morning window and Wind down are also shown in the App Store screenshots). Users can change any.
export const PRESETS: Preset[] = [
  { id: 'night-lock', emoji: '🌙', title: 'Night lock', start: h(22), end: h(7), days: 'every', color: '#5b6cff' },
  { id: 'morning-window', emoji: '🌅', title: 'Morning window', start: h(7), end: h(9), days: 'every', color: '#ff9b2e' },
  { id: 'deep-work', emoji: '💼', title: 'Deep work', start: h(9), end: h(17), days: 'weekdays', color: '#3f8cff' },
  { id: 'lunch-break', emoji: '🥗', title: 'Lunch break', start: h(12), end: h(13), days: 'weekdays', color: '#3ccf6a' },
  { id: 'study-block', emoji: '📚', title: 'Study block', start: h(15), end: h(19), days: 'weekdays', color: '#ffd23f' },
  { id: 'dinner-table', emoji: '🍽️', title: 'Dinner table', start: h(18), end: h(20), days: 'every', color: '#ff5a4a' },
  { id: 'wind-down', emoji: '🌆', title: 'Wind down', start: h(20), end: h(22), days: 'every', color: '#c86bf5' },
  { id: 'weekend-time', emoji: '🌿', title: 'Weekend time', start: h(10), end: h(14), days: 'weekends', color: '#2fd6a0' },
];

export const DEFAULT_ACTIVE = ['night-lock', 'morning-window', 'dinner-table'];

export const DAY_LABELS: Record<Days, string> = { every: 'Every day', weekdays: 'Weekdays', weekends: 'Weekends' };

export function clock(minutes: number, withMinutes = true) {
  const m = ((minutes % 1440) + 1440) % 1440;
  const hour24 = Math.floor(m / 60);
  const minute = m % 60;
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const period = hour24 < 12 ? 'AM' : 'PM';
  return withMinutes || minute ? `${hour12}:${String(minute).padStart(2, '0')} ${period}` : `${hour12} ${period}`;
}

export const range = (preset: Preset) => `${clock(preset.start)} – ${clock(preset.end)}`;

/** Quick Focus durations from the listing: 15 min, 25 min, 1 hour or indefinite. */
export const DURATIONS = [
  { label: '15 min', minutes: 15 },
  { label: '25 min', minutes: 25 },
  { label: '1 hour', minutes: 60 },
  { label: 'No limit', minutes: 0 },
];

// Free Unsplash photos (Unsplash License), cropped by the CDN to the size each spot needs.
const PHOTO_IDS = {
  friendsLaugh: '1626388129566-b25c51bc1942',
  phonesTable: '1566915541858-48b56240e292',
  phonesCrowd: '1598826867442-9ef9e2527b1e',
  bedMorning: '1742575422852-f68324d9355b',
  phoneHand: '1543428390-52250776dd46',
  coffeeBook: '1711185895393-f70acef05c09',
  deskFocus: '1762341118523-38c54d621bd4',
  parkReading: '1791325494354-dee8d7c92e3e',
};

export type PhotoName = keyof typeof PHOTO_IDS;

export function photo(name: PhotoName, width: number, height = width) {
  return `https://images.unsplash.com/photo-${PHOTO_IDS[name]}?w=${width}&h=${height}&fit=crop&auto=format&q=72`;
}

/** Use cases: a preset switched on turns the scroll into the moment it protects. */
export const MOMENTS: { preset: string; line: string; before: PhotoName; after: PhotoName }[] = [
  { preset: 'morning-window', line: 'Coffee and a chapter before the first notification.', before: 'bedMorning', after: 'coffeeBook' },
  { preset: 'dinner-table', line: 'Talk to the people right in front of you.', before: 'phonesTable', after: 'friendsLaugh' },
];

/** How it works, from the listing: pick apps, pick when, Luvia enforces it. */
export const STEPS = [
  {
    title: 'pick your distractions',
    text: 'Choose the apps that pull you in. Keep the ones you need on your always-allowed list.',
  },
  {
    title: 'choose when',
    text: 'Start from a preset like Night lock or Deep work, adjust the days and hours, or build your own.',
  },
  {
    title: 'luvia holds the line',
    text: 'Apps are blocked on schedule, even when the app is closed. Need focus right now? One tap on Quick Focus.',
  },
];

export const FAQ = [
  {
    question: 'How does Luvia block apps?',
    answer:
      'Luvia uses Apple’s Screen Time API. You pick the apps that distract you, and Luvia blocks them on your schedule or the moment you start Quick Focus. All blocking runs on your device.',
  },
  {
    question: 'Do schedules work when the app is closed?',
    answer:
      'Yes. Choose the days and the time window once, and Luvia enforces the block automatically, even when the app is closed.',
  },
  {
    question: 'What if I really need an app?',
    answer:
      'Add it to your always-allowed list and it stays open no matter which schedule is running. In an emergency you can pause blocking for up to 15 minutes, and the session picks back up on its own.',
  },
  {
    question: 'Which schedules can I start with?',
    answer:
      'Eight ready-made presets: Deep work, Morning window, Night lock, Lunch break, Wind down, Dinner table, Study block and Weekend time. Adjust their times or build your own.',
  },
  {
    question: 'What is the Focus score?',
    answer:
      'Your daily Focus % shows how well you stuck to your schedules: how much blocked-app time slipped through and how many times you unblocked. You can also set a daily screen time goal and track it through the day.',
  },
  {
    question: 'How do I get access after paying?',
    answer: 'Right after checkout we show you how to get Luvia with your subscription unlocked.',
  },
  {
    question: 'Which devices does it work on?',
    answer: 'iPhone with iOS 18.0 or later.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes. Cancel from your account, and you keep access until the paid period ends.',
  },
];
