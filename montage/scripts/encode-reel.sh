#!/usr/bin/env bash
# Reel deliverables: Instagram upload (H.264 CRF 18, AAC 192k), web MP4 and WebM, and a poster.
#   bash scripts/encode-reel.sh            → from out/reel-master.mp4    (the programme reel)
#   bash scripts/encode-reel.sh vintage    → from out/vintage-master.mp4 (the black-and-white reel)
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ "${1:-}" == "vintage" ]]; then IN=out/vintage-master.mp4; NAME=selin-incekara-reel-vintage; POSTER=1.2
else IN=out/reel-master.mp4; NAME=selin-incekara-reel; POSTER=14.6; fi
OUT=out/web
mkdir -p "$OUT"
ffmpeg -v error -y -i "$IN" -c:v libx264 -preset slow -crf 18 -profile:v high -pix_fmt yuv420p -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$OUT/$NAME-instagram.mp4"
ffmpeg -v error -y -i "$IN" -c:v libx264 -preset slow -crf 25 -maxrate 6M -bufsize 12M -profile:v high -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart "$OUT/$NAME.mp4"
ffmpeg -v error -y -i "$IN" -c:v libvpx-vp9 -crf 35 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 -pix_fmt yuv420p -c:a libopus -b:a 128k "$OUT/$NAME.webm"
ffmpeg -v error -y -ss "$POSTER" -i "$IN" -frames:v 1 -c:v libwebp -quality 85 "$OUT/$NAME-poster.webp"
ls -la "$OUT"/$NAME*
