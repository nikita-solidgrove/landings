# Styles: one identity per app

The first set of landings came out as one template in 15 colors: a condensed uppercase Archivo
headline on the left with one highlighted line, price and button under it, the demo on the right, a
small letter-spaced label above every section heading, heading left with a paragraph on the right,
and a dark photo with the icon, a headline and a button at the end. The user's verdict: every app
needs its own style. This file gives each page its own art direction. Pages follow their entry;
LANDING_GUIDE.md still holds the facts rules, the required pieces and the process.

## What stays the same on every page

Behavior, not looks: the sticky header with `ProgressiveBlur` (tint once stuck, light text over
`data-header="dark"`), the creator ribbon's content, the mobile dock's behavior, `onStart` on every
buying button, prices only from `describeOffer`, the FAQ questions required by the guide, the facts in
`content.ts` and the decisions in NOTES.md (no quoted reviews where they were removed, left-out
screenshots stay out). How the header, ribbon, dock, buttons, FAQ and footer look is up to the style.

## Never again (the old template)

- A condensed uppercase poster headline with one highlighted line as the hero (only AI Song
  Generator keeps that, it is its identity).
- Hero = headline block left, demo card right, three check-mark proof points under the button.
- A small uppercase letter-spaced colored label above section headings ("HOW IT WORKS"), and the
  "heading left, paragraph right" section head. Each style below names its own heading device.
- Final call = dark photo + centered icon + headline + button. Each style names its own ending.
- The same header: icon, name, small dark rounded button on the right.
- Still banned: glowing gradients, gradient text, neon, decorative italic serif, pastel pill chips,
  stock-icon feature grids.

## Typography

Each page uses only its own fonts below (installed; import the CSS at the top of your page, e.g.
`import '@fontsource-variable/syne';`). Use the exact family names. No Archivo outside AI Song
Generator. At most the two families listed; vary weight, size, width and case inside them.

| Page | Display | Text | Import |
|---|---|---|---|
| ai-song-generator | Archivo Variable (wdth 62) | Archivo Variable | already global |
| luvia | Bricolage Grotesque Variable | same | `@fontsource-variable/bricolage-grotesque/standard.css` |
| lidar-room-scanner | IBM Plex Sans Variable (wdth 85) | IBM Plex Mono for labels and numbers | `@fontsource-variable/ibm-plex-sans/wdth.css`, `@fontsource/ibm-plex-mono/400.css`, `/500.css`, `/600.css` |
| speaker-cleaner | Baloo 2 Variable | same | `@fontsource-variable/baloo-2` |
| lottery-scanner | Alfa Slab One | Barlow Condensed | `@fontsource/alfa-slab-one`, `@fontsource/barlow-condensed/500.css`, `/600.css`, `/700.css` |
| dub-ai | Syne Variable | DM Sans Variable | `@fontsource-variable/syne`, `@fontsource-variable/dm-sans` |
| speech-to-text | Schibsted Grotesk Variable | same | `@fontsource-variable/schibsted-grotesk` |
| universal-tv-remote | Red Hat Display Variable | same | `@fontsource-variable/red-hat-display` |
| plant-id | Josefin Sans Variable | Nunito Sans Variable | `@fontsource-variable/josefin-sans`, `@fontsource-variable/nunito-sans` |
| findmypix | Space Grotesk Variable | same | `@fontsource-variable/space-grotesk` |
| coin-scanner | Krona One | Manrope Variable | `@fontsource/krona-one`, `@fontsource-variable/manrope` |
| screen-mirroring | Unbounded Variable | Onest Variable | `@fontsource-variable/unbounded`, `@fontsource-variable/onest` |
| homehug | Fredoka Variable | Nunito Variable | `@fontsource-variable/fredoka`, `@fontsource-variable/nunito` |
| duoline | Chivo Variable | same | `@fontsource-variable/chivo` |
| device-detector | Martian Mono Variable | Hanken Grotesk Variable | `@fontsource-variable/martian-mono`, `@fontsource-variable/hanken-grotesk` |

Monospace appears only on LiDAR and Device Detector.

