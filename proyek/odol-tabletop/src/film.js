// Kenapa Pasta Gigi Disebut "Odol"? — Gunting Fakta, Episode 01. Tabletop App Flythrough, 1080×1920.
// One take up a long desk: a chat that says "BELI ODOL!", a search card, a map of Europe (Dresden, 1892), Lingner's lab,
// a sailing ship to a map of Java (Batavia, 1894), a newspaper ad, today's shelf where a stamp names every tube "ODOL",
// and the close: Aqua / Sanyo / Honda, the question to the viewer, scissors cut FAKTA, the Gunting Fakta card drops.
// The hero is a pixel toothpaste tube that hops the whole route. Every action is cued to the voice (vo.js).
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
const q16 = t => Math.round(t * 8) / 8;     // snap to the 16th grid (120 BPM)

// ── timeline (film seconds, cued to words of the voice-over) ──
export const T = {
  type: [.5, 1.5], ding: 1.75, kid: 1.0, tubes: [3.5, 4.375, 5.5], odolQ: 8.75, reply: 6.75,
  hopB: [[9.625, 9.95], [10.05, 10.5]], search: [10.5, 11.25], sign: 11.5, rowX: 12.75, rowMerek: 15.0, bottle: 15.5, rowJerman: 16.375, rowAbad: 18.25,
  hopC: [[19.5, 19.875], [19.95, 20.5]], pinC: 21.125, tower: 21.625, y1892: 23.375, lingner: 25.625, labSign: 26.75, bottleHop: [28.75, 29.25],
  kumur: 34.125, notPaste: 35.375, seifert: 38.625, flask: 39.0, crates: [40.125, 40.375, 40.625], lingnerNod: 41.5,
  ship: 43.25, boardHero: [43.75, 44.25], boardBottle: [44.375, 44.875], sail: [46.25, 49.75], pinE: 49.875, offShip: [50.0, 50.5],
  bottleAd: [50.25, 50.75], y1894: 49.375, hindia: 52.5, tube1903: 55.625, y1903: 57.75,
  toF: [[59.5, 60.0]], tube03F: [59.75, 60.25], stamp0: 61.0, modern: [65.125, 65.5], gone: 67.0, stamps: [68.5, 69.0, 69.75],
  toG: [71.375, 72.125], banner: 72.75, kidG: 73.25, aqua: 79.875, sanyo: 80.625, honda: 81.75, question: 83.75, comments: [84.5, 85.125, 85.75],
  finale: 86.0, cut: 88.25, logo: 89.0,
};

// ── the desk (1 unit = 1000 canvas px; +z toward the camera at az 0) ──
export const MAT = [1.44, 4.92];
const MATZ = -.96;   // the mat's centre
export const CARDS = {
  phoneA: { c: V(-.27, 0, 1.12), w: .30, h: .56, yaw: .05, thick: PH },
  shelf: { c: V(.18, 0, 1.2), w: .30, h: .24, yaw: -.04 },
  phoneB: { c: V(.25, 0, .44), w: .30, h: .56, yaw: -.05, thick: PH },
  mapC: { c: V(-.25, 0, -.18), w: .46, h: .40, yaw: .04 },
  lab: { c: V(.27, 0, -.5), w: .40, h: .34, yaw: -.04 },
  mapE: { c: V(-.22, 0, -1.1), w: .48, h: .32, yaw: .03 },
  news: { c: V(.27, 0, -1.14), w: .32, h: .40, yaw: -.05 },
  shelfF: { c: V(.0, 0, -1.72), w: .62, h: .30, yaw: 0 },
  phoneG: { c: V(-.27, 0, -2.62), w: .30, h: .56, yaw: .05, thick: PH },
  banner: { c: V(.25, 0, -2.62), w: .40, h: .18, yaw: -.03 },
  strip: { c: V(-.2, 0, -3.06), w: .36, h: .1, yaw: .02 },
  logo: { c: V(.22, 0, -3.1), w: .44, h: .3, yaw: -.03, thick: .007 },
};
export const at = (n, u, v, y) => { const d = CARDS[n]; return V(u / 1000 - d.w / 2, y ?? (d.thick || TOP), v / 1000 - d.h / 2).applyAxisAngle(YAX, d.yaw).add(d.c); };
const onPaper = (x, z) => V(x, 0, z);

// ── pixel art (one cell per pixel; pure black = eyes) ──
const toArt = (rows, pal) => { const cells = []; rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== '.') cells.push([i, j, pal[ch]]); })); return { w: rows[0].length, h: rows.length, cells }; };
const TUBE = ['..GGGGGG..', '..GGGGGG..', '.WWWWWWWW.', '.WWWWWWWW.', '.WWKWWKWW.', '.WWKWWKWW.', '.WWWWWWWW.', '.MMMMMMMM.', '.MMMMMMMM.', '.WWWWWWWW.', '.WWWWWWWW.', '.MMMMMMMM.', '.WWWWWWWW.', '..WWWWWW..', '...WWWW...', '...CCCC...', '...CCCC...', '...CCCC...'];
const tubePal = (band, body = '#fbfbf8', cap = '#3d4456') => ({ G: '#c9ccd3', W: body, K: '#0d0d0d', M: band, C: cap });
const BOTTLE = ['.......SSS', '....GGGSSS', '....GG....', '....GG....', '...GGGG...', '..CCCCCCCC', '..CCCCCCCC', '..CCKCCKCC', '..CCKCCKCC', '..CCCCCCCC', '..BBBBBBBB', '..BCCBBCCB', '..BBBBBBBB', '..CCCCCCCC', '..CCCCCCCC', '..CCCCCCCC', '..CCCCCCCC'];
const BOTTLE_PAL = { S: '#c3c7cf', G: '#cfe3e8', C: '#f4ecd6', K: '#0d0d0d', B: '#2c5fb8' };
const LINGNER = ['....SSSSSS....', '...SSSSSSSS...', '..HSSSSSSSSH..', '..HSKSSSSKSH..', '..SSSSSSSSSS..', '..SBBBBBBBBS..', '..BBBSSSSBBB..', '..BBBBBBBBBB..', '...BBBBBBBB...', '....BBBBBB....', '..DDDWWWWDDD..', '.DDDDWNNWDDDD.', 'DDDDDWNNWDDDDD', 'DDDDDDNNDDDDDD', 'DDDDDDNNDDDDDD', 'DDDDDDDDDDDDDD', 'DDDDDDDDDDDDDD', '.DDDDDDDDDDDD.', '.DDDDD..DDDDD.', '.DDDDD..DDDDD.', '.ZZZZ....ZZZZ.'];
const LINGNER_PAL = { S: '#f0c6a2', H: '#8d9099', K: '#0d0d0d', B: '#7c6a58', D: '#2b3142', W: '#f7f7f4', N: '#5a2f38', Z: '#3a3a3e' };
const SEIFERT = ['....HHHHHH....', '...HHHHHHHH...', '..HSSSSSSSSH..', '..SGGGSSGGGS..', '..SGKGSSGKGS..', '..SSSSSSSSSS..', '..SSSRRRRSSS..', '...SSSSSSSS...', '....SSSSSS....', '..WWWLLLLWWW..', '.WWWWLLLLWWWW.', 'WWWWWLLLLWWWWW', 'WWWWWWLLWWWWWW', 'WWWWWWWWWWWWWW', 'WWWWWWWWWWWWWW', 'WWWWWWWWWWWWWW', '.WWWWWWWWWWWW.', '.PPPPP..PPPPP.', '.PPPPP..PPPPP.', '.ZZZZ....ZZZZ.'];
const SEIFERT_PAL = { H: '#6b4a34', S: '#f0c6a2', G: '#5d6472', K: '#0d0d0d', R: '#c97a6a', W: '#f4f4ef', L: '#a9c8e8', P: '#4b5568', Z: '#3a3a3e' };
const KID = ['...HHHHHH...', '..HHHHHHHH..', '.HHSSSSSSHH.', '.HSKSSSSKSH.', '.HSSSSSSSSH.', '..SSSRRSSS..', '...SSSSSS...', '..YYYYYYYY..', '.YYYYYYYYYY.', 'SYYYYYYYYYYS', 'SYYYYYYYYYYS', '.YYYYYYYYYY.', '..PPPPPPPP..', '..PPP..PPP..', '..PPP..PPP..', '..ZZZ..ZZZ..'];
const KID_PAL = { H: '#2b2b33', S: '#e9b48e', K: '#0d0d0d', R: '#c76a5a', Y: '#f2c94c', P: '#3f6db3', Z: '#3a3a3e' };
const SHIP = ['.....A........A.....', '.....M........M.....', '....CMC......CMC....', '...CCMCC....CCMCC...', '..CCCMCCC..CCCMCCC..', '..CCCMCCC..CCCMCCC..', '.CCCCMCCCCCCCCMCCCC.', '.CCCCMCCCCCCCCMCCCC.', '.....M........M.....', 'RRRRRRRRRRRRRRRRRRRR', '.RRWRRRRRRRRRRRRRRR.', '..RRRRRRRRRRRRRRRR..', '...RRRRRRRRRRRRRR...'];
const SHIP_PAL = { A: '#2c5fb8', M: '#5a4030', C: '#f4ecd6', R: '#8a5a3c', W: '#e8d9b8' };
const TOWER = ['...DD...', '...DD...', '..DDDD..', '..DDDD..', '.DDDDDD.', '.GGGGGG.', '.GGWWGG.', '.GGWWGG.', '.GGGGGG.', '.GNGGNG.', '.GNGGNG.', '.GGGGGG.', 'GGGGGGGG', 'GNGGGGNG', 'GNGGGGNG', 'GGGGGGGG', 'GGGGGGGG', 'GGGNNGGG', 'GGGNNGGG'];
const TOWER_PAL = { D: '#6f8f86', G: '#c9c2b4', W: '#f7f3e8', N: '#5b6170' };
const SCISSORS = ['.SS.........SS..', 'S..S.......S..S.', 'S..S......S..S..', '.SS.BB...BB.SS..', '.....BBBBB......', '......BBB.......', '.....B...B......', '....B.....B.....', '...B.......B....', '..B.........B...'];
const SCISSORS_PAL = { S: '#ef8a5e', B: '#aeb4bf' };

