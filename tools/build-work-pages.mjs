#!/usr/bin/env node
/**
 * Generates the static Work pages from data/projects.json.
 *
 * Usage (from the project root):   node tools/build-work-pages.mjs
 *
 * Writes:
 *   work/index.html          - filterable grid of every project
 *   work/<slug>/index.html   - one page per project (hero, intro, gallery, prev/next, CTA)
 *
 * Uses tools/partials/header.html + footer.html ({{ROOT}} is replaced per page).
 * No npm dependencies. Output is plain static HTML (good for SEO); do not hand-edit it.
 * To change copy, alt text or order, edit data/projects.json (or tools/images.tsv for
 * image data) and re-run.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://caiomsi.github.io/Bento-Viana/';
const BRAND = 'Bento Viana';
const SUFFIX = 'Bento Viana Architectural Photography';
const FONTS = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@200;600&family=Jost:wght@300;400;500&display=swap';

const projects = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data/projects.json'), 'utf8'));
const partial = (n) => fs.readFileSync(path.join(ROOT_DIR, 'tools/partials', n), 'utf8');
const header = partial('header.html');
const footer = partial('footer.html');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pad = (n) => String(n).padStart(2, '0');
const sentences = (t) => t.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [t];
const img = (p, f, w) => `images/work/${p.slug}/${f}-${w}.jpg`;
const abs = (rel) => SITE + rel;

function head({ title, desc, canonical, ogImage, root, jsonld }) {
  return `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${canonical}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="theme-color" content="#1d1b1c">
  <link rel="icon" type="image/png" href="${root}images/favicon.png">
  <link rel="apple-touch-icon" href="${root}images/apple-touch-icon.png">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${BRAND}">
  <meta property="og:locale" content="en_US">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${ogImage}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(desc)}">
  <meta name="twitter:image" content="${ogImage}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${FONTS}" rel="stylesheet">
  <link rel="stylesheet" href="${root}css/style.css">
  <link rel="stylesheet" href="${root}css/work.css">
  <script defer src="${root}js/main.js"></script>
  <script type="application/ld+json">${JSON.stringify(jsonld)}</script>
</head>`;
}

/* ---- gallery sequencing -------------------------------------------------- */
// Split a run of n consecutive portraits into rows of 2-3 (never a lone one).
function splitRun(n) {
  const rows = [];
  while (n > 0) {
    if (n === 4) { rows.push(2, 2); n = 0; }
    else if (n === 5) { rows.push(3, 2); n = 0; }
    else if (n === 2) { rows.push(2); n = 0; }
    else if (n === 1) { rows.push(1); n = 0; }
    else { rows.push(3); n -= 3; }
  }
  return rows;
}

function figure(p, i, sizes, loading = 'lazy') {
  const full = img(p, i.filename, 2000);
  return `<a class="work-img" href="${'../../' + full}" data-lightbox data-lightbox-group="${p.slug}" data-full="${'../../' + full}"><img class="fade-img" src="../../${img(p, i.filename, 1000)}" srcset="../../${img(p, i.filename, 1000)} 1000w, ../../${full} 2000w" sizes="${sizes}" width="${i.width}" height="${i.height}" alt="${esc(i.alt)}" loading="${loading}" decoding="async" draggable="false"></a>`;
}

function gallery(p) {
  // The hero already shows the opening image full-screen; don't repeat it first in the gallery.
  const items = p.images[0] && p.images[0].filename === p.hero ? p.images.slice(1) : p.images;
  const rows = [];
  for (let k = 0; k < items.length; ) {
    if (items[k].orientation === 'landscape') {
      rows.push(`<div class="work-row work-row--full">${figure(p, items[k], '100vw')}</div>`);
      k++;
      continue;
    }
    let run = [];
    while (k < items.length && items[k].orientation === 'portrait') run.push(items[k++]);
    let at = 0;
    for (const n of splitRun(run.length)) {
      const group = run.slice(at, at + n);
      at += n;
      if (n === 1) {
        rows.push(`<div class="work-row work-row--solo">${figure(p, group[0], '(min-width: 760px) 50vw, 100vw')}</div>`);
      } else {
        const cols = group.map((g) => (g.width / g.height).toFixed(4) + 'fr').join(' ');
        rows.push(`<div class="work-row work-row--group work-row--${n}" style="grid-template-columns:${cols}">${group.map((g) => figure(p, g, n === 2 ? '50vw' : '34vw')).join('')}</div>`);
      }
    }
  }
  return rows.join('\n    ');
}

