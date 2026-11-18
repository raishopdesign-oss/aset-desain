/* Timeline video "Kenapa langit biru? / Tidak tidur 3 hari?" — 60 detik, 1080x1920.
   Semua animasi ada di SATU gsap.timeline (paused) supaya bisa di-seek per frame saat render.
   Waktu disinkronkan ke VO lewat V(t): waktu kata di VO mentah -> waktu di video (VO digeser per bagian). */
gsap.registerPlugin(CustomEase);
// Kurva dari Emil Kowalski: strong ease-out untuk masuk/keluar, strong ease-in-out untuk gerak di layar.
CustomEase.create("out", "0.23,1,0.32,1");
CustomEase.create("inout", "0.77,0,0.175,1");

const TOTAL = 60;
// offset VO per bagian (detik). Harus sama dengan render.mjs (SEGMENTS).
const off = t => (t < 4.6 ? 0.6 : t < 29.7 ? 1.4 : t < 50.1 ? 2.4 : 3.2);
const V = t => +(t + off(t)).toFixed(3);

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const NS = "http://www.w3.org/2000/svg";
const mk = (tag, attrs, parent) => {
  const el = document.createElementNS(NS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  parent && parent.appendChild(el);
  return el;
};
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const R = rng(7);

/* ---------- generated SVG ---------- */
// stars
for (let i = 0; i < 80; i++) mk("circle", { cx: R() * 1080, cy: R() * 1500, r: 1.5 + R() * 3, fill: "#fff", opacity: 0.3 + R() * 0.6 }, $("#stars"));
// spectrum
const SPEC = ["#ff4d4d", "#ff9a3d", "#ffd23d", "#4cd964", "#3da5ff", "#3d5bff", "#9b5cff"];
SPEC.forEach((c, i) => mk("line", { x1: 560, y1: 640, x2: 1010, y2: 490 + i * 50, stroke: c, "stroke-width": 14, "stroke-linecap": "round", pathLength: 1, "stroke-dasharray": 1, "stroke-dashoffset": 1 }, $("#spectrum")));
// molecules (pasangan atom = N2/O2)
const mols = [];
for (let i = 0; i < 34; i++) {
  let x, y;
  do { x = 70 + R() * 940; y = 990 + R() * 300; } while (Math.hypot(x - 540, y - 1100) < 110);
  const g = mk("g", {}, $("#mols"));
  const a = R() * Math.PI;
  mk("circle", { cx: x - Math.cos(a) * 8, cy: y - Math.sin(a) * 8, r: 9, fill: "#fff", opacity: 0.85 }, g);
  mk("circle", { cx: x + Math.cos(a) * 8, cy: y + Math.sin(a) * 8, r: 9, fill: "#dcecff", opacity: 0.85 }, g);
  mols.push(g);
}
// scattered blue rays
const rays = [];
for (let i = 0; i < 16; i++) {
  const a = (i / 16) * Math.PI * 2 + 0.2, L = 230 + (i % 3) * 70;
  rays.push(mk("line", { x1: 540 + Math.cos(a) * 30, y1: 1100 + Math.sin(a) * 30, x2: 540 + Math.cos(a) * L, y2: 1100 + Math.sin(a) * L, stroke: "#3da5ff", "stroke-width": 10, "stroke-linecap": "round", pathLength: 1, "stroke-dasharray": 1, "stroke-dashoffset": 1 }, $("#rays")));
}
// sky -> eye rays (digambar dari langit menuju mata)
const eyeRays = [];
for (let i = 0; i < 9; i++) {
  const x = 120 + i * 105, y = 520 + Math.abs(i - 4) * 70;
  eyeRays.push(mk("line", { x1: x, y1: y, x2: 540 + (x - 540) * 0.12, y2: 1165, stroke: "#e8f6ff", "stroke-width": 8, "stroke-linecap": "round", pathLength: 1, "stroke-dasharray": "0.06 0.04", "stroke-dashoffset": 1, opacity: 0.9 }, $("#eyeRays")));
}
// waves
const wave = (yc, amp, wl) => { let d = `M40 ${yc}`; for (let x = 40; x <= 860; x += 4) d += ` L${x} ${(yc + Math.sin(((x - 40) / wl) * Math.PI * 2) * amp).toFixed(1)}`; return d; };
$("#waveB").setAttribute("d", wave(150, 42, 72));
$("#waveR").setAttribute("d", wave(340, 42, 270));
// hallucination blobs
const BL = [["#ff5ac8", 300, 640, 70], ["#4cd964", 820, 760, 54], ["#ffd23d", 250, 1050, 48], ["#3da5ff", 850, 1060, 66], ["#9b5cff", 540, 560, 40]];
const blobs = BL.map(([c, x, y, r]) => mk("circle", { cx: x, cy: y, r, fill: c, opacity: 0.85 }, $("#blobs")));

/* ---------- timeline ---------- */
const tl = gsap.timeline({ paused: true, defaults: { ease: "out", duration: 0.7 } });
const pop = (t, el, o = {}) => tl.fromTo(el, { autoAlpha: 0, y: o.y ?? 40, scale: o.s ?? 0.95 }, { autoAlpha: o.a ?? 1, y: 0, scale: 1, duration: o.d ?? 0.7, stagger: o.st ?? 0.06, ease: "out", ...(o.origin ? { svgOrigin: o.origin } : {}) }, t);
const hide = (t, el, o = {}) => tl.to(el, { autoAlpha: 0, y: o.y ?? -24, duration: o.d ?? 0.45, stagger: o.st ?? 0.03, ease: "out" }, t);
const draw = (t, el, d = 0.6, st = 0) => tl.fromTo(el, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: d, stagger: st, ease: "inout" }, t);
const fade = (t, el, a, d = 0.8) => tl.to(el, { autoAlpha: a, duration: d, ease: "inout" }, t);

