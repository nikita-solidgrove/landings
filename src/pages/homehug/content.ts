// Facts come from the App Store listing (see creatives/apps/homehug/NOTES.md): the description,
// the release notes and the app's own screenshots. The family, names and plans in the demos are
// illustrations built from the listing's own examples and are labelled "Example" on the page.

export const APP = {
  name: 'HomeHug',
  storeName: 'Calendar & To Do List: HomeHug',
  developer: 'Auxilin',
  legalName: 'Auxilin LLC',
  iconUrl:
    'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/9a/0e/12/9a0e124a-90b4-8a25-499e-3b4e1307a39d/Placeholder.mill/256x256bb.webp',
  privacyUrl: 'https://homehug.ai/privacy',
  termsUrl: 'https://homehug.ai/terms',
};

const shot = (path: string) => `https://is1-ssl.mzstatic.com/image/thumb/${path}/600x0w.webp`;

export const SCREENSHOTS = [
  {
    url: shot('PurpleSource126/v4/04/ac/0c/04ac0c18-f917-470c-a619-57ebceb54b40/bc57f0b2-cf9c-4e87-9dcf-510c8b0a2ce4_App_Store_1284_x_2778_-_1.png'),
    alt: 'Family Organizer and To-Do List: the Upcoming view with tasks for each day',
  },
  {
    url: shot('PurpleSource126/v4/32/9f/d3/329fd349-fa2a-2825-e83d-e8c0b3025882/88163c42-750c-4c93-972a-f30170198ad0_App_Store_1284_x_2778_-_2.png'),
    alt: 'Your Family AI-Assistant: notes in the diary become to-dos and reminders',
  },
  {
    url: shot('PurpleSource126/v4/82/06/d4/8206d476-3d07-8773-9c3d-a79bbd99a9ea/bfa07a12-93a6-4c1c-be82-d1338042b659_App_Store_1284_x_2778_-_3.png'),
    alt: 'All Tasks at Hand: the family to-do list',
  },
  {
    url: shot('PurpleSource126/v4/af/79/3c/af793cef-b96f-77ef-fd41-8cf2eccb08e6/629571c9-262c-44ca-b2cb-1e6376773724_App_Store_1284_x_2778_-_4.png'),
    alt: 'A Shared List for Easy Shopping: the Groceries list',
  },
];

// Free Unsplash photos (Unsplash License), cropped by the CDN to the size each spot needs.
const PHOTO_IDS = {
  familyKitchen: '1761839258803-21515f43190c',
  breakfast: '1713942589575-abe9bbe7095e',
  baking: '1761839258568-fd466a93f68b',
  grandma: '1761839258075-585182da7521',
  sofaPhone: '1758522490273-83abd2c9c3d4',
  sunsetCouple: '1774814326518-6ab631b78c38',
  train: '1758216169256-d624949e7d06',
  schoolRun: '1789395257219-24a4df53b523',
};

export type PhotoName = keyof typeof PHOTO_IDS;

export function photo(name: PhotoName, width: number, height = width) {
  return `https://images.unsplash.com/photo-${PHOTO_IDS[name]}?w=${width}&h=${height}&fit=crop&auto=format&q=72`;
}

/* ---------- The example family ---------- */

export type MemberId = 'anna' | 'john' | 'kate' | 'billy';

export const FAMILY: Record<MemberId, string> = {
  anna: 'Anna',
  john: 'John',
  kate: 'Kate',
  billy: 'Billy',
};

export const MEMBERS = Object.keys(FAMILY) as MemberId[];

export type Mark = 'bell' | 'repeat' | 'link';

export type Todo = {
  id: string;
  title: string;
  who: MemberId;
  mark?: Mark;
  /** Time or date shown after the title. */
  meta?: string;
  done?: boolean;
};

/* ---------- Hero demo: diary notes become the family's plan ---------- */

export type GroupId = 'fri' | 'sat' | 'groceries' | 'birthdays';

export const BOARD_GROUPS: { id: GroupId; day?: string; label: string }[] = [
  { id: 'fri', day: '16', label: 'Friday' },
  { id: 'sat', day: '17', label: 'Saturday' },
  { id: 'groceries', label: 'Groceries' },
  { id: 'birthdays', label: 'Birthdays' },
];

export const BOARD_START: Record<GroupId, Todo[]> = {
  fri: [{ id: 'project', title: 'School project for Kate', who: 'kate' }],
  sat: [{ id: 'dinner', title: 'Family dinner', who: 'anna' }],
  groceries: [
    { id: 'pasta', title: 'Pasta', who: 'anna' },
    { id: 'bread', title: 'Bread', who: 'anna' },
  ],
  birthdays: [{ id: 'grandma', title: 'Grandma’s birthday', who: 'kate', mark: 'repeat', meta: 'Mar 3' }],
};

