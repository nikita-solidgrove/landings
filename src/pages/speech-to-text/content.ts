// Facts come from the App Store listing (see creatives/apps/speech-to-text/NOTES.md).
// Transcripts in the demo and the photo captions are illustrations and are labelled "Example".

export const APP = {
  name: 'Speech to Text',
  fullName: 'Speech to Text – Voice Typing',
  developer: 'PaoApps',
  legalName: 'PAO APPS PTE. LTD.',
  // The App Store page serves this icon (the lookup's artworkUrl512 is another asset of the same design).
  iconUrl:
    'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/ab/1f/30/ab1f3002-eae6-cc00-4a4a-61a4d513a740/Placeholder.mill/256x256bb.webp',
  privacyUrl: 'https://www.getpaoapps.com/privacy',
  termsUrl: 'https://www.getpaoapps.com/terms',
};

const shot = (path: string) => `https://is1-ssl.mzstatic.com/image/thumb/${path}/600x1300bb.webp`;

export const SCREENSHOTS = [
  shot('PurpleSource221/v4/8b/4f/00/8b4f00fa-2853-8742-45d9-ef48f7261686/EN-13Pro-0.jpg'),
  shot('PurpleSource221/v4/8f/12/2a/8f122aca-1ae7-e3a9-0231-a98c15606c21/EN-13Pro-1.png'),
  shot('PurpleSource221/v4/57/50/d0/5750d04b-33d5-85e8-ab7c-71006ff4998e/EN-13Pro-2.png'),
  shot('PurpleSource211/v4/a5/b5/d2/a5b5d261-1b60-2618-5a0c-4365ad729940/e9f83665-ae8e-4285-b6b2-1da9b7896203_EN-13Pro-3.png'),
  shot('PurpleSource221/v4/f7/f7/46/f7f746bf-6ce6-5c77-47ef-8447090ba3f2/86a0fae2-b92b-4b05-bce2-2d16b128249e_EN-13Pro-4.png'),
  shot('PurpleSource221/v4/30/8c/0d/308c0de8-6035-7207-b4bc-c482df286964/ee242609-db8d-46c5-80bc-14d72f8d0119_EN-13Pro-5.png'),
];

/** Short captions, taken from the titles printed on the App Store screenshots. */
export const SCREENSHOT_CAPTIONS = ['Voice typing', 'Your transcripts', 'Any source', 'Export', 'Into English', 'Languages'];

export const SCREENSHOT_ALTS = [
  'Speech to Text Voice Typing: a live recording turning into text',
  'Voice Memos to Text Transcriber: the library of transcripts',
  'Easily Transcribe from Any Source: recorder, files, voice memos, video, URL',
  'Export Your Transcriptions: TXT, PDF, DOCX, SRT',
  'Convert Audio to English Text: Spanish speech transcribed into English',
  'Choose from Multiple Languages: the language list',
];

// Free Unsplash photos (Unsplash License), cropped by the CDN to the size each spot needs.
const PHOTO_IDS = {
  caller: '1508480408285-812f971170b3',
  business: '1758525589763-b9ad2a75bfe8',
  lecture: '1758270705067-0d7edee57af0',
  podcast: '1559523161-0fc0d8b38a7a',
  filming: '1557804506-e969d7b32a4b',
};

export type PhotoName = keyof typeof PHOTO_IDS;

export function photo(name: PhotoName, width: number, height = width) {
  return `https://images.unsplash.com/photo-${PHOTO_IDS[name]}?w=${width}&h=${height}&fit=crop&crop=faces,center&auto=format&q=72`;
}

/** Ways in, named as in the app's "Transcribe More" screen and the listing. */
export const SOURCES = [
  { label: 'Live recording', text: 'Speak and watch your words appear instantly.', meta: 'Voice typing · Meetings · Lectures' },
  { label: 'Audio files', text: 'Upload recordings from your device.', meta: 'MP3 · WAV · M4A and more' },
  { label: 'Voice memos', text: 'Turn voice memos into text in seconds.', meta: 'Notes · Interviews' },
  { label: 'Video files', text: 'Pick a video and get the transcript or subtitles.', meta: 'Transcript · SRT subtitles' },
  { label: 'Links', text: 'Transcribe straight from an online source.', meta: 'YouTube · Podcasts' },
];

/** Languages visible in the app's own language list; the listing says 90+ in total. */
export const LANGUAGES = ['English (US)', 'Mandarin', 'Spanish', 'Hindi', 'French', 'English (UK)'];

export const FORMATS = [
  { ext: 'TXT', use: 'Paste anywhere' },
  { ext: 'PDF', use: 'Share or print' },
  { ext: 'DOCX', use: 'Edit in Word' },
  { ext: 'SRT', use: 'Video subtitles' },
] as const;

export type Format = (typeof FORMATS)[number]['ext'];