// initial hidden states
gsap.set(["#hook > *", "#sunG1", "#earth", "#hero", "#eyeBadge", "#moon", "#face", "#battery", "#days .d", ".chips .pill", "#zzz", "#outro .t1 span", "#outro .t2 span", "#outro .bed", "#outro .z", "#oSun", "#oMoon", "#eyeRays", ".hdr .num", ".hdr .h span", "#stars"], { autoAlpha: 0 });
gsap.set([...mols, ...blobs], { autoAlpha: 0 });
gsap.set(["#lidL", "#lidR"], { scaleY: 0, transformOrigin: "50% 0%" });
tl.fromTo("#prog", { scaleX: 0 }, { scaleX: 1, duration: TOTAL, ease: "none" }, 0);
fade(0, "#stars", 0.5, 1.2);

/* HOOK 0 – 5.2 */
pop(0.15, "#hook .chip", { y: -20 });
tl.fromTo("#hook .q", { autoAlpha: 0, scale: 0.9, rotation: -10 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.9 }, 0.3);
tl.to("#hook .q", { rotation: 6, duration: 1.1, ease: "inout", yoyo: true, repeat: 2 }, 1.2);
pop(V(0.32), ["#hook .c1", "#hook .c2"], { y: 60, st: 0.12 });
pop(V(2.64), "#hook .timer", { y: 20 });
tl.fromTo("#timerArc", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.0, ease: "none" }, V(3.68));
hide(5.15, ["#hook .chip", "#hook .timer", "#hook .q", "#hook .c1", "#hook .c2"], { st: 0.04 });

