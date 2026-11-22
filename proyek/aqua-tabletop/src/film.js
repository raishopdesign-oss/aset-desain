// Kenapa Semua Air Mineral Disebut "Aqua"? — Gunting Fakta, Episode 02. Tabletop App Flythrough, 1080×1920.
// One take down a long desk: a chat that says "BELI AQUA!" and a warung shelf of other brands, a search card (Aqua = a brand,
// Latin for water), a map of West Java (Bekasi, 1973), a 1970s home where water is boiled, Tirto Utomo and the deed of
// PT Golden Mississippi, the first product (1974, glass bottle 950 ml, Rp75), packaging through the years and a delivery truck,
// today's shelf where a stamp names every bottle "AQUA", a dictionary card (genericized trademark), the question to the viewer,
// scissors cut FAKTA, the Gunting Fakta card drops. The hero is a pixel water bottle that hops the whole route.
// Every action is cued to the user's own voice-over (vo.js, from audio/user_vo.py).
import * as THREE from 'three';
import { card, pill, rbox } from './world.js';
import { makeMonster } from './voxel.js';
import * as K from './cards.js';
import { clamp, lerp, seg, ss, eo, ei, eio, back, hash, V, arc, pop, beatBounce, squash, hops } from './anim.js';
import { VO, DUR as VDUR } from './vo.js';
import { COAST } from './coast.js';

export const DUR = VDUR;
export const END = { credit: VDUR + 10 };   // no sign-off
export { VO };
export const GLYPHS = '';
const C = K.COL, TOP = .005, YAX = V(0, 1, 0), PH = .009;

// ── timeline (film seconds, cued to words of the voice-over) ──
export const T = {
  hero: .9, type: [1.3, 2.3], ding: 2.4, lain: 5.24, bottles: [7.36, 8.34, 9.02], reply: 11.26, ibu: 13.14, aquaQ: 13.6, satu: 15.3,
  hopB: [[16.9, 17.25], [17.3, 17.75]], search: [17.75, 18.25], sign: 18.8, rowX: 21.08, rowMerek: 25.6, rowIndo: 27.78, rowLatin: 31.28, glass: 33.72, modern: 35.54, y50: 37.1,
  hopC: [[38.1, 38.45], [38.5, 38.95]], pinC: 39.38, y1973: 40.5, belum: 46.86,
  hopD: [[48.2, 48.55], [48.6, 49.05]], kettle: 50.78, rumah: 51.3, bulb: 57.06, mini: 60.24,
  hopE: [[60.55, 60.9], [60.95, 61.4]], tirto: 63.4, tirtoName: 64.0, date: [65.42, 66.6], pt: 71.28, stampA: 71.76, praktis: 75.72, higienis: 76.44,
  hopF: [[81.35, 81.7], [81.75, 82.2]], y1974: 85.92, pasar: 89.08, glassBig: 91.78, kaca: 92.18, ml: 93.1, coins: [96.4, 96.6, 96.8], susah: 101.82, beliAir: 105.9,
  hopG: [[109.3, 109.65], [109.7, 110.15]], pack: [110.44, 112.2, 114.34], truck: 116.34, board: [116.6, 117.1], drive: [117.46, 126.0], percaya: 118.96,
  stops: [123.48, 124.4, 125.4], offTruck: [126.1, 126.6], banner2: 128.36,
  toF: [132.7, 133.4], big: 136.42, stamps: [142.1, 143.0, 143.9, 144.8],
  toH: [147.7, 148.4], term: [149.64, 150.9], def: 152.36, chips: [154.6, 155.0, 155.4, 155.8], banner3: 156.46,
  toG: [158.2, 158.9], question: 160.32, comments: [163.12, 163.78, 164.3],
  finale: 164.6, cut: 165.9, logo: 166.6,
};

// ── the desk (1 unit = 1000 canvas px; +z toward the camera at az 0) ──
export const MAT = [1.44, 7.2];
const MATZ = -.2;
export const CARDS = {
  phoneA: { c: V(-.27, 0, 3.22), w: .30, h: .56, yaw: .05, thick: PH },
  shelf: { c: V(.19, 0, 3.32), w: .32, h: .24, yaw: -.04 },
  phoneB: { c: V(.25, 0, 2.52), w: .30, h: .56, yaw: -.05, thick: PH },
  mapC: { c: V(-.22, 0, 1.86), w: .48, h: .34, yaw: .04 },
  cal: { c: V(.27, 0, 1.9), w: .22, h: .26, yaw: -.06 },
  home: { c: V(.14, 0, 1.24), w: .44, h: .34, yaw: -.03 },
  tirto: { c: V(-.25, 0, .6), w: .34, h: .34, yaw: .04 },
  akta: { c: V(.25, 0, .56), w: .34, h: .42, yaw: -.05 },
  product: { c: V(-.1, 0, -.08), w: .50, h: .34, yaw: .03 },
  price: { c: V(.33, 0, -.02), w: .22, h: .16, yaw: -.08 },
  pack: { c: V(-.22, 0, -.68), w: .46, h: .26, yaw: .03 },
  road: { c: V(.04, 0, -1.24), w: .92, h: .36, yaw: 0 },
  banner2: { c: V(.26, 0, -1.7), w: .40, h: .18, yaw: -.03 },
  shelfF: { c: V(0, 0, -2.22), w: .66, h: .30, yaw: 0 },
  kamus: { c: V(-.2, 0, -2.86), w: .44, h: .34, yaw: .03 },
  banner3: { c: V(.27, 0, -2.92), w: .40, h: .18, yaw: -.04 },
  phoneG: { c: V(-.27, 0, -3.52), w: .30, h: .56, yaw: .05, thick: PH },
  strip: { c: V(-.2, 0, -3.98), w: .36, h: .1, yaw: .02 },
  logo: { c: V(.22, 0, -4.02), w: .44, h: .3, yaw: -.03, thick: .007 },
};
export const at = (n, u, v, y) => { const d = CARDS[n]; return V(u / 1000 - d.w / 2, y ?? (d.thick || TOP), v / 1000 - d.h / 2).applyAxisAngle(YAX, d.yaw).add(d.c); };
const onPaper = (x, z) => V(x, 0, z);

// ── pixel art (one cell per pixel; pure black = eyes) ──
const toArt = (rows, pal) => { const cells = []; rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== '.') cells.push([i, j, pal[ch]]); })); return { w: rows[0].length, h: rows.length, cells }; };
const BOTTLE = ['...CCCC...', '...CCCC...', '....NN....', '...SSSS...', '..SSSSSS..', '.SSSSSSSS.', '.SSKSSKSS.', '.SSKSSKSS.', '.SSSSSSSS.', '.LLLLLLLL.', '.LWWWWWWL.', '.LLLLLLLL.', '.SSSSSSSS.', '.SSSSSSSS.', '.SSSSSSSS.', '..SSSSSS..'];
const bottlePal = (cap, label, wave = '#ffffff', body = '#d4ecf7') => ({ C: cap, N: '#e3f2f8', S: body, K: '#0d0d0d', L: label, W: wave });
const GLASS = ['....GG....', '....GG....', '....GG....', '....GG....', '...GGGG...', '...GGGG...', '..GGGGGG..', '.GGGGGGGG.', '.GGGGGGGG.', '.GGKGGKGG.', '.GGKGGKGG.', '.GGGGGGGG.', '.GWWWWWWG.', '.GBBBBBBG.', '.GGGGGGGG.', '.GBBBBBBG.', '.GGGGGGGG.', '.GBBBBBBG.', '.GGGGGGGG.', '.GGGGGGGG.', '..GGGGGG..'];
const GLASS_PAL = { G: '#dcefe8', K: '#0d0d0d', W: '#f8fbfa', B: '#3b86c6' };
const GALON = ['.....CCCC.....', '.....CCCC.....', '......NN......', '...BBBBBBBB...', '..BBBBBBBBBB..', '.BBBBBBBBBBBB.', '.BBBKBBBBKBBB.', '.BBBKBBBBKBBB.', '.BBBBBBBBBBBB.', '.LLLLLLLLLLLL.', '.LLLLLLLLLLLL.', '.BBBBBBBBBBBB.', '.BBBBBBBBBBBB.', '.BBBBBBBBBBBB.', '..BBBBBBBBBB..'];
const GALON_PAL = { C: '#2c5fb8', N: '#cfe6f4', B: '#a9d4ef', K: '#0d0d0d', L: '#fbfdff' };
const KETTLE = ['.....DDDD.....', '....H....H....', '....H....H....', '...MMMMMMMM...', '..MMMMMMMMMMSS', '..MMKMMMMKMMS.', '..MMKMMMMKMM..', '..MMMMMMMMMM..', '..MMMMMMMMMM..', '...MMMMMMMM...', '..FF.FF.FF.FF.', '.DDDDDDDDDDDD.', '.DRDDDDDDDDRD.', '.DDDDDDDDDDDD.'];
const KETTLE_PAL = { D: '#3d4456', H: '#3d4456', M: '#c9ccd3', S: '#b5b9c2', K: '#0d0d0d', F: '#ef8a5e', R: '#d8453a' };
const BULB = ['..YYYY..', '.YYYYYY.', 'YYYYYYYY', 'YYKYYKYY', 'YYKYYKYY', 'YYYYYYYY', '.YYYYYY.', '..YYYY..', '..GGGG..', '..GGGG..', '...GG...'];
const BULB_PAL = { Y: '#f6cf45', K: '#0d0d0d', G: '#9aa1ad' };
const TIRTO = ['....HHHHHH....', '...HHHHHHHH...', '..HHSSSSSSHH..', '..HSSSSSSSSH..', '..SSKSSSSKSS..', '..SSSSSSSSSS..', '..SSWWWWWWSS..', '...SSSSSSSS...', '....SSSSSS....', '..OOOOOOOOOO..', '.OOOOOOOOOOOO.', 'OOOOOOOOOOOOOO', 'OOOOOOOOOOOOOO', 'OOOOOOOOOOOOOO', 'OOOOOOOOOOOOOO', 'OOOOOOOOOOOOOO', '.OOOOOOOOOOOO.', '.PPPPP..PPPPP.', '.PPPPP..PPPPP.', '.ZZZZ....ZZZZ.'];
const TIRTO_PAL = { H: '#22252c', S: '#e8b58e', K: '#0d0d0d', W: '#f7f7f4', O: '#5b6b4a', P: '#3c3f47', Z: '#3a3a3e' };
const TRUCK = ['.BBBBBBBBBBBB.......', '.BWWWWWWWWWWB.......', '.BWWWWWWWWWWB.CCCC..', '.BWWWWWWWWWWB.CGGCC.', '.BWWWWWWWWWWB.CGGCCC', '.BBBBBBBBBBBBBCCCCCC', '.DDDDDDDDDDDDDDDDDDD', '..TT......TT....TT..', '..TT......TT....TT..'];
const TRUCK_PAL = { B: '#2c5fb8', W: '#f4f7fb', C: '#3b86c6', G: '#bfe3f2', D: '#3d4456', T: '#22252c' };
const FACTORY = ['.........CC.', '.........CC.', '.........CC.', '..R..R...CC.', '.RR.RR.RRCC.', 'RRRRRRRRRRRR', 'WWWWWWWWWWWW', 'WGGWWGGWWGGW', 'WGGWWGGWWGGW', 'WWWWWWWWWWWW', 'WWWWDDWWWWWW', 'WWWWDDWWWWWW'];
const FACTORY_PAL = { C: '#c9c2b4', R: '#6f8f86', W: '#f4ecd6', G: '#5b6170', D: '#8a5a3c' };
const SCISSORS = ['.SS.........SS..', 'S..S.......S..S.', 'S..S......S..S..', '.SS.BB...BB.SS..', '.....BBBBB......', '......BBB.......', '.....B...B......', '....B.....B.....', '...B.......B....', '..B.........B...'];
const SCISSORS_PAL = { S: '#ef8a5e', B: '#aeb4bf' };
// the brands on the shelves: cap and label colours only (names are printed on the cards, no logos)
const BRANDS = { hero: bottlePal('#2c5fb8', '#7fb4e0'), lemin: bottlePal('#7fd3c0', '#f4fbf8', '#5cc2a4'), club: bottlePal('#3f7fd0', '#ffffff', '#3f7fd0'), cleo: bottlePal('#ef8a3c', '#26262b', '#ef8a3c'), vit: bottlePal('#d8453a', '#d8453a', '#ffffff'), prima: bottlePal('#2c5fb8', '#2c5fb8', '#ffffff') };

