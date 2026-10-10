#!/usr/bin/env bash
# The reel's soundtrack: the closing two phrases of her at-home grand recording (the cleanest of the eight),
# from a downbeat (76.96 s) to the final chord ringing out. Normalised to −14 LUFS for social playback.
set -euo pipefail
cd "$(dirname "$0")/.."
SRC="../videos/WhatsApp Video 2026-10-06 at 14.22.50.mp4"
mkdir -p public/audio
ffmpeg -v error -y -ss 76.96 -to 91.70 -i "$SRC" -vn -ac 2 -ar 48000 \
  -af "afade=t=in:d=0.03,afade=t=out:st=14.04:d=0.7,loudnorm=I=-14:TP=-1.2:LRA=9" -c:a pcm_s16le public/audio/reel.wav
ffmpeg -hide_banner -nostats -i public/audio/reel.wav -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):"