/* SCENE 1 — langit biru */
tl.set("#h1", { autoAlpha: 1 }, 6.0);
pop(V(4.72), "#h1 .num", { y: 20 });
pop(V(5.6), "#h1 .h span", { st: 0.24, y: 50 });
fade(V(5.6), "#stars", 0.8);
// cahaya matahari putih
pop(V(7.12), "#sunG1", { origin: "180 640", s: 0.85, y: 0, d: 0.9 });
tl.to("#sunG1 circle:first-child", { scale: 1.12, svgOrigin: "180 640", duration: 1.1, repeat: 9, yoyo: true, ease: "inout" }, V(7.6));
draw(V(7.7), "#beam", 0.7);
pop(V(8.5), "#nWhite", { y: 20 });
// campuran semua warna pelangi
draw(V(9.56), "#spectrum line", 0.7, 0.05);
pop(V(10.4), "#nRainbow", { y: 20 });
// masuk atmosfer, menabrak molekul
hide(V(11.6), ["#nWhite", "#nRainbow"]);
fade(V(11.6), ["#spectrum", "#beam"], 0, 0.5);
tl.fromTo("#earth", { autoAlpha: 0, y: 650 }, { autoAlpha: 1, y: 0, duration: 1.3, ease: "inout" }, V(11.84));
tl.fromTo(mols, { autoAlpha: 0, scale: 0.8, transformOrigin: "50% 50%" }, { autoAlpha: 1, scale: 1, duration: 0.6, stagger: { each: 0.025, from: "random" } }, V(12.8));
pop(V(13.6), "#hero", { origin: "540 1100", y: 0, s: 0.8 });
draw(V(14.0), "#hitBeam", 0.55);
pop(V(14.64), "#nMol", { y: 20 });
const ring = t => tl.fromTo("#heroRing", { opacity: 1, scale: 0.8, svgOrigin: "540 1100" }, { opacity: 0, scale: 1.8, svgOrigin: "540 1100", duration: 0.9, ease: "out" }, t);
ring(V(14.5)); ring(V(15.6));
hide(V(16.6), "#nMol");
// gelombang biru pendek vs merah panjang
pop(V(16.9), "#waveCard", { y: 40 });
draw(V(17.2), "#waveB", 1.0);
draw(V(17.8), "#waveR", 1.0);
// dihamburkan ke segala arah
hide(V(19.5), "#waveCard", { y: -30 });
draw(V(19.6), rays, 0.7, 0.03);
ring(V(19.6));
fade(V(19.8), "#bgDay", 0.35, 1.6);
fade(V(19.8), "#stars", 0.3, 1.6);
pop(V(20.4), "#pBlue", { y: 20 });
draw(V(22.5), "#redRay", 0.6);
pop(V(22.84), "#pRed", { y: 20 });
// hamburan Rayleigh
pop(V(23.5), "#rayCard", { y: 40 });
fade(V(23.6), "#bgDay", 0.65, 1.4);
// ke mana pun kamu menatap -> biru sampai ke mata
hide(V(25.65), ["#rayCard", "#pBlue", "#pRed"]);
fade(V(25.7), ["#rays", "#hitBeam", "#redRay"], 0, 0.6);
fade(V(25.7), "#bgDay", 1, 1.6);
fade(V(25.7), "#stars", 0, 1.2);
pop(V(26.0), "#eyeBadge", { origin: "540 1250", y: 0, s: 0.85 });
fade(V(26.3), "#eyeRays", 1, 0.6);
tl.fromTo(eyeRays, { strokeDashoffset: 0 }, { strokeDashoffset: -2, duration: 3.6, ease: "none" }, V(26.3));
tl.to("#eyeBadge", { scale: 1.1, svgOrigin: "540 1250", duration: 0.35, yoyo: true, repeat: 1, ease: "inout" }, V(28.8));
// keluar
tl.to("#s1", { autoAlpha: 0, duration: 0.6, ease: "out" }, V(29.6) + 0.1);

