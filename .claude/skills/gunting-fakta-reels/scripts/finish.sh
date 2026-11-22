#!/bin/sh
# Mux out/video.mp4 + out/mix_final.wav + watermark (top-left, fades out before the logo card), then QC.
# Usage (from the project folder): sh <skill>/scripts/finish.sh <out.mp4> <DUR> <logo_card_time>
set -e; OUT=$1; DUR=$2; LOGO=$3; WMOUT=$(python3 -c "print(round($LOGO-0.6,2))")
ffmpeg -v error -y -i out/video.mp4 -i out/mix_final.wav -loop 1 -i watermark.png -filter_complex \
 "[2:v]format=rgba,fade=t=in:st=0.2:d=0.4:alpha=1,fade=t=out:st=$WMOUT:d=0.4:alpha=1[wm];[0:v][wm]overlay=40:200:shortest=1[v]" \
 -map "[v]" -map 1:a -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart -t "$DUR" "$OUT"
mkdir -p qc; ls -la "$OUT"
ffmpeg -nostats -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -A12 Summary | grep -E "I:|Peak:" || true
ffmpeg -v info -i "$OUT" -vf blackdetect=d=0.3:pix_th=0.05 -an -f null - 2>&1 | grep black_start || echo "no black segments"
ffmpeg -v error -y -i "$OUT" -vf "fps=1/7,scale=216:384,tile=6x4" -frames:v 1 qc/contact.jpg; echo "contact sheet: qc/contact.jpg"
