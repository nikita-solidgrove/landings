// Facts come from the App Store listing and the app's own screenshots
// (see creatives/apps/device-detector/NOTES.md). The room check in the hero is an illustration,
// labelled "Example" on the page; device names are generic or the app's own labels.

export const APP = {
  name: 'Device Detector',
  fullName: 'Device Detector: Find & Detect',
  developer: 'Auxilin',
  legalName: 'Auxilin LLC',
  iconUrl:
    'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/21/6c/09/216c09a1-7db5-7587-6422-0d7e10fa232f/Placeholder.mill/256x256bb.webp',
  privacyUrl: 'https://auxilin.com/privacy',
  termsUrl: 'https://auxilin.com/terms',
};

const shot = (path: string) => `https://is1-ssl.mzstatic.com/image/thumb/${path}/600x0w.webp`;

/**
 * The listing's iPhone screenshots of the app's three tools. Left out: "Protect Yourself & Your
 * Child Now" (a stock scene with a "Protected" badge), the scanner screen captioned "High risk of
 * being secretly recorded" and "Security Starts Here" (warning pins over a room, a view the listing
 * doesn't describe) — the page doesn't sell with fear or a promise it can't back.
 */
export const SCREENSHOTS = [
  {
    url: shot('PurpleSource221/v4/29/c2/0f/29c20f22-38dc-8d75-2136-2fa235f00f6f/EN-13Pro-6.jpg'),
    caption: 'Wi-Fi and Bluetooth scanner',
  },
  {
    url: shot('PurpleSource211/v4/d4/ff/7a/d4ff7a49-b94a-47ac-6ae4-77bc39091374/EN-13Pro-4.jpg'),
    caption: 'Magnetometer',
  },
  {
    url: shot('PurpleSource221/v4/16/87/93/168793d2-e5c0-a126-ff12-8d0706a11970/EN-13Pro-3.jpg'),
    caption: 'Light filter',
  },
];

// Free Unsplash photos (Unsplash License), cropped by the CDN to the size each spot needs.
const PHOTO_IDS = {
  hotelRoom: '1618773928121-c32242e63f39',
  arriving: '1787724779182-12e416692737',
  suitcase: '1631729284450-bc22a60c96aa',
  cabin: '1767348922879-a5cade5cceff',
  workTrip: '1787724778049-9b17f7a9c047',
  livingRoom: '1596205178128-cde32892fd11',
  navyBedroom: '1711059985570-4c32ed12a12c',
};

export type PhotoName = keyof typeof PHOTO_IDS;

export function photo(name: PhotoName, width: number, height = width) {
  return `https://images.unsplash.com/photo-${PHOTO_IDS[name]}?w=${width}&h=${height}&fit=crop&auto=format&q=72`;
}

/**
 * The radar scope in the hero (an example). Positions are percent of the square room photo: your
 * phone in the middle, the rest where such things usually sit. "Router", "My Phone" and "Unknown
 * Device" are the app's own labels; the unknown one is the lit screen above the bed.
 */
export type Device = {
  name: string;
  via: 'Wi-Fi' | 'Bluetooth';
  kind: 'router' | 'phone' | 'laptop' | 'headphones' | 'unknown';
  x: number;
  y: number;
  /** Which side of the dot its label sits on, so labels never cross. */
  tag: 'left' | 'right';
};

export const DEVICES: Device[] = [
  { name: 'My Phone', via: 'Wi-Fi', kind: 'phone', x: 50, y: 50, tag: 'right' },
  { name: 'Router', via: 'Wi-Fi', kind: 'router', x: 78, y: 25, tag: 'left' },
  { name: 'Headphones', via: 'Bluetooth', kind: 'headphones', x: 72, y: 80, tag: 'left' },
  { name: 'My Laptop', via: 'Wi-Fi', kind: 'laptop', x: 26, y: 71, tag: 'right' },
  { name: 'Unknown Device', via: 'Wi-Fi', kind: 'unknown', x: 49.5, y: 29, tag: 'left' },
];

