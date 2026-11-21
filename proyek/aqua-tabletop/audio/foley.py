"""Foley for Kenapa Semua Air Mineral Disebut Aqua? (Tabletop App Flythrough): every on-screen action gets a sound; pitched sounds take their notes from the score's harmony.json,
camera whips get whooshes sized by the measured camera speed. Usage: sfx.py <events.json> <camspeed.json> <harmony.json> <out.wav>"""
import sys, os, json
import numpy as np
sys.path.insert(0, os.path.join(os.environ.get('LIB', os.path.expanduser('~/lemo-opuscar')), 'core/audio'))
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, whoosh, thump, click, step, add

ev = json.load(open(sys.argv[1]))['ev']; cam = json.load(open(sys.argv[2])); HAR = json.load(open(sys.argv[3]))
DUR = float(os.environ.get("DUR", 92.0)); N = int(DUR * SR); out = np.zeros((N, 2))
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def chord(t):
    b = max(0, min(len(HAR) - 1, int(t // 2))); return HAR[b]['notes']
def note(t, deg, octv=1):   # the deg-th chord tone at time t, octave-shifted
    ns = sorted(n % 12 + 60 for n in chord(t)); return ns[deg % len(ns)] + 12 * (octv + deg // len(ns))

def marimba(f, d=.7, v=1.0):
    tt = t_(d)
    x = np.sin(2 * np.pi * f * tt) * env_exp(d, .28) + .3 * np.sin(2 * np.pi * f * 3.93 * tt) * env_exp(d, .045) + .1 * np.sin(2 * np.pi * f * 9.2 * tt) * env_exp(d, .01)
    return norm(x + hp(noise(d), 3000) * env_exp(d, .002) * .25) * v
def bell(f, d=1.2, v=1.0):
    tt = t_(d); x = sum(a * np.sin(2 * np.pi * f * r * tt) * env_exp(d, tau) for r, a, tau in [(1, 1, .5), (2.01, .45, .3), (3.0, .25, .18), (4.2, .15, .1)])
    return norm(x) * v
def blip(f, d=.12, v=1.0):
    tt = t_(d); return norm(np.sin(2 * np.pi * f * tt) * env_exp(d, .025) * (1 - np.exp(-tt / .002))) * v
def poppy(f0=500, f1=1400, d=.16, v=1.0):
    tt = t_(d); f = f0 + (f1 - f0) * tt / d; return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(d, .045)) * v
def boing(v=1.0):
    d = .6; tt = t_(d); f = 180 + 260 * np.exp(-tt / .25) * (1 + .5 * np.sin(2 * np.pi * 14 * tt) * np.exp(-tt / .2))
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(d, .2)) * v
def rise(d, v=1.0, lo=300, hi=3000):
    tt = t_(d); n = noise(d); o = np.zeros_like(n)
    for i in range(0, len(n), 480):
        f = lo * (hi / lo) ** (i / len(n)); seg = bp(n[max(0, i - 2000):i + 480], f * .8, f * 1.25); o[i:i + 480] = seg[-len(o[i:i + 480]):]
    return norm(o) * (tt / d) ** 1.5 * v
def fall(d=.35, v=1.0):   # descending whistle for things dropping from above
    tt = t_(d); f = 1800 * (1 - .7 * tt / d); return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / d) ** 2) * v
def crumble(d=.4, v=1.0, n=26, pitch=1.0):
    o = np.zeros(int((d + .1) * SR)); r = np.random.default_rng(int(d * 1000 + n))
    for k in range(n):
        c = click(pitch * (.7 + r.random() * .8), .3 + r.random() * .7); s = int(r.random() ** 1.3 * d * SR); o[s:s + len(c)] += c[:len(o) - s]
    return norm(o) * v
def build(d=1.0, v=1.0, n=40):   # cubes stacking up: ticks rising in pitch
    o = np.zeros(int((d + .1) * SR))
    for k in range(n):
        c = click(.8 + k / n * 1.2, .5); s = int(k / n * d * SR); o[s:s + len(c)] += c[:len(o) - s]
    return norm(o) * v
def slam(v=1.0, f=55):
    d = 1.2; tt = t_(d)
    sub = np.sin(2 * np.pi * f * tt * (1 - .2 * tt)) * env_exp(d, .22)
    body = lp(noise(d), 500) * env_exp(d, .06); crack = hp(noise(d), 2500) * env_exp(d, .012)
    paper = bp(noise(d), 1500, 7000) * env_exp(d, .25) * .25
    return norm(sub + body * .8 + crack * .5 + paper) * v
