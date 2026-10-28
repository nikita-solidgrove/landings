# Landing guide

How to build a landing for one app. The reference is `src/pages/ai-song-generator` — read it
fully before starting (page, demo, content, CSS); it is the quality bar, not a template to clone.
Each page's look comes from its own entry in `STYLES.md` (fonts, composition, shapes, color,
motion, headings, FAQ, ending). Read that file before designing anything.

## What a landing is

Buyers arrive from an influencer's bio link or video (TikTok, Instagram, YouTube), mostly on a
phone, already warmed up by the creator. The page must make them want the app in seconds and press
the button that opens checkout. In production it runs inside a FunnelsGrove funnel that supplies the
price, the creator's discount and the checkout; here the preview supplies samples.

## Files and contract

```
src/pages/<slug>/index.ts         export default the page component + `export const meta: LandingMeta`
src/pages/<slug>/<Name>Page.tsx   the page; takes `LandingProps` ({ offer, creator, onStart })
src/pages/<slug>/<Demo>.tsx       the product centerpiece (see Design)
src/pages/<slug>/content.ts       facts, copy, photo ids, screenshots, FAQ
src/pages/<slug>/page.css         every class prefixed with the page prefix
../apps/<slug>/NOTES.md           sources, decisions, risks (see the ai-song-generator one)
```

- The page appears at `http://localhost:5173/<slug>` automatically (main.tsx globs `pages/*/index.ts`).
- All CSS of all pages is loaded together: every class must start with your prefix (`lv-`, `tvr-`…),
  the root element is `<div className='<prefix>'>`, and no selector may target bare elements or
  attributes outside your root. Custom properties live on your root class.
- Do not edit `src/shared/*`, `src/main.tsx`, `src/styles.css`, other pages, or scripts. Use from
  shared: `ProgressiveBlur`, `useReveal` + `data-reveal`, `Tilt`, `describeOffer`, `initials`,
  `LandingProps`, `LandingMeta`. Need something else shared? Copy it into your folder.
- Every button that should buy calls `onStart`. Prices come only from `describeOffer(offer)`.

## Required pieces

1. **Creator ribbon** when `creator && offer.discountPercent`: avatar/initials, "<name> picked this
   app for you", "−N% today" as plain colored text.
2. **Sticky header with the aiby.com gradient blur**: `ProgressiveBlur` + light tint that appears once
   content slides under it, and a dark tone (light text) over sections marked `data-header="dark"`.
   Copy the pattern from the reference (`headerStuck`, `headerTone`, `elementFromPoint`). The header
   element itself must not get filter/opacity/backdrop-filter. Sticky on phones too.
3. **Hero**: headline (composed as your STYLES.md entry says), one-line lead, price line (`terms.today` + struck `terms.regular` when
   discounted), the main button, `terms.terms` under it, 2–3 plain-text proof points from the listing.
   Next to it (below on phones) the product centerpiece.
4. **Sections that sell this product** (choose and order per app; don't copy the reference order):
   how it works in 3–4 steps, real use cases with photos, the app's screenshots, FAQ, final call.
5. **Mobile dock**: fixed bottom bar with icon, price and button, shown only after the visitor has
   scrolled past the hero button (`boundingClientRect.top < 0`); footer gets bottom padding for it.
6. **Footer**: "<App> is developed by <seller legal name>", Privacy/Terms links from the listing,
   "Photos: Unsplash" when used.

## Facts (non-negotiable)

- Only what the App Store listing says (iTunes lookup, the App Store page, release notes) and what
  the app's own screenshots show. No invented numbers, user counts, rankings, awards, "#1", ratings
  or testimonials. Don't repeat claims from the developer's screenshots that the store contradicts.
- Ratings/reviews: show them only if the store rating is strong (≥ 4.5 with a meaningful count) and
  quote real reviews verbatim with author. Otherwise leave them out and say why in NOTES.md.
  Before quoting, read the dates: generic 5★ reviews bunched on a few days (often launch week) or
  reviews that mention a free/lifetime offer for a review are not proof — quote none of them. The
  rating itself may still go in the hero proof line.
- Never mention a trial or a price in copy; the plan's terms come from the offer props.
- Demos and examples are illustrations: label them ("Example") and prefer the app's own examples.
- FAQ: listing facts + "How do I get access after paying?" + "Can I cancel anytime?" + devices (from
  `minimumOsVersion`, iPhone/iPad as listed). The access answer must not promise a mechanism (no
  "sign in with the same email" — some apps have no email sign-in): "Right after checkout we show you
  how to get <App> with your subscription unlocked." The funnel's success step does the handoff.
- Copy in English, short, concrete, benefit first.

## Design

What the user rejected as "AI-looking" — never use:
- dark purple/blue glowing gradients, gradient text, neon, sparkles as decoration;
- a decorative italic serif (Instrument Serif and the like) — only the fonts STYLES.md gives you;
- the old shared template: see "Never again" in STYLES.md;
- soft pastel pill badges: eyebrow chips above headlines, tag chips, caption pills, "New" pills;
- generic feature grids of stock icons; cloning one website's look.

What landed well:
- **A product-specific centerpiece**: an animated mock of the app's core moment (song being made →
  for a scanner: a room being scanned into a floor plan; for a remote: a TV reacting to taps; for a
  dubbing app: a video switching languages…). Every app gets its own idea; this is the heart.
