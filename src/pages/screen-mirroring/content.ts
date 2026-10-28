// Facts come from the App Store listing (see creatives/apps/screen-mirroring/NOTES.md).
// Everything in the demo (TVs found, photos, the trip page) is an illustration, labelled "Example".

export const APP = {
  name: 'Screen Mirroring',
  fullName: 'Screen Mirroring ‣ Cast to TV',
  developer: 'PaoApps',
  legalName: 'PAO APPS PTE. LTD.',
  iconUrl:
    'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/a4/3f/9c/a43f9c24-0eb6-ce0a-7a1d-6b050d1b50c5/Placeholder.mill/256x256bb.webp',
  privacyUrl: 'https://www.getpaoapps.com/privacy',
  termsUrl: 'https://www.getpaoapps.com/terms',
};

const shot = (path: string) => `https://is1-ssl.mzstatic.com/image/thumb/${path}/600x0w.webp`;

/** The App Store screenshots, in store order, with the headline each one carries. */
export const SCREENSHOTS = [
  { url: shot('PurpleSource221/v4/60/89/5b/60895bb5-fefd-32a6-4ed4-cbd96f38287e/EN-13Pro-1.jpg'), alt: 'Screen Mirroring' },
  { url: shot('PurpleSource211/v4/0b/9c/3f/0b9c3f2b-7507-b85a-cdb5-5bdd2d5d16a8/EN-13Pro-2.jpg'), alt: 'Cast Photos & Videos' },
  { url: shot('PurpleSource221/v4/62/20/66/622066ba-3fb5-f50e-8dcc-960aa0c64734/EN-13Pro-3.jpg'), alt: 'All-in-One Casting Tool' },
  { url: shot('PurpleSource221/v4/9b/ed/e9/9bede985-0624-5713-a3c8-dc66cf1c14a4/EN-13Pro-4.jpg'), alt: 'One-Tap Connection' },
  { url: shot('PurpleSource221/v4/07/37/3c/07373cbf-cd14-701b-a6bd-424c045b6bf9/EN-13Pro-5.jpg'), alt: 'Mirror Your iPhone Gallery' },
  { url: shot('PurpleSource221/v4/1e/64/43/1e64435b-76ec-8900-2beb-f703bd6083e7/EN-13Pro-6.jpg'), alt: 'Photo preview before casting' },
  { url: shot('PurpleSource221/v4/db/29/70/db297022-ac9b-ee76-6ec4-2f3a47cd809e/EN-13Pro-7.jpg'), alt: 'Video preview before casting' },
];

// Free Unsplash photos (Unsplash License), cropped by the CDN to the size each spot needs.
const PHOTO_IDS = {
  momSon: '1758598737810-7489fde716af',
  laughing: '1758611973339-faec9f953f1b',
  friendsPhone: '1551612084-0fdf19cb8f72',
  dadSon: '1758687125679-d000e186e09b',
  sisters: '1758525862267-e24d8b46741a',
  movieNight: '1758687125866-6b9d86d41cc5',
  meeting: '1676275774895-7fbba85dce94',
  livingRoom: '1604011854873-76e939ef5a5e',
  grandparents: '1632366989362-b7e202cb4fdf',
  office: '1677078611286-4d023c913878',
  lounge: '1612965607446-25e1332775ae',
  projector: '1694253987646-353954f1889d',
};

export type PhotoName = keyof typeof PHOTO_IDS;

export function photo(name: PhotoName, width: number, height = width) {
  return `https://images.unsplash.com/photo-${PHOTO_IDS[name]}?w=${width}&h=${height}&fit=crop&auto=format&q=72`;
}

/** The TVs in the demo's device list, as in the app's own "One-Tap Connection" screenshot. */
export const DEVICES = ['Hisense U7HQ', 'LG C3 OLED', 'Samsung QN90C'];
export const DEMO_TV = DEVICES[1];

/**
 * The example gallery on the demo phone; the first two photos and the video go to the TV.
 * `glow` is the light the picture throws into the room.
 */