// ── print helpers ──
const signPrint = (c, x, y, w, h) => {   // our own plate for the brand name: blue field, white word, three waves (not the brand's logo)
  c.fillStyle = C.accent; K.rr(c, x, y, w, h, 12); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 3; K.rr(c, x + 6, y + 6, w - 12, h - 12, 8); c.stroke();
  const fs = h * .42;
  K.txt(c, 'AQUA', x + w / 2 + fs * .05, y + h * .4 + fs * .05, { size: fs, wt: 800, font: K.SANS, col: '#13284f', align: 'center', ls: fs * .08 });
  K.txt(c, 'AQUA', x + w / 2, y + h * .4, { size: fs, wt: 800, font: K.SANS, col: '#ffffff', align: 'center', ls: fs * .08 });
  c.strokeStyle = '#a9d4ef'; c.lineWidth = h * .035; c.lineCap = 'round';
  for (let k = 0; k < 2; k++) { const yy = y + h * (.72 + k * .1); c.beginPath(); for (let i = 0; i <= 40; i++) { const xx = x + w * .18 + i / 40 * w * .64; const v = yy + Math.sin(i / 40 * Math.PI * 4) * h * .025; i ? c.lineTo(xx, v) : c.moveTo(xx, v); } c.stroke(); }
};
function statusBar(c) {
  K.txt(c, '07:15', 30, 30, { size: 17, wt: 500 });
  for (let i = 0; i < 4; i++) { c.fillStyle = C.ink; c.fillRect(214 + i * 7, 36 - (i + 1) * 4, 5, (i + 1) * 4); }
  c.strokeStyle = C.ink; c.lineWidth = 2; K.rr(c, 246, 24, 26, 13, 3); c.stroke(); c.fillStyle = C.ink; c.fillRect(249, 27, 18, 7);
}
function phoneFrame(c) {
  const w = 300, h = 560; c.clearRect(0, 0, w, h);
  c.fillStyle = C.ink; K.rr(c, 0, 0, w, h, 36); c.fill();
  c.fillStyle = '#f6f8fb'; K.rr(c, 11, 11, w - 22, h - 22, 27); c.fill();
  c.fillStyle = C.ink; K.rr(c, w / 2 - 36, 20, 72, 14, 7); c.fill();
  statusBar(c);
}
const bubble = (c, s, mine, y, o = {}) => {
  const size = o.size || 20; c.font = `800 ${size}px ${K.SANS}`; const tw = c.measureText(s).width + 30, w = Math.max(o.minW || 0, tw), hh = o.h || 42;
  const x = mine ? 300 - 24 - w : 24; c.fillStyle = o.bg || (mine ? C.accent : '#e6eaf1'); K.rr(c, x, y, w, hh, 16); c.fill();
  K.txt(c, s, x + 15, y + hh / 2 + 1, { size, wt: 800, font: K.SANS, col: o.col || (mine ? '#fff' : C.ink) });
};
const yearCard = (c, w, h, yr, sub) => {   // a tear-off calendar page
  c.clearRect(0, 0, w, h); c.fillStyle = C.card; K.rr(c, 0, 0, w, h, 14); c.fill(); K.grain(c, w, h, 77);
  c.fillStyle = C.red; K.rr(c, 0, 0, w, 56, [14, 14, 0, 0]); c.fill();
  for (let i = 0; i < 4; i++) { c.fillStyle = '#f6f8fb'; c.beginPath(); c.arc(36 + i * (w - 72) / 3, 28, 7, 0, 7); c.fill(); }
  K.txt(c, yr, w / 2, h * .54, { size: 68, wt: 800, font: K.SANS, align: 'center' });
  K.txt(c, sub, w / 2, h * .82, { size: 17, wt: 500, col: C.mute, align: 'center', ls: 2 });
};