/* ---- project page -------------------------------------------------------- */
function projectPage(p, idx) {
  const n = projects.length;
  const prev = projects[(idx - 1 + n) % n];
  const next = projects[(idx + 1) % n];
  const url = `${SITE}work/${p.slug}/`;
  const title = `${p.title} — ${SUFFIX}`;
  const hero = p.images.find((i) => i.filename === p.hero);
  const lines = [...sentences(p.intro), `${p.images.length} photographs`];
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ImageGallery',
        '@id': url,
        url,
        name: `${p.title} — ${BRAND}`,
        description: p.intro,
        author: { '@type': 'Person', name: BRAND },
        image: p.images.map((i) => abs(img(p, i.filename, 2000))),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
          { '@type': 'ListItem', position: 2, name: 'Work', item: SITE + 'work/' },
          { '@type': 'ListItem', position: 3, name: p.title, item: url },
        ],
      },
    ],
  };
  const R = '../../';
  const heroSrc = `${R}${img(p, p.hero, 1000)}`;
  return `<!doctype html>
<html lang="en">
${head({ title, desc: p.intro, canonical: url, ogImage: abs(img(p, p.hero, 2000)), root: R, jsonld })}
<body class="has-hero page-project">
${header.replaceAll('{{ROOT}}', R)}
<main id="main">
  <section class="work-hero" aria-labelledby="project-title">
    <img class="work-hero__img fade-img" src="${heroSrc}" srcset="${heroSrc} 1000w, ${R}${img(p, p.hero, 2000)} 2000w" sizes="100vw" width="${hero.width}" height="${hero.height}" alt="${esc(hero.alt)}" fetchpriority="high" decoding="async" draggable="false">
    <div class="work-hero__scrim" aria-hidden="true"></div>
    <div class="work-hero__body">
      <p class="label">${esc(p.category)}</p>
      <h1 id="project-title">${esc(p.title)}</h1>
      <p class="label work-hero__count">Project ${pad(idx + 1)} / ${pad(n)}</p>
    </div>
  </section>

  <section class="section section--paper work-intro" aria-label="About this project">
    <div class="manifesto">
      <h2 class="manifesto__title">${esc(p.title)}</h2>
      <p class="manifesto__lines">${lines.map((l, k) => `<span class="line${k === lines.length - 1 ? ' label' : ''}" style="--i:${k}">${esc(l)}</span>`).join('\n        ')}</p>
    </div>
  </section>

  <section class="section--ink work-gallery" aria-label="${esc(p.title)} photographs">
    ${gallery(p)}
  </section>

  <nav class="section--ink work-pager" aria-label="More projects">
    <a class="work-pager__link work-pager__link--prev" href="../${prev.slug}/" rel="prev">
      <span class="label">Previous project</span>
      <span class="work-pager__title">${esc(prev.title)}</span>
    </a>
    <a class="work-pager__link work-pager__link--next" href="../${next.slug}/" rel="next">
      <span class="label">Next project</span>
      <span class="work-pager__title">${esc(next.title)}</span>
    </a>
  </nav>

  <section class="section section--paper work-cta" aria-label="Contact">
    <h2 class="work-cta__title">Have a project that deserves its story told?</h2>
    <a class="btn-link" href="${R}contact/">Start a conversation</a>
  </section>
</main>
${footer.replaceAll('{{ROOT}}', R)}
</body>
</html>
`;
}

/* ---- work index ---------------------------------------------------------- */
const FILTERS = [['all', 'All'], ['architecture', 'Architecture'], ['interiors', 'Interiors'], ['aerial', 'Aerial'], ['landscape', 'Landscape'], ['cities', 'Cities']];

