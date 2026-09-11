#!/usr/bin/env bash
# Turns the raw recordings from record.mjs into the files the site loads:
#   public/previews/<slug>.mp4        1280×800 H.264, ~12.5 s, no audio
#   public/previews/<slug>.webp       poster, first settled frame
#   public/previews/<slug>-thumb.webp filmstrip thumbnail
# Needs ffmpeg and python3 with Pillow (this machine's ffmpeg has no libwebp).
# Usage: bash scripts/previews/encode.sh [slug ...]
set -euo pipefail

RAW=".previews-raw"
DST="public/previews"
mkdir -p "$DST"

slugs=("$@")
if [ ${#slugs[@]} -eq 0 ]; then
  slugs=($(ls "$RAW"))
fi

for s in "${slugs[@]}"; do
  read -r ss dur speed <<<"$(python3 -c "
import json
m = json.load(open('$RAW/$s/meta.json'))
a = max(0, m['start'] - 0.3)
d = m['end'] - a
print(round(a, 2), round(d, 2), round(d / 12.5, 3))")"

  ffmpeg -v error -y -ss "$ss" -t "$dur" -i "$RAW/$s/"*.webm \
    -vf "setpts=PTS/$speed,fps=30,scale=1280:-2:flags=lanczos" \
    -c:v libx264 -crf 27 -preset slow -profile:v high -pix_fmt yuv420p -g 60 \
    -movflags +faststart -an "$DST/$s.mp4"

  python3 - "$RAW/$s/poster.png" "$DST/$s" <<'EOF'
import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert('RGB')
im.resize((1280, 800), Image.LANCZOS).save(sys.argv[2] + '.webp', 'WEBP', quality=72, method=6)
im.resize((384, 240), Image.LANCZOS).save(sys.argv[2] + '-thumb.webp', 'WEBP', quality=70, method=6)
EOF
  echo "encoded $s (${speed}× speed)"
done
