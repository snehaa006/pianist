#!/usr/bin/env bash
# The reel's soundtrack: the ending of Dog Hungry (Sonny Chua), her Grade 3 recording, from a strong accent
# (51.47 s) through the silence to the final chord ringing out. Normalised to −14 LUFS for social playback.
set -euo pipefail
cd "$(dirname "$0")/.."
SRC="../videos/WhatsApp Video 2026-10-06 at 14.23.06.mp4"
mkdir -p public/audio
ffmpeg -v error -y -ss 51.47 -to 65.30 -i "$SRC" -vn -ac 2 -ar 48000 \
  -af "afade=t=in:d=0.02,afade=t=out:st=13.33:d=0.5,loudnorm=I=-14:TP=-1.2:LRA=9" -c:a pcm_s16le public/audio/reel.wav
ffmpeg -hide_banner -nostats -i public/audio/reel.wav -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):"
