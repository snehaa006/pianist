#!/usr/bin/env bash
# Reel deliverables from out/reel-master.mp4:
#   Instagram upload (high quality H.264, 1080p, AAC 192k), web MP4 and WebM, and a poster frame.
set -euo pipefail
cd "$(dirname "$0")/.."
IN=out/reel-master.mp4
OUT=out/web
mkdir -p "$OUT"
ffmpeg -v error -y -i "$IN" -c:v libx264 -preset slow -crf 18 -profile:v high -pix_fmt yuv420p -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$OUT/selin-incekara-reel-instagram.mp4"
ffmpeg -v error -y -i "$IN" -c:v libx264 -preset slow -crf 25 -maxrate 6M -bufsize 12M -profile:v high -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart "$OUT/selin-incekara-reel.mp4"
ffmpeg -v error -y -i "$IN" -c:v libvpx-vp9 -crf 35 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 -pix_fmt yuv420p -c:a libopus -b:a 128k "$OUT/selin-incekara-reel.webm"
ffmpeg -v error -y -ss 14.6 -i "$IN" -frames:v 1 -c:v libwebp -quality 85 "$OUT/selin-incekara-reel-poster.webp"
ls -la "$OUT"/*reel*