/* SCENE 2 — tidak tidur 3 hari */
fade(31.0, "#bgDay", 0, 1.2);
fade(31.0, "#bgNight", 1, 1.2);
fade(31.2, "#stars", 1, 1.2);
tl.fromTo("#moon", { autoAlpha: 0, y: 80 }, { autoAlpha: 1, y: 0, duration: 1.2 }, 31.3);
tl.set("#h2", { autoAlpha: 1 }, 31.5);
pop(V(29.84), "#h2 .num", { y: 20 });
pop(V(30.72), "#h2 .h span", { st: 0.18, y: 50 });
pop(V(31.6), "#face", { origin: "540 860", y: 0, s: 0.9, d: 0.8 });
pop(V(32.4), "#battery", { y: 20 });
pop(V(33.0), "#days .d", { y: 20, st: 0.07 });
const day = (i, t, level, color) => {
  tl.to(`#days .d:nth-child(${i}) i`, { scaleX: 1, duration: 0.5, ease: "inout" }, t);
  tl.to(`#days .d:nth-child(${i}) span`, { color: "#0d1b2a", duration: 0.3 }, t + 0.2);
  tl.to("#battery .fill", { scaleX: level, backgroundColor: color, duration: 0.7, ease: "inout" }, t);
};
// hari 1: fokus turun, emosi meledak
day(1, V(33.84), 0.66, "#ffd23d");
pop(V(34.84), "#chips1 .pill:nth-child(1)", { y: 20 });
pop(V(36.0), "#chips1 .pill:nth-child(2)", { y: 20 });
tl.to("#browL", { rotation: 14, svgOrigin: "452 766", duration: 0.3 }, V(36.0));
tl.to("#browR", { rotation: -14, svgOrigin: "628 766", duration: 0.3 }, V(36.0));
fade(V(36.0), "#mouthN", 0, 0.2); fade(V(36.0), "#mouthF", 1, 0.2);
pop(V(37.08), "#anger", { origin: "740 640", y: 0, s: 0.8, d: 0.4 });
tl.to("#face", { x: 12, duration: 0.05, repeat: 9, yoyo: true, ease: "none" }, V(37.08));
// hari 2: tidur mikro
hide(V(38.0), ["#chips1 .pill", "#anger"]);
tl.to(["#browL", "#browR"], { rotation: 0, duration: 0.4 }, V(38.0));
fade(V(38.0), "#mouthF", 0, 0.2); fade(V(38.0), "#mouthN", 1, 0.2);
day(2, V(38.08), 0.33, "#ff9a3d");
tl.to(["#lidL", "#lidR"], { scaleY: 0.45, duration: 0.6, ease: "inout" }, V(38.4));
fade(V(38.4), "#bags", 0.75, 0.6);
pop(V(39.24), "#chips2 .pill", { y: 20 });
tl.fromTo("#zzz", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: -10, duration: 0.8 }, V(39.6));
// mata tertutup -> layar gelap sejenak (microsleep)
tl.to(["#lidL", "#lidR"], { scaleY: 1, duration: 0.25, ease: "inout" }, V(40.0));
tl.to("#blackout", { autoAlpha: 0.94, duration: 0.15, ease: "out" }, V(40.2));
pop(V(40.3), "#msLabel", { y: 20, d: 0.5 });
hide(V(41.1), "#msLabel", { d: 0.2, y: 0 });
tl.to("#blackout", { autoAlpha: 0, duration: 0.2, ease: "out" }, V(41.15));
tl.to(["#lidL", "#lidR"], { scaleY: 0.5, duration: 0.18, ease: "out" }, V(41.2));
tl.fromTo("#face", { y: 0 }, { y: -14, duration: 0.12, yoyo: true, repeat: 1, ease: "out" }, V(41.2));
tl.to(["#lidL", "#lidR"], { scaleY: 1, duration: 0.2, ease: "inout" }, V(42.1));
tl.to("#blackout", { autoAlpha: 0.9, duration: 0.12 }, V(42.25));
tl.to("#blackout", { autoAlpha: 0, duration: 0.2 }, V(42.65));
tl.to(["#lidL", "#lidR"], { scaleY: 0.55, duration: 0.18 }, V(42.7));
// hari 3: halusinasi, sulit mikir, imun anjlok
hide(V(43.7), ["#chips2 .pill", "#zzz"]);
day(3, V(43.84), 0.08, "#ff5a4e");
tl.to("#battery", { opacity: 0.35, duration: 0.25, repeat: 11, yoyo: true, ease: "none" }, V(44.6));
tl.to(["#lidL", "#lidR"], { scaleY: 0.68, duration: 0.5 }, V(44.2));
pop(V(45.44), "#chips3 .pill:nth-child(1)", { y: 20 });
tl.fromTo(blobs, { autoAlpha: 0, scale: 0.8, transformOrigin: "50% 50%" }, { autoAlpha: 1, scale: 1, duration: 0.6, stagger: 0.08 }, V(45.44));
blobs.forEach((b, i) => tl.to(b, { x: (i % 2 ? -1 : 1) * 50, y: (i % 3 ? 1 : -1) * 40, scale: 1.25, duration: 1.1, repeat: 3, yoyo: true, ease: "inout" }, V(45.8) + i * 0.1));
tl.to("#face", { skewX: 5, svgOrigin: "540 860", duration: 0.55, repeat: 7, yoyo: true, ease: "inout" }, V(45.8));
pop(V(46.68), "#chips3 .pill:nth-child(2)", { y: 20 });
tl.to("#face", { filter: "blur(6px)", duration: 0.5, yoyo: true, repeat: 1, ease: "inout" }, V(46.9));
pop(V(48.24), "#chips3 .pill:nth-child(3)", { y: 20 });
// keluar
tl.to("#s2", { autoAlpha: 0, duration: 0.6 }, V(49.9) + 0.15);

