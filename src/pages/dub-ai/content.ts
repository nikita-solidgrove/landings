// Facts come from the App Store listing (see creatives/apps/dub-ai/NOTES.md).
// Languages are the ones the app's own screenshots name. Every video line and subtitle on the page
// is an illustration and is labelled "Example".

export const APP = {
  name: 'Dub AI',
  fullName: 'Dub AI: Lip Sync・Video Dubbing',
  developer: 'PaoApps',
  legalName: 'PAO APPS PTE. LTD.',
  iconUrl:
    'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/95/92/aa/9592aaf8-86ae-e4a6-44a3-758e2c689a84/Placeholder.mill/256x256bb.webp',
  privacyUrl: 'https://www.getpaoapps.com/privacy',
  termsUrl: 'https://www.getpaoapps.com/terms',
};

const shot = (path: string) => `https://is1-ssl.mzstatic.com/image/thumb/${path}/600x0w.webp`;

/** The App Store page's iPhone screenshots, in the order the steps use them. */
export const SCREENSHOTS = {
  input: shot('PurpleSource211/v4/5d/11/fb/5d11fbaa-e959-aa8f-e67d-f1e52e4947b6/EN-13Pro-5.png'),
  languages: shot('PurpleSource221/v4/e9/4f/8a/e94f8a33-e18e-f20a-c83a-7d6361215aaf/EN-13Pro-2.png'),
  lipSync: shot('PurpleSource221/v4/da/00/ae/da00aea7-4a5e-0c07-ccfe-0dd1ccc7a9b2/EN-13Pro-3.png'),
  captions: shot('PurpleSource221/v4/9d/f8/7a/9df87aeb-6f34-3b9b-83b4-4c93a24e7ad9/EN-13Pro-4.png'),
};

// Free Unsplash photos (Unsplash License), cropped by the CDN to the size each spot needs.
const PHOTO_IDS = {
  creator: '1758273706454-b85bc7796b5e',
  vlogger: '1758874573052-4499233b02a4',
  teacher: '1758273705961-9766016f5169',
  business: '1758874384113-4059f76860c5',
  travel: '1530789253388-582c481c54b0',
};

export type PhotoName = keyof typeof PHOTO_IDS;

export function photo(name: PhotoName, width: number, height = width) {
  return `https://images.unsplash.com/photo-${PHOTO_IDS[name]}?w=${width}&h=${height}&fit=crop&auto=format&q=72`;
}

/** The creator's frame is always requested at 9:16, so the mouth sits at the same spot (54.5% / 50%). */
export const creatorFrame = (width: number) => photo('creator', width, Math.round((width * 16) / 9));

/** The hero shot is the same creator photo uncropped at 16:9 (mouth at 50.9% / 49.3%); CSS letterboxes it. */
export const heroShot = (width: number) => photo('creator', width, Math.round((width * 9) / 16));

/**
 * The hero headline is a burned-in subtitle that is re-dubbed into each language the app's screenshots
 * name. "Your Voice in Any Language" is a heading of the App Store description.
 */
export const HEADLINE: { code: string; name: string; lang: string; text: string }[] = [
  { code: 'EN', name: 'English', lang: 'en', text: 'Your video. Your voice. Any language.' },
  { code: 'ES', name: 'Spanish', lang: 'es', text: 'Tu video. Tu voz. Cualquier idioma.' },
  { code: 'FR', name: 'French', lang: 'fr', text: 'Ta vidéo. Ta voix. Toutes les langues.' },
  { code: 'PT', name: 'Portuguese', lang: 'pt', text: 'Seu vídeo. Sua voz. Qualquer idioma.' },
  { code: 'JA', name: 'Japanese', lang: 'ja', text: 'あなたの動画。あなたの声。どんな言語でも。' },
  { code: 'DE', name: 'German', lang: 'de', text: 'Dein Video. Deine Stimme. Jede Sprache.' },
  { code: 'HI', name: 'Hindi', lang: 'hi', text: 'आपका वीडियो। आपकी आवाज़। कोई भी भाषा।' },
  { code: 'SV', name: 'Swedish', lang: 'sv', text: 'Din video. Din röst. Vilket språk som helst.' },
];

/** End credits: every line is a listing fact, set as a film's crawl. */
export const CREDITS: { role: string; names: string[] }[] = [
  { role: 'Directed by', names: ['You'] },
  { role: 'Voice', names: ['Your own, in a new language'] },
  { role: 'Lip sync', names: ['Matched to the translated audio'] },
  { role: 'Subtitles', names: ['One click'] },
  {
    role: 'Languages',
    names: ['English · Spanish · French', 'Portuguese · Japanese · German', 'Hindi · Swedish · and more'],
  },
  { role: 'Footage', names: ['Recorded in the app', 'From your library', 'From a link'] },
  { role: 'Made for', names: ['Content creators', 'Educators', 'Business teams', 'Your personal videos'] },
  { role: 'Runs on', names: ['iPhone with iOS 15.0 or later', 'Mac with Apple M1 or later'] },
  { role: 'Developed by', names: ['PAO APPS PTE. LTD.'] },
];

export type Language = {
  code: string;
  name: string;
  /** Subtitle cues, each a list of words that light up as they are "spoken". */
  cues: string[][];
  /** Japanese is written without spaces between words. */
  joiner?: string;
};

