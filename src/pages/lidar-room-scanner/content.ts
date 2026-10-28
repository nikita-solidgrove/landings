// Facts come from the App Store listing (see creatives/apps/lidar-room-scanner/NOTES.md).
// Measurements in the demo and in the cards are illustrations and are labelled "Example" on the page;
// the floor plan numbers (room height 8'9", ft/in units) follow the app's own screenshots.

export const APP = {
  name: 'LiDAR Room Scanner',
  fullName: 'LiDAR Room Scanner: Floor Plan',
  inAppName: 'LiDAR Plan',
  developer: 'PaoApps',
  legalName: 'PAO APPS PTE. LTD.',
  iconUrl:
    'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/b0/c2/91/b0c29117-bf01-97b6-c9a9-ab35ff7b2f6e/Placeholder.mill/256x256bb.webp',
  privacyUrl: 'https://www.getpaoapps.com/privacy',
  termsUrl: 'https://www.getpaoapps.com/terms',
};

const shot = (path: string) => `https://is1-ssl.mzstatic.com/image/thumb/${path}/600x0w.webp`;

/** iPhone screenshots in App Store order. */
export const SCREENSHOTS = [
  { url: shot('PurpleSource221/v4/3c/a2/25/3ca22527-de6c-6412-0b68-dde4d0ca1bbd/EN-13Pro-1.jpg'), caption: 'Room Plan 3D' },
  { url: shot('PurpleSource211/v4/6b/ea/56/6bea56af-4be7-5e25-66d4-76425b9d20ce/EN-13Pro-2.jpg'), caption: 'Ruler' },
  { url: shot('PurpleSource221/v4/81/82/7f/81827f80-0531-f2cf-7859-25d3b172b895/EN-13Pro-3.jpg'), caption: 'Floor plan' },
  { url: shot('PurpleSource221/v4/fa/e3/da/fae3dabe-5092-ecce-d98b-d989b14247b7/EN-13Pro-4.jpg'), caption: 'Area' },
];

/** The 3D room render from the iPad screenshots (no phone frame around it). */
export const ROOM_3D = shot('PurpleSource211/v4/d4/77/d0/d477d09a-85cb-8d38-fe29-584db07bef86/EN-iPad_Pro-_1.jpg');

// Free Unsplash photos (Unsplash License), cropped by the CDN to the size each spot needs.
const PHOTO_IDS = {
  scanRoom: '1757742690834-aa581b9f53b2',
  openPlan: '1789353527453-2121cc451a89',
  livingRoom: '1618221195710-dd6b41faaea6',
  movingIn: '1758523671413-cd178a883d6a',
  doorRoom: '1789352844296-81a113658d69',
  brightRoom: '1630699144867-37acec97df5a',
  archedRoom: '1600210491892-03d54c0aaf87',
};

export type PhotoName = keyof typeof PHOTO_IDS;

export function photo(name: PhotoName, width: number, height = width) {
  return `https://images.unsplash.com/photo-${PHOTO_IDS[name]}?w=${width}&h=${height}&fit=crop&auto=format&q=72`;
}

/** Where the listing says the app is for: on the tape-measure band. */
export const USES = ['Renovation', 'Furnishing', 'Home projects', 'Quick surveys', 'Interior planning', 'Moving in'];

/** The example room in the hero demo. Room height and units follow the app's floor-plan screenshot. */
export const DEMO_ROOM = {
  name: 'Living room',
  widthIn: 179, // 14'11"
  lengthIn: 186, // 15'6"
  heightIn: 105, // 8'9"
};

export const feetInches = (inches: number) => {
  const total = Math.round(inches);
  return `${Math.floor(total / 12)}'${total % 12}"`;
};

export const squareFeet = (widthIn: number, lengthIn: number) => `${((widthIn * lengthIn) / 144).toFixed(1)} ft²`;

