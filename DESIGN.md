# Bento Viana — Design Language

## Concept: "Monument & Horizon"
The site is his printed portfolio turned into a building you walk through. Black "gallery"
rooms hold the photographs; white "text" rooms hold his voice. Nothing competes with the images:
no accent color, no rounded corners, no shadows, no gradients except a scrim over photos. Every
color on the page comes from the photographs.

The rhythm follows the PDF. A black stage carries full-bleed panoramas. Then a white page carries
a heavy condensed-caps heading on the **left** and short sentences **right-aligned on the right**,
one per line, like a poem set against a wall.

## Tokens
| Token | Value | Role |
|---|---|---|
| `--ink` | `#1d1b1c` | Black stage (PDF cover warm-black), header over dark sections, footer |
| `--ink-2` | `#262425` | Raised dark surface (lightbox chrome, form on dark) |
| `--paper` | `#ffffff` | Text rooms |
| `--paper-2` | `#f3f3f1` | Alternate light band (services, contact panel) |
| `--black` | `#0e0e0e` | Text on paper (PDF headings are pure black) |
| `--graphite` | `#5c5a58` | Secondary text on paper (≥ 4.5:1 on white) |
| `--fog` | `#b9b6b2` | Secondary text on ink (≥ 4.5:1 on `--ink`) |
| `--line-dark` | `rgba(14,14,14,.14)` | Hairlines on paper |
| `--line-light` | `rgba(255,255,255,.16)` | Hairlines on ink |
| `--gutter` | `clamp(20px, 5vw, 96px)` | Page side padding |
| `--ease` | `cubic-bezier(.2,.7,.1,1)` | All motion |

**No accent color.** Links and CTAs are underlined, uppercase and tracked, in black on paper or
white on ink. Hover thickens or slides the underline.

## Type
Google Fonts link:
```
https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@200;600&family=Jost:wght@300;400;500&display=swap
```
- **Headings:** `Bebas Neue`, uppercase, line-height .92, letter-spacing .01em.
  - H1 hero `clamp(3.5rem, 11vw, 10rem)`
  - Section H2 `clamp(2.6rem, 6vw, 5.5rem)`
- **Wordmark:** live text, never an image. **BENTO** in `Barlow Condensed 600` and **VIANA** in
  `Barlow Condensed 200`, with no space between them and letter-spacing .02em. Below it, right-aligned
  under VIANA, sits the word "photography" in `Jost 300` lowercase at about 0.42× the wordmark
  size. Used in the header (small, no "photography"), the hero (large) and the footer.
- **Body:** `Jost 300` at 1.0625–1.25rem, line-height 1.55. Manifesto lines use `Jost 300`
  `clamp(1.15rem, 1.9vw, 1.6rem)` at line-height 1.45.
- **Labels and captions:** `Jost 500`, 0.72rem, uppercase, letter-spacing .22em. Used for project
  category tags, image counters ("03 / 08") and nav.

## Structural device: `.manifesto`
This is the PDF's signature layout, rebuilt as one CSS component and used on every text room.
- A 12-column grid. `.manifesto__title` (Bebas) sits in columns 1–6, at the top-left.
  `.manifesto__lines` sits in columns 5–12, **right-aligned**, and each sentence is its own
  `<span class="line">` displayed as a block.
- On scroll into view, lines reveal one at a time: opacity 0 → 1 and translateY 0.6em → 0, staggered
  70ms per line. Use IntersectionObserver with a `--i` custom property per line for the
  `transition-delay`.
- Long lines may wrap. They stay right-aligned with `text-wrap: balance`.
- Mobile (<760px): the title stacks above, the lines stay right-aligned, and both use the full
  width.
- A hairline (`--line-dark`) runs under the title on desktop. It's the only ornament on the site.

Use it for these texts:
- Home: *From Brasília to the American West*
- About: *Why I Photograph* and *How I See Architecture*
- Services: *What I Deliver* and *Process & Tools*

The closing couplet "Not only what was built. / But what remains." is set huge in Bebas, centered,
on ink, just before the footer on every page.

## Photo rules
- Most images are **≈2.16:1 panoramas** (2000px wide). Show them **full-bleed and edge to edge** on
  ink, at their natural ratio. Don't crop panoramas to 16:9 except in the hero.
- Portrait images (≈0.71:1) are always shown in **pairs or triplets** side by side, never alone at
  full width. The PDF does this with the cathedral triptych.
- Use `srcset` with `-1000.jpg 1000w, -2000.jpg 2000w`, a `sizes` attribute, `loading="lazy"`
  (except the hero), and explicit width/height attributes.
- Captions sit below the image in label style, `--fog` on ink.
- Photos get no borders, no radius and no hover zoom. On hover over a project card, the image goes
  from 92% to 100% brightness and the title underline grows.
- **Light protection:** `contextmenu` and `dragstart` blocked on images, and
  `-webkit-user-drag: none`. Indexing stays allowed.

## Layout
- **Header:** fixed and transparent over the hero; it turns `--ink` after 80px of scroll.
  - Wordmark on the left.
  - Nav on the right: Work · About · Services · Contact.
  - On mobile, a full-screen ink menu with Bebas links.
- **Project page:**
  - Hero panorama.
  - A white intro room with the title in Bebas on the left and right-aligned meta lines on the
    right: category, scope and "Location — to be confirmed" omitted (don't render unknowns).
  - Then the gallery on ink as a vertical sequence: panoramas full-bleed, portraits in pairs or
    triplets, 8–16px gaps.
  - Then next/previous project links as two huge Bebas titles.
- **Work index:** two-column grid of large cards at ratio 3:2 with object-fit cover (the one place
  cropping is allowed), title in Bebas, category label above it. Filter buttons are label-style
  text toggles, not pills.

## Motion
Keep it slow and quiet.
- Manifesto lines stagger in.
- Images fade from opacity 0 → 1 over 600ms when loaded.
- The header background fades in.
- The lightbox crossfades over 300ms.
- No parallax, no scroll-jacking.
- Respect `prefers-reduced-motion`: show everything immediately and drop all transitions.
