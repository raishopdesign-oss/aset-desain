"""Tile storyboard stills with shot number, framing, duration and line: python tools/storyboard.py out.jpg"""
import sys, os
from PIL import Image, ImageDraw, ImageFont
H = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
F = os.path.join(H, 'fonts/Manrope.ttf')
SHOTS = [
 ('2.3', '01 · 0–17 s', 'Close, dari atas · glide', 'Chat Ibu: "BELI AQUA!"; rak warung: Le Minerale, Club, Cleo.'),
 ('12.0', '02 · 10–17 s', 'Baca chat', '"Adanya Cleo, Bu" / "Iya, Aqua-nya taruh meja". "AQUA?"'),
 ('31.9', '03 · 17–38 s', 'Rise · baca kartu', 'Pencarian: bukan nama benda, tapi merek; Latin: aqua = air.'),
 ('41.0', '04 · 38–48 s', 'Macro peta · pin jatuh', 'Jawa Barat, pin Bekasi, kalender 1973; "BELUM UMUM".'),
 ('58.5', '05 · 48–61 s', 'Rendah · rumah 70-an', 'Ceret di kompor, "MEREBUS AIR"; bohlam ide muncul.'),
 ('72.2', '06 · 61–82 s', 'Orbit kartu · cap SAH', 'Tirto Utomo; akta PT Golden Mississippi, 23 Feb 1973.'),
 ('97.5', '07 · 82–109 s', 'Low · botol besar', '1974: botol kaca 950 ml, Rp75; "TIDAK MUDAH".'),
 ('120.5', '08 · 109–133 s', 'Ride-along truk', 'Kemasan kaca→plastik→galon; truk ke toko, warung, mal.'),
 ('145.3', '09 · 133–148 s', 'Hold + shake', 'Cap AQUA menghantam: semua botol jadi "AQUA".'),
 ('155.9', '10 · 148–158 s', 'Baca kartu kamus', 'Genericized trademark; AQUA · ODOL · SANYO · HONDA.'),
 ('163.9', '11 · 158–165 s', 'Baca komentar', '"Kalau di daerahmu, air mineral disebut apa?"'),
 ('168.6', '12 · 165–169 s', 'Pull-back → logo', 'Seluruh meja, gunting potong FAKTA, kartu logo.'),
]
w, cols = 300, 6; h = int(w * 1920 / 1080); cap = 150
rows = (len(SHOTS) + cols - 1) // cols
S = Image.new('RGB', (cols * (w + 16) + 16, rows * (h + cap + 32)), (24, 28, 40)); d = ImageDraw.Draw(S)
fb, fr = ImageFont.truetype(F, 24), ImageFont.truetype(F, 19); fb.set_variation_by_axes([800]); fr.set_variation_by_axes([600])
for k, (t, no, frame, line) in enumerate(SHOTS):
    x = 16 + (k % cols) * (w + 16); y0 = (k // cols) * (h + cap + 32); im = Image.open(os.path.join(H, f'stills/sb_{t}.jpg')).resize((w, h)); S.paste(im, (x, y0 + 16))
    d.text((x, y0 + h + 26), no, font=fb, fill=(255, 255, 255)); d.text((x, y0 + h + 60), frame, font=fr, fill=(150, 180, 230))
    words, ln, y = line.split(), '', y0 + h + 92
    for wd in words:
        if d.textlength(ln + ' ' + wd, font=fr) > w - 4: d.text((x, y), ln.strip(), font=fr, fill=(215, 220, 230)); ln, y = wd, y + 26
        else: ln += ' ' + wd
    d.text((x, y), ln.strip(), font=fr, fill=(215, 220, 230))
S.save(sys.argv[1], quality=88); print(sys.argv[1], S.size)
