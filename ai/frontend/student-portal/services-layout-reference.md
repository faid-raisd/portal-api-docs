# Services source layout inventory

Reviewed 6 September 2026. Live full-page desktop and 390×844 phone screenshots were inspected in the implementation task; the source HTML, widget inventory and responsive CSS were captured before the layout work. The checked-in [reference inventory](services-layout-reference.json) preserves source body text, section order, image placements and capture context. [The asset manifest](services-source-manifest.json) preserves original image dimensions, origins and checksums. Screenshots are task evidence, not runtime assets.

## Common measurements

- Desktop source body: 855px outer width at its widest content layout, 60px insets (735px text region), 32px column/section spacing, equal split columns, 360px cover photos. Split photos stretch to adjacent text height. Source bodies use a dark gradient and rounded photo corners; the portal uses corresponding semantic dark surfaces.
- Phone source: 48px vertical/32px horizontal insets, 220px cover photos and stacked content. The source viewport breakpoint is 767px; its tablet sidebar can leave cramped content. The portal adapts this to **below 640px of available Services container width**, independent of viewport and Community size. At 639px it stacks; at 640px it uses wide arrangements.
- Tables: grey full-width title strip, dark header row, centered bordered cells. Hours tables have 40/60 columns, rate tables equal columns. Semantic HTML tables replace the source's visual grid widgets.
- Icons: source Finance illustrations remain original local PNGs.

## Per-page arrangements

| Source page | Wide content order and arrangement | Narrow arrangement |
| --- | --- | --- |
| [Transportation](https://limkokwing.net/services-transportation/) | KLIA Transit copy, divided Terminal Location and Trip Duration sections on the left; stretched train photo on the right | Photo first, then the complete text column |
| [Dining](https://limkokwing.net/services-dining/) | Cuisine introduction and photo; divided Malay, Chinese and Indian sections with text/dish cards left and outlet photo right; Wing’s Cafe copy then photo | Each outlet photo precedes its text. Dish cards change from three columns (110px) to one (140px), retaining bottom caption overlays. Cafe photo first |
| [Wellness](https://limkokwing.net/services-wellness/) | Clinic heading/copy/hours/tests/photo; Gym heading/copy; facilities/hours left and studio photo right; divided equipment photo left and equipment/rates right | Clinic photo first; each gym photo precedes its associated list/table |
| [Finance](https://limkokwing.net/services-finance/) | Cashless heading/copy and four illustrated benefits in a 2×2 grid left; bank-card composition right, cover centred on wide containers and bottom-aligned on narrow containers | Bank-card image first; illustrated benefits remain 2×2 with 60px icons |
| [Connectivity](https://limkokwing.net/services-connectivity/) | Wi-Fi Services heading/copy, divided Wi-Fi Settings heading/two paragraphs, photo | Photo first, then both text sections |
| [Shopping](https://limkokwing.net/services-shopping/) | 10-Ten heading/copy/photo/hours; divided Wings Art & Print Shop heading/copy/Caters for All/photo; Premium Print Quality/Customer Service/photo/Other services/hours | Each of the three photo groups moves before its associated copy; two hours tables retained |
| [Recreation](https://limkokwing.net/services-recreation/) | Amphitheatre and Branding heading/copy/photo sections; Library introduction/photo/location copy, Collection left/photo right, Facilities/hours left/photo right; Creativity Library copy/photo; Club opening copy/photo/further copy/list/hours | Introductory photos move first. Library Collection and Facilities lists remain before their respective photos. Club photo moves ahead of all its copy |

The repeated source contact block is excluded from the active portal. Contact copy and business hours remain stored once per campus for API compatibility.

## Fidelity boundaries

The six current banners, compact descriptions, portal heading, tabs and navigation are preserved. The campus label is omitted from the portal heading. Website chrome, news, promotional controls and decorative outer backgrounds are excluded. Portal typography changes text wrapping relative to the website; the content container breakpoint and removal of Accommodation, Finance and department contacts are deliberate adaptations. This is structural/source-content fidelity, not a claim of identical pixels. The site intermittently returned 522 errors; successful source captures and extracted CSS/text were used, with no guessed replacement layouts or runtime requests.

## Approved cleanup and media delivery (6 September 2026)

The retained source inventory excludes Accommodation provenance. The active portal also excludes the Finance category and all department contact blocks. Shopping uses the light banner gradient. All 34 active images received AI restoration and visual comparison; 15 problematic results were retried. Delivery uses 22 accepted restorations and 12 optimized originals where lettering, display details or framing could not be preserved. See `assets/services/restoration-review.json` and the source manifest for individual decisions. All 68 responsive WebP variants preserve source aspect ratios and existing layout crop settings.