export type DemoStep = {
  from: MemberId;
  note: string;
  reply: { action: string; title: string; where: string };
  group: GroupId;
  add: Todo[];
  /** Insert at the top of the group instead of the bottom. */
  first?: boolean;
  /** A reminder notification that follows this step. */
  remind?: { title: string; when: string };
};

/** Shown above the live steps, so the diary never starts empty. */
export const DIARY_SEEDS: DemoStep[] = [
  {
    from: 'john',
    note: 'Rent a house for the holidays',
    reply: { action: 'Created task', title: 'Rent house for holidays', where: 'in Inbox' },
    group: 'sat',
    add: [],
  },
  {
    from: 'anna',
    note: 'Family dinner at home on Saturday',
    reply: { action: 'Created task', title: 'Family dinner', where: 'on Saturday' },
    group: 'sat',
    add: [],
  },
];

// The notes are the listing's own examples ("Buy bananas and yogurt", "Prepare school lunch every
// workday at 9 PM") and the ones in its screenshots (John's birthday, the school forms).
export const DEMO_STEPS: DemoStep[] = [
  {
    from: 'anna',
    note: 'We have to submit the school forms for the kids by next Friday',
    reply: { action: 'Created task with reminder', title: 'Submit the school forms for the kids', where: 'in Inbox' },
    group: 'fri',
    add: [{ id: 'forms', title: 'Submit the school forms', who: 'anna', mark: 'bell' }],
  },
  {
    from: 'billy',
    note: 'Buy bananas and yogurt',
    reply: { action: 'Created 2 todos', title: 'Bananas, Yogurt', where: 'in Groceries' },
    group: 'groceries',
    add: [
      { id: 'bananas', title: 'Bananas', who: 'billy' },
      { id: 'yogurt', title: 'Yogurt', who: 'billy' },
    ],
  },
  {
    from: 'john',
    note: 'Prepare school lunch every workday at 9 PM',
    reply: { action: 'Created repeating todo', title: 'Prepare school lunch', where: 'every workday' },
    group: 'fri',
    add: [{ id: 'lunch', title: 'Prepare school lunch', who: 'john', mark: 'repeat', meta: '9 PM' }],
    remind: { title: 'Prepare school lunch', when: 'Every workday · 9:00 PM' },
  },
  {
    from: 'kate',
    note: 'John’s birthday is on January 24th',
    reply: { action: 'Created yearly repeating todo', title: 'John’s birthday', where: 'in Birthdays' },
    group: 'birthdays',
    add: [{ id: 'john-bday', title: 'John’s birthday', who: 'kate', mark: 'repeat', meta: 'Jan 24' }],
    first: true,
  },
];

/** Ticked by the family once every note has landed. */
export const DEMO_TICK = 'bananas';

/* ---------- Hero: plain-text proof points from the listing, set as fridge word magnets ---------- */

export const PROOF = ['AI turns notes into to-dos', 'Yearly birthday reminders', 'Tasks for everyone at home'];

/* ---------- Diary section: the listing's examples, note → result ---------- */

export type DiaryExample = {
  from: MemberId;
  note: string;
  action: string;
  title: string;
  where: string;
  mark: Mark | 'list';
  items?: string[];
};

export const DIARY_EXAMPLES: DiaryExample[] = [
  {
    from: 'billy',
    note: 'Buy bananas and yogurt',
    action: 'Added to your list',
    title: 'Groceries',
    where: '2 new to-dos',
    mark: 'list',
    items: ['Bananas', 'Yogurt'],
  },
  {
    from: 'john',
    note: 'Prepare school lunch every workday at 9 PM.',
    action: 'Created repeating todo',
    title: 'Prepare school lunch',
    where: 'Every workday · 9:00 PM',
    mark: 'repeat',
  },
  {
    from: 'kate',
    note: 'John’s birthday is on January 24th',
    action: 'Created yearly repeating todo',
    title: 'John’s birthday',
    where: 'in Birthdays · every Jan 24',
    mark: 'repeat',
  },
  {
    from: 'anna',
    note: 'We have to submit the school forms for the kids by next Friday',
    action: 'Created task with reminder',
    title: 'Submit the school forms for the kids',
    where: 'in Inbox · Friday',
    mark: 'bell',
  },
];

/* ---------- Week section: one example week, everyone on it ---------- */

export type WeekDay = {
  day: string;
  date: string;
  photo: PhotoName;
  task: Todo;
  /** Everyone is on this one. */
  everyone?: boolean;
};

