// Facts come from the App Store listing (see creatives/apps/coin-scanner/NOTES.md).
// Coins in the demo, the plate and the album are real coins cut out of free Unsplash photos; their
// details are illustrations of what a result looks like, and every price is labelled as an example.

export const APP = {
  name: 'Coin Scanner & Identifier App',
  shortName: 'Coin Scanner',
  developer: 'PaoApps',
  legalName: 'PAO APPS PTE. LTD.',
  iconUrl:
    'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/c6/5b/06/c65b0695-e39d-9a89-7310-60feada0da85/AppIcon-0-0-1x_U007ephone-0-1-0-85-220.jpeg/256x256bb.webp',
  privacyUrl: 'https://www.getpaoapps.com/privacy',
  termsUrl: 'https://www.getpaoapps.com/terms',
  /** US App Store, collected 2026-10-26. */
  rating: '4.5',
  ratingCount: 131,
};

const shot = (path: string) => `https://is1-ssl.mzstatic.com/image/thumb/${path}/600x0w.webp`;

/** The App Store page's screenshots with their own headlines (no. 3, a $7.5M "reference price", is left out). */
export const SCREENSHOTS = [
  { url: shot('PurpleSource221/v4/69/2c/9a/692c9a1c-36c4-62e3-8eef-397845b33379/EN-13Pro-1.png'), caption: 'Coin identifier' },
  { url: shot('PurpleSource221/v4/0c/b8/0c/0cb80c09-52d2-6eb4-600c-c3963ea3cdca/EN-13Pro-2.png'), caption: 'Scan any coin' },
  { url: shot('PurpleSource221/v4/71/6e/14/716e14f3-fce7-fa2f-c810-a01d877f1621/EN-13Pro-4.png'), caption: 'Organize collections' },
  { url: shot('PurpleSource211/v4/04/f7/cf/04f7cf9d-9bbd-e931-0651-cb7001e50336/EN-13Pro-5.png'), caption: 'Track scan history' },
  { url: shot('PurpleSource221/v4/79/a0/61/79a06107-fea9-1180-a51d-5e357c328770/EN-13Pro-6.png'), caption: 'Discover numismatics' },
];

// Free Unsplash photos (Unsplash License), cropped by the CDN to the size each spot needs.
const PHOTO_IDS = {
  usCoins: '1587403335644-fa8fef06b261',
  worldCoins: '1672945690877-5307346cde57',
  changeJar: '1512075135822-67cdd9dd7314',
  tripCoins: '1693729016213-99dc29e465de',
  fleaMarket: '1780461475603-623381708d77',
  examining: '1564736678197-8eb9b0e20f75',
};

export type PhotoName = keyof typeof PHOTO_IDS;

const unsplash = (name: PhotoName) => `https://images.unsplash.com/photo-${PHOTO_IDS[name]}`;

export function photo(name: PhotoName, width: number, height = width) {
  return `${unsplash(name)}?w=${width}&h=${height}&fit=crop&auto=format&q=72`;
}

/** A region of the original photo (pixels), scaled to `width` × `height`. */
export function photoRegion(name: PhotoName, [x, y, w, h]: [number, number, number, number], width: number, height: number) {
  return `${unsplash(name)}?rect=${x},${y},${w},${h}&w=${width}&h=${height}&fit=crop&auto=format&q=75`;
}

/** One side of a real coin in a photo: its center and radius in original pixels, and the turn that sets it upright. */
type CoinSide = { photo: PhotoName; cx: number; cy: number; r: number; turn: number };

export const SIDES = {
  nickelObv: { photo: 'usCoins', cx: 2611, cy: 1504, r: 292, turn: 178 },
  nickelRev: { photo: 'usCoins', cx: 2220, cy: 502, r: 290, turn: 232 },
  lireObv: { photo: 'worldCoins', cx: 1471, cy: 607, r: 246, turn: -12 },
  lireRev: { photo: 'worldCoins', cx: 1381, cy: 2198, r: 248, turn: 178 },
  cent: { photo: 'usCoins', cx: 1290, cy: 1177, r: 250, turn: 240 },
  rupee: { photo: 'worldCoins', cx: 2011, cy: 1378, r: 230, turn: 0 },
  riyals: { photo: 'worldCoins', cx: 1198, cy: 1751, r: 218, turn: 0 },
  pula: { photo: 'worldCoins', cx: 2407, cy: 531, r: 210, turn: 0 },
  meticais: { photo: 'worldCoins', cx: 1953, cy: 2184, r: 218, turn: 0 },
  southAfrica: { photo: 'worldCoins', cx: 1763, cy: 994, r: 228, turn: 0 },
} satisfies Record<string, CoinSide>;

