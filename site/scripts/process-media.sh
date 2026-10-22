#!/usr/bin/env bash
# Builds every web asset in public/media from the source videos in ../videos.
#   - full performance: H.264 MP4 + VP9 WebM, native size (all sources are under 1080p),
#     30 fps max, light brand grade (about 20% desaturated, slightly warm)
#   - hero: a muted 7.5 s loop with a crossfaded seam (MP4 + WebM, no audio track)
#   - film loops: a muted 6 s warm-monochrome 640x360 loop of every film (MP4 + WebM), played on the home reel
#   - stills: warm-monochrome WebP posters, the 4:5 portrait (the supplied photo, in colour) and a 1200x630 share image
#   - site sound: every piece as audio only, cut to the music (Opus WebM + AAC M4A), played on "Hear me play" and
#     on the stairs; their notes come from scripts/notes.py
#   - Biography stills: more moments of her, taken from the films (warm monochrome, public/media/about)
# Usage: bash scripts/process-media.sh [--stills | --loops | --audio | --about] [--only=slug,slug]
#   --stills: redo images only, skip the video encodes. --loops: encode the film loops only.
#   --audio: encode the site sound only. --about: cut the Biography stills only.
# Needs ffmpeg with libx264, libvpx-vp9, libopus, libwebp.
set -euo pipefail
STILLS_ONLY=0; LOOPS_ONLY=0; AUDIO_ONLY=0; ABOUT_ONLY=0; ONLY=""
for arg in "$@"; do
  case "$arg" in
    --stills) STILLS_ONLY=1 ;;
    --loops) LOOPS_ONLY=1 ;;
    --audio) AUDIO_ONLY=1 ;;
    --about) ABOUT_ONLY=1 ;;
    --only=*) ONLY=",${arg#--only=}," ;;   # e.g. --only=dog-hungry,andante: encode just these films
  esac
done

SRC="$(cd "$(dirname "$0")/../../videos" && pwd)"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/media"
FONT="$(cd "$(dirname "$0")/.." && pwd)/src/styles/fonts/BebasNeue-Regular.ttf"
mkdir -p "$OUT/video/loops" "$OUT/posters" "$OUT/og" "$OUT/audio" "$OUT/about"

# Site sound: each piece cut to its music, without the spoken exam introductions, the walk-on or the applause (the
# edges were found from the recordings' loudness and their transcribed notes: the cut starts about a tenth of a second
# before the first note and ends once the last chord has died away or the applause comes in). The natural decay
# stays; the last `fade` seconds fade out; all are normalised to -20 LUFS, so one piece is as loud as the next.
# slug | source file | music in (s) | music out (s) | fade (s)
PIECES=(
  "at-home-grand|WhatsApp Video 2026-10-06 at 14.22.50.mp4|5.2|92.6|1"
  "austrian-master-classes|WhatsApp Video 2026-10-06 at 14.23.41.mp4|10.3|89.4|0.6"
  "on-stage|WhatsApp Video 2026-10-06 at 14.22.40.mp4|16.2|66.35|0.35"
  "song-of-twilight|WhatsApp Video 2026-10-06 at 14.22.59.mp4|20.85|99.2|0.6"
  "lcm-grade-1|WhatsApp Video 2026-10-06 at 14.23.31.mp4|14.4|113.3|1"
  "dog-hungry|WhatsApp Video 2026-10-06 at 14.23.06.mp4|17.5|65.4|0.5"
  "andante|WhatsApp Video 2026-10-06 at 14.23.23.mp4|16.3|62.4|0.8"
)
sound() {
  for row in "${PIECES[@]}"; do
    IFS='|' read -r slug file in out fade <<<"$row"
    [[ -n "$ONLY" && "$ONLY" != *",$slug,"* ]] && continue
    echo "♪ $slug"
    local st; st=$(awk -v a="$in" -v b="$out" -v f="$fade" 'BEGIN { print b - a - f }')
    local af="atrim=$in:$out,asetpts=PTS-STARTPTS,afade=t=in:d=0.08,afade=t=out:st=$st:d=$fade,loudnorm=I=-20:TP=-1.5:LRA=11"
    ffmpeg -v error -y -i "$SRC/$file" -vn -af "$af" -ar 48000 -c:a libopus -b:a 96k "$OUT/audio/$slug.webm"
    ffmpeg -v error -y -i "$SRC/$file" -vn -af "$af" -ar 44100 -c:a aac -b:a 128k -movflags +faststart "$OUT/audio/$slug.m4a"
  done
}
(( AUDIO_ONLY )) && { sound; ls -la "$OUT"/audio; exit 0; }

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

# Film loops: 6.6 s from two seconds before the poster frame; the last 0.6 s crossfades into the first, so the loop
# has no seam. Small (640x360, 24 fps, no audio) because the reel plays up to a dozen at once.
loop() {
  local in="$1" t="$2" out="$3"
  local start; start=$(awk -v t="$t" 'BEGIN { print (t > 2 ? t - 2 : 0) }')
  local graph="[0:v]fps=24,scale=640:360:force_original_aspect_ratio=increase,crop=640:360,$MONO,format=yuv420p,split[a][b];[a]trim=0.6:6.6,setpts=PTS-STARTPTS[body];[b]trim=0:0.6,setpts=PTS-STARTPTS[head];[body][head]xfade=transition=fade:duration=0.6:offset=5.4,format=yuv420p[v]"
  ffmpeg -v error -y -ss "$start" -t 6.6 -i "$in" -filter_complex "$graph" \
    -map "[v]" -an -c:v libx264 -preset slow -crf 27 -profile:v high -g 48 -movflags +faststart "$out.mp4"
  ffmpeg -v error -y -ss "$start" -t 6.6 -i "$in" -filter_complex "$graph" \
    -map "[v]" -an -c:v libvpx-vp9 -crf 38 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 -g 48 "$out.webm"
}

