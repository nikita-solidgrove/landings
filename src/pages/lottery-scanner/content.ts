// Facts come from the App Store listing and the app's own screenshots
// (see creatives/apps/lottery-scanner/NOTES.md). Tickets, draws and jackpots on the page are
// examples: the draws and jackpots are the ones the app shows in its App Store screenshots.

export const APP = {
  name: 'Lottery Scanner',
  /** Name on the US App Store; other storefronts list it as "Lottery Scanner & Checker App". */
  storeName: 'Lottery Ticket Scanner Results',
  altStoreName: 'Lottery Scanner & Checker App',
  developer: 'PaoApps',
  legalName: 'PAO APPS PTE. LTD.',
  iconUrl:
    'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/a9/ee/69/a9ee6901-b2ca-a744-5429-49c15170c4a0/Placeholder.mill/256x256bb.webp',
  privacyUrl: 'https://www.getpaoapps.com/privacy',
  termsUrl: 'https://www.getpaoapps.com/terms',
};

const shot = (path: string) => `https://is1-ssl.mzstatic.com/image/thumb/${path}/600x0w.webp`;

/**
 * The app's App Store screenshots with our own captions. Screenshot 5 ("Know Your Chances Before
 * You Play") is left out: its game rules and prices are out of date and it reads as an odds claim.
 */
export const SCREENSHOTS = [
  {
    url: shot('PurpleSource221/v4/45/af/86/45af8612-43c7-c52c-7d9a-460a96a4e7c2/EN-13Pro-2.jpg'),
    caption: 'Scan the ticket',
  },
  {
    url: shot('PurpleSource211/v4/11/53/98/11539871-c391-eac2-2e1f-43b687f88590/EN-13Pro-1.jpg'),
    caption: 'Every line checked',
  },
  {
    url: shot('PurpleSource211/v4/e7/1a/85/e71a8501-a3c5-3221-6320-a86fd546bb84/EN-13Pro-4.jpg'),
    caption: 'Jackpots and results',
  },
  {
    url: shot('PurpleSource211/v4/7d/5f/4e/7d5f4efd-1b04-e51c-86f0-e80a0add833e/EN-13Pro-3.jpg'),
    caption: 'Type numbers by hand',
  },
  {
    url: shot('PurpleSource221/v4/e4/35/6e/e4356e28-d677-80e1-3b79-f0f6788dca5a/EN-13Pro-6.jpg'),
    caption: 'Generate a line',
  },
];

// Free Unsplash photos (Unsplash License), cropped by the CDN to the size each spot needs.
const PHOTO_IDS = {
  phoneTicket: '1758631516577-eb1150965a75',
  playSlip: '1769162019571-8092c59573ca',
  ticketPile: '1715520928476-cd350276d96e',
  cornerStore: '1765741836929-af2f9e1968e8',
};

export type PhotoName = keyof typeof PHOTO_IDS;

/** Where the CDN should crop, for photos whose subject is off-center. */
const FOCUS: Partial<Record<PhotoName, string>> = {
  phoneTicket: '&crop=focalpoint&fp-x=0.42&fp-y=0.6&fp-z=1.5',
};

export function photo(name: PhotoName, width: number, height = width) {
  return `https://images.unsplash.com/photo-${PHOTO_IDS[name]}?w=${width}&h=${height}&fit=crop${FOCUS[name] ?? ''}&auto=format&q=72`;
}

/* ---------- Games, draws and example tickets ---------- */

export type GameId = 'megaMillions' | 'powerball';

export const GAMES: Record<GameId, { name: string; ball: string; ballShort: string }> = {
  megaMillions: { name: 'Mega Millions', ball: 'Mega Ball', ballShort: 'MB' },
  powerball: { name: 'Powerball', ball: 'Powerball', ballShort: 'PB' },
};

export type Draw = { numbers: number[]; ball: number };

/** Latest draws and jackpots as the app shows them in its App Store screenshots. */
export const SAMPLE_DRAWS: Record<GameId, Draw & { jackpot: string }> = {
  powerball: { numbers: [12, 36, 41, 52, 65], ball: 9, jackpot: '$452M' },
  megaMillions: { numbers: [5, 9, 18, 24, 42], ball: 15, jackpot: '$178M' },
};

export type TicketLine = { label: string; numbers: number[]; ball: number };

export type DemoTicket = { game: GameId; lines: TicketLine[] };

export const DEMO_TICKETS: DemoTicket[] = [
  {
    game: 'megaMillions',
    lines: [
      // Line A is the ticket the app scans in its own App Store screenshot.
      { label: 'A', numbers: [3, 5, 29, 40, 58], ball: 12 },
      { label: 'B', numbers: [9, 18, 33, 47, 66], ball: 15 },
      { label: 'C', numbers: [11, 24, 38, 52, 70], ball: 3 },
    ],
  },
  {
    game: 'powerball',
    lines: [
      { label: 'A', numbers: [7, 12, 28, 52, 64], ball: 4 },
      { label: 'B', numbers: [3, 19, 33, 47, 60], ball: 21 },
    ],
  },
];