export type SideName = keyof typeof SIDES;

export function coinSrc(side: SideName, size: number) {
  const { photo: name, cx, cy, r } = SIDES[side];
  return photoRegion(name, [cx - r, cy - r, r * 2, r * 2], size, size);
}

export type DemoCoin = {
  id: string;
  /** Short label on the example picker. */
  label: string;
  title: string;
  obverse: SideName;
  reverse: SideName;
  /** The inscription set around the hero coin: the example result, read aloud like a coin legend. */
  ring: string;
  /** The photo the coin lies in; a patch of the same table without the coin sits out of focus in the viewfinder. */
  scene: PhotoName;
  table: [number, number, number, number];
  rows: [string, string][];
  value: string;
  set: string;
};

export const DEMO_COINS: DemoCoin[] = [
  {
    id: 'nickel',
    label: 'USA · 5 cents',
    title: 'Jefferson Nickel, USA, 2002',
    obverse: 'nickelObv',
    reverse: 'nickelRev',
    ring: 'United States · 5 cents · 2002 · copper-nickel · Monticello · estimate $0.05–$0.30 · example ·',
    scene: 'usCoins',
    table: [3100, 1350, 1000, 1000],
    rows: [
      ['Country', 'United States'],
      ['Denomination', '5 cents'],
      ['Mint year', '2002'],
      ['Metal', '75% copper, 25% nickel'],
      ['History', 'Monticello design, first struck in 1938'],
    ],
    value: '$0.05 – $0.30',
    set: 'Global Coins',
  },
  {
    id: 'lire',
    label: 'Italy · 100 lire',
    title: '100 Lire, Italy, 1981',
    obverse: 'lireObv',
    reverse: 'lireRev',
    ring: 'Italy · 100 lire · 1981 · acmonital · Minerva · estimate $0.10–$0.50 · example ·',
    scene: 'worldCoins',
    table: [2150, 2550, 900, 900],
    rows: [
      ['Country', 'Italy'],
      ['Denomination', '100 lire'],
      ['Mint year', '1981'],
      ['Metal', 'Acmonital (stainless steel)'],
      ['History', 'Minerva by an olive tree, first struck in 1955'],
    ],
    value: '$0.10 – $0.50',
    set: 'World in Coins',
  },
];

/** The catalogue plate: what one result tells you, pointed out on the coin itself. */
export type PlateField = {
  id: string;
  label: string;
  value: string;
  note: string;
  /** Where on which side to circle it, in % of the coin. */
  spot: { side: 'obv' | 'rev'; x: number; y: number; r: number } | null;
};

export const PLATE_FIELDS: PlateField[] = [
  { id: 'country', label: 'Country', value: 'Italy', note: 'Read from the legend: REPVBBLICA ITALIANA.', spot: { side: 'obv', x: 27, y: 30, r: 24 } },
  { id: 'denomination', label: 'Denomination', value: '100 lire', note: 'The face value struck on the coin.', spot: { side: 'rev', x: 24, y: 55, r: 16 } },
  { id: 'year', label: 'Mint year', value: '1981', note: 'The year it was struck.', spot: { side: 'rev', x: 47, y: 89, r: 11 } },
  { id: 'metal', label: 'Metal', value: 'Acmonital', note: 'A stainless steel alloy, not silver.', spot: { side: 'obv', x: 50, y: 50, r: 50 } },
  { id: 'history', label: 'History', value: 'Minerva', note: 'Minerva beside an olive tree, a design first struck in 1955.', spot: { side: 'rev', x: 66, y: 46, r: 26 } },
  { id: 'value', label: 'Price estimate', value: '$0.10 – $0.50', note: 'Example. Prices move with condition and the market.', spot: null },
];