export const WEEK: WeekDay[] = [
  { day: 'Tue', date: '20', photo: 'schoolRun', task: { id: 'w1', title: 'Submit the school forms', who: 'anna', mark: 'bell', meta: '8 AM' } },
  { day: 'Wed', date: '21', photo: 'breakfast', task: { id: 'w2', title: 'Buy bananas and yogurt', who: 'john', meta: 'Groceries', done: true } },
  { day: 'Thu', date: '22', photo: 'grandma', task: { id: 'w3', title: 'Grandma’s birthday', who: 'kate', mark: 'repeat', meta: 'Every year' } },
  { day: 'Fri', date: '23', photo: 'familyKitchen', task: { id: 'w4', title: 'Family dinner', who: 'anna', meta: '7 PM' }, everyone: true },
  { day: 'Sat', date: '24', photo: 'sunsetCouple', task: { id: 'w5', title: 'Our anniversary', who: 'john', mark: 'repeat', meta: 'Every year' } },
  { day: 'Sun', date: '25', photo: 'train', task: { id: 'w6', title: 'Rent house for holidays', who: 'anna', mark: 'link' } },
];

/* ---------- Today view ---------- */

export const TODAY: { part: string; todos: Todo[] }[] = [
  {
    part: 'Morning',
    todos: [
      { id: 't1', title: 'Schedule dentist for kids', who: 'anna', mark: 'bell' },
      { id: 't2', title: 'Pay bills', who: 'john' },
    ],
  },
  {
    part: 'Afternoon',
    todos: [
      { id: 't3', title: 'Help Billy with project', who: 'kate' },
      { id: 't4', title: 'Read 4th chapter of the book', who: 'billy', done: true },
    ],
  },
  {
    part: 'Evening',
    todos: [
      { id: 't5', title: 'Prepare school lunch', who: 'john', mark: 'repeat', meta: '9 PM' },
      { id: 't6', title: 'Watch Fantastic Mr. Fox', who: 'anna', mark: 'link' },
    ],
  },
];

/** "View completed to-dos for your entire family" (release notes 2.1.1). */
export const TODAY_DONE: Todo[] = [
  { id: 'd1', title: 'Buy gift for Julie', who: 'kate', done: true },
  { id: 'd2', title: 'Rent house for holidays', who: 'john', done: true },
];

export const DETAILS: { title: string; text: string; who: MemberId }[] = [
  {
    who: 'john',
    title: 'Repeats your way',
    text: 'Every workday at 9 PM, every 2nd week, every 3rd month or once a year. Just write it.',
  },
  {
    who: 'kate',
    title: 'Lists and sublists',
    text: 'Groceries, Birthdays, Inbox or your own lists, with sublists inside them.',
  },
  {
    who: 'billy',
    title: 'Links on to-dos',
    text: 'Add a link to any to-do: the recipe, the booking, the school page.',
  },
  {
    who: 'anna',
    title: 'Reminders you control',
    text: 'Choose which notifications you get. A reminder opens straight into its task.',
  },
];

export const STEPS = [
  {
    title: 'Invite your family',
    text: 'Share one invite link and everyone joins your family’s HomeHug.',
  },
  {
    title: 'Write what’s on your mind',
    text: 'Plans, chores, shopping, birthdays. The AI turns notes into to-dos, reminders and list items.',
  },
  {
    title: 'Tick it off together',
    text: 'Assign tasks to anyone, get reminded on time and see what the family has already done.',
  },
];

export const FAQ = [
  {
    question: 'How does the AI turn notes into to-dos?',
    answer:
      'Write in the family diary the way you would say it, like “Buy bananas and yogurt.” The AI creates the to-dos and adds them to the right list, in this case Groceries. Dates and repeats like “every workday at 9 PM” become reminders and recurring tasks.',
  },
  {
    question: 'Can the whole family use it?',
    answer:
      'Yes. Share an invite link to add family members, then create tasks and assign them to anyone, or let the AI help with who does what. Everyone can see the to-dos the family has completed.',
  },
  {
    question: 'Will it remember birthdays and anniversaries?',
    answer: 'Write important dates in the diary and HomeHug creates yearly reminders for birthdays and anniversaries.',
  },
  {
    question: 'Can tasks repeat?',
    answer:
      'Yes. Daily routines like “Prepare school lunch” or a custom schedule such as every 2nd or 3rd day, week, month or year.',
  },
  {
    question: 'How do I get access after paying?',
    answer: 'Right after checkout we show you how to get HomeHug with your subscription unlocked.',
  },
  {
    question: 'Which devices does it work on?',
    answer: 'iPhone with iOS 26 or later.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes. Cancel from your account, and you keep access until the paid period ends.',
  },
];