// ── print helpers ──
const signPrint = (c, x, y, w, h, s = 1) => {   // our own Odol-style enamel plate: blue field, cream wordmark with a hard dark shadow
  c.fillStyle = C.accent; K.rr(c, x, y, w, h, 10 * s); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 3 * s; K.rr(c, x + 6 * s, y + 6 * s, w - 12 * s, h - 12 * s, 7 * s); c.stroke();
  const fs = h * .5;
  K.txt(c, 'ODOL', x + w / 2 + fs * .06, y + h * .47 + fs * .06, { size: fs, wt: 800, font: K.SANS, col: '#13284f', align: 'center', ls: fs * .06 });
  K.txt(c, 'ODOL', x + w / 2, y + h * .47, { size: fs, wt: 800, font: K.SANS, col: C.cream, align: 'center', ls: fs * .06 });
  K.txt(c, 'OBAT KUMUR · PASTA GIGI', x + w / 2, y + h * .84, { size: h * .1, wt: 500, col: C.cream, align: 'center', ls: h * .02 });
};
function statusBar(c, w) {
  K.txt(c, '07:15', 30, 30, { size: 17, wt: 500 });
  for (let i = 0; i < 4; i++) { c.fillStyle = C.ink; c.fillRect(214 + i * 7, 36 - (i + 1) * 4, 5, (i + 1) * 4); }
  c.strokeStyle = C.ink; c.lineWidth = 2; K.rr(c, 246, 24, 26, 13, 3); c.stroke(); c.fillStyle = C.ink; c.fillRect(249, 27, 18, 7);
}
function phoneFrame(c) {
  const w = 300, h = 560; c.clearRect(0, 0, w, h);
  c.fillStyle = C.ink; K.rr(c, 0, 0, w, h, 36); c.fill();
  c.fillStyle = '#f6f8fb'; K.rr(c, 11, 11, w - 22, h - 22, 27); c.fill();
  c.fillStyle = C.ink; K.rr(c, w / 2 - 36, 20, 72, 14, 7); c.fill();
  statusBar(c, w);
}
const bubble = (c, s, mine, y, o = {}) => {
  const size = o.size || 21; c.font = `800 ${size}px ${K.SANS}`; const tw = c.measureText(s).width + 30, w = Math.max(o.minW || 0, tw), hh = o.h || 44;
  const x = mine ? 300 - 24 - w : 24; c.fillStyle = o.bg || (mine ? C.accent : '#e6eaf1'); K.rr(c, x, y, w, hh, 16); c.fill();
  K.txt(c, s, x + 15, y + hh / 2 + 1, { size, wt: 800, font: K.SANS, col: o.col || (mine ? '#fff' : C.ink) });
};