---

## luvia — Screen Time Control: a calm day, dawn to night

- **Idea**: the opposite of a busy screen. The page is one day: it starts at morning light and gets
  darker as you scroll until it ends at night. The 24-hour dial is the spine of the page.
- **Type**: Bricolage Grotesque, lowercase headlines (700–800, large optical size, tight tracking),
  400 text at a relaxed size. No uppercase except tiny clock times.
- **Hero**: centered. A short lowercase headline above a large dial (half day, half night) with the
  phone in the middle; price and button centered under it. Lots of air.
- **Composition**: symmetrical, one idea per screen, wide margins; no card grids. Elements float on
  fields of color.
- **Shapes**: circles, arcs and full-round buttons; no bordered cards; photos in circles and arches.
- **Color**: cream and honey `#ffc531` at the top, sunset in the middle, deep ink `#0b0e27` with lime
  at the bottom; section backgrounds step from light to dark.
- **Motion**: slow and soft (600–900 ms ease-out); the dial hand advances with scroll; nothing
  bounces.
- **Section headings**: a clock time and a plain lowercase heading ("07:00 · morning, before the
  scroll"), not labels.
- **FAQ**: centered single column, generous line height, thin dividers.
- **Final call**: night: the dial at 22:30, a single lowercase line and the button, stars as tiny dots.
- **Header / dock**: centered app name, minimal; dock as a rounded floating bar.

## lidar-room-scanner — LiDAR Room Scanner: an architect's drawing set

- **Idea**: the page is a set of technical drawings of your room.
- **Type**: IBM Plex Sans at width 85 for headings (600, sentence case, not uppercase posters), IBM
  Plex Mono for every label, measurement, number and button.
- **Hero**: full width. The scan demo is a large drawing sheet spanning the content width; the
  headline and price sit in the sheet's title block (bottom-right box with rules), like a drawing.
- **Composition**: a visible 12-column hairline grid on drafting paper; everything snaps to it;
  dense, precise, asymmetric.
- **Shapes**: radius 0 everywhere; 1px rules; dimension lines with ticks and arrows as dividers;
  crop/registration marks at corners.
- **Color**: drafting white `#f6f5f0`, blueprint navy `#12163a`, line blue `#3a43c8`, tape yellow
  `#ffc62e` only for the main button and highlights.
- **Imagery**: photos as numbered plates ("Fig. 3 — Living room"), cool and slightly desaturated.
- **Motion**: lines draw themselves (stroke-dashoffset), measurements count up, linear precise timing.
- **Section headings**: sheet numbers ("A-102 · Floor plan") in mono beside the heading.
- **FAQ**: a numbered specification list (1.1, 1.2…) with rules.
- **Final call**: a full floor plan drawing; the CTA sits in the title block.
- **Header / dock**: a thin title strip with mono text and a rectangular yellow button.

## speaker-cleaner — Water Remover: summer at the pool

- **Idea**: an outdoor pool on a hot day; water gets pushed out by sound.
- **Type**: Baloo 2, 800 for big bubbly sentence-case headlines, 500 for text.
- **Hero**: centered big headline over pool water; the speaker grille demo floats in the water and
  breaks through a wavy edge into the next section.
- **Composition**: organic and playful; wavy SVG edges between sections instead of straight cuts;
  things float and bob.
- **Shapes**: drops, bubbles, blobs; round buttons with a ripple on press; a pool-tile pattern (small
  squares) in deep sections; photos masked as water drops or circles.
- **Color**: pool blue `#1060ff`, deep water `#06173a`, sun yellow `#ffd23f`, white foam; a soft
  CSS caustic-light pattern over water sections.
- **Motion**: bubbles rise, waves drift, sound rings pulse, ripples on tap.
- **Section headings**: big headlines with a hand-drawn wavy underline.
- **FAQ**: bubbles/rounded panels that expand.
- **Final call**: underwater, light rays from the surface, one big round button.
- **Header / dock**: a white floating rounded bar.

## lottery-scanner — Lottery Scanner: the ticket and the corner store

- **Idea**: printed tickets, play slips and corner-store signage.
- **Type**: Alfa Slab One for headlines and big numbers (printed, heavy), Barlow Condensed 500–700 for
  text, tabular numbers.
- **Hero**: one giant ticket spanning the width: the headline printed on it, a perforated stub on the
  right holding price and button, a serial line; the phone scanner overlaps the ticket.
- **Composition**: dense printed matter: tickets, stubs, slips; number balls as a recurring element.
- **Shapes**: ticket shapes with half-circle notches (radial-gradient cutouts), dashed perforation
  lines, zig-zag tear edges, circles for balls; a halftone dot texture.
- **Color**: cream ticket paper `#fbf3e0`, royal blue, match green, Powerball red, ink.
- **Imagery**: photos printed as halftone or duotone on paper.
- **Motion**: scratch-off reveal (mask wipe) on key lines, balls roll in, a "CHECKED" stamp lands.
- **Section headings**: ticket line letters ("Line A", "Line B") with a slab heading.
- **FAQ**: a row of ticket stubs / a printed rules sheet.
- **Final call**: a big scratch card; scratching (or scrolling) reveals the CTA.
- **Header / dock**: a ticket header with perforated bottom edge. Never promise winnings.

## dub-ai — Dub AI: cinema with subtitles

- **Idea**: one film, many languages: letterbox frames, burned-in subtitles, timecode.
- **Type**: Syne 700–800 for display (wide, sentence case or lowercase), DM Sans for text; subtitles
  in DM Sans 600 white/yellow with a dark text shadow like real subtitles; timecodes in tabular
  figures.
- **Hero**: full-bleed letterboxed video frame; the headline is the subtitle line at the bottom of
  the frame and changes language; price and button below the frame.
- **Composition**: mostly black, cinematic 2.39:1 and 9:16 frames, horizontal filmstrips; one paper
  interlude for steps.
- **Shapes**: hard rectangles, film perforations, a rec dot, playhead lines.
- **Color**: black `#0b0b10`, subtitle yellow `#ffd60a`, icon blue `#3a44f5` for buttons, paper
  `#f3f1ea`.
- **Motion**: subtitles swap languages, a timecode runs, a playhead scrubs across a timeline.
- **Section headings**: scene slates ("Sc. 02 — Captions").
- **FAQ**: Q/A set as subtitle pairs.
- **Final call**: end credits rolling up with the CTA as the last card.
- **Header / dock**: transparent on black with a running timecode.

## speech-to-text — Speech to Text: the page is a transcript

- **Idea**: a document being written by voice: transcript, timestamps, highlighter, margin notes.
- **Type**: Schibsted Grotesk only: 800 sentence-case headlines, 400 body at a comfortable reading
  size, tabular numbers for timestamps.
- **Hero**: the headline itself types out word by word with a blinking cursor, left-aligned and huge;
  the recorder sits in the margin; timestamps run down the left margin.
- **Composition**: editorial: a wide reading column, a left margin with timestamps and speaker
  names, pull quotes, inline captioned photos like a magazine.
- **Shapes**: sheets of paper with a soft shadow, marker highlights and underlines; no rounded cards.
- **Color**: paper white, ink, royal blue `#2443f5` for links and buttons, record red for the dot,
  marker yellow for highlights.
- **Motion**: words appear as if dictated; the highlighter sweeps in; cursor blink.
- **Section headings**: a timestamp in the margin ("[02:14]") plus a plain heading.
- **FAQ**: transcript format: "Q" and "A" as speaker labels.
- **Final call**: "Start talking." followed by a blinking cursor and the button.
- **Header / dock**: like a document toolbar: file name and a record button.

## universal-tv-remote — Universal TV Remote: well-made hardware

- **Idea**: an industrial-design object: tactile buttons, printed legends, a living room in the
  evening.
- **Type**: Red Hat Display: 800–900 for headlines, small uppercase legends at 600 (like the print
  on a remote), 400 text.
- **Hero**: centered product shot: the phone remote large in the middle, the TV behind it; headline
  above in two lines.
- **Composition**: a product catalogue on warm grey surfaces; layouts built on a button grid.
- **Shapes**: soft rounded rectangles shaded like real buttons (convex/concave), dot grids and
  speaker-hole patterns, a small LED.
- **Color**: warm greys `#e9e6e1` / `#2a2826`, the icon's violet `#5b4bf0` as the "power" color,
  lamp amber `#ffb547` in photos, a green LED.
- **Motion**: buttons depress on press, the LED blinks, the TV responds.
- **Section headings**: a small printed legend ("VOL · CH") above a plain heading.
- **FAQ**: a button-grid accordion.
- **Final call**: one large round power button that is the CTA.
- **Header / dock**: like the top edge of a device with an LED; the dock looks like a remote's
  bottom row.

## plant-id — Plant Identifier: seed packets and herbarium sheets

- **Idea**: vintage seed packets, plant tags and herbarium specimen sheets.
- **Type**: Josefin Sans 600–700 for headlines (seed-packet geometric, uppercase allowed at display
  size), Nunito Sans for text.
- **Hero**: a large seed packet: photo window on the front, the headline as the packet title, price
  and button on the packet's flap; the camera demo beside it.
- **Composition**: specimen sheets: a leaf or photo held by paper tape on cream paper with a
  label block (common name, Latin name, notes).
- **Shapes**: packet shapes, arches, plant tags with a hole and string, stamped borders, paper tape.
- **Color**: cream `#f6f0e3`, forest `#1f3d2b`, the app's green `#00a86b`, terracotta buttons,
  sun yellow.
- **Motion**: leaves sway gently, tags swing, the camera brackets lock.
- **Section headings**: a specimen label (Latin-style number "No. 3") with the heading.
- **FAQ**: the back of a seed packet ("growing instructions" layout in columns).
- **Final call**: a big packet "ready to plant" with the button as its seal.
- **Header / dock**: a plant tag.

## findmypix — FindMyPix: contact sheets on a light table

- **Idea**: a photographer's contact sheets on a light table; the matches circled in grease pencil.
- **Type**: Space Grotesk only: 600–700 sentence-case headlines, tabular frame numbers.
- **Hero**: a contact sheet of many frames fills the hero; a loupe follows the pointer (static on
  phones); the headline and button sit on a white card laid on top; your matched frames are circled.
- **Composition**: grids of frames with black film borders and frame numbers; light-table white
  background.
- **Shapes**: square frames, sprocket holes, hand-drawn red ellipses and arrows (SVG, drawn on
  scroll).
- **Color**: light-table white `#f7f7f4`, film black `#121417`, grease red `#e5372b` for circles,
  the app's blue for buttons, mint for a confirmed match.
- **Imagery**: black-and-white frames; the matched face turns to color.
- **Motion**: the grease circle draws itself; the loupe magnifies.
- **Section headings**: frame numbers ("12A ▸") beside the heading.
- **FAQ**: a negative sleeve list.
- **Final call**: a contact sheet with one frame circled and the button written beside it.
- **Header / dock**: a film edge with a frame counter. Keep the privacy tone calm.

## coin-scanner — Coin Scanner: the numismatic certificate

- **Idea**: a catalogue and a certificate: engraved guilloché patterns, seals, catalogue numbers.
- **Type**: Krona One (wide, minted) for headlines at moderate sizes, uppercase; Manrope for text.
- **Hero**: symmetrical: one big coin in the center that flips from obverse to reverse; the
  headline above, an inscription set on a circular path around the coin; price and button below in a
  certificate frame.
- **Composition**: centered, framed with double rules like a certificate; velvet trays for coins.
- **Shapes**: circles, double-line borders, guilloché rosettes (SVG), an embossed seal.
- **Color**: ivory `#f5f0e4`, patina green `#1f4d45`, copper `#b5651d`, ink navy; no gold gradients.
- **Imagery**: macro coin photos with raking light.
- **Motion**: coins flip (rotateY), the rosette turns slowly, numbers count.
- **Section headings**: catalogue numbers ("Cat. No. 04").
- **FAQ**: a catalogue index with dotted leaders.
- **Final call**: a certificate with the seal; the button sits under the seal.
- **Header / dock**: a certificate band with a thin guilloché line.

## screen-mirroring — Screen Mirroring: small screen to big screen

- **Idea**: scale. Something on a phone becomes something the whole room sees.
- **Type**: Unbounded 700–900 for display (wide, can go very large), Onest for text.
- **Hero**: a small phone on the left and a huge TV frame bleeding off the right edge; the headline
  runs across the top in wide type.
- **Composition**: extreme scale contrast: phone-sized elements next to full-bleed 16:9 frames; a
  scroll-driven zoom from phone to full screen; dark rooms.
- **Shapes**: screen rectangles with thin bezels, 16:9 frames; soft ambient light that takes the
  color of what is on screen (like a TV lighting a room), never neon outlines.
- **Color**: deep navy `#071331`, cast green `#2bd47c`, white.
- **Motion**: phone → TV scale, cast transitions, the room lighting up.
- **Section headings**: TV-style "Now showing" lines with the heading.
- **FAQ**: a TV settings menu with a focus ring moving between items.
- **Final call**: a TV switching on (line → full picture) with the button.
- **Header / dock**: a TV-interface top bar.

## homehug — HomeHug: the family fridge

- **Idea**: the fridge door: magnets, notes, photos, the week's plan.
- **Type**: Fredoka 600–700 for headlines (rounded, friendly, sentence case), Nunito for text.
- **Hero**: a fridge door: the headline on a big note held by magnets, the phone pinned beside it,
  polaroids and small notes around.
- **Composition**: tidy collage: slightly rotated notes, magnets, polaroids; the week planner as a
  structure.
- **Shapes**: squircles, sticky notes with folded corners, round magnets, tape.
- **Color**: lavender and plum from the icon, cream, family colors (tomato, sky, butter, leaf).
- **Motion**: notes drop and stick with a small wobble, ticks pop.
- **Section headings**: a magnet-held note with the heading.
- **FAQ**: notes.
- **Final call**: the fridge door with the button as a big magnet.
- **Header / dock**: a rounded floating bar with family avatars.

## duoline — Second Phone: two lines

- **Idea**: two of everything: personal and second line, a SIM card, a split screen.
- **Type**: Chivo: 900 for display, 400 text, tabular numbers for phone numbers.
- **Hero**: a 50/50 split screen: left ink "your number", right green "your second number"; the
  headline spans across the split; the phone sits on the seam.
- **Composition**: split layouts throughout (ink | green, paper | ink); a Swiss grid.
- **Shapes**: SIM-card shapes with a cut corner, chip-contact pattern, hard edges.
- **Color**: green `#1fc47a`, ink `#0d0f10`, paper `#f2f3ee`, orange once.
- **Motion**: things slide across the seam from one line to the other; numbers type in.
- **Section headings**: "1 | 2" line numerals beside the heading.
- **FAQ**: two columns, one per line.
- **Final call**: split CTA: "keep yours" | "get a second one".
- **Header / dock**: split in two with line indicators.

## device-detector — Device Detector: a calm night check

- **Idea**: an instrument at night: radar sweep, sensor readouts, then the warm relief of a checked
  room.
- **Type**: Martian Mono for display and readouts (wide mono), Hanken Grotesk for text.
- **Hero**: dark; a radar with concentric rings in the center-right sweeping the room photo; the
  headline in mono on the left; readouts aligned like an instrument.
- **Composition**: instrument panels on dark, alternating with warm linen "relax" sections.
- **Shapes**: rings, crosshair ticks, dotted scales, rounded-rect panels.
- **Color**: night ink `#15121e`, violet `#6a5cff`, red only for "unknown", green for "checked",
  linen `#f3eee5`.
- **Motion**: radar sweep, signal bars rising, a needle settling.
- **Section headings**: channel readouts ("CH 01 · Wi-Fi").
- **FAQ**: an instrument list.
- **Final call**: the room calm, a green "checked" ring closing, the button.
- **Header / dock**: a status bar ("Room check · ready"). No fear, no guarantees.
