#!/usr/bin/env bash
# Web encodes from the master render:
#   1080p H.264 (main), 720p H.264 (phones), 1080p VP9 WebM, and a poster of the first frame.
set -euo pipefail
cd "$(dirname "$0")/.."
IN=${1:-out/master.mp4}
OUT=out/web
mkdir -p "$OUT"
NAME=selin-incekara-film
ffmpeg -v error -y -i "$IN" -c:v libx264 -preset slow -crf 27 -maxrate 3500k -bufsize 7M -profile:v high -pix_fmt yuv420p \
  -c:a aac -b:a 160k -movflags +faststart "$OUT/$NAME.mp4"
ffmpeg -v error -y -i "$IN" -vf "scale=1280:720:flags=lanczos" -c:v libx264 -preset slow -crf 26 -maxrate 2M -bufsize 4M -profile:v high \
  -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart "$OUT/$NAME-720.mp4"
ffmpeg -v error -y -i "$IN" -c:v libvpx-vp9 -crf 37 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 -pix_fmt yuv420p \
  -c:a libopus -b:a 128k "$OUT/$NAME.webm"
ffmpeg -v error -y -i "$IN" -frames:v 1 -q:v 3 "$OUT/$NAME-poster.jpg"
ffmpeg -v error -y -i "$IN" -frames:v 1 -c:v libwebp -quality 82 "$OUT/$NAME-poster.webp"
ls -la "$OUT"

# Portrait cut for phones (9:16), if rendered: COMP=MontagePortrait node scripts/render.mjs out/master-portrait.mp4
if [[ -f out/master-portrait.mp4 ]]; then
  P=out/master-portrait.mp4
  ffmpeg -v error -y -i "$P" -c:v libx264 -preset slow -crf 27 -maxrate 3500k -bufsize 7M -profile:v high -pix_fmt yuv420p \
    -c:a aac -b:a 128k -movflags +faststart "$OUT/$NAME-portrait.mp4"
  ffmpeg -v error -y -i "$P" -c:v libvpx-vp9 -crf 37 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 -pix_fmt yuv420p \
    -c:a libopus -b:a 128k "$OUT/$NAME-portrait.webm"
  ffmpeg -v error -y -i "$P" -frames:v 1 -c:v libwebp -quality 82 "$OUT/$NAME-portrait-poster.webp"
  ls -la "$OUT"/*portrait*
fi