// A: the chat from Mum
function drawA(c, st) {
  phoneFrame(c);
  K.txt(c, '‹', 26, 76, { size: 34, wt: 600, col: C.accent });
  c.fillStyle = C.coral; c.beginPath(); c.arc(70, 76, 17, 0, 7); c.fill(); K.txt(c, 'I', 70, 77, { size: 18, wt: 800, font: K.SANS, col: '#fff', align: 'center' });
  K.txt(c, 'Ibu', 98, 77, { size: 26, wt: 800, font: K.SANS });
  c.fillStyle = C.line; c.fillRect(20, 104, 260, 2);
  bubble(c, 'Nak, pulang sekolah', false, 126); bubble(c, 'mampir warung ya', false, 176);
  if (st.n > 0) {   // the big message, typed letter by letter
    const full = 'BELI ODOL!', s = full.slice(0, st.n);
    c.fillStyle = '#e6eaf1'; K.rr(c, 24, 234, 252, 96, 20); c.fill();
    K.txt(c, s, 40, 284, { size: 44, wt: 800, font: K.SANS, col: C.ink });
    if (st.n < full.length) { c.fillStyle = C.accent; c.fillRect(40 + c.measureText(s).width + 4, 262, 4, 44); }
  }
  if (st.reply) bubble(c, 'Siap, Bu!', true, 352);
  c.fillStyle = '#e9edf4'; K.rr(c, 22, 476, 188, 50, 25); c.fill(); K.txt(c, 'Ketik pesan', 42, 502, { size: 19, wt: 600, font: K.SANS, col: '#98a1b3' });
  c.fillStyle = C.accent; K.rr(c, 218, 476, 60, 50, 25); c.fill(); K.txt(c, '➤', 248, 502, { size: 20, wt: 800, font: K.SANS, col: '#fff', align: 'center' });
}
// A2: the shop shelf
const SHELF_NAMES = ['PEPSODENT', 'CLOSE UP', 'MEREK LAIN'];
function drawShelf(c, st) {
  K.cardBase(c, 300, 240, 'warung', 'Rak pasta gigi', { headH: 88, tagSize: 16, cnSize: 21 });
  SHELF_NAMES.forEach((n, i) => { const x = 18 + i * 92; c.fillStyle = C.faint; K.rr(c, x, 104, 84, 112, 10); c.fill();
    K.txt(c, n, x + 42, 200, { size: n.length > 8 ? 12 : 14, wt: 500, col: C.ink, align: 'center', ls: 1 }); });
}
// B: the search card
function drawB(c, st) {
  phoneFrame(c);
  K.txt(c, 'Cari', 28, 78, { size: 28, wt: 800, font: K.SANS });
  c.fillStyle = '#e9edf4'; K.rr(c, 24, 100, 252, 48, 24); c.fill();
  c.strokeStyle = C.mute; c.lineWidth = 3; c.beginPath(); c.arc(50, 122, 9, 0, 7); c.stroke(); c.beginPath(); c.moveTo(57, 129); c.lineTo(64, 136); c.stroke();
  const q = 'odol'.slice(0, st.q || 0); K.txt(c, q, 76, 125, { size: 24, wt: 800, font: K.SANS });
  if (st.q < 4 || st.caret) { c.font = `800 24px ${K.SANS}`; c.fillStyle = C.accent; c.fillRect(78 + c.measureText(q).width, 110, 3, 30); }
  if (st.sign) signPrint(c, 24, 164, 252, 128);
  const rows = [['Nama semua pasta gigi?', 'x', st.r1], ['Merek dagang', 'v', st.r2], ['Asal: Jerman', 'v', st.r3], ['Sejak akhir abad ke-19', 'v', st.r4]];
  rows.forEach(([s, k, on], i) => { if (!on) return; const y = 318 + i * 54;
    c.fillStyle = '#ffffff'; K.rr(c, 24, y, 252, 46, 12); c.fill(); c.strokeStyle = C.line; c.lineWidth = 2; K.rr(c, 24, y, 252, 46, 12); c.stroke();
    if (k === 'x') K.cross(c, 46, y + 23, 16, C.red, 5); else K.tick(c, 46, y + 23, 20, C.green, 5);
    K.txt(c, s, 70, y + 24, { size: 18, wt: 800, font: K.SANS, col: k === 'x' ? C.red : C.ink }); });
}
// C: coastline map of Europe, no borders
function project(box, x0, y0, w, h) {   // equirectangular stretched by 1/cos(mid-latitude), fitted and centred in the box
  const [a, b, cc, d] = box, k = 1 / Math.cos((b + d) / 2 * Math.PI / 180), s = Math.min(w / (cc - a), h / ((d - b) * k));
  const ox = x0 + (w - (cc - a) * s) / 2, oy = y0 + (h - (d - b) * k * s) / 2;
  return ([lo, la]) => [ox + (lo - a) * s, oy + (d - la) * k * s];
}
function coastMap(c, key, x0, y0, w, h) {
  const { box, polys } = COAST[key], P = project(box, x0, y0, w, h);
  c.save(); K.rr(c, x0, y0, w, h, 12); c.clip();
  c.fillStyle = C.sea; c.fillRect(x0, y0, w, h);
  c.strokeStyle = 'rgba(44,95,184,.10)'; c.lineWidth = 1.5; for (let g = 1; g < 8; g++) { c.beginPath(); c.moveTo(x0, y0 + g * h / 8); c.lineTo(x0 + w, y0 + g * h / 8); c.stroke(); c.beginPath(); c.moveTo(x0 + g * w / 8, y0); c.lineTo(x0 + g * w / 8, y0 + h); c.stroke(); }
  c.fillStyle = C.land; c.strokeStyle = C.ink; c.lineWidth = 1.6; c.lineJoin = 'round';
  for (const r of polys) { c.beginPath(); r.forEach((p, i) => { const [x, y] = P(p); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath(); c.fill(); c.stroke(); }
  c.restore(); c.strokeStyle = C.line; c.lineWidth = 2; K.rr(c, x0, y0, w, h, 12); c.stroke();
  return P;
}
const MAPC = { x: 18, y: 96, w: 424, h: 288 }, MAPE = { x: 18, y: 92, w: 444, h: 212 };
let PC = null, PE = null;
function drawC(c, st) {
  K.cardBase(c, 460, 400, 'peta', 'Eropa, akhir abad ke-19', { headH: 82, tagSize: 16, cnSize: 21 });
  PC = coastMap(c, 'europe', MAPC.x, MAPC.y, MAPC.w, MAPC.h);
  if (st.dresden) { const [x, y] = PC([13.74, 51.05]); K.txt(c, 'DRESDEN', x + 16, y + 26, { size: 19, wt: 500, ls: 2 }); K.txt(c, 'Jerman', x + 16, y + 48, { size: 17, wt: 800, font: K.SANS, col: C.mute }); }
}
function drawE(c, st) {
  K.cardBase(c, 480, 320, 'peta', 'Hindia Belanda', { headH: 78, tagSize: 16, cnSize: 21, tagCol: st.hindia ? C.accent : C.mute });
  PE = coastMap(c, 'java', MAPE.x, MAPE.y, MAPE.w, MAPE.h);
  if (st.batavia) { const [x, y] = PE([106.82, -6.13]); K.txt(c, 'BATAVIA', x + 14, y - 22, { size: 19, wt: 500, ls: 2 }); }
}
// D: Lingner's lab
function drawLab(c, st) {
  K.cardBase(c, 400, 340, 'lab', 'Dresden · 1892', { headH: 82, tagSize: 16, cnSize: 21 });
  c.fillStyle = C.faint; for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2) c.fillRect(20 + i * 60, 98 + j * 50, 60, 50);
  if (st.ln) { K.txt(c, 'K. A. LINGNER', 88, 306, { size: 15, wt: 500, align: 'center', ls: 1 }); K.txt(c, 'pengusaha', 88, 326, { size: 14, wt: 700, font: K.SANS, col: C.mute, align: 'center' }); }
  if (st.sf) { K.txt(c, 'R. SEIFERT', 312, 306, { size: 15, wt: 500, align: 'center', ls: 1 }); K.txt(c, 'ahli kimia', 312, 326, { size: 14, wt: 700, font: K.SANS, col: C.mute, align: 'center' }); }
}
// news: a Batavia paper, 1894 (fictional masthead)
function drawNews(c, st) {
  const w = 320, h = 400; c.clearRect(0, 0, w, h);
  c.fillStyle = C.sepia; K.rr(c, 0, 0, w, h, 12); c.fill(); K.grain(c, w, h, 31, null, 'rgba(74,58,38,.06)', 'rgba(255,250,235,.4)');
  K.txt(c, 'KABAR HINDIA', w / 2, 44, { size: 30, wt: 800, font: K.SANS, col: C.sepiaInk, align: 'center', ls: 3 });
  c.fillStyle = C.sepiaInk; c.fillRect(18, 66, w - 36, 3); c.fillRect(18, 98, w - 36, 1.5);
  K.txt(c, 'BATAVIA · ' + (st.year ? '1894' : '····'), w / 2, 83, { size: 15, wt: 500, col: C.sepiaInk, align: 'center', ls: 2 });
  c.fillStyle = 'rgba(74,58,38,.28)'; for (let col = 0; col < 2; col++) for (let k = 0; k < 9; k++) c.fillRect(18 + col * 148, 112 + k * 13, 136 - (k % 3) * 18, 5);
  if (st.ad) { const a = st.ad; c.globalAlpha = a; signPrint(c, 30, 240, 260, 130); c.globalAlpha = 1; c.strokeStyle = C.sepiaInk; c.lineWidth = 2; c.setLineDash([6, 5]); K.rr(c, 22, 232, 276, 146, 8); c.stroke(); c.setLineDash([]); }
}
// F: today's shelf; stamp prints
const F_NAMES = ['ODOL 1903', 'PEPSODENT', 'CLOSE UP', 'COLGATE'];
function drawF(c, st) {
  K.cardBase(c, 620, 300, 'rak hari ini', 'Semua disebut…', { headH: 82, tagSize: 16, cnSize: 21 });
  if (st.big) { c.save(); c.globalAlpha = .92; c.strokeStyle = C.accent; c.lineWidth = 6; c.translate(310, 132); c.rotate(-.05); K.rr(c, -120, -34, 240, 68, 10); c.stroke(); K.txt(c, 'ODOL', 0, 3, { size: 52, wt: 800, font: K.SANS, col: C.accent, align: 'center', ls: 10 }); c.restore(); }
  F_NAMES.forEach((n, i) => { const x = 22 + i * 146, y = 250, stamped = st.s && st.s[i];
    c.fillStyle = i === 0 && st.gone ? '#eceef2' : C.faint; K.rr(c, x, y - 22, 136, 44, 10); c.fill();
    if (stamped) { K.txt(c, n, x + 68, y - 8, { size: 12, wt: 500, col: C.mute, align: 'center', ls: 1 }); c.strokeStyle = C.mute; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + 22, y - 8); c.lineTo(x + 114, y - 8); c.stroke();
      K.txt(c, 'ODOL', x + 68, y + 12, { size: 19, wt: 800, font: K.SANS, col: C.accent, align: 'center', ls: 4 }); }
    else K.txt(c, i === 0 && st.gone ? 'TAK DIJUAL LAGI' : n, x + 68, y + 1, { size: i === 0 && st.gone ? 11 : 14, wt: 500, col: i === 0 && st.gone ? C.mute : C.ink, align: 'center', ls: 1 }); });
}
// G: comments
function drawG(c, st) {
  phoneFrame(c);
  K.txt(c, 'Komentar', 28, 78, { size: 26, wt: 800, font: K.SANS });
  c.fillStyle = C.line; c.fillRect(20, 102, 260, 2);
  if (st.q) { c.fillStyle = C.accent; K.rr(c, 22, 116, 256, 120, 18); c.fill();
    K.txt(c, 'KALAU DI DAERAHMU,', 150, 152, { size: 21, wt: 800, font: K.SANS, col: '#fff', align: 'center' });
    K.txt(c, 'PASTA GIGI', 150, 180, { size: 21, wt: 800, font: K.SANS, col: '#fff', align: 'center' });
    K.txt(c, 'DISEBUT APA?', 150, 210, { size: 24, wt: 800, font: K.SANS, col: C.lemon, align: 'center' }); }
  const cm = [['rara.jkt', 'odol dong!', C.coral], ['ucok_mdn', 'odol jugaa', C.mint], ['neng.bdg', 'odol, euy', C.lemon]];
  cm.forEach(([u, s, col], i) => { if ((st.n || 0) <= i) return; const y = 256 + i * 66;
    c.fillStyle = col; c.beginPath(); c.arc(44, y + 22, 15, 0, 7); c.fill();
    K.txt(c, u, 68, y + 12, { size: 15, wt: 500, col: C.mute }); K.txt(c, s, 68, y + 36, { size: 20, wt: 800, font: K.SANS }); });
  c.fillStyle = '#e9edf4'; K.rr(c, 22, 476, 256, 50, 25); c.fill(); K.txt(c, 'Tulis komentar…', 42, 502, { size: 19, wt: 600, font: K.SANS, col: '#98a1b3' });
}
function drawBanner(c, st) {
  K.cardBase(c, 400, 180, '', '', {});
  if (!st.on) return;
  c.fillStyle = C.accent; c.fillRect(0, 0, 14, 180);
  K.txt(c, 'TERNYATA,', 36, 46, { size: 22, wt: 500, col: C.mute, ls: 3 });
  K.txt(c, 'ODOL ITU', 36, 92, { size: 42, wt: 800, font: K.SANS });
  K.txt(c, 'NAMA MEREK!', 36, 140, { size: 42, wt: 800, font: K.SANS, col: C.accent });
}
function drawStrip(c, st) { c.clearRect(0, 0, 360, 100); c.fillStyle = C.cream; c.fillRect(0, 0, 360, 100); K.grain(c, 360, 100, 41); K.txt(c, 'FAKTA', 180, 54, { size: 64, wt: 800, font: K.SANS, col: C.ink, align: 'center', ls: 14 }); c.save(); c.setLineDash([8, 7]); c.strokeStyle = C.mute; c.lineWidth = 2; c.beginPath(); c.moveTo(180, 0); c.lineTo(180, 100); c.stroke(); c.restore(); }
let LOGO_IMG = null;
function drawLogo(c, st) {
  const w = 440, h = 300; c.clearRect(0, 0, w, h); c.fillStyle = C.card; K.rr(c, 0, 0, w, h, 20); c.fill(); K.grain(c, w, h, 53);
  c.fillStyle = C.accent; c.fillRect(0, 0, w, 14);
  if (LOGO_IMG) { const s = Math.min(150 / LOGO_IMG.width, 130 / LOGO_IMG.height); c.drawImage(LOGO_IMG, w / 2 - LOGO_IMG.width * s / 2, 36, LOGO_IMG.width * s, LOGO_IMG.height * s); }
  else { K.txt(c, '✂', w / 2, 84, { size: 64, wt: 800, font: K.SANS, col: C.coral, align: 'center' }); }
  K.txt(c, 'GUNTING FAKTA', w / 2, 196, { size: 44, wt: 800, font: K.SANS, align: 'center', ls: 2 });
  c.fillStyle = C.ink; K.rr(c, 70, 228, 300, 46, 23); c.fill();
  K.txt(c, 'FOLLOW @GUNTINGFAKTA', w / 2, 252, { size: 18, wt: 500, col: '#fff', align: 'center', ls: 1.5 });
}