def stampS(v=1.0):
    d = .5; tt = t_(d); return norm(lp(noise(d), 900) * env_exp(d, .03) + np.sin(2 * np.pi * 90 * tt) * env_exp(d, .07) + hp(noise(d), 3000) * env_exp(d, .006) * .6) * v
def swish(d=.3, v=1.0):
    return norm(bp(noise(d), 2000, 8000) * np.sin(np.pi * t_(d) / d) ** 2) * v
def key(v=1.0):
    d = .05; tt = t_(d); return norm(hp(noise(d), 2000) * env_exp(d, .004) + np.sin(2 * np.pi * 3200 * tt) * env_exp(d, .003) * .4) * v

R = np.random.default_rng(5)
q16 = lambda t: round(t * 8) / 8
used = set()
def onslot(kind, t):
    k = (kind, round(t * 8))
    if k in used: return None
    used.add(k); return q16(t)
def wrong(v=1.0):
    """the film's one 'bad' sound (failures and the verdict): a muted low two-note fall, F3 → E3, a semitone that isn't in D major's I chord"""
    o = np.zeros(int(.6 * SR))
    for k, (f, s0, d) in enumerate([(174.6, 0, .16), (164.8, .14, .42)]):
        tt = t_(d); x = sum(a * np.sin(2 * np.pi * f * h * tt) for h, a in [(1, 1), (2, .5), (3, .32), (4, .18), (5, .1)])
        x = lp(x * env_exp(d, .16 if k else .07) * (1 - np.exp(-tt / .006)), 1400)
        i = int(s0 * SR); o[i:i + len(x)] += x[:len(o) - i]
    return norm(o) * v
def buzz(d, v=1.0):   # moth wings: a soft fluttering noise, amplitude-modulated at wing rate
    tt = t_(d); return norm(bp(noise(d), 300, 2400) * (.5 + .5 * np.sin(2 * np.pi * 26 * tt)) ** 2) * v
# the user's paper/stop-motion sound effects (assets/audio/efek-suara, free to use), decoded once
import subprocess
FX = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), 'assets/audio/efek-suara')
_fx = {}
def fx(name):
    if name not in _fx:
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(FX, name + '.mp3'), '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
        _fx[name] = np.frombuffer(raw, '<f4').astype(np.float64)
    return _fx[name]
