#!/bin/sh
# Overlap check: render clean test stills WITH the watermark burned in, tiled side by side, to look at before a full render.
# Usage (from the project folder): sh <skill>/scripts/check_frames.sh <outdir> <t> [<t> ...]
set -e; D=$1; shift; LIB=${LIB:-/root/lemo-opuscar}; HERE=$(pwd); mkdir -p "$D"
(cd "$LIB" && node core/render/still.mjs "$HERE" "$@" --size 1080x1920 --q 'n=4' --prefix t_ --out "$HERE/$D" 2>/dev/null | grep -c jpg)
IN=""; N=0; for t in "$@"; do ffmpeg -v error -y -i "$D/t_$t.jpg" -i watermark.png -filter_complex "overlay=40:200,scale=300:-1" "$D/w_$t.jpg"; IN="$IN -i $D/w_$t.jpg"; N=$((N+1)); done
if [ $N -gt 1 ]; then ffmpeg -v error -y $IN -filter_complex hstack=$N "$D/all.jpg"; else cp "$D/w_$1.jpg" "$D/all.jpg"; fi; echo "$D/all.jpg"