# Biography stills: moments the posters don't show, each cut from its film at its own time and crop (w:h:x:y, in the
# source's pixels), warm monochrome. The faces to camera come from the start of the exam films, where she says what
# she will play; the rest are mid-piece, the end of a piece and the bow.
# slug | source file | time (s) | crop
ABOUT=(
  "smile-hungry|WhatsApp Video 2026-10-06 at 14.23.06.mp4|2|432:540:440:0"
  "smile-twilight|WhatsApp Video 2026-10-06 at 14.22.59.mp4|2|432:540:520:0"
  "smile-technical|WhatsApp Video 2026-10-06 at 14.23.15.mp4|2|432:540:120:0"
  "smile-andante|WhatsApp Video 2026-10-06 at 14.23.23.mp4|3|372:464:60:0"
  "smile-grade-1|WhatsApp Video 2026-10-06 at 14.23.31.mp4|114|432:540:200:20"
  "score|WhatsApp Video 2026-10-06 at 14.23.31.mp4|111|432:576:120:0"
  "amc-lift|WhatsApp Video 2026-10-06 at 14.23.41.mp4|88|400:480:0:0"
  "amc-stand|WhatsApp Video 2026-10-06 at 14.23.41.mp4|1|720:480:40:0"
  "grand-up|WhatsApp Video 2026-10-06 at 14.22.50.mp4|91.5|348:464:40:0"
  "stage-arms|WhatsApp Video 2026-10-06 at 14.22.40.mp4|65.5|348:464:220:0"
  "stage-bow|WhatsApp Video 2026-10-06 at 14.22.40.mp4|6.5|372:464:320:0"
)
about() {
  for row in "${ABOUT[@]}"; do
    IFS='|' read -r slug file t crop <<<"$row"
    ffmpeg -v error -y -ss "$t" -i "$SRC/$file" -frames:v 1 -vf "crop=$crop,$MONO,format=yuv420p" \
      -c:v libwebp -quality 82 "$OUT/about/$slug.webp"
  done
}
(( ABOUT_ONLY )) && { about; ls -la "$OUT"/about; exit 0; }

for row in "${VIDEOS[@]}"; do
  IFS='|' read -r slug file t <<<"$row"
  [[ -n "$ONLY" && "$ONLY" != *",$slug,"* ]] && continue
  in="$SRC/$file"
  echo "→ $slug"
  (( ! STILLS_ONLY )) && loop "$in" "$t" "$OUT/video/loops/$slug"
  (( LOOPS_ONLY )) && continue
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
(( LOOPS_ONLY )) && { ls -la "$OUT"/video/loops; exit 0; }

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

# Hero and Biography portrait, 4:5: the supplied photograph at the piano in the Austrian Master Classes hall (source is 1200x1600,
# sRGB; the crop drops the ceiling frieze). In its original colour, no grade. Full size for 2x screens, half size
# for the rest.
PHOTO="$SRC/../photos/selin-incekara-austrian-master-classes.jpg"
ffmpeg -v error -y -i "$PHOTO" -frames:v 1 \
  -vf "crop=1200:1500:0:100,format=yuv420p" -c:v libwebp -quality 82 "$OUT/posters/portrait.webp"
ffmpeg -v error -y -i "$PHOTO" -frames:v 1 \
  -vf "crop=1200:1500:0:100,scale=600:750:flags=lanczos,format=yuv420p" -c:v libwebp -quality 84 \
  "$OUT/posters/portrait-600.webp"

# Social share image, 1200x630, a poster like the landing page: her silhouette at the grand piano (the cut-out from
# scripts/cutout.py, as an ink mask) on the red, her name in ink, "Pianist" in cream.
CUT="$OUT/cutouts/selin-grand.webp"
ffmpeg -v error -y -f lavfi -i "color=c=0xB42F35:s=1200x630" -i "$CUT" \
  -filter_complex "[1:v]format=rgba,scale=-1:500,geq=r=14:g=10:b=10:a='alpha(X\,Y)'[shape];[0:v][shape]overlay=x=W-w-24:y=H-h,drawtext=fontfile=$FONT:text=SELIN:fontcolor=0x0E0A0A:fontsize=160:x=52:y=72,drawtext=fontfile=$FONT:text=INCEKARA:fontcolor=0x0E0A0A:fontsize=160:x=52:y=210,drawtext=fontfile=$FONT:text=PIANIST:fontcolor=0xF4E9D8:fontsize=34:x=58:y=h-th-60" \
  -frames:v 1 -q:v 3 "$OUT/og/selin-incekara-share.jpg"

# The landing page no longer plays a film: it opens on the photograph above (posters/portrait*), standing on a keyboard.
# (../montage/scripts/hero-film.py still cuts the old ten-second hero film if it is ever wanted back.)
# Her cut-out at the grand piano (cutouts/selin-grand.webp) is made by scripts/cutout.py.

about
(( ! STILLS_ONLY )) && sound

ls -la "$OUT"/*
