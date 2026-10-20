#!/usr/bin/env bash
# The earlier hero reels at full resolution, in the reel's original colour: no grade, only re-encoded for the web.
# The site now opens on the hero film (scripts/hero-film.py); to bring the reel back, run this and point CUTS in
# ../site/src/components/Hero.jsx at hero-reel.
#   in:  the colour originals kept in this folder (selin-incekara-reel-colour-{web-1920x1080,phone-1080x1920}.mp4,
#        the Remotion renders, also at out/reel-master.mp4 and out/reel-phone-master.mp4 after a render)
#   out: ../site/public/media/video/hero-reel{,-phone}.{mp4,webm} (silent, header strip cropped) and the posters
# GRADE=silvertone bash scripts/grade-reels.sh brings back the earlier black-and-white-on-paper look, matched from the
# iPhone Silvertone exports into grade/*.cube (brightness → tone, within ~3/255 of the export). If you switch, re-sample
# the background of .hero--film in ../site/src/styles/site.css.
set -euo pipefail
cd "$(dirname "$0")/.."
SITE=../site/public/media
MONO="colorchannelmixer=.2126:.7152:.0722:0:.2126:.7152:.0722:0:.2126:.7152:.0722:0"
# The top strip is cropped off: it holds only the running header (her name and the opus number), which repeated the
# site's nav wordmark directly above it. Measured on every frame: the header sits at rows 44-62 (wide) and 52-74
# (phone); no picture starts above row 92 (wide) or 114 (phone). Out: 1920x996 and 1080x1820.
for cut in wide phone; do
  if [[ $cut == wide ]]; then IN=selin-incekara-reel-colour-web-1920x1080.mp4; NAME=hero-reel; CROP="crop=1920:996:0:84"
  else IN=selin-incekara-reel-colour-phone-1080x1920.mp4; NAME=hero-reel-phone; CROP="crop=1080:1820:0:100"; fi
  # The originals are full-range (yuvj420p); the web encodes are standard (limited) range.
  G="$CROP,scale=in_range=full:out_range=limited,format=yuv420p"
  [[ "${GRADE:-}" == silvertone ]] && G="$CROP,$MONO,lut1d=file=grade/$cut.cube,format=yuv420p"
  ffmpeg -v error -y -i "$IN" -an -vf "$G" -c:v libx264 -preset slow -crf 24 -tune film -profile:v high -movflags +faststart "$SITE/video/$NAME.mp4"
  ffmpeg -v error -y -i "$IN" -an -vf "$G" -c:v libvpx-vp9 -crf 35 -b:v 0 -row-mt 1 -deadline good -cpu-used 1 "$SITE/video/$NAME.webm"
  ffmpeg -v error -y -i "$IN" -frames:v 1 -vf "$G" -c:v libwebp -quality 88 "$SITE/posters/$NAME.webp"
  ffmpeg -v error -y -ss 6.6 -i "$IN" -frames:v 1 -vf "$G" -c:v libwebp -quality 88 "$SITE/posters/$NAME-still.webp"
done
ls -la "$SITE"/video/hero-reel* "$SITE"/posters/hero-reel*
