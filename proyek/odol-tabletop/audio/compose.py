"""Score for "Kenapa Pasta Gigi Disebut Odol?" (Tabletop App Flythrough). 92 s, 120 BPM, F major, a bar = 2 s from 0.0, one chord per bar.
A light bed under the voice (plucked bass, soft kick, shaker, string pad, a two-note marimba figure); the marimba theme plays in the gaps where
nobody speaks; a walking bass and claps under the voyage; a full silence 59.3–61.0 before the first stamp; the closing chord held to the end.
Usage (from anywhere): LIB=<library> python audio/compose.py   → music/score.wav, music/harmony.json"""
import sys, os, json
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); LIB = os.environ.get('LIB', os.path.expanduser('~/lemo-opuscar'))
sys.path.insert(0, LIB)
import numpy as np, soundfile as sf
from core.audio import sampler as S
from core.audio.sfx import SR, add, t_, env_exp

S.seed(7)
TL = json.load(open(os.path.join(ROOT, 'vo/timeline.json'))); DUR = TL['dur']
BAR, BEAT = 2.0, .5
SIL = (59.25, 61.0)          # the silence before the stamp
FIN = 89.0                   # the logo card lands; the final chord holds
CH = (['F', 'C', 'Dm', 'Bb'] * 2 + ['F', 'C', 'Bb', 'C'] +                 # 0–11   hook, search (0–24 s)
      ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'Gm', 'C', 'Dm', 'Bb'] +          # 12–21  Dresden, lab (24–44 s)
      ['F', 'C', 'Dm', 'Bb', 'F', 'C', 'Bb', 'C'] +                         # 22–29  the voyage, 1894, 1903
      ['F', 'Am', 'Bb', 'C', 'Dm', 'Bb', 'Gm', 'C'] +                       # 30–37  the stamp; the name sticks
      ['F', 'C', 'Dm', 'Bb', 'Gm', 'C', 'F', 'F'])                          # 38–45  the close
PAD = {'F': ['A3', 'C4', 'F4'], 'C': ['G3', 'C4', 'E4'], 'Dm': ['A3', 'D4', 'F4'], 'Bb': ['Bb3', 'D4', 'F4'], 'Gm': ['Bb3', 'D4', 'G4'], 'Am': ['A3', 'C4', 'E4']}
ROOT_ = {'F': 'F2', 'C': 'C2', 'Dm': 'D2', 'Bb': 'Bb1', 'Gm': 'G2', 'Am': 'A2'}
WALK = {'F': ['F2', 'A2', 'C3', 'A2'], 'C': ['C2', 'E2', 'G2', 'E2'], 'Dm': ['D2', 'F2', 'A2', 'F2'], 'Bb': ['Bb1', 'D2', 'F2', 'D2']}
HEAD = [(0, 'A5', 1), (1, 'C6', .5), (1.5, 'D6', .5), (2, 'F6', 1.5), (3.5, 'E6', .5)]   # the theme (bar-relative beats)
# where nobody speaks the theme plays in full; elsewhere a soft two-note figure
GAPS = [(0, .5), (9.35, 10.1), (19.44, 20.2), (31.31, 32.1), (42.01, 42.9), (70.97, 71.9), (89.47, 92)]
quiet = lambda t: any(a - .3 <= t < b for a, b in GAPS)
ev = []
def E(t, inst, p, d, v, pan=0., **kw):
    if SIL[0] <= t < SIL[1]: return
    ev.append(dict(t=t, inst=inst, pitch=p, dur=d, vel=v, pan=pan, **kw))
for b, ch in enumerate(CH):
    t0 = b * BAR
    if t0 >= DUR: break
    last = b >= 44
    for i, p in enumerate(PAD[ch]): E(t0, 'violas' if i else 'cellos', p, BAR + .1, .2 if b < 30 else .24, [-.3, 0, .3][i], attack=.35, release=.6)
    tones = sorted(S.midi(p) + 24 for p in PAD[ch])
    if b in (0, 4, 9, 15, 21, 35, 43):   # the theme in the gaps (and the curtain call)
        for (bt, n, d) in HEAD: E(t0 + bt * BEAT, 'marimba', n, max(.18, d * BEAT), .7, .05); (d >= 1.5) and E(t0 + bt * BEAT, 'vibraphone', n, d * BEAT, .28, -.1)
    elif not last:
        E(t0, 'marimba', S.name(tones[2]), .4, .4, .1); E(t0 + 2 * BEAT, 'marimba', S.name(tones[1]), .4, .34, .1)
        if 22 <= b < 30: E(t0 + 3.5 * BEAT, 'marimba', S.name(tones[0]), .3, .3, .1)
    if last: continue
    if 22 <= b < 30 and ch in WALK:   # the voyage: a walking bass, claps on 2 and 4
        for k, p in enumerate(WALK[ch]): E(t0 + k * BEAT, 'contrabass_pizz', p, .42, .7 - .08 * (k % 2), 0)
        for k in (1, 3): E(t0 + k * BEAT, 'claps', 'solo', None, .3, -.2)
    else:
        rt = ROOT_[ch]; E(t0, 'contrabass_pizz', rt, .45, .72, 0); E(t0 + 2 * BEAT, 'contrabass_pizz', rt, .4, .56, 0)
    if b >= 5:
        for k in range(8): E(t0 + k * BEAT / 2, 'shaker', 'down' if k % 2 == 0 else 'up', None, .16 + (.06 if k % 2 == 0 else 0), .35)
    if 30 <= b < 36:
        for k in (1, 3): E(t0 + k * BEAT, 'claps', 'solo', None, .28, -.2)
