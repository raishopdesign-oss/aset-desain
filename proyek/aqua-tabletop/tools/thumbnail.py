"""Reels cover for the Aqua episode: a clean still (qc/th/t_147.jpg, rendered with nosub: every brand on the shelf
re-stamped AQUA) + the hook, Poppins Bold. What must read sits inside the 3:4 centre (y 240-1680); brand chip below."""
from PIL import Image, ImageDraw, ImageFont
W, H = 1080, 1920
src = Image.open('qc/th/t_147.jpg').convert('RGB')
z = 1.22; cx, cy = 610, 640          # zoom on the shelf, keep it in the upper half
bg = src.resize((int(W * z), int(H * z)), Image.LANCZOS)
x0 = int(cx * z - W / 2); y0 = int(cy * z - 640)
bg = bg.crop((x0, y0, x0 + W, y0 + H)).convert('RGBA')
F = lambda sz: ImageFont.truetype('fonts/Poppins-Bold.ttf', sz)
g = Image.new('L', (1, H))
for y in range(H): g.putpixel((0, y), int(max(0, min(1, (y - 1000) / 330)) ** 1.3 * 238))
nv = Image.new('RGBA', (W, H), (10, 22, 52, 255)); nv.putalpha(g.resize((W, H))); bg.alpha_composite(nv)
d = ImageDraw.Draw(bg); YEL, NAV, WHT = (251, 196, 22), (10, 22, 52), (255, 255, 255)
def center(t, y, f, fill, st=0):
    d.text(((W - d.textlength(t, font=f)) / 2, y), t, font=f, fill=fill, stroke_width=st, stroke_fill=NAV)
k = 'SELAMA INI KITA SALAH SEBUT?'; fk = F(40); kw = d.textlength(k, font=fk)
d.rounded_rectangle(((W - kw) / 2 - 34, 1150, (W + kw) / 2 + 34, 1226), radius=38, fill=YEL); center(k, 1161, fk, NAV)
fh = F(118)
center('AQUA ITU', 1242, fh, WHT, 5)
w1, w2, gap = d.textlength('NAMA', font=fh), d.textlength('MEREK!', font=fh), 30; x = (W - (w1 + gap + w2)) / 2
d.text((x, 1382), 'NAMA', font=fh, fill=WHT, stroke_width=5, stroke_fill=NAV); d.text((x + w1 + gap, 1382), 'MEREK!', font=fh, fill=YEL, stroke_width=5, stroke_fill=NAV)
center('Bukan nama air mineral. Ceritanya dari 1973.', 1560, F(36), (225, 232, 245))
logo = Image.open('logo.png').convert('RGBA').resize((104, 104), Image.LANCZOS)
chip = 'GUNTING FAKTA  ·  EPS 02'; fc = F(32); cw = d.textlength(chip, font=fc)
x0 = (W - (104 + 16 + cw + 36)) / 2; y0 = 1712
ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(ov).rounded_rectangle((x0 + 52, y0 + 24, x0 + 104 + 16 + cw + 36, y0 + 80), radius=28, fill=(255, 255, 255, 38)); bg.alpha_composite(ov); d = ImageDraw.Draw(bg)
bg.alpha_composite(logo, (int(x0), y0)); d.text((x0 + 104 + 16, y0 + 52), chip, font=fc, fill=WHT, anchor='lm')
bg.convert('RGB').save('thumbnail.jpg', quality=94)
bg.convert('RGB').crop((0, 240, W, 1680)).resize((360, 480)).save('qc/thumb_grid.jpg')