def loop(name, d, v):
    x = fx(name); n = int(d * SR); reps = np.tile(x, n // len(x) + 1)[:n]; f = int(.6 * SR); env = np.ones(n); env[:f] = np.linspace(0, 1, f); env[-f:] = np.linspace(1, 0, f); return reps * env * v
for e in sorted(ev, key=lambda e: e['t']):
    t, ty = e['t'], e['type']; pan = float(R.uniform(-.3, .3)); k = e.get('k', 0)
    if ty == 'pop': g = 1.2 if e.get('big') else 1.0; add(out, marimba(hz(note(q16(t), k % 7, 0)), .5, .25 * g), q16(t), 1, pan); add(out, poppy(400 + 40 * (k % 7), 1300, .12, .12 * g), t, 1, pan)
    elif ty == 'unpop': add(out, poppy(1300, 400, .16, .1), t, 1, pan); add(out, fx('kertas-dibalik-1') * .25, t, 1, pan)
    elif ty == 'key': add(out, key(.12), t, 1, -.1)
    elif ty == 'send': add(out, click(1.1, .2), t, 1, .1); add(out, swish(.3, .1), t + .05, 1, .2)
    elif ty == 'ding': add(out, bell(hz(note(t, 2, 2)), 1.2, .2), t, 1, -.2); add(out, bell(hz(note(t, 0, 2)), 1.2, .14), t + .07, 1, -.2)
    elif ty == 'nope': add(out, wrong(.14), t, 1)
    elif ty == 'tick': add(out, blip(hz(note(q16(t), k % 4, 2)), .08, .06), q16(t), 1, .2)
    elif ty == 'hop': add(out, swish(.12, .05), t, 1, pan); add(out, blip(hz(note(q16(t), k % 3, 1)), .08, .06), q16(t), 1, pan)
    elif ty == 'jump': add(out, swish(.25, .09), t, 1, pan)
    elif ty == 'land': add(out, thump(.3 * e.get('v', 1), 105), t, 1); add(out, step(.1 * e.get('v', 1)), t, 1, pan)
    elif ty == 'badge': add(out, poppy(500, 1300, .1, .08), t, 1, .2); add(out, blip(hz(note(t, k % 3, 2)), .1, .06), q16(t), 1, .2)
    elif ty == 'drop': add(out, fall(.25, .08), t, 1)
    elif ty == 'pin': add(out, fx('pin-ditancap') * .4, t - .03, 1, .1); add(out, thump(.25, 120), t, 1)
    elif ty == 'bubble': [add(out, blip(700 + 220 * j, .05, .03), t + j * .27, 1, .3) for j in range(10)]
    elif ty == 'horn': add(out, fx('klakson-kapal') * .28, t, 1, .2)
    elif ty == 'waves': add(out, loop('ombak-laut-loop', e['d'], .16), t - .3, 1, 0)
    elif ty == 'print': add(out, fx('kertas-dibalik-2') * .3, t - .05, 1, pan); add(out, stampS(.12), t, 1, pan)
    elif ty == 'slam': big = e.get('big'); add(out, slam(.75 if big else .45, 55 if big else 70), t, 1); add(out, crumble(.3, .08, 16, 1.1), t + .02, 1); add(out, stampS(.2), t, 1)
    elif ty == 'brush': d = e['d']; tt = t_(d); add(out, norm(bp(noise(d), 2500, 9000) * (.5 + .5 * np.sin(2 * np.pi * 3.5 * tt)) ** 2) * .035, t, 1, -.2)
    elif ty == 'tent': add(out, fx(['label-jatuh-1', 'label-jatuh-2', 'label-jatuh-3'][k % 3]) * .35, t - .1, 1, -.2 + .2 * k); add(out, marimba(hz(note(t, k, 1)), .5, .18), q16(t), 1, -.2 + .2 * k)
    elif ty == 'comment': add(out, fx('pop-huruf-' + str(k % 4 + 1)) * .3, t, 1, .2); [add(out, key(.08), t + .05 + j * .06, 1, .2) for j in range(5)]
    elif ty == 'snip': add(out, click(1.4, .25), t, 1, -.1); add(out, click(1.6, .2), t + .2, 1, -.1)
    elif ty == 'cut': add(out, fx('kertas-kresek-pendek') * .35, t - .05, 1, -.1); add(out, click(1.8, .3), t, 1, -.1)
    elif ty == 'kettle':   # a kettle coming to the boil: rising hiss, then a soft whistle
        d = e['d']; tt = t_(d); hiss = norm(bp(noise(d), 1500, 7000)) * np.clip(tt / d, 0, 1) ** 1.5 * .03
        wh = np.sin(2 * np.pi * np.cumsum(1900 + 120 * np.sin(2 * np.pi * 5 * tt)) / SR) * np.clip((tt - d * .6) / (d * .3), 0, 1) * np.clip((d - tt) / .4, 0, 1) * .018
        add(out, hiss + wh, t, 1, .25)
    elif ty == 'engine':   # a small truck pulling away and driving past: low rumble, amplitude-modulated, panned left to right
        d = e['d']; tt = t_(d); rum = norm(lp(noise(d), 160)) * (.6 + .4 * np.sin(2 * np.pi * 9 * tt)) * np.clip(tt / .5, 0, 1) * np.clip((d - tt) / .8, 0, 1) * .09
        n = len(rum); L = rum * np.linspace(1, .4, n); R_ = rum * np.linspace(.4, 1, n); s0 = int(t * SR); m = min(n, N - s0)
        if m > 0: out[s0:s0 + m, 0] += L[:m]; out[s0:s0 + m, 1] += R_[:m]
    elif ty == 'coin': add(out, bell(2600 + 300 * k, .35, .05), t, 1, .2); add(out, bell(3900 + 200 * k, .25, .03), t + .015, 1, .2); add(out, thump(.12, 300), t, 1)
    elif ty == 'titleLand': add(out, thump(.55, 75), t, 1); add(out, step(.18), t, 1); add(out, bell(hz(note(t, 0, 2)), 1.6, .16), t + .02, 1, 0); add(out, bell(hz(note(t, 2, 2)), 1.4, .1), t + .1, 1, 0)
# camera whips: one whoosh per burst of fast motion, length and level from the measured speed
sp = np.array([c[1] + .25 * c[2] for c in cam]); ts = np.array([c[0] for c in cam]); i = 0
while i < len(sp):
    if sp[i] > .9:
        j = i
        while j < len(sp) and sp[j] > .5: j += 1
        a = max(0, i - 4); pk = sp[i:j].max(); d = max(.25, (j - a) / 30 + .1)
        add(out, whoosh(d, min(.7, .18 + pk * .14)), ts[a], 1, float(R.uniform(-.4, .4))); i = j + 3
    else: i += 1

out *= .9
peak = np.abs(out).max(); print('sfx peak', round(peak, 3))
if peak > .98: out *= .98 / peak
import wave
with wave.open(sys.argv[4], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(out, -1, 1) * 32767).astype('<i2').tobytes())
print('wrote', sys.argv[4])
