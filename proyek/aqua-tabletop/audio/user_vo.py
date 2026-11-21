"""The user's own VO (vo_user/source.mp3, ElevenLabs, one take) is the film's clock: the picture is cued to it, it is not retimed.
Places the read at OFF s, cuts it into the script's lines (start times from whisper, text from the script), splits long lines
into subtitle cues at commas (word-timed), and writes src/vo.js (WT, DUR, LINES, VO), vo/timeline.json and vo_user/vo_track.wav."""
import json, re, numpy as np, soundfile as sf
OFF, DUR = 0.4, 169.0
TEXT = """Pernah gak, kamu disuruh beli Aqua, padahal yang dibeli justru air mineral merek lain?
Misalnya, Le Minerale, Club, atau Cleo.
Tapi anehnya, orang yang menyuruhmu mungkin tetap menyebutnya Aqua.
Nah, kenapa kebiasaan ini bisa terjadi?
Jawabannya ternyata menarik.
Aqua sebenarnya bukan nama untuk semua air mineral.
Aqua adalah nama sebuah merek air minum dalam kemasan asal Indonesia.
Nama ini berasal dari bahasa Latin yang berarti air.
Namun, perjalanan merek ini ternyata sudah dimulai sejak lebih dari lima dekade lalu.
Ceritanya bermula pada tahun 1973.
Saat itu, air minum dalam kemasan belum menjadi sesuatu yang umum seperti sekarang.
Kebanyakan masyarakat masih terbiasa merebus air sendiri untuk kebutuhan minum sehari-hari.
Di tengah kebiasaan tersebut, muncul sebuah gagasan untuk menyediakan air minum siap konsumsi dalam kemasan.
Sosok di balik lahirnya Aqua adalah Tirto Utomo.
Pada 23 Februari 1973, ia mendirikan perusahaan bernama PT Golden Mississippi.
Ia melihat peluang untuk menghadirkan air minum yang praktis dan higienis bagi masyarakat.
Dari gagasan inilah, perjalanan Aqua di Indonesia dimulai.
Setahun setelah perusahaan didirikan, tepatnya pada tahun 1974, Aqua mulai dipasarkan.
Produk pertamanya menggunakan botol kaca berukuran 950 ml, dengan harga sekitar Rp75 per botol.
Pada masa itu, menjual air putih dalam kemasan bukanlah bisnis yang mudah.
Sebab, masyarakat belum terbiasa membeli sesuatu yang biasanya bisa mereka dapatkan sendiri di rumah.
Seiring berjalannya waktu, kebutuhan masyarakat terhadap air minum yang praktis semakin berkembang.
Aqua terus memperluas distribusi dan membangun kepercayaan konsumen.
Produknya semakin mudah ditemukan, mulai dari toko, warung, hingga pusat perbelanjaan.
Kehadirannya yang lebih dahulu dikenal, membuat nama Aqua semakin kuat melekat dalam ingatan masyarakat Indonesia.
Karena sudah lebih dahulu dikenal luas, nama Aqua akhirnya begitu melekat dalam kebiasaan masyarakat.
Bahkan, ketika merek-merek lain bermunculan, sebagian orang tetap menggunakan kata Aqua untuk menyebut air mineral dalam kemasan.
Fenomena ini disebut genericized trademark, yaitu ketika nama merek digunakan secara umum untuk menyebut produk sejenis.
Jadi, sekarang kamu tahu asal-usulnya!
Nah, kalau di daerahmu, semua air mineral juga disebut Aqua? Tulis di kolom komentar, dan jangan lupa share video ini!""".split('\n')
STARTS = [0, 6.04, 9.68, 14.24, 17.24, 19.48, 23.10, 28.60, 32.50, 38.42, 42.74, 48.34, 53.70, 60.84, 64.72, 72.40, 78.04, 82.16, 89.90, 98.40, 103.24, 109.54, 115.30, 120.28, 126.68, 132.72, 139.74, 147.98, 156.06, 158.34]
assert len(TEXT) == len(STARTS) == 30
W = json.load(open('vo_user/words.json'))
norm = lambda s: re.sub(r'[^a-z0-9]', '', s.lower())
LINES, WT, VO = [], {}, []
def chunks(text):
    if len(text) <= 66: return [text]
    parts = [p.strip() for p in re.split(r'(?<=[,?!])\s+', text) if p.strip()]
    out = []
    for p in parts:
        while len(p) > 66:
            ws = p.split(); k = min(range(1, len(ws)), key=lambda k: abs(len(' '.join(ws[:k])) - len(p) / 2)); out.append(' '.join(ws[:k])); p = ' '.join(ws[k:])
        out.append(p)
    m = True
    while m:
        m = False
        for k in range(len(out)):
            if len(out[k]) < 24 and len(out) > 1:
                cand = [j for j in (k - 1, k + 1) if 0 <= j < len(out) and len(out[j]) + 1 + len(out[k]) <= 82]
                if cand:
                    j = min(cand, key=lambda j: len(out[j])); a, b = sorted((j, k)); out[a:b + 1] = [out[a] + ' ' + out[b]]; m = True; break
    return out
for i, txt in enumerate(TEXT):
    a, b = STARTS[i] - .05, (STARTS[i + 1] - .05 if i + 1 < 30 else 1e9)
    ws = [w for w in W if a <= w['s'] < b]
    lid = f'L{i + 1:02d}'
    WT[lid] = [[w['w'].strip(), round(w['s'] + OFF, 3), round(w['e'] + OFF, 3)] for w in ws]
    t0, t1 = ws[0]['s'] + OFF, ws[-1]['e'] + OFF
    LINES.append(dict(id=lid, t0=round(t0, 3), t1=round(t1, 3), text=txt))
    cs = chunks(txt); tot = sum(len(norm(c)) for c in cs); wch = np.cumsum([len(norm(w['w'])) for w in ws]); wt = wch[-1]; acc = 0
    for k, c in enumerate(cs):
        lo = acc; acc += len(norm(c))
        i0 = int(np.argmin([abs((wch[j] - len(norm(ws[j]['w']))) / wt - lo / tot) for j in range(len(ws))]))
        i1 = int(np.argmin([abs(wch[j] / wt - acc / tot) for j in range(len(ws))]))
        c0 = t0 if k == 0 else ws[i0]['s'] + OFF; c1 = t1 if k == len(cs) - 1 else ws[i1]['e'] + OFF
        VO.append(dict(t0=round(c0, 3), t1=round(max(c1, c0 + .6), 3), zh=c, en=''))
for v in VO: print(f"{v['t0']:7.2f}-{v['t1']:7.2f} {v['zh']}")
js = '// Voice-over on the film clock (generated by audio/user_vo.py from the user\'s own read). LINES: spoken lines; VO: subtitle cues.\n'
js += 'export const WT = ' + json.dumps(WT, ensure_ascii=False) + ';\nexport const DUR = ' + str(DUR) + ';\nexport const LINES = ' + json.dumps(LINES, ensure_ascii=False) + ';\nexport const VO = ' + json.dumps(VO, ensure_ascii=False, indent=0) + ';\n'
open('src/vo.js', 'w').write(js)
json.dump(dict(dur=DUR, off=OFF, lines=LINES, cues=VO), open('vo/timeline.json', 'w'), ensure_ascii=False, indent=1)
x, sr = sf.read('vo_user/source.wav'); trk = np.zeros(int(DUR * sr)); n = min(len(x), len(trk) - int(OFF * sr)); trk[int(OFF * sr):int(OFF * sr) + n] = x[:n]
sf.write('vo_user/vo_track.wav', trk, sr); print(len(VO), 'cues')