export type LineResult = { matched: boolean[]; ballMatched: boolean; count: number; wins: boolean; label: string };

/**
 * Matches one line against a draw. In both games a line pays with three or more main numbers, or
 * with the special ball (alone or with fewer numbers). Prize amounts are left to the app.
 */
export function checkLine(line: TicketLine, draw: Draw, game: GameId): LineResult {
  const matched = line.numbers.map((n) => draw.numbers.includes(n));
  const count = matched.filter(Boolean).length;
  const ballMatched = line.ball === draw.ball;
  const wins = count >= 3 || ballMatched;
  const ball = GAMES[game].ball;
  const label = ballMatched ? (count ? `${count} + ${ball}` : `${ball} only`) : count >= 3 ? `${count} numbers` : 'No prize';
  return { matched, ballMatched, count, wins, label };
}

export const pad = (n: number) => String(n).padStart(2, '0');

/* ---------- Page copy ---------- */

/** Printed fields along the bottom of the hero ticket: the plain-text proof points. */
export const HERO_FIELDS = [
  { label: 'Entry', value: 'Camera or by hand' },
  { label: 'Results', value: 'After each draw' },
  { label: 'Ads', value: 'None' },
];

export const STEPS = [
  { title: 'Tap Scan Ticket', text: 'Open the app and select Scan Ticket.' },
  { title: 'Point your camera', text: 'Hold your Powerball or Mega Millions ticket inside the frame.' },
  { title: 'See every line', text: 'Results show up instantly, with every matching number marked.' },
];

/** The play slip in the manual-entry panel: line A of the Powerball example ticket. */
export const SLIP = { game: 'powerball' as GameId, numbers: [7, 12, 28, 52, 64], ball: 4, pool: 69, ballPool: 26 };

/** The jackpot sign: games in the order the app lists them, with the example's next drawing. */
export const BOARD: { game: GameId; next: string }[] = [
  { game: 'powerball', next: 'Saturday' },
  { game: 'megaMillions', next: 'Friday' },
];

/** Example history on the receipt. Most checks end with no prize, as most tickets do. */
export const HISTORY = [
  { game: 'Mega Millions', detail: 'Scanned · 3 lines', result: '1 winning line', win: true },
  { game: 'Powerball', detail: 'Scanned · 2 lines', result: 'No prize', win: false },
  { game: 'Powerball', detail: 'Typed in · 1 line', result: 'No prize', win: false },
];

export const USE_CASES: { title: string; text: string; photo: PhotoName }[] = [
  {
    title: 'The one in your wallet',
    text: 'Check it on the way to work instead of reading numbers off a website.',
    photo: 'phoneTicket',
  },
  {
    title: 'The office pool pile',
    text: 'Scan the tickets one after another. Every check lands in your history.',
    photo: 'ticketPile',
  },
  {
    title: 'Your regular numbers',
    text: 'Pick the game and the drawing date, type the lines and check them.',
    photo: 'playSlip',
  },
  {
    title: 'The corner store ticket',
    text: 'Scan it before you toss it, so nothing goes out with the receipts.',
    photo: 'cornerStore',
  },
];

export const FEATURES = [
  'Scan tickets with your camera',
  'Latest results after each draw',
  'Jackpots and next draw dates',
  'Drawing history and past checks',
  'Manual number entry',
  'No ads',
];

export const FAQ = [
  {
    question: 'Which lotteries does it check?',
    answer: 'Powerball and Mega Millions. Scan the ticket or type the numbers in, and the app checks every line against the draw.',
  },
  {
    question: 'How does scanning work?',
    answer: 'Open the app, tap Scan Ticket and point your camera at the ticket. The results show up right away, with each matching number marked.',
  },
  {
    question: 'What if my ticket won’t scan?',
    answer: 'Enter it by hand: pick the game and the drawing date, add your lines and check them the same way.',
  },
  {
    question: 'Can I see jackpots and past results?',
    answer: 'Yes. The app shows the current Powerball and Mega Millions jackpots with the next draw dates, the latest winning numbers, past drawings and the tickets you already checked.',
  },
  {
    question: 'What do I do with a winning ticket?',
    answer: 'The app only checks numbers. As the result screen reminds you, winning tickets must be redeemed in the state or jurisdiction where they were sold.',
  },
  {
    question: 'Are there ads?',
    answer: 'No. The app is ad-free.',
  },
  {
    question: 'How do I get access after paying?',
    answer: `Right after checkout we show you how to get ${APP.name} with your subscription unlocked.`,
  },
  {
    question: 'Which devices does it work on?',
    answer: 'iPhone with iOS 17.0 or later.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes. Cancel from your account, and you keep access until the paid period ends.',
  },
];
