// Facts come from the App Store listing (see creatives/apps/ai-song-generator/NOTES.md).
// Song examples in the demo are illustrations and are labelled as such on the page.

export const APP = {
  name: 'AI Song Generator',
  developer: 'Belkalabs',
  legalName: 'BELKALABS PTE. LTD.',
  iconUrl:
    'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/7d/6c/ed/7d6ced1c-2753-5b54-84ee-a87010653d77/Placeholder.mill/256x256bb.webp',
  privacyUrl: 'https://www.belkalabs.com/privacy',
  termsUrl: 'https://www.belkalabs.com/terms',
};

const shot = (path: string) => `https://is1-ssl.mzstatic.com/image/thumb/${path}/600x0w.webp`;

export const SCREENSHOTS = [
  shot('PurpleSource211/v4/a0/fc/a8/a0fca8fc-9294-039c-1a23-a7b589bea7c9/iPhones__6.5-01.png'),
  shot('PurpleSource221/v4/5a/8b/03/5a8b0307-caa0-8cce-92c1-f55757187be8/iPhones__6.5-02.png'),
  shot('PurpleSource221/v4/d7/35/cc/d735cc37-4eba-53eb-6f14-a86edf7a9e83/iPhones__6.5-03.png'),
  shot('PurpleSource211/v4/b8/7f/b7/b87fb73f-c76e-2fd7-b618-cbc17cc14ab2/iPhones__6.5-04.png'),
  shot('PurpleSource211/v4/e8/34/f0/e834f024-61f0-df11-4fa5-b5d993f37d49/iPhones__6.5-05.png'),
  shot('PurpleSource211/v4/0b/6f/c8/0b6fc8dd-8687-498e-8337-c0d8bcda0511/iPhones__6.5-06.png'),
];

export const GENRES = ['Pop', 'Hip-Hop', 'R&B', 'Rock', 'EDM', 'Country', 'Jazz', 'Latin', 'Afrobeat', 'Classical'];

// Free Unsplash photos (Unsplash License), cropped by the CDN to the size each spot needs.
const PHOTO_IDS = {
  starryCity: '1647120295899-2364e53e3fe3',
  sunsetWalk: '1496275068113-fff8c90750d1',
  sunsetJump: '1573269354259-8c108692afa1',
  journal: '1712229461978-ce728be7adf0',
  writing: '1612414982193-a59247a2f974',
  notebook: '1726377362206-4ee44eff5646',
  momGift: '1752652012237-ba62a2c65a76',
  filming: '1653343860663-02bc74f017ed',
  roadTrip: '1564415051543-cb73a7468103',
  listening: '1625786682948-2168238883d2',
  concert: '1603910234616-3b5f4a6be2b4',
};

export type PhotoName = keyof typeof PHOTO_IDS;

export function photo(name: PhotoName, width: number, height = width) {
  return `https://images.unsplash.com/photo-${PHOTO_IDS[name]}?w=${width}&h=${height}&fit=crop&auto=format&q=72`;
}

/** Photos between the genres in the ticker. */
export const TICKER_PHOTOS: PhotoName[] = ['listening', 'sunsetJump', 'concert', 'starryCity', 'filming'];

export type Mode = 'lyrics' | 'smart' | 'image';

export type DemoSong = {
  mode: Mode;
  prompt: string;
  chips: string[];
  title: string;
  meta: string;
  cover: PhotoName;
  lyrics: string[];
};

export const DEMO_SONGS: DemoSong[] = [
  {
    // The app's own example from its App Store screenshots.
    mode: 'smart',
    prompt: 'a dreamy pop song about stargazing with someone you love',
    chips: ['Pop', 'Vocals', 'Random voice'],
    title: 'Counting Stars with You',
    meta: 'Pop · Vocals',
    cover: 'starryCity',
    lyrics: [
      'We’re lying on the rooftop, city fast asleep',
      'The sky is telling secrets only we can keep',
      'A quiet breeze is calling out your name',
    ],
  },
  {
    mode: 'lyrics',
    prompt: 'I wrote it on a napkin the night you said goodbye',
    chips: ['Acoustic', 'Soft vocals', 'Piano'],
    title: 'Napkin Song',
    meta: 'Acoustic · Vocals',
    cover: 'journal',
    lyrics: [
      'I wrote it on a napkin',
      'the night you said goodbye',
      'and now I hear it sung',
    ],
  },
  {
    mode: 'image',
    prompt: 'beach_sunset.jpg',
    chips: ['Chill pop', 'Vocals', 'Full band'],
    title: 'Golden Hour',
    meta: 'Chill pop · Vocals',
    cover: 'sunsetWalk',
    lyrics: [
      'Salt in our hair and the sun going down',
      'Turn up the radio, nobody’s around',
      'We’ll call it forever, this golden hour',
    ],
  },
];

export const MODE_LABELS: Record<Mode, { tab: string; field: string }> = {
  lyrics: { tab: 'Lyrics', field: 'Your lyrics' },
  smart: { tab: 'Smart', field: 'Describe your song' },
  image: { tab: 'Image', field: 'Your photo' },
};

export const USE_CASES: { tag: string; title: string; prompt: string; tone: 'coral' | 'violet' | 'butter' | 'ink'; photo: PhotoName }[] = [
  { tag: 'A gift', title: 'For mom’s birthday', prompt: 'a warm birthday song for my mom, with her name in the chorus', tone: 'coral', photo: 'momGift' },
  { tag: 'For creators', title: 'For your next Reel', prompt: 'an upbeat summer track for my city vlog', tone: 'violet', photo: 'filming' },
  { tag: 'For writers', title: 'For your poem', prompt: 'my poem as a slow piano ballad', tone: 'butter', photo: 'notebook' },
  { tag: 'A memory', title: 'For one photo', prompt: 'the picture from our road trip, as a song', tone: 'ink', photo: 'roadTrip' },
];

export const FAQ = [
  {
    question: 'Do I need any musical experience?',
    answer: 'Not at all. Type a few words, describe an idea or pick a photo, and the app writes, composes and sings the track.',
  },
  {
    question: 'How long does it take to make a song?',
    answer: 'Usually under a minute from tapping Create to a finished track, and you can watch the song update while it is being generated.',
  },
  {
    question: 'What if I don’t know what to write about?',
    answer: 'Use Song Idea in Smart Mode. The app suggests a creative concept to get you started.',
  },
  {
    question: 'How does Image Mode work?',
    answer: 'The AI reads the mood, colors and emotion in your photo, then creates a song with vocals, lyrics and the instruments you choose.',
  },
  {
    question: 'Can I share my songs?',
    answer: 'Yes. Every song is saved in your library. Download it or share it to TikTok, Instagram Reels, YouTube Shorts, Stories or any messenger.',
  },
  {
    question: 'How do I get access after paying?',
    answer: 'Right after checkout we show you how to get AI Song Generator with your subscription unlocked.',
  },
  {
    question: 'Which devices does it work on?',
    answer: 'iPhone and iPad with iOS 17.6 or later.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes. Cancel from your account, and you keep access until the paid period ends.',
  },
];