export const USE_CASES: { tag: string; title: string; text: string; photo: PhotoName; fig: string }[] = [
  {
    tag: 'Renovation',
    title: 'Plan the renovation',
    text: 'Walls, floor area and ceiling height in one plan, before anyone picks up a hammer.',
    photo: 'openPlan',
    fig: 'Open plan with kitchen',
  },
  {
    tag: 'Furnishing',
    title: 'Furnish with real numbers',
    text: 'Know the space between the windows and the door before you order the sofa.',
    photo: 'livingRoom',
    fig: 'Living room',
  },
  {
    tag: 'Moving in',
    title: 'Map the new place',
    text: 'Scan every room once and plan where everything goes from your phone.',
    photo: 'movingIn',
    fig: 'Moving day',
  },
  {
    tag: 'Quick surveys',
    title: 'Measure on the go',
    text: 'Capture a room in a visit and find it later in your measurement history.',
    photo: 'brightRoom',
    fig: 'Empty room',
  },
];

/** The page is a drawing set: one sheet per section. The header shows the sheet under it. */
export const SHEETS = {
  scan: { no: 'A-101', name: 'Room scan' },
  tools: { no: 'A-102', name: 'Tools' },
  sequence: { no: 'A-103', name: 'Sequence' },
  uses: { no: 'A-104', name: 'Uses' },
  screens: { no: 'A-105', name: 'Screens' },
  spec: { no: 'A-106', name: 'Spec sheet' },
  plan: { no: 'A-107', name: 'Floor plan' },
} as const;

export type SheetId = keyof typeof SHEETS;

/** The hero's "general notes": proof points from the listing. */
export const NOTES = [
  '3D room layouts with accurate dimensions.',
  'Distances and surface areas with the AR ruler.',
  'Export as PDF or USDZ.',
  '3D scanning needs a LiDAR sensor: iPhone 12 Pro, iPad Pro and later Pro models.',
];

/**
 * The example apartment on the last sheet, in inches like the app's ft/in plans. Its layout echoes
 * the app's own floor-plan screenshot (living room with kitchen, hall, bath, bedroom); the numbers
 * are an illustration and labelled "Example plan" on the page.
 */
export const APARTMENT = [
  { no: 1, name: 'Living room', widthIn: 228, lengthIn: 186 },
  { no: 2, name: 'Bedroom', widthIn: 144, lengthIn: 150 },
  { no: 3, name: 'Bath', widthIn: 84, lengthIn: 84 },
  { no: 4, name: 'Hall', widthIn: 84, lengthIn: 60 },
];

export const HISTORY = [
  { name: 'Living room', meta: '231.2 ft² · Today' },
  { name: 'Bedroom', meta: '132.5 ft² · Yesterday' },
  { name: 'Hallway', meta: '38.0 ft² · Sep 28' },
];

export const FAQ = [
  {
    question: 'Which devices does it work on?',
    answer:
      'iPhone and iPad with iOS 18.0 or later. 3D room scanning needs a LiDAR sensor: iPhone 12 Pro, iPad Pro and later Pro or Pro Max models.',
  },
  {
    question: 'What do I get from a room scan?',
    answer:
      'A 3D room layout with accurate dimensions and a floor plan with wall lengths, floor area and room height. Saved scans stay in Measurement History.',
  },
  {
    question: 'Can I measure single things, not whole rooms?',
    answer: 'Yes. Ruler & Area measures distances and surface areas in AR: a wall, a door, a window, a rug.',
  },
  {
    question: 'Which formats can I export?',
    answer: 'PDF or USDZ. A PDF is easy to print or send; USDZ keeps the room in 3D.',
  },
  {
    question: 'What is AI Design?',
    answer:
      'Start with a photo of your room, explore interior styles, change wall colors and floors, or add, remove and replace objects. Compare before and after and save the results you like.',
  },
  {
    question: 'How do I get access after paying?',
    answer: 'Right after checkout we show you how to get LiDAR Room Scanner with your subscription unlocked.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes. Cancel from your account, and you keep access until the paid period ends.',
  },
];

/** The FAQ as a numbered specification: 1.1, 1.2… */
export const SPEC = [
  { title: 'Devices and scanning', items: FAQ.slice(0, 3) },
  { title: 'Files and features', items: FAQ.slice(3, 5) },
  { title: 'Access and billing', items: FAQ.slice(5) },
];