export const STEPS: { title: string; text: string; side: SideName; mark: 'frame' | 'flip' | 'match' | 'file' }[] = [
  { title: 'Shoot the front', text: 'Center the coin in the frame and take a photo of the obverse.', side: 'nickelObv', mark: 'frame' },
  { title: 'Flip it over', text: 'Take a photo of the reverse. The app matches both sides.', side: 'nickelRev', mark: 'flip' },
  { title: 'Read the card', text: 'Best matches from a global database, with year, country, metal and a price estimate.', side: 'lireRev', mark: 'match' },
  { title: 'File it', text: 'Add it to a collection, write a note, sort it into a set.', side: 'rupee', mark: 'file' },
];

export const USE_CASES: { title: string; text: string; photo: PhotoName }[] = [
  { title: 'The change jar', text: 'Tip it out and scan the ones that look different: old dates, foreign coins, odd metals.', photo: 'changeJar' },
  { title: 'Coins from old trips', text: 'Pesetas, escudos, schillings, lire: put a name and a year on the holiday change in the drawer.', photo: 'tripCoins' },
  { title: 'Flea markets', text: 'Check a coin on the spot, before you pay for it.', photo: 'fleaMarket' },
  { title: 'An inherited box', text: 'Go through a relative’s coins one at a time and keep a note on each.', photo: 'examining' },
];

/** Labels pinned on the world-coins photo; positions in % of the cropped region. */
export const TRAY_REGION: [number, number, number, number] = [0, 250, 3164, 2050];

export const TRAY_TAGS: { name: string; detail: string; x: number; y: number }[] = [
  { name: 'Botswana', detail: '2007', x: 76.1, y: 13.7 },
  { name: 'Italy', detail: '100 lire', x: 46.5, y: 17.4 },
  { name: 'South Africa', detail: '1994', x: 55.7, y: 36.3 },
  { name: 'Mauritius', detail: '1 rupee · 1993', x: 63.6, y: 55 },
  { name: 'Saudi Arabia', detail: '2 riyals · 2016', x: 37.9, y: 73.2 },
  { name: 'Mozambique', detail: '10 meticais', x: 61.7, y: 94.3 },
];

/** Collection sets, named after the app's own examples in its screenshots. */
export const SETS: { name: string; coins: SideName[] }[] = [
  { name: 'Global Coins', coins: ['nickelObv', 'cent', 'riyals', 'rupee'] },
  { name: 'World in Coins', coins: ['pula', 'meticais', 'southAfrica', 'lireRev'] },
  { name: 'Past Treasures', coins: ['lireObv', 'nickelRev', 'rupee', 'cent'] },
];

/** What the collection keeps, from the listing ("add notes, sort by categories, build multiple sets"). */
export const LEDGER: [string, string][] = [
  ['Sets', 'Build as many as you like'],
  ['Notes', 'On any coin'],
  ['Categories', 'Sort your way'],
  ['History', 'Every scan kept'],
];

export const HISTORY: { side: SideName; name: string; meta: string }[] = [
  { side: 'lireObv', name: '100 Lire', meta: 'Italy, 1981' },
  { side: 'nickelObv', name: 'Jefferson Nickel', meta: 'USA, 2002' },
  { side: 'rupee', name: '1 Rupee', meta: 'Mauritius, 1993' },
  { side: 'riyals', name: '2 Riyals', meta: 'Saudi Arabia, 2016' },
];

export const FAQ = [
  {
    question: 'How does it identify a coin?',
    answer: 'Take a photo of both sides. The app matches them with entries in a global coin database and shows you the best matches.',
  },
  {
    question: 'Will it tell me what my coin is worth?',
    answer:
      'It shows market values and price estimates, so you know roughly what a coin might be worth. They are a guide: condition and the market decide what someone pays.',
  },
  {
    question: 'What details do I get?',
    answer: 'Mint year, country of origin, metal composition, denomination and historical background.',
  },
  {
    question: 'Does it know coins from other countries?',
    answer: 'Yes. It covers coins from the United States, Europe, Asia and many other regions.',
  },
  {
    question: 'Can I organize my collection?',
    answer: 'Create collections, add notes, sort by categories and build multiple sets. Every scan is kept in your history.',
  },
  {
    question: 'I know nothing about coins. Is it for me?',
    answer: 'Yes. It is made for beginners as much as for serious numismatists: point, shoot both sides, read the card.',
  },
  {
    question: 'How do I get access after paying?',
    answer: 'Right after checkout we show you how to get Coin Scanner with your subscription unlocked.',
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
