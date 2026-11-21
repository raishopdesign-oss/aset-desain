"""Re-time the subtitle cues (src/vo.js VO) to the user's VO as placed on the film clock (vo_user/vo_track.wav,
vo_user/placed.json). The cue texts stay; each cue starts at its first word and ends at its last, from whisper word
times. Writes the new VO array into src/vo.js (WT/LINES, which drive the picture, are untouched) and lists the frames
(30 fps) whose subtitle differs from the old timing in vo_user/redo_frames.json."""
import json, re, sys
from faster_whisper import WhisperModel
src = open('src/vo.js').read()
head, arr = src.split('export const VO = ', 1)
OLD = json.loads(arr.strip().rstrip(';'))
P = json.load(open('vo_user/placed.json'))['lines']
LINES = json.load(open('vo/timeline.json'))['lines']
m = WhisperModel('small', device='cpu', compute_type='int8')
segs, _ = m.transcribe('vo_user/vo_track.wav', language='id', word_timestamps=True)
W = [(w.word.strip(), w.start, w.end) for s in segs for w in s.words]
norm = lambda s: re.sub(r'[^a-z0-9]', '', s.lower())
# which cues belong to which line: cue texts concatenate to the line text
NEW = []; ci = 0
for L, p in zip(LINES, P):
    cues = []
    while ci < len(OLD) and OLD[ci]['t0'] < (LINES[LINES.index(L) + 1]['t0'] if L is not LINES[-1] else 1e9) - .01:
        cues.append(OLD[ci]); ci += 1
    ws = [w for w in W if p['start'] - .15 <= w[1] < p['end'] + .1]
    tot = sum(len(norm(c['zh'])) for c in cues); acc = 0
    wch = []; a = 0
    for w in ws: a += len(norm(w[0])); wch.append(a)
    wt = wch[-1] if wch else 1
    for k, c in enumerate(cues):
        lo = acc; acc += len(norm(c['zh']))
        if not ws: t0, t1 = p['start'], p['end']
        else:
            i0 = min(range(len(ws)), key=lambda j: abs((wch[j] - len(norm(ws[j][0]))) / wt - lo / tot))
            i1 = min(range(len(ws)), key=lambda j: abs(wch[j] / wt - acc / tot))
            t0 = p['start'] if k == 0 else ws[i0][1]
            t1 = p['end'] if k == len(cues) - 1 else ws[i1][2]
        NEW.append(dict(t0=round(t0, 3), t1=round(max(t1, t0 + .6), 3), zh=c['zh'].replace('Pernah nggak', 'Pernah gak'), en=''))
assert len(NEW) == len(OLD), (len(NEW), len(OLD))
for o, n in zip(OLD, NEW): print(f"{o['t0']:6.2f}-{o['t1']:6.2f} -> {n['t0']:6.2f}-{n['t1']:6.2f}  {n['zh']}")
open('src/vo.js', 'w').write(head + 'export const VO = ' + json.dumps(NEW, ensure_ascii=False, indent=0) + ';\n')
# frame-by-frame subtitle state, mirroring captions.js
def seg(t, a, b): return min(1, max(0, (t - a) / (b - a)))
def eo(x): return 1 - (1 - x) ** 3
def state(VO, t):
    i = -1
    for k in range(len(VO)):
        nxt = VO[k + 1]['t0'] - .12 if k + 1 < len(VO) else 1e9
        if VO[k]['t0'] - .12 <= t < min(nxt, VO[k]['t1'] + .5): i = k
    if i < 0: return None
    a = min(eo(seg(t, VO[i]['t0'] - .12, VO[i]['t0'] + .05)), 1 - seg(t, VO[i]['t1'] + .35, VO[i]['t1'] + .5))
    return (VO[i]['zh'], round(a, 2)) if a > 0 else None
redo = [f for f in range(2760) if state(OLD, f / 30) != state(NEW, f / 30)]
json.dump(redo, open('vo_user/redo_frames.json', 'w')); print('frames to redo', len(redo))
