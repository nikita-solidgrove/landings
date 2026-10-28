// Facts come from the App Store listing (see creatives/apps/duoline/NOTES.md).
// Every phone number on the page is fictional: NANP 555-01xx and the UK 020 7946 0xxx drama range.
// Demo scenes are illustrations and are labelled "Example" on the page.

export const APP = {
  name: 'Virtual Number - Second Phone',
  short: 'Second Phone',
  developer: 'Auxilin',
  legalName: 'Auxilin LLC',
  iconUrl:
    'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/6a/98/6c/6a986cb6-c3a3-3514-5096-e11c2c6433df/Placeholder.mill/256x256bb.webp',
  privacyUrl: 'https://auxilin.com/privacy',
  termsUrl: 'https://auxilin.com/terms',
  rating: '4.6',
  ratingCount: '408',
};

/** The second number used across the page (Austin area code, fictional 555-01xx range). */
export const LINE = '(512) 555-0147';

const shot = (path: string) => `https://is1-ssl.mzstatic.com/image/thumb/${path}/600x0w.webp`;

// Store screenshots 3 and 4 are left out: their captions say "Unlimited" calls and texts, and the
// store sells credit packs. Screenshot 2 lists "International" countries the description doesn't.
export const SCREENSHOTS = [
  shot('PurpleSource221/v4/d9/48/4e/d9484e6b-dd9c-9c01-2511-bd59888e061c/EN-13Pro-1.png'),
  shot('PurpleSource211/v4/77/a8/74/77a87472-2c37-5479-9a39-adace416a6e0/EN-13Pro-6.png'),
  shot('PurpleSource221/v4/91/bd/57/91bd571e-997b-cb75-5a17-e893ece195c4/EN-13Pro-7.png'),
];

/** What each store screenshot shows, in the same order. */
export const SCREENSHOT_CAPTIONS = [
  { title: 'My Numbers', text: 'Every line with its calls and messages, on or off.' },
  { title: 'Voicemail', text: 'Greetings, voicemail and a call being recorded.' },
  { title: 'Do Not Disturb', text: 'All the time, or on a schedule you set.' },
];

/** Who has which number (examples). */
export const OWN_CONTACTS = [
  ['Mom', 'Family'],
  ['Sam', 'Best friend'],
  ['Jordan', 'Brother'],
  ['Your team', 'Day job'],
];

export const SECOND_CONTACTS = [
  ['Buyer', 'Marketplace'],
  ['New client', 'Table order'],
  ['Alex', 'First date'],
  ['Brand inquiry', 'Via your bio'],
];

// Free Unsplash photos (Unsplash License), cropped by the CDN to the size each spot needs.
const PHOTO_IDS = {
  seller: '1770013413878-2530e2c3d82b',
  parcel: '1566576721346-d4a3b4eaeb55',
  maker: '1687422811062-a966b55cb217',
  studio: '1753164597612-5e71b83fda91',
  date: '1653762379954-8943c787e78b',
  departures: '1772466104938-d9e6b6197cdb',
  lounge: '1788631934024-735d3e706ce9',
};

export type PhotoName = keyof typeof PHOTO_IDS;

export function photo(name: PhotoName, width: number, height = width) {
  return `https://images.unsplash.com/photo-${PHOTO_IDS[name]}?w=${width}&h=${height}&fit=crop&auto=format&q=72`;
}

export type TextEvent = { kind: 'text'; from: string; number: string; message: string; reply: string };
export type CallEvent = {
  kind: 'call';
  direction: 'in' | 'out';
  who: string;
  detail: string;
  /** What the connected call shows in the middle of the screen. */
  live: { icon: 'rec' | 'wifi'; text: string };
};

export type Scene = {
  id: string;
  tab: string;
  /** Where the second number was handed out (or, abroad, where you are). */
  share: { label: string; title: string; line: string; photo: PhotoName };
  event: TextEvent | CallEvent;
  note: string;
};

export const SCENES: Scene[] = [
  {
    id: 'selling',
    tab: 'Selling',
    share: { label: 'Your shop page', title: 'Questions about an order?', line: `Text ${LINE}`, photo: 'parcel' },
    event: {
      kind: 'text',
      from: 'Buyer',
      number: '(737) 555-0118',
      message: 'Hi! Has my order shipped yet?',
      reply: 'Yes! It went out this morning 📦',
    },
    note: 'Buyers get your shop number, not your own.',
  },
  {
    id: 'clients',
    tab: 'Clients',
    share: { label: 'Your business card', title: 'Oak & Pine Woodwork', line: `Call ${LINE}`, photo: 'maker' },
    event: {
      kind: 'call',
      direction: 'in',
      who: 'New client',
      detail: '(512) 555-0163',
      live: { icon: 'rec', text: 'Recording this call' },
    },
    note: 'Work calls ring on your work number.',
  },
  {
    id: 'dating',
    tab: 'Dating',
    share: { label: 'After a first date', title: 'Here’s my number', line: LINE, photo: 'date' },
    event: {
      kind: 'text',
      from: 'Alex',
      number: '(512) 555-0129',
      message: 'Had fun tonight! Same place next week?',
      reply: 'Deal! See you Friday 🙂',
    },
    note: 'Share your real number when you’re ready.',
  },
  {
    id: 'travel',
    tab: 'Travel',
    share: { label: 'You’re abroad', title: 'Lisbon, hotel Wi‑Fi', line: 'Roaming: off', photo: 'lounge' },
    event: { kind: 'call', direction: 'out', who: 'Mom', detail: 'Wi‑Fi call', live: { icon: 'wifi', text: 'Internet call, no roaming' } },
    note: 'Calls go over the Internet, not roaming.',
  },
];