// A: the chat from Mum
function drawA(c, st) {
  phoneFrame(c);
  K.txt(c, '‹', 26, 76, { size: 34, wt: 600, col: C.accent });
  c.fillStyle = C.coral; c.beginPath(); c.arc(70, 76, 17, 0, 7); c.fill(); K.txt(c, 'I', 70, 77, { size: 18, wt: 800, font: K.SANS, col: '#fff', align: 'center' });
  K.txt(c, 'Ibu', 98, 77, { size: 26, wt: 800, font: K.SANS });
  c.fillStyle = C.line; c.fillRect(20, 104, 260, 2);
  bubble(c, 'Nak, haus nih', false, 122); bubble(c, 'mampir warung ya', false, 170);
  if (st.n > 0) {
    const full = 'BELI AQUA!', s = full.slice(0, st.n);
    c.fillStyle = '#e6eaf1'; K.rr(c, 24, 222, 252, 84, 20); c.fill();
    K.txt(c, s, 40, 266, { size: 42, wt: 800, font: K.SANS, col: C.ink });
    if (st.n < full.length) { c.fillStyle = C.accent; c.fillRect(40 + c.measureText(s).width + 4, 246, 4, 40); }
  }
  if (st.reply) bubble(c, 'Adanya Cleo, Bu', true, 322);
  if (st.ibu) bubble(c, 'Iya, Aqua-nya taruh meja', false, 374, { size: 18 });
  c.fillStyle = '#e9edf4'; K.rr(c, 22, 476, 188, 50, 25); c.fill(); K.txt(c, 'Ketik pesan', 42, 502, { size: 19, wt: 600, font: K.SANS, col: '#98a1b3' });
  c.fillStyle = C.accent; K.rr(c, 218, 476, 60, 50, 25); c.fill(); K.txt(c, '➤', 248, 502, { size: 20, wt: 800, font: K.SANS, col: '#fff', align: 'center' });
}
const SHELF_NAMES = ['LE MINERALE', 'CLUB', 'CLEO'];
function drawShelf(c, st) {
  K.cardBase(c, 320, 240, 'warung', 'Rak air mineral', { headH: 88, tagSize: 16, cnSize: 21 });
  SHELF_NAMES.forEach((n, i) => { const x = 16 + i * 98; c.fillStyle = C.faint; K.rr(c, x, 100, 92, 132, 10); c.fill();
    if (st.n > i) K.txt(c, n, x + 46, 222, { size: n.length > 8 ? 11 : 14, wt: 500, col: C.ink, align: 'center', ls: 1 }); });
}
// B: the search card
function drawB(c, st) {
  phoneFrame(c);
  K.txt(c, 'Cari', 28, 78, { size: 28, wt: 800, font: K.SANS });
  c.fillStyle = '#e9edf4'; K.rr(c, 24, 100, 252, 48, 24); c.fill();
  c.strokeStyle = C.mute; c.lineWidth = 3; c.beginPath(); c.arc(50, 122, 9, 0, 7); c.stroke(); c.beginPath(); c.moveTo(57, 129); c.lineTo(64, 136); c.stroke();
  const q = 'aqua'.slice(0, st.q || 0); K.txt(c, q, 76, 125, { size: 24, wt: 800, font: K.SANS });
  if (st.q < 4 || st.caret) { c.font = `800 24px ${K.SANS}`; c.fillStyle = C.accent; c.fillRect(78 + c.measureText(q).width, 110, 3, 30); }
  if (st.sign) signPrint(c, 24, 164, 252, 128);
  const rows = [['Nama semua air mineral?', 'x', st.r1], ['Merek air minum kemasan', 'v', st.r2], ['Asal: Indonesia', 'v', st.r3], ['Latin: aqua = air', 'v', st.r4]];
  rows.forEach(([s, k, on], i) => { if (!on) return; const y = 318 + i * 54;
    c.fillStyle = '#ffffff'; K.rr(c, 24, y, 252, 46, 12); c.fill(); c.strokeStyle = C.line; c.lineWidth = 2; K.rr(c, 24, y, 252, 46, 12); c.stroke();
    if (k === 'x') K.cross(c, 46, y + 23, 16, C.red, 5); else K.tick(c, 46, y + 23, 20, C.green, 5);
    K.txt(c, s, 70, y + 24, { size: 17, wt: 800, font: K.SANS, col: k === 'x' ? C.red : C.ink }); });
}
// C: coastline map of West Java, no borders
const JAVA_BOX = [105.0, -7.9, 109.6, -5.6];
function project(box, x0, y0, w, h) {
  const [a, b, cc, d] = box, k = 1 / Math.cos((b + d) / 2 * Math.PI / 180), s = Math.min(w / (cc - a), h / ((d - b) * k));
  const ox = x0 + (w - (cc - a) * s) / 2, oy = y0 + (h - (d - b) * k * s) / 2;
  return ([lo, la]) => [ox + (lo - a) * s, oy + (d - la) * k * s];
}
function coastMap(c, key, box, x0, y0, w, h) {
  const { polys } = COAST[key], P = project(box, x0, y0, w, h);
  c.save(); K.rr(c, x0, y0, w, h, 12); c.clip();
  c.fillStyle = C.sea; c.fillRect(x0, y0, w, h);
  c.strokeStyle = 'rgba(44,95,184,.10)'; c.lineWidth = 1.5; for (let g = 1; g < 8; g++) { c.beginPath(); c.moveTo(x0, y0 + g * h / 8); c.lineTo(x0 + w, y0 + g * h / 8); c.stroke(); c.beginPath(); c.moveTo(x0 + g * w / 8, y0); c.lineTo(x0 + g * w / 8, y0 + h); c.stroke(); }
  c.fillStyle = C.land; c.strokeStyle = C.ink; c.lineWidth = 1.6; c.lineJoin = 'round';
  for (const r of polys) { c.beginPath(); r.forEach((p, i) => { const [x, y] = P(p); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath(); c.fill(); c.stroke(); }
  c.restore(); c.strokeStyle = C.line; c.lineWidth = 2; K.rr(c, x0, y0, w, h, 12); c.stroke();
  return P;
}
const MAPC = { x: 18, y: 92, w: 444, h: 232 };
const BEKASI = [107.0, -6.24];
let PC = null;
function drawC(c, st) {
  K.cardBase(c, 480, 340, 'peta', 'Jawa Barat', { headH: 78, tagSize: 16, cnSize: 21 });
  PC = coastMap(c, 'java', JAVA_BOX, MAPC.x, MAPC.y, MAPC.w, MAPC.h);
  if (st.bekasi) { const [x, y] = PC(BEKASI); K.txt(c, 'BEKASI', x + 16, y + 26, { size: 19, wt: 500, ls: 2 }); K.txt(c, 'Jawa Barat', x + 16, y + 48, { size: 16, wt: 800, font: K.SANS, col: C.mute }); }
}
function drawCal(c, st) { yearCard(c, 220, 260, st.y || '1972', 'INDONESIA'); }
// D: a 1970s home: water is boiled on the stove
function drawHome(c, st) {
  K.cardBase(c, 440, 340, 'rumah', 'Indonesia, 1970-an', { headH: 82, tagSize: 16, cnSize: 21 });
  c.fillStyle = C.faint; for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2) c.fillRect(20 + i * 50, 98 + j * 52, 50, 52);
  if (st.rebus) { c.fillStyle = C.ink; K.rr(c, 195, 290, 190, 36, 18); c.fill(); K.txt(c, 'MEREBUS AIR', 290, 309, { size: 16, wt: 500, col: '#fff', align: 'center', ls: 2 }); }
}
// E: Tirto Utomo and the deed
function drawTirto(c, st) {
  K.cardBase(c, 340, 340, 'pendiri', 'Bekasi · 1973', { headH: 82, tagSize: 16, cnSize: 21 });
  c.fillStyle = C.faint; c.beginPath(); c.arc(170, 200, 92, 0, 7); c.fill();
  if (st.name) { K.txt(c, 'TIRTO UTOMO', 170, 302, { size: 19, wt: 500, align: 'center', ls: 2 }); K.txt(c, 'pendiri Aqua', 170, 324, { size: 15, wt: 700, font: K.SANS, col: C.mute, align: 'center' }); }
}
function drawAkta(c, st) {
  const w = 340, h = 420; c.clearRect(0, 0, w, h);
  c.fillStyle = C.sepia; K.rr(c, 0, 0, w, h, 12); c.fill(); K.grain(c, w, h, 61, null, 'rgba(74,58,38,.06)', 'rgba(255,250,235,.4)');
  K.txt(c, 'AKTA PENDIRIAN', w / 2, 44, { size: 26, wt: 800, font: K.SANS, col: C.sepiaInk, align: 'center', ls: 2 });
  c.fillStyle = C.sepiaInk; c.fillRect(22, 66, w - 44, 3);
  const date = '23 FEBRUARI 1973'.slice(0, st.d || 0);
  K.txt(c, date, w / 2, 96, { size: 20, wt: 500, col: C.sepiaInk, align: 'center', ls: 2 });
  c.fillStyle = 'rgba(74,58,38,.25)'; for (let k = 0; k < 6; k++) c.fillRect(24, 124 + k * 15, w - 48 - (k % 3) * 40, 5);
  if (st.pt) { K.txt(c, 'PT GOLDEN', w / 2, 238, { size: 30, wt: 800, font: K.SANS, col: C.sepiaInk, align: 'center', ls: 1 }); K.txt(c, 'MISSISSIPPI', w / 2, 276, { size: 30, wt: 800, font: K.SANS, col: C.sepiaInk, align: 'center', ls: 1 }); }
  c.fillStyle = 'rgba(74,58,38,.25)'; for (let k = 0; k < 3; k++) c.fillRect(24, 312 + k * 15, 150 - k * 20, 5);
  if (st.stamp) { c.save(); c.globalAlpha = .85; c.strokeStyle = C.red; c.lineWidth = 5; c.translate(262, 352); c.rotate(-.18); c.beginPath(); c.arc(0, 0, 44, 0, 7); c.stroke(); c.beginPath(); c.arc(0, 0, 34, 0, 7); c.lineWidth = 2; c.stroke();
    K.txt(c, 'SAH', 0, 1, { size: 22, wt: 800, font: K.SANS, col: C.red, align: 'center', ls: 2 }); c.restore(); }
}
// F: the first product, 1974
function drawProduct(c, st) {
  K.cardBase(c, 500, 340, 'produk pertama', 'Aqua, 1974', { headH: 82, tagSize: 16, cnSize: 21 });
  c.fillStyle = C.faint; K.rr(c, 24, 100, 196, 220, 14); c.fill();
  const rows = [['Botol kaca', st.r1], ['950 ml', st.r2], ['± Rp75 / botol', st.r3]];
  rows.forEach(([s, on], i) => { if (!on) return; const y = 112 + i * 64;
    c.fillStyle = '#ffffff'; K.rr(c, 238, y, 240, 50, 12); c.fill(); c.strokeStyle = C.line; c.lineWidth = 2; K.rr(c, 238, y, 240, 50, 12); c.stroke();
    K.tick(c, 262, y + 25, 20, C.green, 5); K.txt(c, s, 286, y + 26, { size: 21, wt: 800, font: K.SANS }); });
}
function drawPrice(c, st) {
  const w = 220, h = 160; c.clearRect(0, 0, w, h); c.fillStyle = C.lemon; K.rr(c, 0, 0, w, h, 14); c.fill(); K.grain(c, w, h, 13);
  c.fillStyle = '#e4e9f1'; c.beginPath(); c.arc(28, 80, 10, 0, 7); c.fill();
  K.txt(c, 'HARGA', 120, 42, { size: 16, wt: 500, col: C.sepiaInk, align: 'center', ls: 3 });
  K.txt(c, st.on ? 'Rp75' : 'Rp··', 120, 98, { size: 52, wt: 800, font: K.SANS, align: 'center' });
}
// G: packaging through the years; the road; the banner
const PACK = [['1974', 'KACA'], ['PLASTIK', 'BOTOL'], ['GALON', 'ISI ULANG']];
function drawPack(c, st) {
  K.cardBase(c, 460, 260, 'kemasan', 'Dari masa ke masa', { headH: 82, tagSize: 16, cnSize: 21 });
  PACK.forEach(([a, b], i) => { const x = 22 + i * 146; c.fillStyle = C.faint; K.rr(c, x, 96, 126, 140, 12); c.fill();
    if (st.n > i) { K.txt(c, a, x + 63, 214, { size: 14, wt: 500, col: C.ink, align: 'center', ls: 1 }); }
    if (i < 2 && st.n > i + 1) K.txt(c, '›', x + 136, 160, { size: 30, wt: 800, font: K.SANS, col: C.accent, align: 'center' }); });
}
const STOPS = [['TOKO', 560, 1], ['WARUNG', 690, -1], ['PUSAT BELANJA', 830, 1]];
function drawRoad(c, st) {
  K.cardBase(c, 920, 360, 'distribusi', 'Makin mudah ditemukan', { headH: 82, tagSize: 16, cnSize: 21 });
  c.fillStyle = '#d9dde4'; K.rr(c, 30, 240, 860, 40, 20); c.fill();
  c.strokeStyle = '#ffffff'; c.lineWidth = 4; c.setLineDash([22, 18]); c.beginPath(); c.moveTo(50, 260); c.lineTo(870, 260); c.stroke(); c.setLineDash([]);
  STOPS.forEach(([s, x, d], i) => { if (st.n > i) { const y = d > 0 ? 300 : 222; c.fillStyle = C.accent; c.beginPath(); c.arc(x, y, 9, 0, 7); c.fill(); K.txt(c, s, Math.min(x, 900 - s.length * 6), d > 0 ? 326 : 198, { size: 15, wt: 500, align: 'center', ls: 1.5 }); } });
}
function drawBanner2(c, st) {
  K.cardBase(c, 400, 180, '', '', {}); if (!st.on) return;
  c.fillStyle = C.accent; c.fillRect(0, 0, 14, 180);
  K.txt(c, 'DARI PRODUK BARU,', 36, 50, { size: 26, wt: 800, font: K.SANS, col: C.mute });
  K.txt(c, 'JADI MEREK YANG', 36, 94, { size: 32, wt: 800, font: K.SANS });
  K.txt(c, 'DIKENAL LUAS', 36, 138, { size: 32, wt: 800, font: K.SANS, col: C.accent });
}
// H: today's shelf; stamp prints
const F_NAMES = ['LE MINERALE', 'CLUB', 'CLEO', 'VIT'];
function drawF(c, st) {
  K.cardBase(c, 660, 300, 'rak hari ini', 'Semua disebut…', { headH: 82, tagSize: 16, cnSize: 21 });
  if (st.big) { c.save(); c.globalAlpha = .92; c.strokeStyle = C.accent; c.lineWidth = 6; c.translate(420, 50); c.rotate(-.05); K.rr(c, -110, -30, 220, 60, 10); c.stroke(); K.txt(c, 'AQUA', 0, 3, { size: 44, wt: 800, font: K.SANS, col: C.accent, align: 'center', ls: 10 }); c.restore(); }
  F_NAMES.forEach((n, i) => { const x = 22 + i * 156, y = 250, stamped = st.s && st.s[i];
    c.fillStyle = C.faint; K.rr(c, x, y - 22, 146, 44, 10); c.fill();
    if (stamped) { K.txt(c, n, x + 73, y - 8, { size: 11, wt: 500, col: C.mute, align: 'center', ls: 1 }); c.strokeStyle = C.mute; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + 20, y - 8); c.lineTo(x + 126, y - 8); c.stroke();
      K.txt(c, 'AQUA', x + 73, y + 12, { size: 19, wt: 800, font: K.SANS, col: C.accent, align: 'center', ls: 4 }); }
    else K.txt(c, n, x + 73, y + 1, { size: n.length > 8 ? 12 : 14, wt: 500, col: C.ink, align: 'center', ls: 1 }); });
}
// I: the dictionary card
const CHIPS = [['AQUA', C.accent], ['ODOL', C.coral], ['SANYO', C.green], ['HONDA', C.red]];
function drawKamus(c, st) {
  K.cardBase(c, 440, 340, 'kamus', 'Istilah', { headH: 82, tagSize: 16, cnSize: 21 });
  const term = 'genericized trademark'.slice(0, st.n || 0);
  K.txt(c, term, 28, 122, { size: 29, wt: 800, font: K.SANS });
  if (st.n && st.n < 21) { c.font = `800 29px ${K.SANS}`; c.fillStyle = C.accent; c.fillRect(30 + c.measureText(term).width, 104, 3, 36); }
  if (st.n >= 21) K.txt(c, '/je·ne·ri·saizd tred·mark/', 28, 156, { size: 16, wt: 500, col: C.mute });
  if (st.def) { K.txt(c, 'Nama merek yang jadi', 28, 200, { size: 22, wt: 700, font: K.SANS }); K.txt(c, 'sebutan umum.', 28, 230, { size: 22, wt: 700, font: K.SANS, col: C.accent }); }
  CHIPS.forEach(([s, col], i) => { if ((st.c || 0) <= i) return; const x = 28 + i * 100; c.fillStyle = col; K.rr(c, x, 272, 90, 40, 20); c.fill(); K.txt(c, s, x + 45, 293, { size: 15, wt: 500, col: '#fff', align: 'center', ls: 1 }); });
}
function drawBanner3(c, st) {
  K.cardBase(c, 400, 180, '', '', {}); if (!st.on) return;
  c.fillStyle = C.accent; c.fillRect(0, 0, 14, 180);
  K.txt(c, 'KETIKA', 36, 46, { size: 22, wt: 500, col: C.mute, ls: 3 });
  K.txt(c, 'NAMA MEREK JADI', 36, 92, { size: 34, wt: 800, font: K.SANS });
  K.txt(c, 'NAMA UMUM!', 36, 138, { size: 38, wt: 800, font: K.SANS, col: C.accent });
}
// J: comments
function drawG(c, st) {
  phoneFrame(c);
  K.txt(c, 'Komentar', 28, 78, { size: 26, wt: 800, font: K.SANS });
  c.fillStyle = C.line; c.fillRect(20, 102, 260, 2);
  if (st.q) { c.fillStyle = C.accent; K.rr(c, 22, 116, 256, 120, 18); c.fill();
    K.txt(c, 'KALAU DI DAERAHMU,', 150, 152, { size: 21, wt: 800, font: K.SANS, col: '#fff', align: 'center' });
    K.txt(c, 'AIR MINERAL', 150, 180, { size: 21, wt: 800, font: K.SANS, col: '#fff', align: 'center' });
    K.txt(c, 'DISEBUT APA?', 150, 210, { size: 24, wt: 800, font: K.SANS, col: C.lemon, align: 'center' }); }
  const cm = [['rara.jkt', 'aqua dong!', C.coral], ['ucok_mdn', 'aqua jugaa', C.mint], ['neng.bdg', 'aqua, euy', C.lemon]];
  cm.forEach(([u, s, col], i) => { if ((st.n || 0) <= i) return; const y = 256 + i * 66;
    c.fillStyle = col; c.beginPath(); c.arc(44, y + 22, 15, 0, 7); c.fill();
    K.txt(c, u, 68, y + 12, { size: 15, wt: 500, col: C.mute }); K.txt(c, s, 68, y + 36, { size: 20, wt: 800, font: K.SANS }); });
  c.fillStyle = '#e9edf4'; K.rr(c, 22, 476, 256, 50, 25); c.fill(); K.txt(c, 'Tulis komentar…', 42, 502, { size: 19, wt: 600, font: K.SANS, col: '#98a1b3' });
}
function drawStrip(c) { c.clearRect(0, 0, 360, 100); c.fillStyle = C.cream; c.fillRect(0, 0, 360, 100); K.grain(c, 360, 100, 41); K.txt(c, 'FAKTA', 180, 54, { size: 64, wt: 800, font: K.SANS, col: C.ink, align: 'center', ls: 14 }); c.save(); c.setLineDash([8, 7]); c.strokeStyle = C.mute; c.lineWidth = 2; c.beginPath(); c.moveTo(180, 0); c.lineTo(180, 100); c.stroke(); c.restore(); }
let LOGO_IMG = null;
function drawLogo(c) {
  const w = 440, h = 300; c.clearRect(0, 0, w, h); c.fillStyle = C.card; K.rr(c, 0, 0, w, h, 20); c.fill(); K.grain(c, w, h, 53);
  c.fillStyle = C.accent; c.fillRect(0, 0, w, 14);
  if (LOGO_IMG) { const d = 196; c.save(); c.shadowColor = 'rgba(20,30,50,.25)'; c.shadowBlur = 10; c.shadowOffsetY = 3; c.drawImage(LOGO_IMG, w / 2 - d / 2, 24, d, d); c.restore(); }
  else K.txt(c, 'GUNTING FAKTA', w / 2, 140, { size: 44, wt: 800, font: K.SANS, align: 'center', ls: 2 });
  c.fillStyle = C.ink; K.rr(c, 70, 228, 300, 46, 23); c.fill();
  K.txt(c, 'FOLLOW @GUNTINGFAKTA', w / 2, 252, { size: 18, wt: 500, col: '#fff', align: 'center', ls: 1.5 });
}