/** The screen above the bed, and the walk toward it during the closer look (from the middle). */
export const TARGET: [number, number] = [49.5, 29];
export const WALK: [number, number][] = [
  [50, 50],
  [57, 47.5],
  [59, 42],
  [55.5, 38],
  [51.5, 36.5],
];

export const TOOLS = [
  {
    id: 'wifi',
    short: 'Wi-Fi',
    name: 'Wi-Fi network scanner',
    text: 'Quickly check the network you’re on for unknown or suspicious devices connected over Wi-Fi.',
  },
  {
    id: 'bluetooth',
    short: 'Bluetooth',
    name: 'Bluetooth device finder',
    text: 'See the Bluetooth devices around you and keep an eye on unexpected activity.',
  },
  {
    id: 'magnet',
    short: 'Magnetometer',
    name: 'Magnetic field meter',
    text: 'Your iPhone’s built-in sensor measures field changes that may point to electronics nearby.',
  },
  {
    id: 'light',
    short: 'Light filter',
    name: 'Light filter',
    text: 'Look through colored camera filters: unusual reflections or light spots may hint at a device.',
  },
] as const;

export const LIGHT_FILTERS = [
  { id: 'red', label: 'Red filter', color: '#ff2d4f' },
  { id: 'blue', label: 'Blue filter', color: '#2f7bff' },
  { id: 'green', label: 'Green filter', color: '#2fd28a' },
  { id: 'white', label: 'No color', color: '#f4efe6' },
] as const;

export const PLACES: { title: string; text: string; photo: PhotoName }[] = [
  {
    title: 'Hotel rooms',
    text: 'Check the hotel network and the Bluetooth devices around you before you unpack.',
    photo: 'arriving',
  },
  {
    title: 'Rental homes',
    text: 'See what’s connected to the rental’s Wi-Fi on the first evening.',
    photo: 'cabin',
  },
  {
    title: 'Work trips & offices',
    text: 'A quick look around a new office, a meeting room or your room on a business trip.',
    photo: 'workTrip',
  },
  {
    title: 'Your own home',
    text: 'Or simply check your home network and the devices around you.',
    photo: 'livingRoom',
  },
];

export const ROUTINE = [
  {
    title: 'Scan the Wi-Fi',
    text: 'Join the room’s network and tap scan. Devices you know and ones you don’t are listed apart.',
  },
  {
    title: 'Look for Bluetooth',
    text: 'Switch to Bluetooth to see what’s broadcasting around you.',
  },
  {
    title: 'Sweep the room',
    text: 'Move your iPhone slowly with the magnetometer on. The reading changes near electronics.',
  },
  {
    title: 'Try the light filter',
    text: 'Look around through the camera filters for unusual reflections or light spots.',
  },
  {
    title: 'Unpack',
    text: 'You’ve had a good look. Now the room is yours.',
  },
];

export const FAQ = [
  {
    question: 'Do I need any extra equipment?',
    answer:
      'No. Device Detector uses what your iPhone already has: Wi-Fi, Bluetooth, the camera and the built-in magnetometer. No complex setup, just open the app and start.',
  },
  {
    question: 'What can it check?',
    answer:
      'The devices on the Wi-Fi network you’re connected to, Bluetooth devices nearby, magnetic field changes from electronics, and reflections or light spots through the camera’s light filter.',
  },
  {
    question: 'Will it find every hidden device?',
    answer:
      'No app can promise that. Device Detector gives you scanning and analysis tools for your own awareness, but it can’t guarantee to detect every device. Think of it as a quick, careful look around.',
  },
  {
    question: 'I’ve never done this. Where do I start?',
    answer:
      'Guides & Tips in the app explain each tool step by step, so you know what to point your phone at and what the readings mean.',
  },
  {
    question: 'How do I get access after paying?',
    answer: 'Right after checkout we show you how to get Device Detector with your subscription unlocked.',
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