function indexPage() {
  const url = SITE + 'work/';
  const desc = 'Architectural, interior, aerial and landscape photography by Bento Viana, from Brasília to the American West.';
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': url,
        url,
        name: `Work — ${BRAND}`,
        description: desc,
        isPartOf: { '@type': 'WebSite', name: SUFFIX, url: SITE },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: projects.map((p, k) => ({ '@type': 'ListItem', position: k + 1, url: `${SITE}work/${p.slug}/`, name: p.title })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
          { '@type': 'ListItem', position: 2, name: 'Work', item: url },
        ],
      },
    ],
  };
  const first = projects[0];
  const cards = projects.map((p, k) => {
    const c = p.images.find((i) => i.filename === p.cover);
    const s = img(p, p.cover, 1000);
    return `<li class="work-card" data-filters="${p.filters.join(' ')}">
        <a class="work-card__link" href="${p.slug}/">
          <span class="work-card__media"><img class="fade-img" src="../${s}" srcset="../${s} 1000w, ../${img(p, p.cover, 2000)} 2000w" sizes="(min-width: 760px) 50vw, 100vw" width="${c.width}" height="${c.height}" alt="${esc(c.alt)}" loading="${k < 2 ? 'eager' : 'lazy'}" decoding="async" draggable="false"></span>
          <span class="label work-card__cat">${esc(p.category)}</span>
          <span class="work-card__title"><span>${esc(p.title)}</span></span>
        </a>
      </li>`;
  }).join('\n      ');
  const R = '../';
  return `<!doctype html>
<html lang="en">
${head({ title: `Work — ${SUFFIX}`, desc, canonical: url, ogImage: abs('images/og-image.jpg'), root: R, jsonld })}
<body class="page-work">
${header.replaceAll('{{ROOT}}', R)}
<main id="main">
  <section class="section section--ink work-index-head">
    <h1>Work</h1>
    <p class="work-index-head__lede">Architecture, interiors, aerial and landscape — Brasília to the American West.</p>
    <div class="work-filters" role="group" aria-label="Filter projects">
      ${FILTERS.map(([v, l]) => `<button class="label work-filter" type="button" data-filter="${v}" aria-pressed="${v === 'all'}">${l}</button>`).join('\n      ')}
    </div>
  </section>
  <section class="section--ink work-index" aria-label="Projects">
    <ul class="work-grid">
      ${cards}
    </ul>
    <p class="label work-empty" hidden>No projects in this category yet.</p>
  </section>
</main>
${footer.replaceAll('{{ROOT}}', R)}
<script>
(function () {
  var buttons = document.querySelectorAll('.work-filter');
  var cards = document.querySelectorAll('.work-card');
  var empty = document.querySelector('.work-empty');
  if (!buttons.length) return;
  function apply(f) {
    var shown = 0;
    buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.filter === f)); });
    cards.forEach(function (c) {
      var ok = f === 'all' || c.dataset.filters.split(' ').indexOf(f) > -1;
      c.hidden = !ok;
      if (ok) shown++;
    });
    if (empty) empty.hidden = shown > 0;
  }
  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      apply(b.dataset.filter);
      try { history.replaceState(null, '', b.dataset.filter === 'all' ? location.pathname : '#' + b.dataset.filter); } catch (e) {}
    });
  });
  var h = location.hash.slice(1);
  if (h && document.querySelector('.work-filter[data-filter="' + h + '"]')) apply(h);
})();
</script>
</body>
</html>
`;
}

/* ---- write --------------------------------------------------------------- */
fs.mkdirSync(path.join(ROOT_DIR, 'work'), { recursive: true });
fs.writeFileSync(path.join(ROOT_DIR, 'work/index.html'), indexPage());
projects.forEach((p, idx) => {
  const dir = path.join(ROOT_DIR, 'work', p.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), projectPage(p, idx));
});
console.log(`Wrote work/index.html + ${projects.length} project pages.`);
