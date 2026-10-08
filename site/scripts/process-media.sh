#!/usr/bin/env bash
# Builds every web asset in public/media from the source videos in ../videos.
#   - full performance: H.264 MP4 + VP9 WebM, native size (all sources are under 1080p),
#     30 fps max, light brand grade (about 20% desaturated, slightly warm)
#   - hero: a muted 7.5 s loop with a crossfaded seam (MP4 + WebM, no audio track)
#   - stills: warm-monochrome WebP posters, a 4:5 portrait and a 1200x630 share image
# Usage: bash scripts/process-media.sh [--stills]   (--stills: redo images only, skip the video encodes)
# Needs ffmpeg with libx264, libvpx-vp9, libopus, libwebp.
set -euo pipefail
STILLS_ONLY=0; ONLY=""
for arg in "$@"; do
  case "$arg" in
    --stills) STILLS_ONLY=1 ;;
    --only=*) ONLY=",${arg#--only=}," ;;   # e.g. --only=dog-hungry,andante: encode just these films
  esac
done

SRC="$(cd "$(dirname "$0")/../../videos" && pwd)"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/media"
FONT="$(cd "$(dirname "$0")/.." && pwd)/src/styles/fonts/BebasNeue-Regular.ttf"
mkdir -p "$OUT/video" "$OUT/posters" "$OUT/og"

# slug | source file | poster time (s)
VIDEOS=(
  "austrian-master-classes|WhatsApp Video 2026-10-06 at 14.23.41.mp4|40"
  "on-stage|WhatsApp Video 2026-10-06 at 14.22.40.mp4|26"
  "at-home-grand|WhatsApp Video 2026-10-06 at 14.22.50.mp4|40"
  "song-of-twilight|WhatsApp Video 2026-10-06 at 14.22.59.mp4|50"
  "lcm-grade-1|WhatsApp Video 2026-10-06 at 14.23.31.mp4|35"
  "dog-hungry|WhatsApp Video 2026-10-06 at 14.23.06.mp4|38"
  "grade-1-technical|WhatsApp Video 2026-10-06 at 14.23.15.mp4|62"
  "andante|WhatsApp Video 2026-10-06 at 14.23.23.mp4|40"
)

# Imagery rules: performance colour is desaturated ~20% and warm-shifted, never cool.
COLOUR="eq=saturation=0.8,colorbalance=rm=0.03:gm=0.01:bm=-0.03:rh=0.02:bh=-0.02"
# Warm monochrome: warm luminance mix, blacks lifted ~4% (toward ink), low-key mids, soft vignette.
WARM="format=gbrp,colorchannelmixer=rr=.30:rg=.59:rb=.11:gr=.285:gg=.56:gb=.105:br=.258:bg=.507:bb=.095"
MONO="$WARM,curves=all='0/0.043 0.5/0.43 1/0.95',vignette=angle=PI/5"
# Hero fill only: the loop plays inside the letters of the wordmark on an ink stage, so its blacks are
# lifted (~24%) and there is no vignette; otherwise the black piano would disappear into the background.
LIFT="$WARM,curves=all='0/0.24 0.5/0.62 1/0.96'"

for row in "${VIDEOS[@]}"; do
  IFS='|' read -r slug file t <<<"$row"
  [[ -n "$ONLY" && "$ONLY" != *",$slug,"* ]] && continue
  in="$SRC/$file"
  echo "→ $slug"
  if (( ! STILLS_ONLY )); then
    ffmpeg -v error -y -i "$in" -vf "fps=fps='min(30,source_fps)',$COLOUR,format=yuv420p" \
      -c:v libx264 -preset slow -crf 23 -profile:v high -movflags +faststart \
      -c:a aac -b:a 128k -ac 2 "$OUT/video/$slug.mp4"
    ffmpeg -v error -y -i "$in" -vf "fps=fps='min(30,source_fps)',$COLOUR,format=yuv420p" \
      -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 \
      -c:a libopus -b:a 96k "$OUT/video/$slug.webm"
  fi
  ffmpeg -v error -y -ss "$t" -i "$in" -frames:v 1 -vf "$MONO,format=yuv420p" \
    -c:v libwebp -quality 82 "$OUT/posters/$slug.webp"
done

[[ -n "$ONLY" ]] && { ls -la "$OUT"/video "$OUT"/posters; exit 0; }

# Hero loop: 8.5 s from the Austrian Master Classes concert; the last second crossfades into the first.
HERO="$SRC/WhatsApp Video 2026-10-06 at 14.23.41.mp4"
LOOP="[0:v]fps=30,$LIFT,format=yuv420p,split[a][b];[a]trim=1:8.5,setpts=PTS-STARTPTS[body];[b]trim=0:1,setpts=PTS-STARTPTS[head];[body][head]xfade=transition=fade:duration=1:offset=6.5,format=yuv420p[v]"
if (( ! STILLS_ONLY )); then
  ffmpeg -v error -y -ss 48 -t 8.5 -i "$HERO" -filter_complex "$LOOP" -map "[v]" -an \
    -c:v libx264 -preset slow -crf 24 -movflags +faststart "$OUT/video/hero-loop.mp4"
  ffmpeg -v error -y -ss 48 -t 8.5 -i "$HERO" -filter_complex "$LOOP" -map "[v]" -an \
    -c:v libvpx-vp9 -crf 36 -b:v 0 -row-mt 1 "$OUT/video/hero-loop.webm"
fi
ffmpeg -v error -y -ss 49 -i "$HERO" -frames:v 1 -vf "$MONO,format=yuv420p" -c:v libwebp -quality 82 "$OUT/posters/hero.webp"
ffmpeg -v error -y -ss 49 -i "$HERO" -frames:v 1 -vf "$LIFT,format=yuv420p" -c:v libwebp -quality 82 "$OUT/posters/hero-fill.webp"

# Fermata: the hall of the Austrian Master Classes concert, wide, seen past the front-row chairs.
ffmpeg -v error -y -ss 12 -i "$HERO" -frames:v 1 \
  -vf "$MONO,format=yuv420p" -c:v libwebp -quality 82 "$OUT/posters/fermata.webp"

# About portrait, 4:5: profile at the grand piano at home (source is 832x464).
ffmpeg -v error -y -ss 70 -i "$SRC/WhatsApp Video 2026-10-06 at 14.22.50.mp4" -frames:v 1 \
  -vf "crop=371:464:96:0,$MONO,format=yuv420p" -c:v libwebp -quality 85 "$OUT/posters/portrait.webp"

# Social share image, 1200x630: dark stage still under the --scrim gradient (ink, 0% at 40% → 72% at the bottom),
# wordmark bottom-left in ivory.
ffmpeg -v error -y -ss 26 -i "$SRC/WhatsApp Video 2026-10-06 at 14.22.40.mp4" \
  -f lavfi -i "color=c=0x0B0B0C:s=1200x630,format=rgba,geq=r=11:g=11:b=12:a='184*clip((Y-252)/378\\,0\\,1)'" \
  -filter_complex "[0:v]scale=1200:-2,crop=1200:630:0:(ih-630)/2,$MONO,format=rgba[bg];[bg][1:v]overlay=format=auto,drawtext=fontfile=$FONT:text=SRINIJAKARA:fontcolor=0xF4EFE6:fontsize=168:x=56:y=h-th-48,drawtext=fontfile=$FONT:text=PIANIST:fontcolor=0xA8A196:fontsize=30:x=60:y=h-th-232" \
  -frames:v 1 -q:v 3 "$OUT/og/srinijakara-share.jpg"

ls -la "$OUT"/*