def chordhit(t, ch, v=.45):
    for p in PAD[ch]: E(t, 'violins_pizz', S.name(S.midi(p) + 12), .3, v, .2)
# accents on the picture's hits
for t, n in [(1.75, 'C6'), (14.875, 'F6'), (21.125, 'A5'), (23.375, 'C6'), (49.875, 'A5'), (57.75, 'F6'), (72.75, 'A6')]: E(t, 'glockenspiel', n, .9, .34, .2)
E(21.125, 'timpani', 'F2', 1.0, .45); chordhit(25.625, 'Bb', .38); chordhit(38.625, 'Gm', .38)
E(43.25, 'sus_cymbal', 'hit', None, .18)
E(61.0, 'timpani', 'F2', 2.0, .7); E(61.0, 'sus_cymbal', 'hit', None, .3); chordhit(61.0, 'F', .5)
for t in (68.5, 69.0, 69.75): E(t, 'timpani', 'C3', .6, .38)
for k in range(7): E(87.0 + k * .125, 'glockenspiel', ['C6', 'F6', 'A6', 'C7', 'A6', 'F6', 'C7'][k], .6, .26, -.3 + .1 * k)   # curtain-call hops
E(FIN, 'timpani', 'F2', 2.5, .45); E(FIN, 'sus_cymbal', 'hit', None, .22)
for p in ['F4', 'A4', 'C5', 'F5']: E(FIN, 'vibraphone', p, DUR - FIN - .5, .3, 0)
for p in ['F3', 'C4']: E(FIN, 'horn', p, DUR - FIN - .5, .26, 0, attack=.3, release=.5)
for p in ['A3', 'C4', 'F4']: E(86.0, 'violas', p, DUR - 86.0 - .4, .24, 0, attack=.4, release=.8)
E(FIN, 'contrabass', 'F2', DUR - FIN - .5, .36, 0, attack=.2, release=.5)
mus = S.render(ev, dur=DUR)
def kick(v):
    d = .22; tt = t_(d); f = 62 + 70 * np.exp(-tt / .03)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(d, .07) * v).astype(np.float32)
for b in range(len(CH) - 2):
    for k in (0, 2):
        t = b * BAR + k * BEAT
        if not (SIL[0] <= t < SIL[1]) and b >= 1: add(mus, kick(.34 if k == 0 else .24), t, 1, 0)
for t in (61.0, FIN): add(mus, kick(.55), t, 1, 0)
mus = S.room(mus, size=.32, mix=.12)
a, b2 = int(SIL[0] * SR), int(SIL[1] * SR); fade = int(.25 * SR)   # hard silence (reverb tails out) before the stamp
mus[a:a + fade] *= np.linspace(1, 0, fade)[:, None] ** 2; mus[a + fade:b2] = 0
fade = int(.5 * SR); mus[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 2
mus *= .5 / max(1e-9, np.abs(mus).max())
os.makedirs(os.path.join(ROOT, 'music'), exist_ok=True)
sf.write(os.path.join(ROOT, 'music/score.wav'), mus[:int(DUR * SR)], SR, subtype='PCM_24')
har = [{'bar': i, 't0': i * BAR, 'chord': ch, 'notes': [S.midi(p) for p in PAD[ch]], 'root': S.midi(ROOT_[ch])} for i, ch in enumerate(CH)]
json.dump(har, open(os.path.join(ROOT, 'music/harmony.json'), 'w'))
print('score', mus.shape, 'peak', float(np.abs(mus).max()))
open(os.path.join(ROOT, 'music/credits.txt'), 'w').write('\n'.join(S.credits(sorted({e['inst'] for e in ev}))) + '\n')
print(S.credits(sorted({e['inst'] for e in ev})))