export type SceneLine = {
  /** Speaker label (speaker identification) or a subtitle time code. */
  label?: string;
  /** Original speech when the scene translates into English. */
  original?: string;
  text: string;
};

export type Scene = {
  tab: string;
  title: string;
  status: string;
  lines: SceneLine[];
  format: Format;
};

export const SCENES: Scene[] = [
  {
    // The app's own example from its first App Store screenshot ("Podcast Ideas").
    tab: 'Voice typing',
    title: 'Podcast Ideas',
    status: 'English (US)',
    lines: [
      {
        text: 'You know, I’ve been thinking a lot lately about how we often overlook the value of simple conversations. No script, no outline, just thoughts as they come.',
      },
    ],
    format: 'PDF',
  },
  {
    tab: 'Meeting',
    title: 'Team call',
    status: 'Speakers identified',
    lines: [
      { label: 'Speaker 1', text: 'Can we move the launch to Friday?' },
      { label: 'Speaker 2', text: 'Friday works. I’ll send the notes right after this call.' },
      { label: 'Speaker 1', text: 'Perfect, thanks.' },
    ],
    format: 'DOCX',
  },
  {
    // The app's own example from its "Convert Audio to English Text" screenshot.
    tab: 'Video → English',
    title: 'Historia de Manhattan',
    status: 'Spanish → English',
    lines: [
      {
        label: '00:00:01',
        original: 'Los holandeses fueron los primeros europeos en colonizar Manhattan.',
        text: 'The Dutch were the first Europeans to settle Manhattan.',
      },
      {
        label: '00:00:05',
        original: 'Para protegerse de los ataques, construyeron un sólido muro de madera.',
        text: 'To protect themselves from attacks, they built a sturdy wooden wall.',
      },
    ],
    format: 'SRT',
  },
];

export type UseCase = {
  title: string;
  text: string;
  photo: PhotoName;
  /** Live-caption line shown over the photo (an illustration). */
  speaker: string;
  caption: string;
};

/** The listing's own use cases, each with a photo of the moment. */
export const USE_CASES: UseCase[] = [
  {
    title: 'Voice typing on the go',
    text: 'Voice-type emails, notes and messages hands-free, wherever you are.',
    photo: 'caller',
    speaker: 'You',
    caption: 'Running late, start without me.',
  },
  {
    title: 'Meetings and business calls',
    text: 'A live transcript of the call, with every speaker told apart.',
    photo: 'business',
    speaker: 'Speaker 1',
    caption: 'Let’s lock the launch for Friday.',
  },
  {
    title: 'Lectures into notes',
    text: 'Record the lesson, then read it back as notes.',
    photo: 'lecture',
    speaker: 'Lecturer',
    caption: 'The exam covers chapters four to six.',
  },
  {
    title: 'Interviews and podcasts',
    text: 'Clean, structured transcripts. Rename speakers before you share.',
    photo: 'podcast',
    speaker: 'Speaker 2',
    caption: 'So how did it all start?',
  },
  {
    title: 'Subtitles for videos',
    text: 'Export SRT and add captions to your video.',
    photo: 'filming',
    speaker: '00:00:04',
    caption: 'Welcome back to the channel.',
  },
];

/**
 * App Store rating (US storefront). Reviews stay off the page: the glowing ones are all from launch
 * week and read like seeded copy, and a 1★ review reports a free offer that required leaving one.
 * Quote real reviews verbatim with author here to bring the section back.
 */
export const RATING = { value: 4.6, count: 137 };

export const REVIEWS: { title: string; text: string; author: string }[] = [];

export const FAQ = [
  {
    question: 'How does voice typing work?',
    answer:
      'Tap record and speak. Your words appear on screen as you talk, ready for emails, notes, messages or documents.',
  },
  {
    question: 'Can it transcribe files, videos and links?',
    answer:
      'Yes. Upload audio or video from your device (MP3, WAV, M4A and more), add voice memos, or transcribe straight from online sources such as YouTube and podcasts.',
  },
  {
    question: 'Does it tell speakers apart?',
    answer: 'Yes. Speaker identification separates who said what, and you can rename speakers before you share the transcript.',
  },
  {
    question: 'Which languages does it support?',
    answer: 'Over 90 languages and dialects. Speech in other languages can also be translated into English.',
  },
  {
    question: 'How do I share a transcript?',
    answer: 'Export it as TXT, PDF, DOCX or SRT. SRT files work as subtitles for your videos.',
  },
  {
    question: 'How do I get access after paying?',
    answer: 'Right after checkout we show you how to get Speech to Text – Voice Typing with your subscription unlocked.',
  },
  {
    question: 'Which devices does it work on?',
    answer:
      'iPhone with iOS 16.0 or later. The App Store also lists Mac with an Apple M1 chip or later (macOS 13.0 or later) and Apple Vision Pro (visionOS 1.0 or later).',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes. Cancel from your account, and you keep access until the paid period ends.',
  },
];
