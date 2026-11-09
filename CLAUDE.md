# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## What this is

Bento Viana Photography — architectural and aerial photographer, Salt Lake City UT.
**Real client** (friend of Caio). Multi-page portfolio, English. Plain static
HTML/CSS/JS, no build step for the site itself. See root `../CLAUDE.md` for shared
conventions (preview, deploy, SEO, images).

## Structure

- Pages: `index.html` (home), `work/index.html` (work index), ~9 project pages under
  `work/`, `about/`, `services/`, `contact/`, `404.html`.
- `css/style.css`, `js/main.js` (from the quiet-luxury kit).
- `data/projects.js` drives the work pages (index grid and project content). Edit
  project data there, not by hand in each page where avoidable.
- `images/work/*` is generated: `tools/build-images.sh` + `tools/images.tsv`
  regenerate it from the masters. Edit the TSV and re-run; don't hand-edit outputs.
- `images/source/` and `images/master/` are gitignored (originals stay local).

## Design language

See `DESIGN.md` ("Monument & Horizon" — mirrors his PDF: black/white, Bebas + Barlow Condensed wordmark, right-aligned `.manifesto`). Reuse the tokens at the
top of `css/style.css`.

## Lead flow

Contact form posts to the shared `MSI-Forms` backend with site tag `bento-viana`.
Add this site's origins (`caiomsi.github.io`, later `bentoviana.com`) to
`ALLOWED_ORIGINS` in `MSI-Forms/api/submit.js`. Recipient must be switched to
`hello@bentoviana.com` before launch.

## Image protection

Light only. Do NOT add `noimageindex` (the photos should be discoverable).

## Hosting

GitHub Pages at `caiomsi.github.io/Bento-Viana`. Custom domain `bentoviana.com`
planned; cutover later (A/www records only, keep iCloud MX/TXT).

## Launch gate

See the **Launch gate** checklist in `README.md`. Placeholder project titles must be
replaced before launch.
