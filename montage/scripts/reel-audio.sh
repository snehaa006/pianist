#!/usr/bin/env bash
# The reel's soundtrack: the closing two phrases of her at-home grand recording (the cleanest of the eight),
# from a downbeat (76.96 s) to the final chord ringing out. Normalised to −14 LUFS for social playback.
set -euo pipefail
cd "$(dirname "$0")/.."
SRC="../videos/WhatsApp Video 2026-10-06 at 14.22.50.mp4"
mkdir -p public/audio
ffmpeg -v error -y -ss 76.96 -to 91.70 -i "$SRC" -vn -ac 2 -ar 48000 \
  -af "afade=t=in:d=0.03,afade=t=out:st=14.04:d=0.7,loudnorm=I=-14:TP=-1.2:LRA=9" -c:a pcm_s16le public/audio/reel.wav
# The vintage reel: the opening of the same recording, from the quiet before the first note (5.35 s) to the
# breath after the second phrase (20.25 s), faded over the last 0.4 s.
ffmpeg -v error -y -ss 5.35 -to 20.25 -i "$SRC" -vn -ac 2 -ar 48000 \
  -af "afade=t=out:st=14.5:d=0.4,loudnorm=I=-14:TP=-1.2:LRA=9" -c:a pcm_s16le public/audio/reel-vintage.wav
for f in reel reel-vintage; do ffmpeg -hide_banner -nostats -i public/audio/$f.wav -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):" | tr -s ' ' | tr '\n' ' '; echo " ($f)"; done
