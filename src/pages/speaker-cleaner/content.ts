// Facts come from the App Store listing and the app's own App Store screenshots
// (see creatives/apps/speaker-cleaner/NOTES.md). Demo values are illustrations, labelled on the page.

export const APP = {
  name: 'Water Remover',
  fullName: 'Water Remover: Speaker Cleaner',
  developer: 'PaoApps',
  legalName: 'PAO APPS PTE. LTD.',
  iconUrl:
    'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/be/52/a6/be52a6ea-7fed-ed56-8a86-8554af337ba8/Placeholder.mill/256x256bb.webp',
  privacyUrl: 'https://www.getpaoapps.com/privacy',
  termsUrl: 'https://www.getpaoapps.com/terms',
};

const shot = (path: string) => `https://is1-ssl.mzstatic.com/image/thumb/${path}/600x0w.webp`;

/** The app's UI screenshots from the App Store page, with the app's own headline for each. */
export const SCREENSHOTS = [
  {
    url: shot('PurpleSource211/v4/73/0f/a3/730fa368-cb50-9fda-002a-b31ea8500546/EN-15Pro-4__U00281_U0029.jpg'),
    title: 'Remove water from speakers',
    text: 'Five cleaning presets, one Start button.',
  },
  {
    url: shot('PurpleSource221/v4/85/18/aa/8518aa93-5714-dd41-5e64-2a9a3fcb1198/EN-15Pro-5.jpg'),
    title: 'Try various Hz frequencies',
    text: 'Manual mode: dial the tone yourself.',
  },
  {
    url: shot('PurpleSource221/v4/0b/7e/73/0b7e7301-7f9a-d8ab-04f7-6d6a8ef2dc8e/EN-15Pro-6.jpg'),
    title: 'Test your speakers',
    text: 'Top and bottom speaker, one by one.',
  },
];

// Free Unsplash photos (Unsplash License), cropped by the CDN to the size each spot needs.
const PHOTO_IDS = {
  poolJump: '1466378284817-a6b7fd50cc68',
  poolFloat: '1567996038819-21fed9f7c27f',
  beachPhone: '1490889737678-4bad47eb1a03',
  rainPhone: '1765220066469-54d4efe41ca5',
  callOutside: '1592169813474-dd0c8e52e3bf',
  splash: '1606214554814-e8a9f97bdbb0',
};

export type PhotoName = keyof typeof PHOTO_IDS;

export function photo(name: PhotoName, width: number, height = width) {
  return `https://images.unsplash.com/photo-${PHOTO_IDS[name]}?w=${width}&h=${height}&fit=crop&auto=format&q=72`;
}

/** Cleaning presets exactly as the app's screenshots list them. */
export const PRESETS = [
  { name: 'Water Eject', time: '0:50', seconds: 50, label: '50 sec', text: 'Pulses water out of the speaker' },
  { name: 'Dust Blast', time: '1:15', seconds: 75, label: '1 min 15 sec', text: 'Sweeps dust from the speaker mesh' },
  { name: 'Deep Clean', time: '3:30', seconds: 210, label: '3 min 30 sec', text: 'Routine deep maintenance' },
  { name: 'Quick Clean', time: '0:30', seconds: 30, label: '30 sec', text: 'Daily express cleaning' },
  { name: 'AirPods Clean', time: '0:50', seconds: 50, label: '50 sec', text: 'Cleans AirPods drivers' },
];

/** Hz range of the Manual dial in the app's screenshot (the listing says tones from 0 Hz to 25 kHz). */
export const DIAL = { min: 100, max: 25000, start: 12300, step: 100 };

/** Plain-text proof points under the hero button, all from the listing and its screenshots. */
export const PROOF = ['Water and dust out', 'Tones up to 25 kHz', 'Stereo speaker test'];

export const MOMENTS: { title: string; place: string; preset: string; text: string; photo: PhotoName }[] = [
  {
    title: 'Pool day',
    place: 'Splashed, dunked, dropped',
    preset: 'Water Eject · 50 sec',
    text: 'Pulses the water out of the speaker before the next song.',
    photo: 'poolFloat',
  },
  {
    title: 'Beach day',
    place: 'Sand in the grille',
    preset: 'Dust Blast · 1 min 15 sec',
    text: 'Sweeps sand and dust from the speaker mesh.',
    photo: 'beachPhone',
  },
  {
    title: 'Caught in the rain',
    place: 'Wet walk home',
    preset: 'Quick Clean · 30 sec',
    text: 'A fast clean for everyday drops and drizzle.',
    photo: 'rainPhone',
  },
  {
    title: 'Muffled calls',
    place: 'Months of pocket dust',
    preset: 'Deep Clean · 3 min 30 sec',
    text: 'Routine deep maintenance for a speaker that sounds dull.',
    photo: 'callOutside',
  },
];

export const FAQ = [
  {
    question: 'How does it get water out of my speaker?',
    answer:
      'The app plays cleaning tones, from 0 Hz to 25 kHz, through your speaker. They dislodge water and dust from the speaker so it sounds clear and powerful again.',
  },
  {
    question: 'Which mode should I use?',
    answer:
      'Water Eject (50 sec) after water, Dust Blast (1 min 15 sec) for dust and sand, Quick Clean (30 sec) for a daily clean and Deep Clean (3 min 30 sec) for routine maintenance. Automatic mode adjusts the frequency for you; Manual mode lets you set the frequency and the duration yourself.',
  },
  {
    question: 'How do I get the best result?',
    answer: 'Place your device face down and turn the volume all the way up before you press Start.',
  },
  {
    question: 'Does it work with AirPods?',
    answer: 'Yes. AirPods Clean is its own 50-second mode that cleans the AirPods drivers.',
  },
  {
    question: 'How do I know the speakers are clear?',
    answer: 'Run the Stereo Speaker Test. It checks your top and bottom speakers so you can hear the difference.',
  },
  {
    question: 'How do I get access after paying?',
    answer: 'Right after checkout we show you how to get Water Remover with your subscription unlocked.',
  },
  {
    question: 'Which devices does it work on?',
    answer: 'iPhone with iOS 15.0 or later and iPad with iPadOS 15.0 or later.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes. Cancel from your account, and you keep access until the paid period ends.',
  },
];