export const GALLERY: { photo: PhotoName; glow: string; video?: string }[] = [
  { photo: 'momSon', glow: '#9cc0e4' },
  { photo: 'laughing', glow: '#f0a65a' },
  { photo: 'friendsPhone', glow: '#e08a48', video: '0:24' },
  { photo: 'dadSon', glow: '#e3a24a' },
  { photo: 'sisters', glow: '#b9c7a0' },
  { photo: 'movieNight', glow: '#d8b27a' },
  { photo: 'grandparents', glow: '#7f9cc9' },
  { photo: 'livingRoom', glow: '#d6b48c' },
  { photo: 'meeting', glow: '#c9d3e3' },
  { photo: 'office', glow: '#f07a3a' },
  { photo: 'lounge', glow: '#c8ccd2' },
  { photo: 'projector', glow: '#c7b9a1' },
];

/** Gallery items the demo casts to the TV. */
export const ON_TV = [0, 1, 2];

/** The six tiles on the app's home screen, in the app's own order and colors. */
export const FEATURES = [
  { name: 'Screen Mirroring', short: 'Your whole screen', text: 'Show your entire iPhone screen on the TV in real time: apps, games, presentations, the web.', color: '#1fae5b' },
  { name: 'Cast from Gallery', short: 'Photos and videos', text: 'Send photos and videos straight from your gallery. Travel albums, family memories, recorded clips.', color: '#d9a21b' },
  { name: 'IPTV', short: 'Live channels', text: 'Watch IPTV channels on the TV.', color: '#5a4de0' },
  { name: 'Web Video', short: 'From websites', text: 'Stream online videos from websites to the big screen.', color: '#119d8d' },
  { name: 'Web Pictures', short: 'From the web', text: 'Show pictures from the web on your TV.', color: '#b8399f' },
  { name: 'YouTube', short: 'Videos', text: 'Cast YouTube videos to your TV.', color: '#e0413a' },
];

export const USE_CASES: { title: string; text: string; photo: PhotoName }[] = [
  { title: 'Family memories', text: 'The trip album and the birthday clips, finally big enough for grandma.', photo: 'momSon' },
  { title: 'Movie night', text: 'Movies and streaming apps on the screen the whole sofa can see.', photo: 'sisters' },
  { title: 'Videos together', text: 'The YouTube video everyone has to see, without passing the phone around.', photo: 'friendsPhone' },
  { title: 'Presentations', text: 'Show slides or a website on the meeting-room TV, no cable to hunt for.', photo: 'meeting' },
];

/** How it works, each step next to the store screenshot (index into SCREENSHOTS) that shows it. */
export const STEPS = [
  {
    title: 'Tap your TV',
    text: 'With your iPhone and Smart TV on the same Wi‑Fi, the app lists the TVs it finds. Tap yours.',
    shot: 3,
  },
  {
    title: 'Pick what to show',
    text: 'Your whole screen, your gallery, YouTube, web videos, web pictures or IPTV, all on one home screen.',
    shot: 2,
  },
  {
    title: 'It plays on the TV',
    text: 'Tap a photo or a video in your gallery and it fills the big screen. No cables.',
    shot: 4,
  },
];

/** Plain-text proof points under the hero button, all from the listing. */
export const PROOF = ['No cables', 'A wide range of Smart TVs', 'Your screen in real time'];

export const FAQ = [
  {
    question: 'Which TVs does it work with?',
    value: 'Smart TVs',
    answer:
      'A wide range of Smart TVs. Your iPhone and the TV need to be on the same Wi‑Fi network; the app lists the TVs it finds and you tap yours.',
  },
  {
    question: 'Do I need cables or a complicated setup?',
    value: 'No',
    answer: 'No. Everything goes over your Wi‑Fi, without cables or complicated setup.',
  },
  {
    question: 'What can I put on the TV?',
    value: 'Six ways',
    answer:
      'Your whole iPhone screen in real time, photos and videos from your gallery, YouTube videos, online videos and pictures from websites, and IPTV channels.',
  },
  {
    question: 'Can I use it for work?',
    value: 'Yes',
    answer:
      'Yes. It is made for home use and for professional settings: show a presentation, browse the web or share your screen on the meeting-room TV.',
  },
  {
    question: 'How do I get access after paying?',
    value: 'After checkout',
    answer: 'Right after checkout we show you how to get Screen Mirroring with your subscription unlocked.',
  },
  {
    question: 'Which devices does it work on?',
    value: 'iOS 16+',
    answer: 'iPhone with iOS 16.0 or later.',
  },
  {
    question: 'Can I cancel anytime?',
    value: 'Yes',
    answer: 'Yes. Cancel from your account, and you keep access until the paid period ends.',
  },
];