/* OUTRO */
fade(52.4, "#bgNight", 0, 1.0);
fade(52.4, "#bgOutro", 1, 1.0);
fade(52.4, "#stars", 0, 0.6);
pop(52.8, "#oSun", { origin: "860 250", y: 0, s: 0.85, d: 0.9 });
pop(53.0, "#oMoon", { origin: "184 1012", y: 0, s: 0.85, d: 0.9 });
pop(V(51.04), "#outro .t1 span", { st: 0.28, y: 50 });
pop(V(52.75), "#outro .t2 span", { st: 0.2, y: 50 });
pop(V(53.7), "#outro .bed", { y: 30 });
tl.fromTo("#oz1", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: -30, duration: 1.0 }, V(54.0));
tl.fromTo("#oz2", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: -40, duration: 1.0 }, V(54.2));
pop(58.0, "#outro .brand", { y: 20 });
tl.to("#cap", { autoAlpha: 0, duration: 0.4 }, 58.3);
tl.set({}, {}, TOTAL);

/* ---------- captions (karaoke per kata, deterministik) ---------- */
const W = WORDS.map(([w, s, e]) => ({ w, s: V(s), e: V(e) }));
const phrases = [];
let cur = [];
W.forEach(w => { cur.push(w); if (/[.,!?:]$/.test(w.w) || cur.map(x => x.w).join(' ').length >= 26) { phrases.push(cur); cur = []; } });
if (cur.length) phrases.push(cur);
phrases.forEach((p, i) => { p.start = p[0].s - 0.05; p.end = i < phrases.length - 1 ? Math.min(phrases[i + 1][0].s - 0.05, p[p.length - 1].e + 0.9) : p[p.length - 1].e + 1.2; });
const box = $("#cap .box");
let shown = -1;
const ease = CustomEase.get("out");
function renderCap(t) {
  const idx = phrases.findIndex(p => t >= p.start && t < p.end);
  if (idx < 0) { box.style.visibility = "hidden"; shown = -1; return; }
  box.style.visibility = "visible";
  const p = phrases[idx];
  if (idx !== shown) { box.innerHTML = p.map(w => `<span class="w">${w.w}</span>`).join(" "); shown = idx; }
  const spans = box.children;
  let now = -1;
  p.forEach((w, i) => { if (t >= w.s - 0.03) now = i; });
  p.forEach((w, i) => { spans[i].className = "w" + (i < now ? " on" : i === now ? " now" : ""); });
  const k = ease(Math.min(1, Math.max(0, (t - p.start) / 0.25)));
  box.style.opacity = k;
  box.style.transform = `translateY(${(1 - k) * 16}px) scale(${0.97 + 0.03 * k})`;
}

/* ---------- icons + API ---------- */
async function loadIcons() {
  await Promise.all($$("[data-icon]").map(async el => {
    const r = await fetch(`/assets/icons/lucide/${el.dataset.icon}.svg`);
    el.innerHTML = (await r.text()).replace(/<!--.*?-->/s, "");
  }));
}
window.seek = t => { tl.time(t, false); renderCap(t); };
window.READY = Promise.all([loadIcons(), document.fonts.ready]).then(() => { window.seek(0); return TOTAL; });

// Preview di browser: klik stage untuk memutar dengan audio final.
if (!/render/.test(location.search)) {
  const fit = () => { const s = Math.min(innerWidth / 1080, innerHeight / 1920); $("#stage").style.transform = `scale(${s})`; $("#stage").style.transformOrigin = "0 0"; };
  fit(); addEventListener("resize", fit);
  const audio = new Audio("audio-final.mp3");
  $("#stage").addEventListener("click", () => {
    audio.currentTime = 0; audio.play();
    const loop = () => { window.seek(audio.currentTime); if (!audio.paused) requestAnimationFrame(loop); };
    loop();
  });
}
