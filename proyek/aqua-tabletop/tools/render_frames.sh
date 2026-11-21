#!/bin/sh
# Resumable picture render: every frame is its own JPEG in out/frames (f_<seconds>.jpg, the same JPEG the video renderer
# pipes to ffmpeg). Frames already on disk are skipped, so after a container restart just run this again.
# Usage: sh tools/render_frames.sh [workers=3]   (then tools/encode_frames.sh)
HERE=$(cd "$(dirname "$0")/.." && pwd); LIB=${LIB:-/root/lemo-opuscar}; WK=${1:-3}; FPS=30
NF=$(python3 -c "import re;print(int(round(float(re.search(r'export const DUR = ([0-9.]+)',open('$HERE/src/vo.js').read()).group(1))*$FPS)))")
for w in $(seq 0 $((WK - 1))); do
  ( while :; do
      T=$(python3 -c "
import os
have=set(os.listdir('$HERE/out/frames'))
todo=[f for f in range($w,$NF,$WK) if 'f_%s.jpg'%repr(f/$FPS) not in have][:60]
print(' '.join(repr(f/$FPS) for f in todo))")
      [ -z "$T" ] && break
      cd "$LIB" && node core/render/still.mjs "$HERE" $T --size 1080x1920 --q 'n=4' --prefix f_ --out "$HERE/out/frames" > /dev/null 2>>"$HERE/out/frames_err.log"
      echo "w$w $(ls "$HERE/out/frames" | wc -l)/$NF $(date -u +%H:%M:%S)" >> "$HERE/out/frames.log"
    done ) &
done
wait; echo "done $(ls "$HERE/out/frames" | wc -l)/$NF" >> "$HERE/out/frames.log"
