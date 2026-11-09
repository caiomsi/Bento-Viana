#!/bin/bash
# Regenerates web images from images/master/ using tools/images.tsv.
# Output: images/work/<project>/<name>-1000.jpg and -2000.jpg (JPEG, q60).
# Usage: tools/build-images.sh   (run from the project root)
set -euo pipefail
cd "$(dirname "$0")/.."
while IFS=$'\t' read -r master project name alt; do
  [[ -z "$master" || "$master" == \#* ]] && continue
  src="images/master/$master.jpg"
  out="images/work/$project"
  mkdir -p "$out"
  for w in 1000 2000; do
    sips -s format jpeg -s formatOptions 60 -Z "$w" "$src" --out "$out/$name-$w.jpg" >/dev/null
  done
done < tools/images.tsv
du -sh images/work
