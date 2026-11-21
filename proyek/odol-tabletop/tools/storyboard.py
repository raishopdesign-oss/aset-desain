"""Tile storyboard stills with shot number, framing, duration and line: python tools/storyboard.py out.jpg"""
import sys, os
from PIL import Image, ImageDraw, ImageFont
H = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
F = os.path.join(H, 'fonts/Manrope.ttf')
SHOTS = [
 ('1.6', '01 · 0–9.6 s', 'Close, 60° atas · glide', 'Chat Ibu: "BELI ODOL!" diketik per huruf, ding.'),
 ('8.9', '02 · 3.4–9.6 s', 'Medium rendah · orbit rak', 'Tube muncul tepat saat namanya disebut; "ODOL?"'),
 ('16.6', '03 · 10–20 s', 'Rise ke 60° · baca kartu', 'Pencarian: bukan nama benda, tapi merek; botol Odol muncul.'),
 ('23.8', '04 · 20–24.5 s', 'Macro peta · pin jatuh', 'Peta Eropa (garis pantai), pin Dresden, 1892.'),
 ('39.6', '05 · 25–42.5 s', 'Orbit lab', 'Lingner & Seifert; obat kumur, bukan pasta gigi.'),
 ('48.0', '06 · 43–50 s', 'Ride-along samping kapal', 'Kapal layar menyeberang meja ke Jawa (Batavia).'),
 ('61.6', '07 · 59.5–71 s', 'Hold + shake · hening dulu', 'Cap ODOL menghantam: semua tube jadi "ODOL".'),
 ('80.9', '08 · 79.4–82.6 s', 'Rendah, tent card', 'AQUA · SANYO · HONDA = nama merek jadi nama umum.'),
 ('90.8', '09 · 86–92 s', 'Pull-back seluruh meja', 'Curtain call, gunting potong FAKTA, kartu logo jatuh.'),
]
w, cols = 420, 9; h = int(w * 1920 / 1080); cap = 150
S = Image.new('RGB', (cols * (w + 16) + 16, h + cap + 32), (24, 28, 40)); d = ImageDraw.Draw(S)
fb, fr = ImageFont.truetype(F, 24), ImageFont.truetype(F, 19); fb.set_variation_by_axes([800]); fr.set_variation_by_axes([600])
for k, (t, no, frame, line) in enumerate(SHOTS):
    x = 16 + k * (w + 16); im = Image.open(os.path.join(H, f'stills/sb_{t}.jpg')).resize((w, h)); S.paste(im, (x, 16))
    d.text((x, h + 26), no, font=fb, fill=(255, 255, 255)); d.text((x, h + 60), frame, font=fr, fill=(150, 180, 230))
    # wrap the line
    words, ln, y = line.split(), '', h + 92
    for wd in words:
        if d.textlength(ln + ' ' + wd, font=fr) > w - 4: d.text((x, y), ln.strip(), font=fr, fill=(215, 220, 230)); ln, y = wd, y + 26
        else: ln += ' ' + wd
    d.text((x, y), ln.strip(), font=fr, fill=(215, 220, 230))
S.save(sys.argv[1], quality=88); print(sys.argv[1], S.size)
