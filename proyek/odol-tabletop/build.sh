#!/bin/sh
# One command: voice timeline → events → camera speed → score → foley → mix → picture → master → subtitles.
# The voice WAVs in vo/ are already generated and checked (tools/tts_ca.py + core/tts/asr_check.py, see vo/lines.json).
set -e
LIB=${LIB:-$HOME/lemo-opuscar}; export LIB
HERE=$(cd "$(dirname "$0")" && pwd); PY="$LIB/.venv/bin/python"
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the library folder"; exit 1; }
cd "$HERE"; mkdir -p out
"$PY" audio/vo_timeline.py
cd "$LIB"
"$PY" core/audio/sampler.py --need "$HERE/audio/compose.py" || true
node core/render/events.mjs "$HERE" --size 1080x1920
node "$HERE/tools/camspeed.mjs" "$HERE/out/camspeed.json"
cd "$HERE"
"$PY" -I audio/compose.py
DUR=92 "$PY" audio/foley.py events.json out/camspeed.json music/harmony.json out/sfx.wav
DUR=92 "$PY" audio/mix.py music/score.wav out/sfx.wav out/mix.wav
cd "$LIB"
node core/render/video.mjs "$HERE" --fps 30 --size 1080x1920 --q 'n=4' --workers 3 --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/odol-tabletop.mp4" 30 0   # needs ffmpeg 7+
"$PY" core/render/srt.py "$HERE/out/cues.json" "$HERE/subtitles_id.srt"
