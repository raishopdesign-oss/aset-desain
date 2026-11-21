"""Reels cover for the Odol episode: a clean still (qc/th/t_56.5.jpg, rendered with ?nosub) + the hook. Everything
that must read sits inside the 3:4 centre (y 240–1680) that the profile grid shows; the brand chip sits below it."""
from PIL import Image, ImageDraw, ImageFont
W, H = 1080, 1920
bg = Image.open('qc/th/t_56.5.jpg').convert('RGB')
bg = bg.resize((int(W * 1.08), int(H * 1.08)), Image.LANCZOS).crop((int(W * .04), 0, int(W * .04) + W, H)).convert('RGBA')
def F(sz, wt=800):
    f = ImageFont.truetype('fonts/Manrope.ttf', sz); f.set_variation_by_axes([wt]); return f
g = Image.new('L', (1, H))
for y in range(H): g.putpixel((0, y), int(max(0, min(1, (y - 1020) / 330)) ** 1.3 * 238))
nv = Image.new('RGBA', (W, H), (10, 22, 52, 255)); nv.putalpha(g.resize((W, H))); bg.alpha_composite(nv)
d = ImageDraw.Draw(bg); YEL, NAV, WHT = (251, 196, 22), (10, 22, 52), (255, 255, 255)
def center(t, y, f, fill, st=0):
    d.text(((W - d.textlength(t, font=f)) / 2, y), t, font=f, fill=fill, stroke_width=st, stroke_fill=NAV)
k = 'SELAMA INI KITA SALAH SEBUT?'; fk = F(40); kw = d.textlength(k, font=fk)
d.rounded_rectangle(((W - kw) / 2 - 34, 1170, (W + kw) / 2 + 34, 1246), radius=38, fill=YEL); center(k, 1181, fk, NAV)
fh = F(132)
center('ODOL ITU', 1262, fh, WHT, 5)
w1, w2, gap = d.textlength('NAMA', font=fh), d.textlength('MEREK!', font=fh), 30; x = (W - (w1 + gap + w2)) / 2
d.text((x, 1405), 'NAMA', font=fh, fill=WHT, stroke_width=5, stroke_fill=NAV); d.text((x + w1 + gap, 1405), 'MEREK!', font=fh, fill=YEL, stroke_width=5, stroke_fill=NAV)
center('Bukan nama pasta gigi. Ceritanya dari Jerman, 1892.', 1580, F(34, 600), (225, 232, 245))
logo = Image.open('logo.png').resize((104, 104), Image.LANCZOS)
chip = 'GUNTING FAKTA  ·  EPS 01'; fc = F(32); cw = d.textlength(chip, font=fc)
x0 = (W - (104 + 16 + cw + 36)) / 2; y0 = 1712
ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(ov).rounded_rectangle((x0 + 52, y0 + 24, x0 + 104 + 16 + cw + 36, y0 + 80), radius=28, fill=(255, 255, 255, 38)); bg.alpha_composite(ov); d = ImageDraw.Draw(bg)
bg.alpha_composite(logo, (int(x0), y0)); d.text((x0 + 104 + 16, y0 + 52), chip, font=fc, fill=WHT, anchor='lm')
bg.convert('RGB').save('thumbnail.jpg', quality=94)
bg.convert('RGB').crop((0, 240, W, 1680)).resize((360, 480)).save('qc/thumb_grid.jpg')
