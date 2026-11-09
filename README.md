# Bento Viana Photography

Architectural and aerial photographer, Salt Lake City UT. Multi-page static portfolio.
Live: https://caiomsi.github.io/Bento-Viana (custom domain bentoviana.com planned).

## Launch gate

- [ ] Client approval of the full site
- [ ] Original high-res images received, with written permission for web usage
- [ ] Real project names, architect credits, locations, and years (titles are currently descriptive placeholders)
- [ ] UNKNOWN facts confirmed: bio facts and the titles/years of the three Brasília books
- [ ] Bento has reviewed all manifesto copy
- [ ] Lead flow: MSI-Forms recipient switched to hello@bentoviana.com; site origins added to `ALLOWED_ORIGINS`; test submission received
- [ ] Domain cutover of bentoviana.com: DNS A/www records only (keep iCloud MX/TXT), add `CNAME`, then update canonical, OG, sitemap, robots, 404, and JSON-LD URLs to the new domain
- [ ] Search for leftover `placehold.co`, `REPLACE WITH`, and old `caiomsi.github.io` URLs

## Images

`tools/build-images.sh` + `tools/images.tsv` regenerate `images/work/*`. Originals live in
gitignored `images/source/` and `images/master/`.