export function build(ctx) {
  const { world, ev } = ctx, scene = world.scene;
  ctx.fx = { flash: 0 };
  const mat = (col, r = .5, extra = {}) => new THREE.MeshStandardMaterial({ color: col, roughness: r, ...extra });
  { const img = new Image(); img.onload = () => { LOGO_IMG = img; re('logo', drawLogo, { v: 2 }, true); }; img.src = 'logo.png'; }

  // cards
  const cv = {}, cd = {}, state = {};
  const mk = (n, draw, init, s = 3.2) => { const d = CARDS[n], [c, x] = K.canvas(d.w * 1000, d.h * 1000, s); cv[n] = x; draw(x, init); state[n] = JSON.stringify(init); const g = card(world, c, d.w, d.h, d.thick || TOP); g.position.copy(d.c); g.rotation.y = d.yaw; scene.add(g); cd[n] = g; };
  const re = (n, draw, st, force) => { const k = JSON.stringify(st); if (k === state[n] && !force) return; state[n] = k; draw(cv[n], st); cd[n].userData.redraw(); };
  mk('phoneA', drawA, { n: 0 }); mk('shelf', drawShelf, { n: 0 }); mk('phoneB', drawB, { q: 0 }); mk('mapC', drawC, {}); mk('cal', drawCal, {}); mk('home', drawHome, {});
  mk('tirto', drawTirto, {}); mk('akta', drawAkta, {}); mk('product', drawProduct, {}); mk('price', drawPrice, {}); mk('pack', drawPack, { n: 0 }); mk('road', drawRoad, { n: 0 }, 2.4);
  mk('banner2', drawBanner2, {}); mk('shelfF', drawF, {}); mk('kamus', drawKamus, {}); mk('banner3', drawBanner3, {}); mk('phoneG', drawG, {}); mk('logo', drawLogo, { v: 1 }, 3);
  const stripHalves = [0, 1].map(k => { const [c, x] = K.canvas(180, 100, 3); x.save(); x.translate(-180 * k, 0); drawStrip(x); x.restore(); const g = card(world, c, .18, .1, .0035); scene.add(g); return g; });
  const stripAt = (k, dx = 0) => { const d = CARDS.strip; return V((k ? .09 : -.09) + dx * (k ? 1 : -1), 0, 0).applyAxisAngle(YAX, d.yaw).add(d.c); };

  // title tent beside the first stop
  const mkTent = (w, h, lean, draw, cw, chh) => { const g = new THREE.Group(); const [c, x] = K.canvas(cw, chh, 1.6); draw(x);
    const face = new THREE.MeshStandardMaterial({ map: world.tex(c), roughness: .8 }), plain = new THREE.MeshStandardMaterial({ color: C.card, roughness: .85 });
    const f = new THREE.Mesh(new THREE.BoxGeometry(w, h, .0012), [plain, plain, plain, plain, face, plain]), b = new THREE.Mesh(new THREE.BoxGeometry(w, h, .0012), plain);
    const dz = Math.sin(lean) * h / 2, hy = Math.cos(lean) * h / 2; f.position.set(0, hy, dz); f.rotation.x = -lean; b.position.set(0, hy, -dz); b.rotation.x = lean; f.castShadow = b.castShadow = f.receiveShadow = true; g.add(f, b); scene.add(g); return { g, f, w, h }; };
  const tent = mkTent(.28, .1, .2, x => { x.fillStyle = C.card; x.fillRect(0, 0, 840, 300); K.grain(x, 840, 300, 9, 4000); x.fillStyle = C.accent; x.fillRect(0, 0, 18, 300);
    K.txt(x, 'KENAPA SEMUA AIR MINERAL', 52, 92, { size: 54, wt: 800, font: K.SANS }); K.txt(x, 'DISEBUT AQUA?', 52, 172, { size: 76, wt: 800, font: K.SANS, col: C.accent });
    K.txt(x, 'GUNTING FAKTA · EPS 02', 56, 248, { size: 30, wt: 500, col: C.mute, ls: 5 }); }, 840, 300);
  tent.g.position.set(.2, 0, 2.94); tent.g.rotation.y = -.12;

  // desk props: a pen, sticky notes, a mug, a glass of water, an eraser, a pencil
  {
    const pen = new THREE.Group(); const body = new THREE.Mesh(new THREE.CylinderGeometry(.0065, .0065, .15, 20), mat('#2a3042', .35)); body.rotation.z = Math.PI / 2; pen.add(body);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(.0065, .02, 20), mat('#c9ccd4', .3, { metalness: .6 })); tip.rotation.z = -Math.PI / 2; tip.position.x = .085; pen.add(tip);
    pen.position.set(-.56, .0065, 2.6); pen.rotation.y = 1.2; pen.traverse(o => o.castShadow = true); scene.add(pen);
    for (let i = 0; i < 4; i++) { const n = new THREE.Mesh(rbox(.1, .0016, .1, .002), mat(i === 3 ? '#f4d27a' : C.lemon, .85)); n.position.set(.58, .0008 + i * .0016, 2.12); n.rotation.y = .25 + i * .03; n.castShadow = n.receiveShadow = true; scene.add(n); }
    const mug = new THREE.Group(); const cup = new THREE.Mesh(new THREE.CylinderGeometry(.05, .046, .095, 40, 1, true), mat('#f3efe7', .45, { side: THREE.DoubleSide })); cup.position.y = .0475; mug.add(cup);
    const bottom = new THREE.Mesh(new THREE.CircleGeometry(.046, 40), mat('#f3efe7', .45)); bottom.rotation.x = -Math.PI / 2; bottom.position.y = .002; mug.add(bottom);
    const tea = new THREE.Mesh(new THREE.CircleGeometry(.047, 40), mat('#8a5a3c', .25)); tea.rotation.x = -Math.PI / 2; tea.position.y = .08; mug.add(tea);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(.025, .007, 12, 24, Math.PI), mat('#f3efe7', .45)); handle.rotation.z = -Math.PI / 2; handle.position.set(.05, .047, 0); mug.add(handle);
    mug.position.set(-.6, 0, .98); mug.rotation.y = 2.4; mug.traverse(o => o.castShadow = o.receiveShadow = true); scene.add(mug);
    const glass = new THREE.Group(); const gl = new THREE.Mesh(new THREE.CylinderGeometry(.03, .027, .08, 32, 1, true), mat('#dfeef2', .1, { transparent: true, opacity: .55, side: THREE.DoubleSide })); gl.position.y = .04; glass.add(gl);
    const water = new THREE.Mesh(new THREE.CylinderGeometry(.028, .026, .055, 32), mat('#bfe2f2', .1, { transparent: true, opacity: .5 })); water.position.y = .028; glass.add(water);
    glass.position.set(.6, 0, -.5); glass.traverse(o => o.castShadow = true); scene.add(glass);
    const er = new THREE.Mesh(rbox(.05, .014, .022, .004), mat('#f0a7b3', .7)); er.position.set(-.58, .007, -1.9); er.rotation.y = .5; er.castShadow = true; scene.add(er);
    const pc = new THREE.Mesh(new THREE.CylinderGeometry(.005, .005, .16, 6), mat(C.lemon, .5)); pc.rotation.z = Math.PI / 2; pc.position.set(.6, .005, -2.6); pc.rotation.y = .4; pc.castShadow = true; scene.add(pc);
  }
  // soft window light on the desk
  { const [c, x] = K.canvas(512, 512, 1); x.filter = 'blur(26px)'; x.fillStyle = 'rgba(255,236,205,1)';
    for (const [a, b] of [[60, 60], [270, 60], [60, 270], [270, 270]]) x.fillRect(a, b, 180, 180); x.filter = 'none';
    const lm = new THREE.MeshBasicMaterial({ map: world.tex(c), transparent: true, opacity: .2, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    for (const [px, pz, r] of [[0, 2.8, .5], [.1, 1.0, .4], [-.05, -.9, .5], [.05, -2.6, .3]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, .8), lm); m.rotation.set(-Math.PI / 2, 0, r); m.position.set(px, .0003, pz); m.renderOrder = 1; scene.add(m); } }

  // ── cast ──
  const add = m => { scene.add(m.root); return m; };
  const B = (pal, n, s = .0068) => add(makeMonster(toArt(BOTTLE, pal), s, n, .9));
  const hero = B(BRANDS.hero, 'hero');
  const shelfB = [B(BRANDS.lemin, 'sl', .0048), B(BRANDS.club, 'sc', .0048), B(BRANDS.cleo, 'so', .0048)];
  const glassB = add(makeMonster(toArt(GLASS, GLASS_PAL), .006, 'glassB', .9)), modernB = B(BRANDS.prima, 'modernB');
  const kettle = add(makeMonster(toArt(KETTLE, KETTLE_PAL), .0078, 'kettle', .9));
  const bulb = add(makeMonster(toArt(BULB, BULB_PAL), .0068, 'bulb', .9));
  const mini = B(BRANDS.hero, 'mini', .0045);
  const tirto = add(makeMonster(toArt(TIRTO, TIRTO_PAL), .0074, 'tirto', .85));
  const glassBig = add(makeMonster(toArt(GLASS, GLASS_PAL), .0082, 'glassBig', .9));
  const packs = [add(makeMonster(toArt(GLASS, GLASS_PAL), .0052, 'p0', .9)), B(BRANDS.prima, 'p1', .0058), add(makeMonster(toArt(GALON, GALON_PAL), .0058, 'p2', .9))];
  const factory = add(makeMonster(toArt(FACTORY, FACTORY_PAL), .0074, 'factory', .8));
  const truck = add(makeMonster(toArt(TRUCK, TRUCK_PAL), .0072, 'truck', .8));
  const shelfH = [B(BRANDS.lemin, 'h0'), B(BRANDS.club, 'h1'), B(BRANDS.cleo, 'h2'), B(BRANDS.vit, 'h3')];
  const scissors = add(makeMonster(toArt(SCISSORS, SCISSORS_PAL), .0075, 'scissors', .8));

  // ── props: pin, stamps, steam, coins ──
  const mkPin = col => { const g = new THREE.Group(); const n = new THREE.Mesh(new THREE.CylinderGeometry(.0018, .0006, .05, 8), mat('#aab2c3', .3, { metalness: .6 })); n.position.y = .025; g.add(n);
    const hd = new THREE.Mesh(new THREE.SphereGeometry(.012, 20, 14), mat(col, .35)); hd.position.y = .055; g.add(hd); g.traverse(o => o.castShadow = true); scene.add(g); return g; };
  const pinC = mkPin(C.accent);
  const mkStamp = (w, d, h, col) => { const g = new THREE.Group(); const base = new THREE.Mesh(rbox(w, h, d, .004), mat(col, .45)); base.position.y = h / 2; g.add(base);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(w * .1, w * .13, h * 1.8, 16), mat('#b98a5a', .5)); neck.position.y = h * 1.9; g.add(neck);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(w * .25, 20, 14), mat('#b98a5a', .5)); knob.position.y = h * 3.3; g.add(knob); g.traverse(o => o.castShadow = true); scene.add(g); return g; };
  const stamp = mkStamp(.07, .05, .018, C.accent), bigStamp = mkStamp(.22, .07, .028, C.accent), aktaStamp = mkStamp(.09, .09, .02, C.red);
  const steam = [...Array(7)].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(.007, 10, 8), mat('#ffffff', .6, { transparent: true, opacity: .8 })); scene.add(m); return m; });
  const coins = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, .004, 28), mat('#d9b25a', .3, { metalness: .7 })); m.castShadow = true; scene.add(m); return m; });

  // ── stations and the route ──
  const P = {
    hero0: at('shelf', 150, 390, TOP), heroB: onPaper(.03, 2.6), heroC: onPaper(.04, 1.98), heroD: at('home', 120, 220, TOP), heroE: onPaper(.0, .84),
    heroF: at('product', 120, 230, TOP), heroG: onPaper(.06, -.44), heroH: at('shelfF', 590, 196, TOP), heroI: onPaper(.03, -2.58), heroJ: onPaper(.06, -3.3),
    glassB: onPaper(-.05, 2.68), modernB: onPaper(-.1, 2.5), kettle: at('home', 290, 200, TOP), tirto: at('tirto', 170, 220, TOP), glassBig: at('product', 122, 240, TOP),
    factory: at('road', 90, 180, TOP), offTruck: onPaper(.18, -1.5),
  };
  P.bekasi = (() => { const [x, y] = PC(BEKASI); return at('mapC', x, y); })();
  const roadPt = u => at('road', 120 + u * 700, 250, TOP);
  const ROUTE_LEGS = [
    { pts: [P.hero0, onPaper(.12, 2.9), P.heroB], t: T.hopB[0][0], d: .9 },
    { pts: [P.heroB, onPaper(.03, 2.3), P.heroC], t: T.hopC[0][0], d: .9 },
    { pts: [P.heroC, onPaper(.0, 1.6), P.heroD], t: T.hopD[0][0], d: .9 },
    { pts: [P.heroD, onPaper(.0, 1.0), P.heroE], t: T.hopE[0][0], d: .9 },
    { pts: [P.heroE, onPaper(.12, .3), P.heroF], t: T.hopF[0][0], d: .9 },
    { pts: [P.heroF, onPaper(.12, -.3), P.heroG], t: T.hopG[0][0], d: .9 },
    { pts: [P.offTruck, onPaper(.36, -1.9), P.heroH], t: T.toF[0], d: .7 },
    { pts: [P.heroH, onPaper(.08, -2.5), P.heroI], t: T.toH[0], d: .7 },
    { pts: [P.heroI, onPaper(.08, -3.1), P.heroJ], t: T.toG[0], d: .7 },
  ];
  const under = (x, z, pad = .012) => Object.values(CARDS).some(d => { const qq = V(x - d.c.x, 0, z - d.c.z).applyAxisAngle(YAX, -d.yaw); return Math.abs(qq.x) < d.w / 2 + pad && Math.abs(qq.z) < d.h / 2 + pad; });
  const DOTS = [];
  for (const L of ROUTE_LEGS) { const cr = new THREE.CatmullRomCurve3(L.pts.map(p => V(p.x, .0016, p.z))), n = Math.round(cr.getLength() / .022);
    for (let k = 0; k < n; k++) { const u = (k + .5) / n, p = cr.getPointAt(u); if (under(p.x, p.z)) continue; DOTS.push({ p, t: L.t + u * L.d }); } }
  const routeMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(.0062, .0062, .0026, 16), new THREE.MeshStandardMaterial({ roughness: .45, color: C.accent }), DOTS.length); routeMesh.castShadow = true; scene.add(routeMesh);

  // impact rings
  const RINGS = [[T.ding, CARDS.phoneA.c], [T.pinC, P.bekasi], [T.stampA, at('akta', 262, 352, 0)], [T.big, at('shelfF', 420, 50, 0)], ...T.stamps.map((t, i) => [t, at('shelfF', 22 + i * 156 + 73, 250, 0)]), [T.logo, CARDS.logo.c]].map(([t, p]) => {
    const m = new THREE.Mesh(new THREE.RingGeometry(.97, 1, 96), new THREE.MeshBasicMaterial({ color: C.accent, transparent: true, depthWrite: false, fog: false })); m.rotation.x = -Math.PI / 2; m.position.set(p.x, .0008, p.z); m.renderOrder = 2; scene.add(m); return { m, t }; });

  // pills (camera-facing, no shadow)
  const P_ = (s, o) => { const m = pill(world, s, { h: .034, size: 44, font: K.SANS, wt: 800, ...o }); m.castShadow = false; m.renderOrder = 3; m.label = s; return m; };
  const pills = [
    { m: P_('MEREK LAIN', { bg: C.red }), t0: T.lain, t1: T.reply - .3, p: () => at('shelf', 160, 40, .1) },
    { m: P_('AQUA?', { bg: C.ink }), t0: T.aquaQ, t1: T.hopB[0][0] - .05, p: () => hero.root.position.clone().add(V(0, .13, 0)) },
    { m: P_('SATU NAMA UNTUK BERBAGAI MEREK!', { bg: C.accent, h: .03 }), t0: T.satu, t1: T.hopB[0][0] + .3, p: () => at('shelf', 160, 120, .2) },
    { m: P_('50+ TAHUN'), t0: T.y50, t1: T.hopC[0][0], p: () => P.glassB.clone().add(V(-.02, .03, .1)) },
    { m: P_('1973'), t0: T.y1973, t1: T.hopD[0][0] - .2, p: () => P.bekasi.clone().add(V(.07, .1, 0)) },
    { m: P_('BELUM UMUM', { bg: C.red }), t0: T.belum, t1: T.hopD[0][0] + .2, p: () => at('mapC', 240, 120, .12) },
    { m: P_('PRAKTIS', { bg: C.green }), t0: T.praktis, t1: T.hopF[0][0], p: () => at('tirto', 170, 60, .2) },
    { m: P_('HIGIENIS', { bg: C.green }), t0: T.higienis, t1: T.hopF[0][0], p: () => at('tirto', 170, 60, .155) },
    { m: P_('1974'), t0: T.y1974, t1: T.glassBig, p: () => at('product', 250, 60, .1) },
    { m: P_('950 ML'), t0: T.ml, t1: T.beliAir - .15, p: () => P.glassBig.clone().add(V(.07, .2, 0)) },
    { m: P_('TIDAK MUDAH', { bg: C.red }), t0: T.susah, t1: T.hopG[0][0], p: () => at('product', 250, 40, .14) },
    { m: P_('BELI AIR PUTIH?', { bg: C.ink }), t0: T.beliAir, t1: T.hopG[0][0], p: () => P.glassBig.clone().add(V(.04, .03, .11)) },
    { m: P_('DIPERCAYA', { bg: C.green }), t0: T.percaya, t1: T.stops[0] - .2, p: () => truck.root.position.clone().add(V(0, .225, 0)) },
  ];

  // ── text meant to be read: [id, text, t0, t1, corners()] ──
  const uv = (n, u0, v0, u1, v1, y) => () => [at(n, u0, v0, y), at(n, u1, v0, y), at(n, u0, v1, y), at(n, u1, v1, y)];
  const pillBox = m => () => { m.updateMatrixWorld(); const hw = m.w / 2, hh = m.geometry.parameters.height / 2; return [[-hw, -hh], [hw, -hh], [-hw, hh], [hw, hh]].map(([x, y]) => V(x, y, 0).applyMatrix4(m.matrixWorld)); };
  const tentBox = (f, w, h) => () => { f.updateMatrixWorld(); return [[-.5, -.5], [.5, -.5], [-.5, .5], [.5, .5]].map(([x, y]) => V(x * w, y * h, .0007).applyMatrix4(f.matrixWorld)); };
  ctx.read = [
    ['title', 'KENAPA SEMUA AIR MINERAL DISEBUT AQUA?', 0, 4.0, tentBox(tent.f, tent.w, tent.h)],
    ['beli', 'BELI AQUA!', T.type[0], T.reply, uv('phoneA', 24, 222, 276, 306)],
    ['reply', 'Adanya Cleo, Bu / Iya, Aqua-nya taruh meja', T.ibu + .2, T.hopB[0][0], uv('phoneA', 24, 322, 276, 416)],
    ['sign', 'AQUA', T.sign + .2, T.hopC[0][0], uv('phoneB', 24, 164, 276, 292)],
    ['rowX', 'Nama semua air mineral?', T.rowX, T.hopC[0][0], uv('phoneB', 24, 318, 276, 364)],
    ['rowM', 'Merek air minum kemasan', T.rowMerek, T.hopC[0][0], uv('phoneB', 24, 372, 276, 418)],
    ['bekasi', 'BEKASI Jawa Barat', T.pinC + .1, T.hopD[0][0], () => { const [x, y] = PC(BEKASI); return [at('mapC', x + 14, y + 12), at('mapC', x + 130, y + 12), at('mapC', x + 14, y + 58), at('mapC', x + 130, y + 58)]; }],
    ['cal73', '1973', T.y1973 + .2, T.hopD[0][0], uv('cal', 20, 90, 200, 190)],
    ['rebus', 'MEREBUS AIR', T.rumah + .2, T.hopE[0][0], uv('home', 195, 290, 385, 326)],
    ['tirto', 'TIRTO UTOMO pendiri Aqua', T.tirtoName + .2, T.hopF[0][0], uv('tirto', 60, 290, 280, 334)],
    ['date', '23 FEBRUARI 1973', T.date[1] + .2, T.hopF[0][0], uv('akta', 30, 82, 310, 110)],
    ['pt', 'PT GOLDEN MISSISSIPPI', T.pt + .2, T.hopF[0][0], uv('akta', 30, 216, 310, 298)],
    ['prod', 'Botol kaca · 950 ml · ± Rp75 / botol', T.coins[0] + .3, T.hopG[0][0], uv('product', 238, 112, 478, 290)],
    ['rp', 'Rp75', T.coins[0] + .2, T.hopG[0][0], uv('price', 40, 60, 200, 136)],
    ['banner2', 'DARI PRODUK BARU, JADI MEREK YANG DIKENAL LUAS', T.banner2 + .2, T.toF[0], uv('banner2', 20, 20, 390, 165)],
    ['bigAQUA', 'AQUA', T.big + .1, T.toH[0], uv('shelfF', 310, 20, 530, 80)],
    ['term', 'genericized trademark', T.term[1] + .2, T.toG[0], uv('kamus', 24, 100, 420, 170)],
    ['def', 'Nama merek yang jadi sebutan umum.', T.def + .2, T.toG[0], uv('kamus', 24, 182, 420, 248)],
    ['banner3', 'KETIKA NAMA MEREK JADI NAMA UMUM!', T.banner3 + .2, T.finale + 2, uv('banner3', 20, 20, 390, 165)],
    ['q', 'KALAU DI DAERAHMU, AIR MINERAL DISEBUT APA?', T.question + .2, DUR, uv('phoneG', 22, 116, 278, 236)],
    ['logo', 'FOLLOW @GUNTINGFAKTA', T.logo + .3, DUR + 1, uv('logo', 40, 220, 400, 280)],
  ];
  for (const p of pills) ctx.read.push(['pill-' + p.m.label, p.m.label, p.t0 + .2, p.t1 - .3, pillBox(p.m)]);

  // ── hero hops: station to station on the dotted route ──
  const leg = (a, mid, b, [h0, h1], hh = .08) => [{ t0: h0[0], t1: h0[1], from: a, to: mid, h: hh }, { t0: h1[0], t1: h1[1], from: mid, to: b, h: hh + .02 }];
  const heroHops = [
    ...leg(P.hero0, onPaper(.12, 2.9), P.heroB, T.hopB), ...leg(P.heroB, onPaper(.03, 2.3), P.heroC, T.hopC), ...leg(P.heroC, onPaper(.0, 1.6), P.heroD, T.hopD),
    ...leg(P.heroD, onPaper(.0, 1.0), P.heroE, T.hopE), ...leg(P.heroE, onPaper(.12, .3), P.heroF, T.hopF), ...leg(P.heroF, onPaper(.12, -.3), P.heroG, T.hopG),
  ];
  const cargo = () => truck.root.position.clone().add(V(-.03, .068, 0));   // the hero rides on the truck's box

  // ── sound events ──
  const E = (t, type, o = {}) => ev.push({ t, type, ...o });
  'BELI AQUA!'.split('').forEach((ch, i) => ch !== ' ' && E(T.type[0] + i * .1, 'key', { k: i }));
  E(T.ding, 'ding'); E(T.hero, 'pop', { k: 0, big: 1 }); T.bottles.forEach((t, i) => E(t, 'pop', { k: i + 1 })); E(T.lain, 'badge', { k: 1 }); E(T.reply, 'send'); E(T.ibu, 'ding'); E(T.aquaQ, 'badge', { k: 2 }); E(T.satu, 'badge', { k: 0 });
  heroHops.forEach(h => { E(h.t0, 'hop'); E(h.t1, 'land', { v: .5 }); });
  [0, 1, 2, 3].forEach(i => E(T.search[0] + i * .125, 'key', { k: i })); E(T.sign, 'pop', { k: 2, big: 1 });
  [T.rowX, T.rowMerek, T.rowIndo, T.rowLatin].forEach((t, i) => E(t, i ? 'tick' : 'nope')); E(T.glass, 'pop', { k: 4, big: 1 }); E(T.modern, 'pop', { k: 5 }); E(T.y50, 'badge', { k: 1 });
  E(T.pinC - .25, 'drop'); E(T.pinC, 'pin'); E(T.y1973 - .15, 'unpop'); E(T.y1973, 'badge', { k: 2 }); E(T.belum, 'nope');
  E(T.kettle, 'pop', { k: 1, big: 1 }); E(T.kettle + .4, 'kettle', { d: 5.5 }); E(T.bulb, 'pop', { k: 3, big: 1 }); E(T.bulb + .05, 'ding'); E(T.mini, 'pop', { k: 5 });
  E(T.tirto, 'pop', { k: 0, big: 1 }); [...'23 FEBRUARI 1973'].forEach((ch, i) => ch !== ' ' && E(T.date[0] + i * (T.date[1] - T.date[0]) / 16, 'key', { k: i })); E(T.pt, 'print');
  E(T.stampA - .3, 'drop'); E(T.stampA, 'slam', { k: 1 }); E(T.praktis, 'badge', { k: 0 }); E(T.higienis, 'badge', { k: 2 });
  E(T.y1974, 'badge', { k: 1 }); E(T.glassBig, 'pop', { k: 2, big: 1 }); E(T.kaca, 'tick'); E(T.ml, 'tick'); T.coins.forEach((t, i) => E(t, 'coin', { k: i })); E(T.coins[0] + .3, 'tick');
  E(T.susah, 'nope'); E(T.beliAir, 'badge', { k: 0 });
  T.pack.forEach((t, i) => E(t, 'pop', { k: i + 1 })); E(T.truck, 'pop', { k: 0, big: 1 }); E(T.board[0], 'hop'); E(T.board[1], 'land', { v: .4 }); E(T.drive[0], 'engine', { d: T.drive[1] - T.drive[0] });
  E(T.percaya, 'badge', { k: 2 }); T.stops.forEach((t, i) => E(t, 'tent', { k: i })); E(T.offTruck[0], 'hop'); E(T.offTruck[1], 'land', { v: .5 }); E(T.banner2, 'print');
  E(T.toF[0], 'jump'); E(T.toF[1], 'land', { v: .6 }); E(T.big - .3, 'drop'); E(T.big, 'slam', { big: 1 }); T.stamps.forEach((t, i) => { E(t - .2, 'drop'); E(t, 'slam', { k: i }); });
  E(T.toH[0], 'jump'); E(T.toH[1], 'land', { v: .6 }); [...'genericized trademark'].forEach((ch, i) => ch !== ' ' && i % 2 === 0 && E(T.term[0] + i * (T.term[1] - T.term[0]) / 21, 'key', { k: i }));
  E(T.def, 'tick'); T.chips.forEach((t, i) => E(t, 'tent', { k: i })); E(T.banner3, 'print');
  E(T.toG[0], 'jump'); E(T.toG[1], 'land', { v: .6 }); E(T.question, 'badge', { k: 0 }); T.comments.forEach((t, i) => E(t, 'comment', { k: i }));
  [...Array(8)].forEach((_, k) => E(T.finale + .3 + k * .1, 'land', { v: .25 })); E(T.cut - .4, 'snip'); E(T.cut, 'cut'); E(T.logo - .3, 'drop'); E(T.logo, 'titleLand');

  // ── camera subjects ──
  const mid = (m, k = .5) => () => m.root.position.clone().add(V(0, m.height * k, 0));
  Object.assign(ctx.subj, {
    A: () => at('phoneA', 150, 290, .02), shelf: () => CARDS.shelf.c.clone().add(V(-.04, .03, 0)), AS: () => at('phoneA', 240, 300, .02).lerp(CARDS.shelf.c.clone().setY(.03), .55),
    B: () => at('phoneB', 150, 300, .02), Btop: () => at('phoneB', 150, 260, .02).add(V(-.06, 0, 0)), Bb: () => P.glassB.clone().add(V(.06, .05, 0)),
    C: () => at('mapC', 240, 190, .02).lerp(CARDS.cal.c.clone().setY(.02), .3), Cpin: () => P.bekasi.clone().add(V(.02, .03, 0)),
    D: () => at('home', 220, 190, .04), E: () => onPaper(0, .58).add(V(0, .04, 0)), Akta: () => at('akta', 170, 220, .02), Tirto: () => at('tirto', 170, 200, .04),
    F: () => at('product', 250, 170, .04), Fb: () => P.glassBig.clone().add(V(.06, .08, 0)),
    G: () => at('pack', 230, 160, .04), truck: () => truck.root.position.clone().add(V(0, .04, 0)), road: () => at('road', 460, 220, .03), ban2: () => at('banner2', 200, 90, .02),
    H: () => at('shelfF', 330, 170, .03), I: () => at('kamus', 160, 190, .02), ban3: () => at('banner3', 200, 90, .02), Gphone: () => at('phoneG', 150, 250, .02),
    hero: mid(hero, .5), final: () => V(0, 0, MATZ), logoC: () => CARDS.logo.c.clone().add(V(0, .02, .01)),
  });

  // ── per frame ──
  const m4 = new THREE.Matrix4(), qq = new THREE.Quaternion();
  const popAt = (m, t, t0, base, o = {}) => { const p = pop(t, t0, o.dur || .4, o.jump ?? .045); const pos = base.clone(); pos.y += p.y; m.set({ pos, vis: t >= t0 && (o.until === undefined || t < o.until), e: p.e, hinge: p.hinge, sq: p.sq * (o.sq || 1), yaw: o.yaw || 0, scale: o.scale || 1 }); return p; };
  const blinkers = [hero, ...shelfB, glassB, modernB, kettle, bulb, mini, tirto, glassBig, ...packs, ...shelfH];
  const TK = [[T.drive[0], 0], [T.stops[0], .63], [T.stops[1], .81], [T.stops[2], .99], [T.drive[1], 1.03]];   // the truck reaches each stop as its name is said
  const truckU = t => { if (t <= TK[0][0]) return 0; for (let i = 1; i < TK.length; i++) if (t <= TK[i][0]) { const [a, ua] = TK[i - 1], [b, ub] = TK[i]; const u = seg(t, a, b); return lerp(ua, ub, i === 1 ? ei(u) * .3 + u * .7 : u); } return TK[TK.length - 1][1]; };
  const truckPos = t => roadPt(truckU(t));
  return t => {
    // ---- cards ----
    re('phoneA', drawA, { n: Math.max(0, Math.min(10, Math.floor((t - T.type[0]) / .1) + 1)), reply: t >= T.reply ? 1 : 0, ibu: t >= T.ibu ? 1 : 0 });
    re('shelf', drawShelf, { n: T.bottles.filter(b => t >= b).length });
    re('phoneB', drawB, { q: Math.max(0, Math.min(4, Math.floor((t - T.search[0]) / .125) + 1)), caret: t < T.sign ? 1 : 0, sign: t >= T.sign ? 1 : 0, r1: t >= T.rowX, r2: t >= T.rowMerek, r3: t >= T.rowIndo, r4: t >= T.rowLatin });
    re('mapC', drawC, { bekasi: t >= T.pinC + .05 });
    re('cal', drawCal, { y: t >= T.y1973 ? '1973' : '1972' });
    re('home', drawHome, { rebus: t >= T.rumah ? 1 : 0 });
    re('tirto', drawTirto, { name: t >= T.tirtoName ? 1 : 0 });
    re('akta', drawAkta, { d: Math.max(0, Math.min(16, Math.floor((t - T.date[0]) / ((T.date[1] - T.date[0]) / 16)) + 1)), pt: t >= T.pt ? 1 : 0, stamp: t >= T.stampA ? 1 : 0 });
    re('product', drawProduct, { r1: t >= T.kaca, r2: t >= T.ml, r3: t >= T.coins[0] + .3 });
    re('price', drawPrice, { on: t >= T.coins[0] ? 1 : 0 });
    re('pack', drawPack, { n: T.pack.filter(p => t >= p).length });
    re('road', drawRoad, { n: T.stops.filter(s => t >= s).length });
    re('banner2', drawBanner2, { on: t >= T.banner2 ? 1 : 0 });
    re('shelfF', drawF, { big: t >= T.big ? 1 : 0, s: T.stamps.map(s => t >= s ? 1 : 0) });
    re('kamus', drawKamus, { n: Math.max(0, Math.min(21, Math.floor((t - T.term[0]) / ((T.term[1] - T.term[0]) / 21)) + 1)), def: t >= T.def ? 1 : 0, c: T.chips.filter(c => t >= c).length });
    re('banner3', drawBanner3, { on: t >= T.banner3 ? 1 : 0 });
    re('phoneG', drawG, { q: t >= T.question ? 1 : 0, n: T.comments.filter(c => t >= c).length });

    // ---- the hero: shelf → B → map → home → Tirto → product → pack → truck → shelf → dictionary → comments ----
    {
      const P0 = pop(t, T.hero, .4, .05);
      let h = hops(t, heroHops, P.hero0), pos = h.pos.clone(), air = h.air, dir = h.dir;
      const lands = [...h.lands], offs = [...h.takeoffs];
      const jump = (u0, a, b, hh) => { const u = seg(t, ...u0); pos = a.clone().lerp(b, eio(u)); pos.y += hh * arc(u); air = u < 1 ? u : null; dir = b.clone().sub(a); lands.push(u0[1]); offs.push(u0[0]); };
      if (t >= T.board[0]) jump(T.board, P.heroG, cargo(), .12);
      if (t >= T.board[1] && t < T.offTruck[0]) { pos = cargo(); air = null; dir = null; }
      if (t >= T.offTruck[0]) jump(T.offTruck, (() => { return truckPos(T.offTruck[0]).add(V(-.03, .068, 0)); })(), P.offTruck, .1);
      if (t >= T.toF[0]) jump(T.toF, P.offTruck, P.heroH, .22);
      if (t >= T.toH[0]) jump(T.toH, P.heroH, P.heroI, .22);
      if (t >= T.toG[0]) jump(T.toG, P.heroI, P.heroJ, .22);
      const stampSq = (() => { const d = t - T.big; return d > -.02 && d < .35 ? 1 - .3 * Math.sin(Math.PI * clamp(d / .35)) : 1; })();
      const rest = air === null && !(t >= T.board[1] && t < T.offTruck[0]);
      const idle = rest && t > T.hero + .6 ? beatBounce(t, T.hero + .6, DUR, .008, .15) : { y: 0, sq: 1 };
      pos.y += P0.y + idle.y;
      hero.set({ pos, e: P0.e, hinge: P0.hinge, sq: squash(t, lands, offs, air) * P0.sq * idle.sq * stampSq, yaw: dir && air !== null ? clamp(Math.atan2(dir.x, dir.z) * .3, -.4, .4) : .1, scale: t > T.finale ? 1 + .3 * ss(seg(t, T.finale, T.finale + .8)) : 1 });
    }
    // A: warung shelf bottles
    shelfB.forEach((m, i) => popAt(m, t, T.bottles[i], at('shelf', 62 + i * 98, 196, TOP), { sq: beatBounce(t, T.bottles[i] + .6, DUR, .006, .2 * i).sq, yaw: -.1 }));
    // B: glass then plastic, half a century
    popAt(glassB, t, T.glass, P.glassB, { yaw: .2, sq: beatBounce(t, T.glass + .6, DUR, .005, .1).sq });
    popAt(modernB, t, T.modern, P.modernB, { yaw: .3, sq: beatBounce(t, T.modern + .6, DUR, .005, .3).sq });
    // C: pin on Bekasi
    { const d = ei(seg(t, T.pinC - .25, T.pinC)); pinC.visible = t >= T.pinC - .25; pinC.position.copy(P.bekasi).add(V(0, .3 * (1 - d), 0)); }
    // D: kettle on the stove, steam; the idea bulb; a small bottle
    { popAt(kettle, t, T.kettle, P.kettle, { yaw: -.2, jump: .03, sq: t > T.kettle + 1 && t < T.kettle + 6 ? 1 + .04 * Math.sin(t * 18) : 1 });
      steam.forEach((m, k) => { const ph = ((t - T.kettle) * .7 + k / 7) % 1; m.visible = t > T.kettle + .6 && t < T.hopE[0][0] + 1; m.position.copy(P.kettle).add(V(.06 + .012 * Math.sin(k * 2 + t * 3), .12 + ph * .09, 0)); m.scale.setScalar(Math.max(.001, (.5 + ph) * (1 - ph) * 2)); }); }
    { const p = popAt(bulb, t, T.bulb, hero.root.position.clone().add(V(.02, .115, 0)), { jump: .03, until: T.hopE[0][0] }); ctx.fx.flash = t > T.bulb && t < T.bulb + .35 ? .06 * (1 - seg(t, T.bulb, T.bulb + .35)) : 0; }
    popAt(mini, t, T.mini, P.heroD.clone().add(V(.08, 0, .02)), { until: T.hopE[0][0] + .6 });
    // E: Tirto Utomo; the deed's stamp
    { popAt(tirto, t, T.tirto, P.tirto, { yaw: .2, jump: .05 }); const b = beatBounce(t, T.tirto + .6, DUR, .005, .1); tirto.root.position.y += b.y; }
    { const d = ei(seg(t, T.stampA - .3, T.stampA)), up = eo(seg(t, T.stampA + .25, T.stampA + .7));
      aktaStamp.visible = t > T.stampA - .7 && t < T.stampA + .8; aktaStamp.position.copy(at('akta', 262, 352, TOP)).add(V(0, .3 * (1 - d) + .3 * up, 0)); }
    // F: the first product, coins
    { popAt(glassBig, t, T.glassBig, P.glassBig, { yaw: .15, jump: .05 }); const b = beatBounce(t, T.glassBig + .6, DUR, .004, .2); glassBig.root.position.y += b.y; }
    coins.forEach((m, k) => { const t0 = T.coins[k], d = ei(seg(t, t0 - .25, t0)); m.visible = t > t0 - .25; m.position.copy(at('price', 34 + k * 0, 80, TOP)).add(V(-.02 - k * .03, .004 + k * .0042 * 0 + .2 * (1 - d), .05 + k * .012)); m.rotation.set(0, k, (1 - d) * 2); });
    // G: packaging, the factory, the truck
    packs.forEach((m, i) => popAt(m, t, T.pack[i], at('pack', 85 + i * 146, 168, TOP), { yaw: .1, sq: beatBounce(t, T.pack[i] + .6, DUR, .004, .1 * i).sq }));
    popAt(factory, t, T.truck - .3, P.factory, { yaw: 0, jump: .02 });
    { const p0 = pop(t, T.truck, .4, .03); const pos = truckPos(t); pos.y += p0.y; const driving = t > T.drive[0] && t < T.drive[1];
      truck.set({ pos, vis: t >= T.truck, e: p0.e, hinge: p0.hinge, sq: p0.sq * (driving ? 1 + .012 * Math.sin(t * 40) : 1), yaw: -.08 }); }
    // H: today's shelf (stamped one by one)
    { const sqk = k => { const d = t - T.stamps[k]; return d > -.02 && d < .35 ? 1 - .4 * Math.sin(Math.PI * clamp(d / .35)) : 1; };
      shelfH.forEach((m, i) => popAt(m, t, T.toF[0] + .3 + i * .15, at('shelfF', 22 + i * 156 + 73, 170, TOP), { sq: sqk(i), yaw: -.1 })); }
    { const d = ei(seg(t, T.big - .3, T.big)), up = eo(seg(t, T.big + .3, T.big + .8));
      bigStamp.visible = t > T.big - .8 && t < T.big + 1.0; bigStamp.position.copy(at('shelfF', 420, 50, TOP)).add(V(0, .45 * (1 - d) + .45 * up, 0)); bigStamp.rotation.y = -.05; }
    { let p = null; T.stamps.forEach((ts, i) => { if (t > ts - .45 && t < ts + .4) { const d = ei(seg(t, ts - .2, ts)), up = eo(seg(t, ts + .08, ts + .4)); p = at('shelfF', 22 + i * 156 + 73, 250, TOP).add(V(0, .25 * (1 - d) + .25 * up, 0)); } });
      stamp.visible = !!p; if (p) stamp.position.copy(p); }
    tent.g.visible = true;
    // pills
    for (const p of pills) { const s = back(seg(t, p.t0, p.t0 + .25), 2.2) * (1 - ss(seg(t, p.t1 - .25, p.t1))); p.m.visible = t >= p.t0 && t < p.t1; p.m.scale.setScalar(Math.max(.001, s)); p.m.position.copy(p.p()); p.m.face(ctx.camera); }
    // route dots
    DOTS.forEach((d, k) => { const s = back(seg(t, d.t, d.t + .15), 2); m4.compose(d.p, qq.identity(), V(1, 1, 1).multiplyScalar(Math.max(1e-4, s))); routeMesh.setMatrixAt(k, m4); });
    routeMesh.instanceMatrix.needsUpdate = true;
    // rings
    for (const { m, t: t0 } of RINGS) { const d = t - t0; m.visible = d > 0 && d < 1; if (m.visible) { m.scale.setScalar(.03 + d * .22); m.material.opacity = (1 - d) * .9; } }
    // scissors cut the FAKTA strip; the logo card drops into the open desk
    { const u = seg(t, T.cut - .6, T.cut), sp = ss(seg(t, T.cut, T.cut + .5));
      stripHalves.forEach((g, k) => { g.position.copy(stripAt(k, .03 * sp)); g.rotation.y = CARDS.strip.yaw + (k ? 1 : -1) * .12 * sp; });
      const sc = at('strip', 180, -30 + 160 * u, .03); scissors.set({ pos: sc, vis: t > T.cut - .8 && t < T.cut + .9, e: 1, hinge: 1, yaw: Math.PI / 2, tiltX: 0, spinZ: .25 * Math.sin(t * 30) * (u > 0 && u < 1 ? 1 : 0), scale: 1 - ss(seg(t, T.cut + .5, T.cut + .9)) }); }
    { const d = ei(seg(t, T.logo - .45, T.logo)), bnc = t > T.logo && t < T.logo + .5 ? .02 * Math.sin(Math.PI * seg(t, T.logo, T.logo + .5)) * (1 - seg(t, T.logo, T.logo + .5)) : 0;
      cd.logo.visible = t > T.logo - .5; cd.logo.position.copy(CARDS.logo.c).add(V(0, .7 * (1 - d) + bnc, 0)); cd.logo.rotation.z = (1 - d) * .15; }
    // curtain call: every station hops once, front to back
    { const st = [[cd.phoneA, cd.shelf], [cd.phoneB], [cd.mapC, cd.cal], [cd.home], [cd.tirto, cd.akta], [cd.product, cd.price], [cd.pack, cd.road], [cd.banner2, cd.shelfF], [cd.kamus, cd.banner3, cd.phoneG]];
      st.forEach((gs, k) => { const d = t - (T.finale + .3 + k * .1); const y = d > 0 && d < .4 ? .025 * arc(d / .4) : 0; gs.forEach(g => g.position.y = y); }); }
    // phone A jolts on the ding
    { const d = t - T.ding; cd.phoneA.position.x = CARDS.phoneA.c.x + (d > 0 && d < .3 ? .003 * Math.sin(d * 60) * (1 - d / .3) : 0); }
    blinkers.forEach((m, i) => m.blink(((t + i * .37) % (2.1 + i * .07)) < .12));
  };
}
