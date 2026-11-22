#!/bin/sh
# Encode out/frames (from render_frames.sh) into out/video.mp4 in frame order, as the video renderer does (x264 crf 14).
HERE=$(cd "$(dirname "$0")/.." && pwd); cd "$HERE/out"
python3 -c "
import os
fs=sorted(os.listdir('frames'),key=lambda n:float(n[2:-4]))
open('frames.txt','w').write(''.join(\"file 'frames/%s'\nduration %s\n\"%(n,1/30) for n in fs))
print(len(fs),'frames')"
ffmpeg -v error -y -f concat -safe 0 -i frames.txt -r 30 -c:v libx264 -preset medium -crf 14 -pix_fmt yuv420p video.mp4