export function build(ctx) {
  const { world, ev } = ctx, scene = world.scene;
  ctx.fx = { flash: 0 };
  const mat = (col, r = .5, extra = {}) => new THREE.MeshStandardMaterial({ color: col, roughness: r, ...extra });

  // the user's logo, if they put one in the project (logo.png); otherwise the text card
  { const img = new Image(); img.onload = () => { LOGO_IMG = img; re('logo', drawLogo, { v: 2 }, true); }; img.src = 'logo.png'; }

  // cards
  const cv = {}, cd = {}, state = {};
  const mk = (n, draw, init, s = 3.2) => { const d = CARDS[n], [c, x] = K.canvas(d.w * 1000, d.h * 1000, s); cv[n] = x; draw(x, init); state[n] = JSON.stringify(init); const g = card(world, c, d.w, d.h, d.thick || TOP); g.position.copy(d.c); g.rotation.y = d.yaw; scene.add(g); cd[n] = g; };
  const re = (n, draw, st, force) => { const k = JSON.stringify(st); if (k === state[n] && !force) return; state[n] = k; draw(cv[n], st); cd[n].userData.redraw(); };
  mk('phoneA', drawA, { n: 0 }); mk('shelf', drawShelf, {}); mk('phoneB', drawB, { q: 0 }); mk('mapC', drawC, {}); mk('lab', drawLab, {});
  mk('mapE', drawE, {}); mk('news', drawNews, {}); mk('shelfF', drawF, {}); mk('phoneG', drawG, {}); mk('banner', drawBanner, {}); mk('logo', drawLogo, { v: 1 }, 3);
  // the FAKTA strip is two halves (the scissors cut it apart)
  const stripHalves = [0, 1].map(k => { const [c, x] = K.canvas(180, 100, 3); x.save(); x.translate(-180 * k, 0); drawStrip(x, {}); x.restore(); const g = card(world, c, .18, .1, .0035); scene.add(g); return g; });
  const stripAt = (k, dx = 0) => { const d = CARDS.strip; return V((k ? .09 : -.09) + dx * (k ? 1 : -1), 0, 0).applyAxisAngle(YAX, d.yaw).add(d.c); };

  // title tent beside the first stops
  const tent = new THREE.Group(); scene.add(tent);
  const TENT = { w: .26, h: .1, lean: .2 };
  { const [c, x] = K.canvas(780, 300, 1.6); x.fillStyle = C.card; x.fillRect(0, 0, 780, 300); K.grain(x, 780, 300, 9, 4000); x.fillStyle = C.accent; x.fillRect(0, 0, 18, 300);
    K.txt(x, 'KENAPA PASTA GIGI', 52, 92, { size: 62, wt: 800, font: K.SANS }); K.txt(x, 'DISEBUT ODOL?', 52, 172, { size: 74, wt: 800, font: K.SANS, col: C.accent });
    K.txt(x, 'GUNTING FAKTA · EPS 01', 56, 248, { size: 30, wt: 500, col: C.mute, ls: 5 });
    const face = new THREE.MeshStandardMaterial({ map: world.tex(c), roughness: .8 }), plain = new THREE.MeshStandardMaterial({ color: C.card, roughness: .85 });
    const f = new THREE.Mesh(new THREE.BoxGeometry(TENT.w, TENT.h, .0012), [plain, plain, plain, plain, face, plain]), b = new THREE.Mesh(new THREE.BoxGeometry(TENT.w, TENT.h, .0012), plain);
    const dz = Math.sin(TENT.lean) * TENT.h / 2, hy = Math.cos(TENT.lean) * TENT.h / 2;
    f.position.set(0, hy, dz); f.rotation.x = -TENT.lean; b.position.set(0, hy, -dz); b.rotation.x = TENT.lean; f.castShadow = b.castShadow = f.receiveShadow = true; tent.add(f, b);
    tent.position.set(.2, 0, .86); tent.rotation.y = -.12; }
  // three small tents: Aqua / Sanyo / Honda
  const tents = [['AQUA', 'air mineral'], ['SANYO', 'pompa air'], ['HONDA', 'sepeda motor']].map(([a, b], i) => {
    const g = new THREE.Group(), TW = .15, TH = .08, lean = .22;
    const [c, x] = K.canvas(450, 240, 1.6); x.fillStyle = C.card; x.fillRect(0, 0, 450, 240); K.grain(x, 450, 240, 17 + i, 3000); x.fillStyle = [C.mint, C.coral, C.lemon][i]; x.fillRect(0, 0, 450, 16);
    K.txt(x, a, 225, 104, { size: 92, wt: 800, font: K.SANS, align: 'center', ls: 4 }); K.txt(x, '= ' + b, 225, 186, { size: 40, wt: 700, font: K.SANS, col: C.mute, align: 'center' });
    const face = new THREE.MeshStandardMaterial({ map: world.tex(c), roughness: .8 }), plain = new THREE.MeshStandardMaterial({ color: C.card, roughness: .85 });
    const f = new THREE.Mesh(new THREE.BoxGeometry(TW, TH, .0012), [plain, plain, plain, plain, face, plain]), bk = new THREE.Mesh(new THREE.BoxGeometry(TW, TH, .0012), plain);
    const dz = Math.sin(lean) * TH / 2, hy = Math.cos(lean) * TH / 2;
    f.position.set(0, hy, dz); f.rotation.x = -lean; bk.position.set(0, hy, -dz); bk.rotation.x = lean; f.castShadow = bk.castShadow = f.receiveShadow = true; g.add(f, bk);
    g.position.set(.15 + i * .17, 0, -2.3 + i * .01); g.rotation.y = -.05; scene.add(g); return { g, f, TW, TH };
  });

  // desk props: a pen, sticky notes, a mug, a toothbrush in a glass, an eraser
  {
    const pen = new THREE.Group(); const body = new THREE.Mesh(new THREE.CylinderGeometry(.0065, .0065, .15, 20), mat('#2a3042', .35)); body.rotation.z = Math.PI / 2; pen.add(body);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(.0065, .02, 20), mat('#c9ccd4', .3, { metalness: .6 })); tip.rotation.z = -Math.PI / 2; tip.position.x = .085; pen.add(tip);
    pen.position.set(-.56, .0065, .62); pen.rotation.y = 1.2; pen.traverse(o => o.castShadow = true); scene.add(pen);
    for (let i = 0; i < 4; i++) { const n = new THREE.Mesh(rbox(.1, .0016, .1, .002), mat(i === 3 ? '#f4d27a' : C.lemon, .85)); n.position.set(.56, .0008 + i * .0016, .14); n.rotation.y = .25 + i * .03; n.castShadow = n.receiveShadow = true; scene.add(n); }
    const mug = new THREE.Group(); const cup = new THREE.Mesh(new THREE.CylinderGeometry(.05, .046, .095, 40, 1, true), mat('#f3efe7', .45, { side: THREE.DoubleSide })); cup.position.y = .0475; mug.add(cup);
    const bottom = new THREE.Mesh(new THREE.CircleGeometry(.046, 40), mat('#f3efe7', .45)); bottom.rotation.x = -Math.PI / 2; bottom.position.y = .002; mug.add(bottom);
    const tea = new THREE.Mesh(new THREE.CircleGeometry(.047, 40), mat('#8a5a3c', .25)); tea.rotation.x = -Math.PI / 2; tea.position.y = .08; mug.add(tea);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(.025, .007, 12, 24, Math.PI), mat('#f3efe7', .45)); handle.rotation.z = -Math.PI / 2; handle.position.set(.05, .047, 0); mug.add(handle);
    mug.position.set(-.6, 0, -.72); mug.rotation.y = 2.4; mug.traverse(o => o.castShadow = o.receiveShadow = true); scene.add(mug);
    const glass = new THREE.Group(); const gl = new THREE.Mesh(new THREE.CylinderGeometry(.03, .027, .08, 32, 1, true), mat('#dfeef2', .1, { transparent: true, opacity: .55, side: THREE.DoubleSide })); gl.position.y = .04; glass.add(gl);
    const brush = new THREE.Group(); const handleB = new THREE.Mesh(rbox(.008, .15, .012, .003), mat(C.mint, .4)); handleB.position.y = .075; brush.add(handleB); const head = new THREE.Mesh(rbox(.012, .03, .014, .002), mat('#fbfbfb', .6)); head.position.set(0, .155, .006); brush.add(head);
    brush.rotation.z = .25; brush.position.set(-.005, .002, 0); glass.add(brush); glass.position.set(.58, 0, -1.98); glass.traverse(o => o.castShadow = true); scene.add(glass);
    const er = new THREE.Mesh(rbox(.05, .014, .022, .004), mat('#f0a7b3', .7)); er.position.set(-.58, .007, -1.62); er.rotation.y = .5; er.castShadow = true; scene.add(er);
  }
  // soft window light on the desk
  { const [c, x] = K.canvas(512, 512, 1); x.filter = 'blur(26px)'; x.fillStyle = 'rgba(255,236,205,1)';
    for (const [a, b] of [[60, 60], [270, 60], [60, 270], [270, 270]]) x.fillRect(a, b, 180, 180); x.filter = 'none';
    const lm = new THREE.MeshBasicMaterial({ map: world.tex(c), transparent: true, opacity: .2, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    for (const [px, pz, s, r] of [[.0, .85, 1.0, .5], [.1, -.8, 1.0, .4], [-.05, -2.4, 1.0, .5]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s * .8), lm); m.rotation.set(-Math.PI / 2, 0, r); m.position.set(px, .0003, pz); m.renderOrder = 1; scene.add(m); } }

  // ── cast ──
  const add = m => { scene.add(m.root); return m; };
  const hero = add(makeMonster(toArt(TUBE, tubePal(C.coral)), .0068, 'hero', .9));
  const tubeB = add(makeMonster(toArt(TUBE, tubePal(C.mint)), .0068, 'tubeB', .9));
  const tubeC = add(makeMonster(toArt(TUBE, tubePal('#5fb4e8')), .0068, 'tubeC', .9));
  const kid = add(makeMonster(toArt(KID, KID_PAL), .0075, 'kid', .9));
  const bottle = add(makeMonster(toArt(BOTTLE, BOTTLE_PAL), .0068, 'bottle', .9));
  const lingner = add(makeMonster(toArt(LINGNER, LINGNER_PAL), .0072, 'lingner', .85));
  const seifert = add(makeMonster(toArt(SEIFERT, SEIFERT_PAL), .0072, 'seifert', .85));
  const tower = add(makeMonster(toArt(TOWER, TOWER_PAL), .0058, 'tower', .9));
  const ship = add(makeMonster(toArt(SHIP, SHIP_PAL), .0072, 'ship', .7));
  const t1903 = add(makeMonster(toArt(TUBE, tubePal(C.accent, '#d9dde3', '#9aa1ad')), .0068, 't1903', .9));
  const fB = add(makeMonster(toArt(TUBE, tubePal(C.mint)), .0068, 'fB', .9)), fC = add(makeMonster(toArt(TUBE, tubePal('#5fb4e8')), .0068, 'fC', .9));
  const kidG = add(makeMonster(toArt(KID, KID_PAL), .0075, 'kidG', .9));
  const scissors = add(makeMonster(toArt(SCISSORS, SCISSORS_PAL), .0075, 'scissors', .8));
  const crates = [0, 1, 2].map(k => add(makeMonster(toArt(BOTTLE, BOTTLE_PAL), .0042, 'mini' + k, .8)));
  // a toothbrush the kid at G holds (a plain primitive that follows the kid's hand)
  const brushG = new THREE.Group(); { const h = new THREE.Mesh(rbox(.006, .07, .008, .002), mat(C.mint, .4)); h.position.y = .035; brushG.add(h); const hd = new THREE.Mesh(rbox(.01, .018, .01, .002), mat('#fbfbfb', .6)); hd.position.y = .078; brushG.add(hd); brushG.traverse(o => o.castShadow = true); scene.add(brushG); }

  // ── props: pins, flask, stamp ──
  const mkPin = col => { const g = new THREE.Group(); const n = new THREE.Mesh(new THREE.CylinderGeometry(.0018, .0006, .05, 8), mat('#aab2c3', .3, { metalness: .6 })); n.position.y = .025; g.add(n);
    const hd = new THREE.Mesh(new THREE.SphereGeometry(.012, 20, 14), mat(col, .35)); hd.position.y = .055; g.add(hd); g.traverse(o => o.castShadow = true); scene.add(g); return g; };
  const pinC = mkPin(C.accent), pinE = mkPin(C.accent);
  const flask = new THREE.Group(); { const b = new THREE.Mesh(new THREE.SphereGeometry(.024, 24, 16), mat('#d6efe8', .1, { transparent: true, opacity: .8 })); b.position.y = .024; flask.add(b);
    const liq = new THREE.Mesh(new THREE.SphereGeometry(.019, 20, 14, 0, 6.3, 1.2, 2), mat(C.mint, .3)); liq.position.y = .024; flask.add(liq);
    const nk = new THREE.Mesh(new THREE.CylinderGeometry(.006, .007, .03, 14), mat('#d6efe8', .1, { transparent: true, opacity: .8 })); nk.position.y = .06; flask.add(nk); flask.traverse(o => o.castShadow = true); scene.add(flask); }
  const bubbles = [...Array(6)].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(.004, 10, 8), mat('#bfeee0', .2)); scene.add(m); return m; });
  const stamp = new THREE.Group(); { const base = new THREE.Mesh(rbox(.07, .018, .05, .004), mat(C.accent, .45)); base.position.y = .009; stamp.add(base);
    const ink = new THREE.Mesh(rbox(.066, .004, .046, .002), mat('#1b3f80', .6)); ink.position.y = .002; stamp.add(ink);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(.008, .01, .03, 16), mat('#b98a5a', .5)); neck.position.y = .033; stamp.add(neck);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(.018, 20, 14), mat('#b98a5a', .5)); knob.position.y = .058; stamp.add(knob); stamp.traverse(o => o.castShadow = true); scene.add(stamp); }
  const bigStamp = new THREE.Group(); { const base = new THREE.Mesh(rbox(.26, .03, .09, .008), mat(C.accent, .45)); base.position.y = .015; bigStamp.add(base);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(.014, .018, .05, 16), mat('#b98a5a', .5)); neck.position.y = .055; bigStamp.add(neck);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(.03, 20, 14), mat('#b98a5a', .5)); knob.position.y = .095; bigStamp.add(knob); bigStamp.traverse(o => o.castShadow = true); scene.add(bigStamp); }

  // ── the route: accent dots laid as the hero travels; the sea leg in pale blue dashes ──
  const P = {
    hero0: at('shelf', 60, 160, TOP), heroB: onPaper(.05, .64), heroC: onPaper(.04, -.08),
    port: null, bat: null, heroE: onPaper(.03, -1.0),
    heroF: at('shelfF', 236, 200, TOP), heroG: onPaper(.07, -2.12), kidA: onPaper(-.02, 1.04), kidG: onPaper(-.05, -2.18),
    bottleB: onPaper(.055, .44), bottleLab: at('lab', 200, 210, TOP), lingner: at('lab', 88, 250, TOP), seifert: at('lab', 312, 250, TOP),
    flask: at('lab', 312, 150, TOP), t03F: at('shelfF', 90, 200, TOP), fB: at('shelfF', 382, 200, TOP), fC: at('shelfF', 528, 200, TOP), adNews: at('news', 160, 300, TOP), t03N: at('news', 160, 440, 0),
  };
  // map coordinates → world (after the first draw the projections exist)
  const mapPt = (n, PP, M, ll, y) => { const [x, yy] = PP(ll); return at(n, x, yy, y); };
  P.dresden = mapPt('mapC', PC, MAPC, [13.74, 51.05]); P.port = mapPt('mapC', PC, MAPC, [6.6, 54.4]); P.bat = mapPt('mapE', PE, MAPE, [106.82, -6.13]);
  P.towerC = mapPt('mapC', PC, MAPC, [8.6, 47.6]); P.portE = mapPt('mapE', PE, MAPE, [106.3, -5.6]);
  const ROUTE_LEGS = [
    { pts: [P.hero0, onPaper(.12, .9), P.heroB], t: T.hopB[0][0], d: .9 },
    { pts: [P.heroB, onPaper(.0, .2), P.heroC], t: T.hopC[0][0], d: 1.0 },
    { pts: [P.port, onPaper(-.62, -.3), onPaper(-.62, -.7), P.portE], t: T.sail[0], d: T.sail[1] - T.sail[0], sea: 1 },
    { pts: [P.heroE, onPaper(.03, -1.45), P.heroF], t: T.toF[0][0], d: .6 },
    { pts: [P.heroF, onPaper(.1, -1.98), P.heroG], t: T.toG[0], d: .8 },
  ];
  const under = (x, z, pad = .012) => Object.values(CARDS).some(d => { const qq = V(x - d.c.x, 0, z - d.c.z).applyAxisAngle(YAX, -d.yaw); return Math.abs(qq.x) < d.w / 2 + pad && Math.abs(qq.z) < d.h / 2 + pad; });
  const DOTS = [];
  for (const L of ROUTE_LEGS) { const cr = new THREE.CatmullRomCurve3(L.pts.map(p => V(p.x, .0016, p.z))), n = Math.round(cr.getLength() / .022);
    for (let k = 0; k < n; k++) { const u = (k + .5) / n, p = cr.getPointAt(u); if (!L.sea && under(p.x, p.z)) continue; DOTS.push({ p, t: L.t + u * L.d, sea: L.sea, onCard: L.sea && under(p.x, p.z, 0) }); } }
  const routeMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(.0062, .0062, .0026, 16), new THREE.MeshStandardMaterial({ roughness: .45 }), DOTS.length); routeMesh.castShadow = true; scene.add(routeMesh);
  DOTS.forEach((d, k) => { routeMesh.setColorAt(k, new THREE.Color(d.sea ? '#7fa6dc' : C.accent)); if (d.onCard) d.p.y = .0068; });
  const seaCurve = new THREE.CatmullRomCurve3(ROUTE_LEGS[2].pts.map(p => V(p.x, 0, p.z)));

  // impact rings
  const RINGS = [[T.ding, CARDS.phoneA.c], [T.pinC, P.dresden], [T.pinE, P.bat], [T.stamp0, CARDS.shelfF.c], ...T.stamps.map((t, i) => [t, at('shelfF', 22 + (i + 1) * 146 + 68, 250, 0)]), [T.logo, CARDS.logo.c]].map(([t, p]) => {
    const m = new THREE.Mesh(new THREE.RingGeometry(.97, 1, 96), new THREE.MeshBasicMaterial({ color: C.accent, transparent: true, depthWrite: false, fog: false })); m.rotation.x = -Math.PI / 2; m.position.set(p.x, .0008, p.z); m.renderOrder = 2; scene.add(m); return { m, t }; });

  // pills (camera-facing, no shadow)
  const P_ = (s, o) => { const m = pill(world, s, { h: .036, size: 44, font: K.SANS, wt: 800, ...o }); m.castShadow = false; m.renderOrder = 3; return m; };
  const pills = [
    { m: P_('ODOL?', { bg: C.ink }), t0: T.odolQ, t1: T.hopB[0][0] - .05, p: () => hero.root.position.clone().add(V(0, .16, 0)) },
    { m: P_('1892'), t0: T.y1892, t1: T.lingner - .4, p: () => P.dresden.clone().add(V(.07, .1, 0)) },
    { m: P_('OBAT KUMUR', { bg: C.green }), t0: T.kumur, t1: T.seifert - .5, p: () => at('lab', 200, 120, .12) },
    { m: P_('BUKAN PASTA GIGI', { bg: C.red }), t0: T.notPaste, t1: T.seifert - .5, p: () => at('lab', 200, 120, .075) },
    { m: P_('1894'), t0: T.y1894, t1: T.tube1903 - .4, p: () => at('news', 250, 70, .08) },
    { m: P_('1903'), t0: T.y1903, t1: T.toF[0][0], p: () => t1903.root.position.clone().add(V(.07, .1, 0)) },
  ];

  // ── text meant to be read: [id, text, t0, t1, corners()] ──
  const uv = (n, u0, v0, u1, v1, y) => () => [at(n, u0, v0, y), at(n, u1, v0, y), at(n, u0, v1, y), at(n, u1, v1, y)];
  const pillBox = m => () => { m.updateMatrixWorld(); const hw = m.w / 2, hh = m.geometry.parameters.height / 2; return [[-hw, -hh], [hw, -hh], [-hw, hh], [hw, hh]].map(([x, y]) => V(x, y, 0).applyMatrix4(m.matrixWorld)); };
  const tentBox = (f, w, h) => () => { f.updateMatrixWorld(); return [[-.5, -.5], [.5, -.5], [-.5, .5], [.5, .5]].map(([x, y]) => V(x * w, y * h, .0007).applyMatrix4(f.matrixWorld)); };
  ctx.read = [
    ['title', 'KENAPA PASTA GIGI DISEBUT ODOL?', 0, 4.0, tentBox(tent.children[0], TENT.w, TENT.h)],
    ['beli', 'BELI ODOL!', T.type[0], T.hopB[0][0] - .3, uv('phoneA', 24, 234, 276, 330)],
    ['sign', 'ODOL', T.sign + .2, T.hopC[0][0], uv('phoneB', 24, 164, 276, 292)],
    ['rowX', 'Nama semua pasta gigi?', T.rowX, T.hopC[0][0], uv('phoneB', 24, 318, 276, 364)],
    ['rowM', 'Merek dagang', T.rowMerek, T.hopC[0][0], uv('phoneB', 24, 372, 276, 418)],
    ['dresden', 'DRESDEN Jerman', T.pinC + .1, T.lingner - .4, () => { const [x, y] = PC([13.74, 51.05]); return [at('mapC', x + 14, y + 12), at('mapC', x + 120, y + 12), at('mapC', x + 14, y + 58), at('mapC', x + 120, y + 58)]; }],
    ['ln', 'K. A. LINGNER pengusaha', T.lingner + .2, T.ship - .3, uv('lab', 30, 294, 150, 336)],
    ['sf', 'R. SEIFERT ahli kimia', T.seifert + .2, T.ship - .3, uv('lab', 254, 294, 374, 336)],
    ['ad', 'ODOL', T.bottleAd[1] + .2, T.toF[0][0], uv('news', 30, 240, 290, 370)],
    ['bigODOL', 'ODOL', T.stamp0 + .1, T.toG[0], uv('shelfF', 190, 98, 430, 166)],
    ['banner', 'TERNYATA, ODOL ITU NAMA MEREK!', T.banner + .2, T.finale + 2, uv('banner', 20, 20, 390, 165)],
    ['q', 'KALAU DI DAERAHMU, PASTA GIGI DISEBUT APA?', T.question + .2, DUR, uv('phoneG', 22, 116, 278, 236)],
    ['logo', 'GUNTING FAKTA FOLLOW @GUNTINGFAKTA', T.logo + .3, DUR + 1, uv('logo', 40, 160, 400, 276)],
  ];
  ['AQUA', 'SANYO', 'HONDA'].forEach((s, i) => ctx.read.push(['tent' + i, s, [T.aqua, T.sanyo, T.honda][i] + .3, T.finale, tentBox(tents[i].f, tents[i].TW, tents[i].TH)]));
  for (const p of pills) ctx.read.push(['pill-' + p.m.uuid.slice(0, 4), '', p.t0 + .2, p.t1 - .3, pillBox(p.m)]);
  pills.forEach((p, i) => { ctx.read[ctx.read.length - pills.length + i][1] = ['ODOL?', '1892', 'OBAT KUMUR', 'BUKAN PASTA GIGI', '1894', '1903'][i]; });

  // ── hops ──
  const heroHops = [
    { t0: T.hopB[0][0], t1: T.hopB[0][1], from: P.hero0, to: onPaper(.12, .9), h: .08 },
    { t0: T.hopB[1][0], t1: T.hopB[1][1], from: onPaper(.12, .9), to: P.heroB, h: .1 },
    { t0: T.hopC[0][0], t1: T.hopC[0][1], from: P.heroB, to: onPaper(.0, .2), h: .08 },
    { t0: T.hopC[1][0], t1: T.hopC[1][1], from: onPaper(.0, .2), to: P.heroC, h: .1 },
  ];
  const deck = (k, t) => { const s = ship.root.position.clone(); return s.add(V(k ? .035 : -.035, .025, .005)); };

  // ── sound events ──
  const E = (t, type, o = {}) => ev.push({ t, type, ...o });
  'BELI ODOL!'.split('').forEach((ch, i) => ch !== ' ' && E(T.type[0] + i * .1, 'key', { k: i }));
  E(T.ding, 'ding'); E(T.kid, 'pop', { k: 0, big: 1 }); T.tubes.forEach((t, i) => E(t, 'pop', { k: i + 1 })); E(T.reply, 'send'); E(T.odolQ, 'badge', { k: 2 });
  heroHops.forEach(h => { E(h.t0, 'hop'); E(h.t1, 'land', { v: .5 }); });
  [0, 1, 2, 3].forEach(i => E(T.search[0] + i * .125, 'key', { k: i })); E(T.sign, 'pop', { k: 2, big: 1 });
  [T.rowX, T.rowMerek, T.rowJerman, T.rowAbad].forEach((t, i) => E(t, i ? 'tick' : 'nope')); E(T.bottle, 'pop', { k: 4, big: 1 });
  E(T.pinC - .25, 'drop'); E(T.pinC, 'pin'); E(T.tower, 'pop', { k: 1 }); [0, 1, 2, 3].forEach(i => E(T.y1892 + i * .125, 'tick', { k: i }));
  E(T.lingner, 'pop', { k: 0, big: 1 }); E(T.bottleHop[0], 'hop'); E(T.bottleHop[1], 'land', { v: .5 });
  E(T.kumur, 'badge', { k: 1 }); E(T.notPaste, 'nope'); E(T.seifert, 'pop', { k: 3, big: 1 }); E(T.flask, 'bubble'); T.crates.forEach((t, i) => E(t, 'pop', { k: 4 + i }));
  E(T.ship, 'pop', { k: 0, big: 1 }); E(T.ship + .3, 'horn'); E(T.boardHero[0], 'hop'); E(T.boardHero[1], 'land', { v: .4 }); E(T.boardBottle[0], 'hop'); E(T.boardBottle[1], 'land', { v: .4 });
  E(T.sail[0], 'waves', { d: T.sail[1] - T.sail[0] + .6 }); E(T.pinE - .25, 'drop'); E(T.pinE, 'pin'); E(T.offShip[0], 'hop'); E(T.offShip[1], 'land', { v: .5 });
  E(T.bottleAd[0], 'hop'); E(T.bottleAd[1], 'print'); [0, 1, 2, 3].forEach(i => E(T.y1894 + i * .125, 'tick', { k: i }));
  E(T.tube1903, 'pop', { k: 2, big: 1 }); [0, 1, 2, 3].forEach(i => E(T.y1903 + i * .125, 'tick', { k: i }));
  E(T.toF[0][0], 'jump'); E(T.toF[0][1], 'land', { v: .6 }); E(T.tube03F[0], 'hop'); E(T.tube03F[1], 'land', { v: .4 });
  E(T.stamp0 - .3, 'drop'); E(T.stamp0, 'slam', { big: 1 }); T.modern.forEach((t, i) => E(t, 'pop', { k: 1 + i })); E(T.gone, 'unpop');
  T.stamps.forEach((t, i) => { E(t - .2, 'drop'); E(t, 'slam', { k: i }); });
  E(T.toG[0], 'jump'); E(T.toG[1], 'land', { v: .6 }); E(T.banner, 'print'); E(T.kidG, 'pop', { k: 0, big: 1 }); E(T.kidG + .6, 'brush', { d: 4.5 });
  [T.aqua, T.sanyo, T.honda].forEach((t, i) => E(t, 'tent', { k: i })); E(T.question, 'badge', { k: 0 }); T.comments.forEach((t, i) => E(t, 'comment', { k: i }));
  [...Array(7)].forEach((_, k) => E(T.finale + 1.0 + k * .125, 'land', { v: .3 })); E(T.cut - .4, 'snip'); E(T.cut, 'cut'); E(T.logo - .3, 'drop'); E(T.logo, 'titleLand');

  // ── camera subjects ──
  const mid = (m, k = .5) => () => m.root.position.clone().add(V(0, m.height * k, 0));
  Object.assign(ctx.subj, {
    A: () => at('phoneA', 150, 290, .02), A2: () => at('phoneA', 210, 300, .02).lerp(CARDS.shelf.c.clone().setY(.03), .5), shelf: () => CARDS.shelf.c.clone().add(V(0, .03, 0)),
    B: () => at('phoneB', 150, 300, .02), Btop: () => at('phoneB', 150, 260, .02).add(V(-.05, 0, 0)),
    C: () => at('mapC', 230, 230, .02), Cpin: () => P.dresden.clone().add(V(0, .03, 0)), lab: () => at('lab', 200, 200, .04), CD: () => P.heroC.clone().add(V(0, .03, -.08)),
    port: () => P.port.clone().add(V(0, .03, 0)), ship: () => ship.root.position.clone().add(V(0, .04, 0)), E: () => at('mapE', 240, 170, .02), news: () => at('news', 160, 230, .02), EN: () => P.heroE.clone().add(V(0, .03, 0)),
    F: () => at('shelfF', 310, 170, .03), G: () => onPaper(.1, -2.45).add(V(0, .03, 0)), tents: () => onPaper(.31, -2.3).add(V(0, .04, 0)), Gphone: () => at('phoneG', 150, 250, .02),
    hero: mid(hero, .5), wide: () => V(0, 0, MATZ), final: () => V(.0, 0, MATZ + .12), logoC: () => CARDS.logo.c.clone().add(V(0, .02, .01)),
  });

  // ── per frame ──
  const m4 = new THREE.Matrix4(), qq = new THREE.Quaternion();
  const popAt = (m, t, t0, base, o = {}) => { const p = pop(t, t0, o.dur || .4, o.jump ?? .045); const pos = base.clone(); pos.y += p.y; m.set({ pos, vis: t >= t0 - (o.sticker ? 99 : 0) && (o.until === undefined || t < o.until), e: p.e, hinge: p.hinge, sq: p.sq * (o.sq || 1), yaw: o.yaw || 0, scale: o.scale || 1 }); return p; };
  const blinkAll = (t) => [hero, tubeB, tubeC, kid, bottle, lingner, seifert, t1903, fB, fC, kidG].forEach((m, i) => m.blink(((t + i * .37) % (2.1 + i * .07)) < .12));
  return t => {
    // ---- cards ----
    re('phoneA', drawA, { n: Math.max(0, Math.min(10, Math.floor((t - T.type[0]) / .1) + 1)), reply: t >= T.reply ? 1 : 0 });
    re('phoneB', drawB, { q: Math.max(0, Math.min(4, Math.floor((t - T.search[0]) / .125) + 1)), caret: t < T.sign ? 1 : 0, sign: t >= T.sign ? 1 : 0, r1: t >= T.rowX, r2: t >= T.rowMerek, r3: t >= T.rowJerman, r4: t >= T.rowAbad });
    re('mapC', drawC, { dresden: t >= T.pinC + .05 });
    re('lab', drawLab, { ln: t >= T.lingner + .1, sf: t >= T.seifert + .1 });
    re('mapE', drawE, { batavia: t >= T.pinE + .05, hindia: t >= T.hindia });
    re('news', drawNews, { year: t >= T.y1894 ? 1 : 0, ad: t >= T.bottleAd[1] ? Math.min(1, Math.round(seg(t, T.bottleAd[1], T.bottleAd[1] + .3) * 6) / 6) : 0 });
    re('shelfF', drawF, { big: t >= T.stamp0 ? 1 : 0, gone: t >= T.gone + .3 ? 1 : 0, s: [0, ...T.stamps.map(s => t >= s ? 1 : 0)] });
    re('phoneG', drawG, { q: t >= T.question ? 1 : 0, n: T.comments.filter(c => t >= c).length });
    re('banner', drawBanner, { on: t >= T.banner ? 1 : 0 });

    // ---- the hero: shelf → B → C/D → ship → E → F (stamped) → G ----
    {
      const P0 = pop(t, T.tubes[0], .4, .05);
      let h = hops(t, heroHops, P.hero0), pos = h.pos.clone(), air = h.air, lands = h.lands, offs = h.takeoffs, dir = h.dir;
      if (t >= T.boardHero[0] && t < T.offShip[0]) { const a = P.heroC, b = deck(0, t); const u = seg(t, ...T.boardHero); pos = a.clone().lerp(b, eio(u)); pos.y += .12 * arc(u); air = u < 1 ? u : null; if (u >= 1) pos = b; }
      if (t >= T.offShip[0]) { const u = seg(t, ...T.offShip), a = deck(0, T.offShip[0]); pos = a.clone().lerp(P.heroE, eio(u)); pos.y += .1 * arc(u); air = u < 1 ? u : null; }
      if (t >= T.toF[0][0]) { const u = seg(t, ...T.toF[0]); pos = P.heroE.clone().lerp(P.heroF, eio(u)); pos.y += .22 * arc(u); air = u < 1 ? u : null; }
      if (t >= T.toG[0]) { const u = seg(t, ...T.toG); pos = P.heroF.clone().lerp(P.heroG, eio(u)); pos.y += .3 * arc(u); air = u < 1 ? u : null; }
      const allLands = [...lands, T.boardHero[1], T.offShip[1], T.toF[0][1], T.toG[1]], allOffs = [...offs, T.boardHero[0], T.offShip[0], T.toF[0][0], T.toG[0]];
      const stampSq = (() => { const d = t - T.stamps[0]; return d > -.02 && d < .35 ? 1 - .55 * Math.sin(Math.PI * clamp(d / .35)) : 1; })();
      const idle = t < T.hopB[0][0] ? beatBounce(t, T.tubes[0] + .6, T.hopB[0][0] - .1, .01) : t > T.hopC[1][1] + .2 && t < T.boardHero[0] ? beatBounce(t, T.hopC[1][1] + .2, T.boardHero[0] - .1, .008) : t > T.toF[0][1] + .3 && t < T.toG[0] ? beatBounce(t, T.toF[0][1] + .3, T.toG[0] - .1, .008, .25) : beatBounce(t, T.toG[1] + .3, DUR, .01);
      pos.y += P0.y + idle.y;
      const fin = t > T.finale + 1.0 ? pop(t, T.finale + 1.0 + 6 * .125, .35, .04) : null;
      hero.set({ pos, e: P0.e, hinge: P0.hinge, sq: squash(t, allLands, allOffs, air) * P0.sq * idle.sq * stampSq, yaw: dir && air !== null ? clamp(Math.atan2(dir.x, dir.z) * .3, -.4, .4) : (t > T.toG[1] ? -.25 : .1), scale: t > T.finale ? 1 + .35 * ss(seg(t, T.finale, T.finale + .8)) : 1 });
    }
    // shelf tubes
    popAt(tubeB, t, T.tubes[1], at('shelf', 152, 160, TOP), { sq: beatBounce(t, T.tubes[1] + .6, DUR, .008, .2).sq });
    popAt(tubeC, t, T.tubes[2], at('shelf', 244, 160, TOP), { sq: beatBounce(t, T.tubes[2] + .6, DUR, .008, .35).sq });
    // the kid at A
    { const p = popAt(kid, t, T.kid, P.kidA, { yaw: .5, jump: .05 }); const b = beatBounce(t, T.kid + .6, T.hopB[0][0], .012); kid.root.position.y += b.y; }
    // the classic bottle: B → lab → ship → printed into the ad
    {
      let pos = P.bottleB.clone(), vis = t >= T.bottle, e = 1, hinge = 1, sq = 1, air = null;
      const P0 = pop(t, T.bottle, .45, .06); pos.y += P0.y; e = P0.e; hinge = P0.hinge; sq = P0.sq;
      if (t >= T.hopC[0][0]) { pos = P.bottleLab.clone(); const u = seg(t, T.lingner - .1, T.lingner + .25); }
      if (t < T.lingner && t >= T.hopC[0][0]) vis = false;   // it waits off stage, then reappears in the lab
      if (t >= T.lingner) { const P1 = pop(t, T.bottleHop[1] - .4, .4, .05); vis = true; pos = P.bottleLab.clone(); pos.y += P1.y; e = P1.e; hinge = P1.hinge; sq = P1.sq; }
      if (t >= T.boardBottle[0]) { const u = seg(t, ...T.boardBottle), b = deck(1, t); pos = P.bottleLab.clone().lerp(b, eio(u)); pos.y += .16 * arc(u); air = u < 1 ? u : null; if (u >= 1) pos = b; e = 1; hinge = 1; }
      if (t >= T.bottleAd[0]) { const u = seg(t, ...T.bottleAd), a = deck(1, T.bottleAd[0]); pos = a.clone().lerp(P.adNews, eio(u)); pos.y += .14 * arc(u); air = u < 1 ? u : null;
        const flat = ss(seg(t, T.bottleAd[1] - .05, T.bottleAd[1] + .2)); hinge = 1 - flat; e = 1 - flat; vis = t < T.bottleAd[1] + .25; }
      const b = t > T.bottle + .5 && t < T.hopC[0][0] ? beatBounce(t, T.bottle + .5, T.hopC[0][0], .01) : t > T.bottleHop[1] && t < T.boardBottle[0] ? beatBounce(t, T.bottleHop[1], T.boardBottle[0], .01, .25) : { y: 0, sq: 1 };
      pos.y += b.y;
      bottle.set({ pos, vis, e, hinge, sq: sq * b.sq * squash(t, [T.boardBottle[1]], [T.boardBottle[0], T.bottleAd[0]], air), yaw: .1 });
    }
    // Dresden: pin, tower; lab: Lingner, Seifert, flask, crates
    { const d = ei(seg(t, T.pinC - .25, T.pinC)); pinC.visible = t >= T.pinC - .25; pinC.position.copy(P.dresden).add(V(0, .3 * (1 - d), 0)); }
    popAt(tower, t, T.tower, P.towerC, { yaw: .2, jump: .03 });
    { const p = popAt(lingner, t, T.lingner, P.lingner, { yaw: .25, jump: .05 }); const b = beatBounce(t, T.lingner + .6, T.ship, .006, .1); lingner.root.position.y += b.y; }
    { popAt(seifert, t, T.seifert, P.seifert, { yaw: -.25, jump: .05 }); const b = beatBounce(t, T.seifert + .6, T.ship, .006, .3); seifert.root.position.y += b.y; }
    { const p = back(seg(t, T.flask, T.flask + .3), 2); flask.visible = t >= T.flask; flask.scale.setScalar(Math.max(.001, p)); flask.position.copy(P.flask).add(V(.05, 0, -.03));
      bubbles.forEach((b, k) => { const ph = ((t - T.flask) * .9 + k / 6) % 1; b.visible = t > T.flask + .3 && t < T.ship + 1; b.position.copy(flask.position).add(V(.003 * Math.sin(k * 3 + t * 4), .07 + ph * .06, 0)); b.scale.setScalar(Math.max(.001, 1 - ph)); }); }
    crates.forEach((m, k) => popAt(m, t, T.crates[k], at('lab', 160 + k * 40, 150, TOP), { jump: .03, until: T.ship + 4 }));
    // the ship: pops at the North Sea, sails the dotted sea route to Java
    {
      const P0 = pop(t, T.ship, .45, .04), u = eio(seg(t, ...T.sail));
      let pos = t < T.sail[0] ? P.port.clone() : seaCurve.getPointAt(u); pos.y = t < T.sail[0] ? TOP : (under(pos.x, pos.z, 0) ? TOP : 0);
      const rock = t > T.sail[0] && t < T.sail[1] ? .06 * Math.sin(t * 7) : 0;
      const tan = seaCurve.getTangentAt(Math.min(.999, Math.max(.001, u)));
      pos.y += P0.y + (t > T.sail[0] && t < T.sail[1] ? .006 * Math.abs(Math.sin(t * 7)) : 0);
      ship.set({ pos, vis: t >= T.ship && t < T.tube1903 + 2, e: P0.e, hinge: P0.hinge, sq: P0.sq, yaw: .9, tiltZ: rock });
    }
    { const d = ei(seg(t, T.pinE - .25, T.pinE)); pinE.visible = t >= T.pinE - .25; pinE.position.copy(P.bat).add(V(0, .3 * (1 - d), 0)); }
    // the 1903 tube: pops from the ad, hops to today's shelf, lies down when it is no longer sold
    {
      const P0 = pop(t, T.tube1903, .45, .06); let pos = P.t03N.clone(), air = null; pos.y += P0.y;
      if (t >= T.tube03F[0]) { const u = seg(t, ...T.tube03F); pos = P.t03N.clone().lerp(P.t03F, eio(u)); pos.y += .2 * arc(u); air = u < 1 ? u : null; }
      const flat = ss(seg(t, T.gone, T.gone + .35));
      t1903.set({ pos, vis: t >= T.tube1903, e: Math.min(P0.e, 1 - .85 * flat), hinge: Math.min(P0.hinge, 1 - flat), sq: P0.sq * squash(t, [T.tube03F[1]], [T.tube03F[0]], air), yaw: .1 });
    }
    // modern tubes on today's shelf; each squashes as the stamp lands beside it
    { const sqk = k => { const d = t - T.stamps[k]; return d > -.02 && d < .35 ? 1 - .4 * Math.sin(Math.PI * clamp(d / .35)) : 1; };
      popAt(fB, t, T.modern[0], P.fB, { sq: sqk(1) }); popAt(fC, t, T.modern[1], P.fC, { sq: sqk(2) }); }
    // stamps
    { const d = ei(seg(t, T.stamp0 - .3, T.stamp0)), up = eo(seg(t, T.stamp0 + .3, T.stamp0 + .8));
      bigStamp.visible = t > T.stamp0 - .8 && t < T.stamp0 + 1.0; bigStamp.position.copy(at('shelfF', 310, 132, TOP)).add(V(0, .45 * (1 - d) + .45 * up, 0)); bigStamp.rotation.y = -.05; }
    { let p = null; T.stamps.forEach((ts, i) => { if (t > ts - .45 && t < ts + .4) { const d = ei(seg(t, ts - .2, ts)), up = eo(seg(t, ts + .08, ts + .4)); p = at('shelfF', 22 + (i + 1) * 146 + 68, 250, TOP).add(V(0, .25 * (1 - d) + .25 * up, 0)); } });
      stamp.visible = !!p; if (p) stamp.position.copy(p); }
    // G: the kid brushing, tents, banner
    { popAt(kidG, t, T.kidG, P.kidG, { yaw: .3, jump: .05 }); const b = beatBounce(t, T.kidG + .6, DUR, .01); kidG.root.position.y += b.y;
      const hand = kidG.root.position.clone().add(V(-.04, .055, .02)); brushG.visible = t >= T.kidG + .3; brushG.position.copy(hand).add(V(0, 0, 0)); brushG.rotation.set(0, 0, .5 + .35 * Math.sin(t * 22) * (t < T.kidG + 5.5 ? 1 : 0)); brushG.scale.setScalar(Math.max(.001, back(seg(t, T.kidG + .3, T.kidG + .6), 2))); }
    tents.forEach(({ g }, i) => { const t0 = [T.aqua, T.sanyo, T.honda][i]; const p = back(seg(t, t0, t0 + .3), 2.4); g.visible = t >= t0; g.scale.set(1, Math.max(.001, p), 1); });
    tent.visible = true;
    // pills
    for (const p of pills) { const s = back(seg(t, p.t0, p.t0 + .25), 2.2) * (1 - ss(seg(t, p.t1 - .25, p.t1))); p.m.visible = t >= p.t0 && t < p.t1; p.m.scale.setScalar(Math.max(.001, s)); p.m.position.copy(p.p()); p.m.face(ctx.camera); }
    // route dots
    DOTS.forEach((d, k) => { const s = back(seg(t, d.t, d.t + .15), 2); m4.compose(d.p, qq.identity(), V(1, 1, 1).multiplyScalar(Math.max(1e-4, s))); routeMesh.setMatrixAt(k, m4); });
    routeMesh.instanceMatrix.needsUpdate = true; routeMesh.instanceColor.needsUpdate = true;
    // rings
    for (const { m, t: t0 } of RINGS) { const d = t - t0; m.visible = d > 0 && d < 1; if (m.visible) { m.scale.setScalar(.03 + d * .22); m.material.opacity = (1 - d) * .9; } }
    // scissors cut the FAKTA strip; the logo card drops into the open desk
    { const u = seg(t, T.cut - .6, T.cut), sp = ss(seg(t, T.cut, T.cut + .5));
      stripHalves.forEach((g, k) => { g.position.copy(stripAt(k, .03 * sp)); g.rotation.y = CARDS.strip.yaw + (k ? 1 : -1) * .12 * sp; });
      const sc = at('strip', 180, -30 + 160 * u, .03); scissors.set({ pos: sc, vis: t > T.cut - .8 && t < T.cut + .9, e: 1, hinge: 1, yaw: Math.PI / 2, tiltX: 0, spinZ: .25 * Math.sin(t * 30) * (u > 0 && u < 1 ? 1 : 0), scale: 1 - ss(seg(t, T.cut + .5, T.cut + .9)) }); }
    { const d = ei(seg(t, T.logo - .45, T.logo)), bnc = t > T.logo && t < T.logo + .5 ? .02 * Math.sin(Math.PI * seg(t, T.logo, T.logo + .5)) * (1 - seg(t, T.logo, T.logo + .5)) : 0;
      cd.logo.visible = t > T.logo - .5; cd.logo.position.copy(CARDS.logo.c).add(V(0, .7 * (1 - d) + bnc, 0)); cd.logo.rotation.z = (1 - d) * .15; }
    // curtain call: every station hops once, front to back
    { const st = [[cd.phoneA, cd.shelf], [cd.phoneB], [cd.mapC, cd.lab], [cd.mapE, cd.news], [cd.shelfF], [cd.phoneG, cd.banner]];
      st.forEach((gs, k) => { const d = t - (T.finale + 1.0 + k * .125); const y = d > 0 && d < .4 ? .025 * arc(d / .4) : 0; gs.forEach(g => g.position.y = y); }); }
    // phone A jolts on the ding
    { const d = t - T.ding; cd.phoneA.position.x = CARDS.phoneA.c.x + (d > 0 && d < .3 ? .003 * Math.sin(d * 60) * (1 - d / .3) : 0); }
    blinkAll(t);
    ctx.fx.flash = 0;
  };
}