/**
 * The example clip's line ("Hey guys! Today I'm showing you my morning routine.") in the languages the
 * app's screenshots show (Select Language, captions).
 */
export const DUBS: Language[] = [
  {
    code: 'ES',
    name: 'Spanish',
    cues: [
      ['¡Hola', 'a', 'todos!'],
      ['Hoy', 'les', 'muestro', 'mi', 'rutina', 'de', 'la', 'mañana.'],
    ],
  },
  {
    code: 'FR',
    name: 'French',
    cues: [
      ['Salut', 'tout', 'le', 'monde !'],
      ['Aujourd’hui,', 'je', 'vous', 'montre', 'ma', 'routine', 'du', 'matin.'],
    ],
  },
  {
    code: 'PT',
    name: 'Portuguese',
    cues: [
      ['Oi,', 'gente!'],
      ['Hoje', 'vou', 'mostrar', 'a', 'minha', 'rotina', 'da', 'manhã.'],
    ],
  },
  {
    code: 'JA',
    name: 'Japanese',
    joiner: '',
    cues: [
      ['みんな、', 'こんにちは！'],
      ['今日は', '私の', 'モーニング', 'ルーティンを', '紹介します。'],
    ],
  },
  {
    code: 'DE',
    name: 'German',
    cues: [
      ['Hallo', 'zusammen!'],
      ['Heute', 'zeige', 'ich', 'euch', 'meine', 'Morgenroutine.'],
    ],
  },
  {
    code: 'HI',
    name: 'Hindi',
    cues: [
      ['नमस्ते', 'दोस्तों!'],
      ['आज', 'मैं', 'आपको', 'अपनी', 'सुबह', 'की', 'दिनचर्या', 'दिखाती', 'हूँ।'],
    ],
  },
  {
    code: 'SV',
    name: 'Swedish',
    cues: [
      ['Hej', 'allihop!'],
      ['Idag', 'visar', 'jag', 'min', 'morgonrutin.'],
    ],
  },
];

export const USE_CASES: {
  who: string;
  title: string;
  text: string;
  photo: PhotoName;
  from: string;
  to: string;
  lang: string;
  subtitle: string;
}[] = [
  {
    who: 'Creators',
    title: 'Grow fans abroad',
    text: 'Post the same video for viewers who speak Spanish or Portuguese.',
    photo: 'vlogger',
    from: 'EN',
    to: 'ES',
    lang: 'es',
    subtitle: '¡Sígueme para la segunda parte!',
  },
  {
    who: 'Educators',
    title: 'Teach it once',
    text: 'Turn one lesson into French, German or Hindi versions.',
    photo: 'teacher',
    from: 'EN',
    to: 'FR',
    lang: 'fr',
    subtitle: 'Aujourd’hui, on apprend les bases.',
  },
  {
    who: 'Business',
    title: 'Talk to every market',
    text: 'Product demos and updates your clients hear in their language.',
    photo: 'business',
    from: 'EN',
    to: 'DE',
    lang: 'de',
    subtitle: 'Das ist neu in diesem Monat.',
  },
  {
    who: 'Personal videos',
    title: 'Send it home',
    text: 'Share trip videos with family in the language they speak.',
    photo: 'travel',
    from: 'EN',
    to: 'PT',
    lang: 'pt',
    subtitle: 'Mãe, olha onde a gente está!',
  },
];

export const STEPS: { title: string; text: string; shot: keyof typeof SCREENSHOTS }[] = [
  { title: 'Choose your video', text: 'Record a new one, pick it from your library or add it from a link.', shot: 'input' },
  {
    title: 'Pick a language',
    text: 'English, Spanish, French, Portuguese, Japanese, German, Hindi, Swedish and more.',
    shot: 'languages',
  },
  {
    title: 'Let Dub AI dub it',
    text: 'It translates what you say, keeps your voice and matches your lips to the new audio.',
    shot: 'lipSync',
  },
  {
    title: 'Add captions and share',
    text: 'Switch on subtitles in one click, then download the video or share it from the app.',
    shot: 'captions',
  },
];

export const FAQ = [
  {
    question: 'Will it still sound like me?',
    answer: 'Yes. Dub AI keeps the unique sound of your voice while you speak the new language.',
  },
  {
    question: 'Does it match my lips?',
    answer:
      'Yes. Dub AI matches your lip movements to the translated audio, so the result looks natural instead of dubbed.',
  },
  {
    question: 'Which languages can I dub into?',
    answer:
      'English, Spanish, French, Portuguese, Japanese, German, Hindi, Swedish and more. You pick the language for each video.',
  },
  {
    question: 'Which videos can I use?',
    answer: 'Record a video in the app, choose one from your library or add one from a link.',
  },
  {
    question: 'Can I add subtitles?',
    answer: 'Yes. Turn on captions in one click to make your video easier to follow and reach a wider audience.',
  },
  {
    question: 'How do I get access after paying?',
    answer: 'Right after checkout we show you how to get Dub AI with your subscription unlocked.',
  },
  {
    question: 'Which devices does it work on?',
    answer: 'iPhone with iOS 15.0 or later. The App Store also lists it for Macs with an Apple M1 chip or later.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes. Cancel from your account, and you keep access until the paid period ends.',
  },
];