- **Real imagery**: Unsplash photos (people, places, objects of the use case) treated in the brand
  colors (duotone that turns to color on hover, photo covers), the app's icon and screenshots.
- **Typography from STYLES.md**: your page's own families (Archivo only on AI Song Generator).
  Separate voices with weight, size, width, case and color, not with extra fonts.
- **Color**: taken from the app icon/screenshots, plus one or two contrasting accents; flat fills.
  Each app has its own identity — palette, composition and section shapes per STYLES.md.
- **Tasteful motion**: staged hero entrance, scroll reveals (`data-reveal`, `--reveal-delay`), pointer
  tilt, marquees, hover states, a toast or two that mirror real UI (iOS notification style).
  Everything static under `prefers-reduced-motion`.
- Settings shown as plain text ("Pop · Vocals"), real UI shapes (segmented controls, notifications).

Responsive: design desktop and phone separately (not just a squeezed column). No horizontal overflow
at 1440, 768, 390 and 280 px. Long card lists become swipeable rows on phones.

## Process

1. **Facts**: `curl -s "https://itunes.apple.com/lookup?id=<id>&country=us"` (try the listing's own
   country if empty), the App Store page (`curl -sL <url>`), reviews
   `https://itunes.apple.com/us/rss/customerreviews/page=1/id=<id>/sortby=mostrecent/json`.
   Take the icon from the App Store page HTML (it can differ from the lookup `artworkUrl512`).
   Look at the screenshots (`600x0w.webp` variant) with the sheet script or by rendering a page.
   Optional extra context: the app's repo in The-Solid-Grove (see `apps-info` README) via `gh` — but
   only listing-backed facts go on the page.
2. **Photos**: you get candidate Unsplash ids in your brief. Look at them:
   `node scripts/photos.mjs /tmp/<slug>-sheet.png <id> <id> …` and Read the PNG. Pick what fits.
   Use `https://images.unsplash.com/photo-<id>?w=…&h=…&fit=crop&auto=format&q=72`. Do not try to
   search Unsplash yourself.
3. **Build**, then `npm run typecheck` (from `creatives/landings`). All pages share one dev server:
   an import of a file that doesn't exist yet breaks every page. Write `page.css`, `content.ts` and the
   components first and `index.ts` last, and never save a file that imports something missing.
4. **Check** — the dev server is already running on port 5173; never start another server or use
   another port, and do not use the shared in-app browser. Screenshots:
   `node scripts/screenshot.mjs http://localhost:5173/<slug> /tmp/<slug>-d 1440x900 0 full`
   `node scripts/screenshot.mjs http://localhost:5173/<slug> /tmp/<slug>-m 390x760m 0 full`
   `node scripts/screenshot.mjs http://localhost:5173/<slug>?ref=0 /tmp/<slug>-t 768x1024m 0`
   Read them and fix overlaps, clipped text, empty states, contrast, header readability over every
   section, dock behavior. Full-page images are tall; scroll stops (`".selector@-40"`) give closer looks.
5. **NOTES.md** in `creatives/apps/<slug>/`: listing facts used, decisions, photos used, risks.
6. No git commits.
