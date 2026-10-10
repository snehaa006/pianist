#!/usr/bin/env bash
# Graded 1920x1080 proxies of only the source windows the edit uses (originals in ../videos stay untouched).
# Grade: per-source exposure (EQ), then one shared warm, low-key curve. Saturation is left at 0.85 here;
# the composition sets the look per chapter (near-monochrome at home, muted colour on stage).
set -euo pipefail
SRC="$(cd "$(dirname "$0")/../../videos" && pwd)"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/proxies"
mkdir -p "$OUT"
COMMON="curves=all='0/0.035 0.25/0.2 0.6/0.58 0.9/0.83 1/0.9',colorbalance=rs=0.03:gs=0.01:bs=-0.03:rm=0.045:gm=0.012:bm=-0.045:rh=0.03:bh=-0.04,hue=s=0.85"
SCALE="scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080,unsharp=5:5:0.45:5:5:0"
HOME_GRAND="eq=brightness=-0.03:gamma=0.9:contrast=1.06"
GRADE1="eq=gamma=0.8:contrast=1.08:brightness=-0.05"
GRADE3="eq=gamma=0.82:contrast=1.06:brightness=-0.05"
STAGE="eq=gamma=1.04:contrast=1.04"
HALL="eq=gamma=0.88:contrast=1.05:brightness=-0.03"
# id | source clip time | start | end | fps | exposure
ROWS=(
  "H1|14.22.50|4.8|20.8|60|$HOME_GRAND"
  "H2|14.22.50|83.3|93.8|60|$HOME_GRAND"
  "T|14.23.15|15.4|20.9|30|$GRADE1"
  "A|14.23.23|16.2|21.4|30|$GRADE1"
  "G|14.23.31|14.0|22.4|30|$GRADE1"
  "S|14.22.59|20.4|28.4|30|$GRADE3"
  "D|14.23.06|34.7|40.2|30|$GRADE3"
  "M|14.23.41|5.0|19.8|30|$HALL"
  "O1|14.22.40|15.4|26.4|30|$STAGE"
  "O2|14.22.40|63.0|70.7|60|$STAGE"
  "D2|14.23.06|51.3|65.4|30|$GRADE3"
)
for row in "${ROWS[@]}"; do
  IFS='|' read -r id clip a b fps eqf <<<"$row"
  [[ -n "${ONLY:-}" && ",$ONLY," != *",$id,"* ]] && continue
  echo "→ $id ($clip $a–$b s @ $fps fps)"
  ffmpeg -v error -y -ss "$a" -to "$b" -i "$SRC/WhatsApp Video 2026-10-06 at $clip.mp4" -an \
    -vf "fps=$fps,$eqf,$COMMON,$SCALE,format=yuv420p" \
    -c:v libx264 -preset faster -crf 14 -g 12 -movflags +faststart "$OUT/$id.mp4"
done
ls -la "$OUT"