export type UseCase = {
  tag: string;
  title: string;
  text: string;
  number: string;
  place: string;
  photo: PhotoName;
  tone: 'green' | 'ink' | 'paper' | 'orange';
};

export const USE_CASES: UseCase[] = [
  {
    tag: 'Selling online',
    title: 'Buyers text your shop line',
    text: 'Put the second number on listings and shop pages. Your personal number stays out of it.',
    number: '+1 (512) 555-0147',
    place: 'US number',
    photo: 'seller',
    tone: 'green',
  },
  {
    tag: 'Side business',
    title: 'A line for your business',
    text: 'A local number for clients, a custom voicemail greeting and calls you can record with a tap.',
    number: '+44 20 7946 0958',
    place: 'UK number',
    photo: 'maker',
    tone: 'ink',
  },
  {
    tag: 'Freelance',
    title: 'Clients call one number',
    text: 'Meeting new clients? Hand out the work number and keep evenings for the people who have your own.',
    number: '+1 (416) 555-0123',
    place: 'Canadian number',
    photo: 'studio',
    tone: 'paper',
  },
  {
    tag: 'Dating',
    title: 'Your real number can wait',
    text: 'Give a match your second number. Share your own when you’re ready.',
    number: '+1 (512) 555-0182',
    place: 'US number',
    photo: 'date',
    tone: 'orange',
  },
];

export const STEPS = [
  {
    title: 'Pick a number',
    text: 'A local number in the US, UK, Canada or Israel, with a local area code. No extra SIM card.',
  },
  {
    title: 'Hand it out',
    text: 'On listings, business cards, your profile: anywhere you’d rather not give your own.',
  },
  {
    title: 'Call and text from it',
    text: 'Calls, SMS and MMS arrive in the app over the Internet. Reply from the same number.',
  },
];

export const COUNTRIES = [
  { flag: '🇺🇸', name: 'United States', code: '+1' },
  { flag: '🇬🇧', name: 'United Kingdom', code: '+44' },
  { flag: '🇨🇦', name: 'Canada', code: '+1' },
  { flag: '🇮🇱', name: 'Israel', code: '+972' },
];

export const DND_HOURS = [
  ['Mon – Fri', '5 pm – 9 am'],
  ['Saturday', '9 pm – 9 am'],
  ['Sunday', '9 pm – 9 am'],
];

/** `line` puts each question in one of the two FAQ columns. */
export const FAQ: { line: 1 | 2; question: string; answer: string }[] = [
  {
    line: 1,
    question: 'Do I need a second SIM card?',
    answer:
      'No. The second number lives in the app, so there is no extra SIM card to buy or swap. Calls and texts go over the Internet.',
  },
  {
    line: 1,
    question: 'Where can my number be from?',
    answer: 'Choose a local number in the US, UK, Canada or Israel, and pick a local area code for a local presence.',
  },
  {
    line: 1,
    question: 'Who can I call and text?',
    answer:
      'Mobile and landline numbers, at home and internationally. You can send SMS and MMS from your second number too.',
  },
  {
    line: 1,
    question: 'Can I have more than one number?',
    answer:
      'Yes. Get and manage several numbers on one iPhone, for work, dating, social media or personal use, and switch between them.',
  },
  {
    line: 1,
    question: 'What if I can’t pick up?',
    answer:
      'Set a custom voicemail greeting for each number, automatic replies for missed messages, and Do Not Disturb hours so the line stays quiet when you’re off.',
  },
  {
    line: 2,
    question: 'Does it work when I travel?',
    answer:
      'Yes. Calls and texts go over the Internet, so you can use Wi‑Fi anywhere in the world and avoid roaming charges, even without a mobile plan.',
  },
  {
    line: 2,
    question: 'Can I call 911 with it?',
    answer: 'No. The app is not meant for emergency calls such as 911. Use your phone’s regular line for those.',
  },
  {
    line: 2,
    question: 'How do I get access after paying?',
    answer: 'Right after checkout we show you how to get Virtual Number - Second Phone with your subscription unlocked.',
  },
  {
    line: 2,
    question: 'Which devices does it work on?',
    answer: 'iPhone with iOS 17.0 or later.',
  },
  {
    line: 2,
    question: 'Can I cancel anytime?',
    answer: 'Yes. Cancel from your account, and you keep access until the paid period ends.',
  },
];
