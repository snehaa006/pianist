#!/usr/bin/env bash
# The landing page's opening film, encoded for the web from the masters that scripts/hero-film.py renders.
#   in:  out/hero-film/wide.mp4 (1920x996) and out/hero-film/phone.mp4 (1080x1820), 10 s, 30 fps, silent
#   out: ../site/public/media/video/hero-film{,-phone}.{mp4,webm}, and in ../site/public/media/posters/
#        hero-film{,-phone}.webp (the first frame, shown while the film loads) and hero-film{,-phone}-still.webp
#        (her hands rising off the keys on stage, shown instead of the film with reduced motion)
# The grain is what costs bits, so the bitrate is capped (about 3.5 Mbit/s, under 5 MB per cut).
set -euo pipefail
cd "$(dirname "$0")/.."
SITE=../site/public/media
STILL=6.6
for cut in wide phone; do
  IN=out/hero-film/$cut.mp4
  NAME=hero-film; [[ $cut == phone ]] && NAME=hero-film-phone
  ffmpeg -v error -y -i "$IN" -an -c:v libx264 -preset slow -crf 26 -maxrate 3.5M -bufsize 7M -tune film -profile:v high -pix_fmt yuv420p -movflags +faststart "$SITE/video/$NAME.mp4"
  ffmpeg -v error -y -i "$IN" -an -c:v libvpx-vp9 -crf 38 -b:v 2.8M -maxrate 3.2M -row-mt 1 -deadline good -cpu-used 1 -pix_fmt yuv420p "$SITE/video/$NAME.webm"
  ffmpeg -v error -y -i "$IN" -frames:v 1 -c:v libwebp -quality 72 "$SITE/posters/$NAME.webp"
  ffmpeg -v error -y -ss $STILL -i "$IN" -frames:v 1 -c:v libwebp -quality 80 "$SITE/posters/$NAME-still.webp"
done
ls -la "$SITE"/video/hero-film* "$SITE"/posters/hero-film*
