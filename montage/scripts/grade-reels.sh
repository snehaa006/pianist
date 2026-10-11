#!/usr/bin/env bash
# The site's hero reels at full resolution, in the black-and-white-on-paper grade made on the exported reels
# (matched from those exports into grade/*.cube: brightness → tone, within ~3/255 of the export).
#   in:  out/reel-master.mp4 (1920x1080) and out/reel-phone-master.mp4 (1080x1920), the Remotion renders
#   out: ../site/public/media/video/hero-reel{,-phone}.{mp4,webm} (silent) and the posters
set -euo pipefail
cd "$(dirname "$0")/.."
SITE=../site/public/media
MONO="colorchannelmixer=.2126:.7152:.0722:0:.2126:.7152:.0722:0:.2126:.7152:.0722:0"
for cut in wide phone; do
  if [[ $cut == wide ]]; then IN=out/reel-master.mp4; NAME=hero-reel; else IN=out/reel-phone-master.mp4; NAME=hero-reel-phone; fi
  G="$MONO,lut1d=file=grade/$cut.cube,format=yuv420p"
  ffmpeg -v error -y -i "$IN" -an -vf "$G" -c:v libx264 -preset slow -crf 24 -tune film -profile:v high -movflags +faststart "$SITE/video/$NAME.mp4"
  ffmpeg -v error -y -i "$IN" -an -vf "$G" -c:v libvpx-vp9 -crf 35 -b:v 0 -row-mt 1 -deadline good -cpu-used 1 "$SITE/video/$NAME.webm"
  ffmpeg -v error -y -i "$IN" -frames:v 1 -vf "$G" -c:v libwebp -quality 88 "$SITE/posters/$NAME.webp"
  ffmpeg -v error -y -ss 6.6 -i "$IN" -frames:v 1 -vf "$G" -c:v libwebp -quality 88 "$SITE/posters/$NAME-still.webp"
done
ls -la "$SITE"/video/hero-reel* "$SITE"/posters/hero-reel*
