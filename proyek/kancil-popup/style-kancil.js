{
  // ---------------------------------------------------------------- content (change this block for a new story)
  // Kancil dan Buaya as a pop-up book. Three spreads: the hungry kancil on the bank with the river (and a crocodile)
  // between him and the fruit tree; the trick ("line up, I'll count you!" on the king's orders); the crocodiles lined
  // up as a bridge, and a pull tab that makes kancil hop across their backs while number tags pop up, 1 to 4, until
  // he stands under the fruit tree on the far bank.
  // Fold mechanisms are the reference's ('v', 'box', 'float') plus two:
  //   fold 'rider'  a cut-out that travels along a V-fold wall (crossing its crease), driven by path(t) -> {x, y, q}
  //   fold 'tag'    a card that rises up through a slit in the page just behind a V-fold wall, driven by show(t) 0..1
  const C = { card: '#f5ecd9', cream: '#fbf3df', navy: '#22364e', coral: '#e2604a', pink: '#f3ab99', yellow: '#f5bd35', amber: '#cf7d22', leaf: '#74a25e', sage: '#a6c787', deep: '#2f6753', sky: '#cfe5df',
    river: '#4c91a7', riverL: '#86bfc9', foam: '#e6f3ef', croc: '#5a8240', crocD: '#2f5230', crocL: '#9ab960', deer: '#b9682d', deerD: '#6f3b1b', bark: '#7b4b2a', fruit: '#d8402e', grassF: '#cfe3ad' };
  const PAGE_W = 5.6, PAGE_D = 6.4;
  const TURN = 1.25, TURNS = [-1.03, 2.5, 5.3];       // the first turn is under way on frame one
  const PULL = [7.0, 9.9];                            // the pull tab slides out; kancil hops across in five hops
  const DURATION = 11.5;
  const pulled = (t) => K.seg(t, PULL[0], PULL[1], K.ease.inOut);

  // the hop schedule (picture and sound both read it): stops on the left bank, four crocodile backs, the right bank
  const STOPS = [[-4.15, 1.0], [-2.5, 0.98], [-0.83, 0.98], [0.83, 0.98], [2.5, 0.98], [3.85, 1.0]];
  const HOP = (PULL[1] - PULL[0]) / 5, AIR = 0.74;
  const landAt = (k) => PULL[0] + (k + AIR) * HOP;     // landing of hop k (k = 0..3 on crocodile k + 1, k = 4 on the far bank)
  const takeoff = (k) => PULL[0] + k * HOP;
  const hop = (t) => {
    const u = (t - PULL[0]) / HOP;
    if (u <= 0) return { x: STOPS[0][0], y: STOPS[0][1], q: 0 };
    if (u >= 5) return { x: STOPS[5][0], y: STOPS[5][1], q: 0 };
    const k = Math.floor(u), f = K.clamp((u - k) / AIR), e = K.ease.inOut(f), a = STOPS[k], b = STOPS[k + 1];
    const settle = f >= 1 ? -0.035 * Math.exp(-((u - k) - AIR) * HOP * 14) * Math.sin(((u - k) - AIR) * HOP * 30) : 0;   // a little dip as he lands
    return { x: K.lerp(a[0], b[0], e), y: K.lerp(a[1], b[1], e) + 0.62 * Math.sin(Math.PI * f) + settle, q: 0.34 * Math.cos(Math.PI * f) * Math.sin(Math.PI * f) * 2 };
  };
  const tagShow = (k) => (t) => K.clamp(K.spring(t - landAt(k) - 0.03, 2.4, 0.42), 0, 1.2);

  // ---- small printed motifs
  const leaf = (a, x, y, len, q, col = C.leaf) => a.path(col, (c) => { const ex = x + Math.cos(q) * len, ey = y + Math.sin(q) * len; c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(q + 0.7) * len * 0.62, y + Math.sin(q + 0.7) * len * 0.62, ex, ey); c.quadraticCurveTo(x + Math.cos(q - 0.7) * len * 0.62, y + Math.sin(q - 0.7) * len * 0.62, x, y); });
  const grass = (a, x0, x1, h, col, seed) => a.path(col, (c) => { const r = K.rng(seed); c.moveTo(x0, -0.1); for (let x = x0; x < x1 - 0.05;) { const w = r.range(0.13, 0.24); c.lineTo(x + w * r.range(0.2, 0.8), h * r.range(0.75, 1.5)); x += w; c.lineTo(Math.min(x, x1), h * 0.5); } c.lineTo(x1, -0.1); });
  const water = (a, x0, x1, h, seed = 1) => {
    a.path(C.river, (c) => { c.moveTo(x0, -0.1); for (let x = x0; x <= x1 + 1e-6; x += 0.05) c.lineTo(x, h + 0.045 * Math.sin(x * 7 + seed)); c.lineTo(x1, -0.1); });
    for (let k = 0; k < 2; k++) a.line(k ? C.riverL : C.foam, 0.035, (c) => { const y = h - 0.09 - k * 0.11; let first = true; for (let x = x0 + 0.12; x <= x1 - 0.12; x += 0.05) { const yy = y + 0.03 * Math.sin(x * 6 + seed + k * 2); if (first) { c.moveTo(x, yy); first = false; } else c.lineTo(x, yy); } }, [0.22, 0.16]);
  };
  const mound = (a, x0, x1, h, seed) => { a.path(C.leaf, (c) => { c.moveTo(x0, -0.1); c.bezierCurveTo(x0, h * 1.1, x1, h * 1.1, x1, -0.1); }); grass(a, x0 + 0.05, x1 - 0.05, h * 0.55, C.deep, seed); };
  // kancil, the mouse-deer: feet at (x, y), about 1.25 * s tall, facing +x (face = -1 turns him round)
  const deer = (a, x, y, s, face = 1, o = {}) => {
    const c = a.ctx; c.save(); c.translate(x, y); c.scale(s * face, s);
    const L = (x0, y0, x1, y1, col, xm, ym) => a.line(col, 0.075, (p) => { p.moveTo(x0, y0); if (xm != null) p.quadraticCurveTo(xm, ym, x1, y1); else p.lineTo(x1, y1); });
    L(-0.27, 0.52, -0.33, 0.03, C.deerD); L(0.22, 0.52, 0.26, 0.03, C.deerD);                       // far legs, in shadow
    L(-0.18, 0.52, -0.17, 0.03, C.deer);
    if (o.raise) L(0.32, 0.55, 0.63, 0.52, C.deer, 0.55, 0.36); else L(0.33, 0.52, 0.36, 0.03, C.deer);  // near front leg, raised to point
    [[-0.33, 0.02], [0.26, 0.02], [-0.17, 0.02]].concat(o.raise ? [[0.64, 0.52]] : [[0.36, 0.02]]).forEach(([hx, hy]) => a.disc(C.navy, hx, hy, 0.045, 0.035));
    a.disc(C.deer, -0.45, 0.67, 0.09, 0.05, 0.7); a.disc(C.cream, -0.48, 0.65, 0.045, 0.03, 0.7);   // tail
    a.disc(C.deer, 0, 0.62, 0.46, 0.21, 0.04);                                                       // body
    a.disc(C.deerD, -0.05, 0.72, 0.36, 0.07, 0.04);                                                  // darker back
    a.disc(C.cream, 0.04, 0.51, 0.3, 0.075);                                                          // belly
    a.path(C.deer, (p) => { p.moveTo(0.2, 0.74); p.quadraticCurveTo(0.36, 0.98, 0.48, 1.04); p.lineTo(0.62, 0.95); p.quadraticCurveTo(0.5, 0.74, 0.42, 0.52); });   // neck
    a.line(C.cream, 0.035, (p) => { p.moveTo(0.46, 0.6); p.lineTo(0.55, 0.86); }); a.line(C.cream, 0.035, (p) => { p.moveTo(0.38, 0.62); p.lineTo(0.47, 0.88); });   // the throat stripes of a kancil
    a.disc(C.deer, 0.58, 1.02, 0.155, 0.12, -0.25); a.disc(C.deer, 0.76, 0.95, 0.11, 0.066, -0.35); a.disc(C.navy, 0.85, 0.925, 0.036);   // head, snout, nose
    a.disc(C.deerD, 0.46, 1.17, 0.052, 0.12, 0.45); a.disc(C.pink, 0.468, 1.16, 0.026, 0.07, 0.45);   // ear
    a.disc(C.navy, 0.61, 1.05, 0.038); a.disc(C.cream, 0.62, 1.065, 0.013);                           // eye
    if (o.smile) a.line(C.navy, 0.022, (p) => { p.moveTo(0.73, 0.9); p.quadraticCurveTo(0.78, 0.87, 0.83, 0.895); });
    c.restore();
  };
  // a crocodile lying in the water, side on: centre x, water line wl, length len, facing +x (face = -1: left)
  const croc = (a, x, wl, len, face = 1, s = 1) => {
    const c = a.ctx; c.save(); c.translate(x, wl); c.scale(face * s, s);
    const hx = -0.05 * len, rx = 0.37 * len, top = (u) => 0.21 * Math.sqrt(Math.max(0, 1 - Math.pow((u - hx) / rx, 2)));
    a.path(C.croc, (p) => { p.moveTo(-0.36 * len, 0); p.quadraticCurveTo(-0.5 * len, 0.03, -0.58 * len, 0.1); p.quadraticCurveTo(-0.46 * len, 0.1, -0.33 * len, 0.1); });   // tail
    a.disc(C.croc, hx, 0, rx, 0.21);                                                                  // back
    for (let u = hx - rx * 0.8; u < hx + rx * 0.82; u += 0.11) a.path(C.crocD, (p) => { const y = top(u) - 0.02; p.moveTo(u - 0.04, y); p.lineTo(u, y + 0.07); p.lineTo(u + 0.04, y); });   // scutes
    a.disc(C.crocL, hx, 0.05, rx * 0.8, 0.05);
    a.box(C.croc, 0.18 * len, -0.06, 0.34 * len, 0.17, [0.02, 0.09, 0.09, 0.02]);                     // long snout
    a.disc(C.croc, 0.49 * len, 0.12, 0.04); a.disc(C.crocD, 0.495 * len, 0.13, 0.016);                // nostril
    for (let u = 0.22 * len; u < 0.48 * len; u += 0.075) a.path(C.cream, (p) => { p.moveTo(u, 0.04); p.lineTo(u + 0.022, -0.01); p.lineTo(u + 0.044, 0.04); });   // teeth
    a.disc(C.croc, 0.2 * len, 0.17, 0.095); a.disc(C.yellow, 0.21 * len, 0.18, 0.05); a.box(C.navy, 0.21 * len - 0.01, 0.14, 0.02, 0.08, 0.01);   // eye
    c.restore();
  };
  // the big crocodile of spread 2: head rising out of the water with its jaws open, facing -x
  const bigCroc = (a, x, wl, s) => {
    const c = a.ctx; c.save(); c.translate(x, wl); c.scale(-s, s);
    a.disc(C.croc, -0.75, 0.05, 0.75, 0.36);                                                          // neck and back
    for (let u = -1.35; u < -0.15; u += 0.16) a.path(C.crocD, (p) => { const y = 0.36 * Math.sqrt(Math.max(0, 1 - Math.pow((u + 0.75) / 0.75, 2))) - 0.03; p.moveTo(u - 0.06, y); p.lineTo(u, y + 0.11); p.lineTo(u + 0.06, y); });
    a.path(C.croc, (p) => { p.moveTo(-0.3, 0); p.lineTo(1.3, 0.06); p.quadraticCurveTo(1.38, 0.14, 1.28, 0.22); p.lineTo(-0.15, 0.36); });   // lower jaw
    a.path(C.pink, (p) => { p.moveTo(-0.1, 0.32); p.lineTo(1.2, 0.2); p.lineTo(1.15, 0.5); p.lineTo(-0.05, 0.5); });   // mouth
    for (let u = 0.15; u < 1.15; u += 0.13) a.path(C.cream, (p) => { const y = 0.33 - 0.12 * (u / 1.2); p.moveTo(u, y - 0.01); p.lineTo(u + 0.04, y + 0.1); p.lineTo(u + 0.08, y - 0.015); });   // bottom teeth
    c.save(); c.translate(-0.1, 0.42); c.rotate(0.42);
    a.box(C.croc, -0.15, -0.05, 1.5, 0.26, [0.05, 0.12, 0.12, 0.05]);                                 // upper jaw
    for (let u = 0.15; u < 1.25; u += 0.13) a.path(C.cream, (p) => { p.moveTo(u, -0.03); p.lineTo(u + 0.04, -0.14); p.lineTo(u + 0.08, -0.03); });
    a.disc(C.croc, 1.3, 0.24, 0.07); a.disc(C.crocD, 1.31, 0.26, 0.025);
    for (let u = 0.2; u < 1.1; u += 0.24) a.disc(C.crocD, u, 0.12, 0.035);
    c.restore();
    a.disc(C.croc, 0.02, 0.62, 0.2); a.disc(C.yellow, 0.05, 0.66, 0.11); a.box(C.navy, 0.03, 0.57, 0.045, 0.18, 0.02);   // eye
    c.restore();
  };
  // a fruit tree (rambutan-red fruit), trunk foot at (x, 0), canopy top near h
  const fruitTree = (a, x, h, w, seed) => {
    const r = K.rng(seed);
    a.path(C.bark, (c) => { c.moveTo(x - 0.16, -0.1); c.quadraticCurveTo(x - 0.06, h * 0.4, x - 0.14, h * 0.62); c.lineTo(x + 0.12, h * 0.62); c.quadraticCurveTo(x + 0.04, h * 0.4, x + 0.18, -0.1); });
    a.line(C.bark, 0.08, (c) => { c.moveTo(x, h * 0.48); c.lineTo(x + w * 0.35, h * 0.68); }); a.line(C.bark, 0.08, (c) => { c.moveTo(x, h * 0.42); c.lineTo(x - w * 0.32, h * 0.64); });
    [[0, 0.74, 0.5, C.deep], [-0.45, 0.66, 0.36, C.deep], [0.45, 0.66, 0.36, C.deep], [-0.22, 0.8, 0.38, C.leaf], [0.25, 0.79, 0.38, C.leaf], [0, 0.88, 0.3, C.sage]].forEach(([dx, dy, rr, col]) => a.disc(col, x + dx * w, h * dy, rr * w, rr * w * 0.82));
    for (let i = 0; i < 14; i++) { const fx = x + r.range(-0.62, 0.62) * w, fy = h * r.range(0.6, 0.92); a.disc(C.fruit, fx, fy, 0.085 * w + 0.02); a.disc('#f2876c', fx - 0.025, fy + 0.03, 0.025); }
  };
  const palm = (a, x, h, lean, seed) => {
    const tx = x + lean, ty = h;
    a.line(C.bark, 0.11, (c) => { c.moveTo(x, -0.05); c.quadraticCurveTo(x + lean * 0.2, h * 0.5, tx, ty); });
    [0.3, 0.9, 1.6, 2.3, 2.85, -0.25].forEach((q, i) => leaf(a, tx, ty, 0.62 + 0.1 * (i % 2), q, i % 2 ? C.deep : C.leaf));
    a.disc(C.bark, tx + 0.06, ty - 0.08, 0.07); a.disc(C.bark, tx - 0.07, ty - 0.1, 0.07);
  };
  const reeds = (a, x0, x1, h, seed) => {
    const r = K.rng(seed);
    for (let x = x0 + 0.1; x < x1 - 0.05; x += r.range(0.16, 0.26)) { const hh = h * r.range(0.6, 1), bend = r.range(-0.15, 0.15); a.line(r.chance(0.5) ? C.deep : C.leaf, 0.06, (c) => { c.moveTo(x, 0); c.quadraticCurveTo(x + bend, hh * 0.5, x + bend * 1.6, hh); }); if (r.chance(0.45)) a.disc(C.bark, x + bend * 1.5, hh - 0.12, 0.055, 0.15, -bend); }
    grass(a, x0, x1, 0.3, C.deep, seed + 1);
  };
  const hills = (a, x0, x1, seed) => {
    const far = (x) => 1.55 + 0.4 * Math.cos((x + seed) * 0.6), near = (x) => 0.85 + 0.25 * Math.cos((x - seed) * 0.75);
    a.ridge(C.sage, x0, x1, far); a.ridge(C.leaf, x0, x1, near);
    return { far, near };
  };
  const riverMouth = (a, h) => { a.path(C.river, (c) => { c.moveTo(-1.35, -0.1); c.quadraticCurveTo(-0.35, h * 0.35, -0.12, h); c.lineTo(0.12, h); c.quadraticCurveTo(0.35, h * 0.35, 1.35, -0.1); }); a.line(C.foam, 0.035, (c) => { c.moveTo(-0.4, 0.15); c.quadraticCurveTo(-0.1, 0.4, -0.03, h - 0.05); }, [0.12, 0.12]); };
  // the printed floor: grass on both banks and the river running down the gutter toward the reader
  const riverFloor = (a, seed, extra) => {
    a.box(C.grassF, -5.42, -3.02, 10.84, 6.04, 0.45);
    a.clip((c) => c.roundRect(-5.42, -3.02, 10.84, 6.04, 0.45), () => {
      const bank = (y, s) => s * (1.55 + 0.28 * Math.sin(y * 1.2 + seed * s));
      a.path(C.river, (c) => { c.moveTo(bank(3.2, -1), 3.2); for (let y = 3.2; y >= -3.2; y -= 0.1) c.lineTo(bank(y, -1), y); for (let y = -3.2; y <= 3.2; y += 0.1) c.lineTo(bank(y, 1), y); });
      for (let k = 0; k < 9; k++) { const y = -2.8 + k * 0.7, x = K.lerp(-0.9, 0.9, K.hash(k, seed)); a.line(C.riverL, 0.05, (c) => { c.moveTo(x - 0.3, y); c.quadraticCurveTo(x, y + 0.08, x + 0.3, y); }); }
      const r = K.rng(seed); for (let i = 0; i < 40; i++) { const s = r.sign(), y = r.range(-2.9, 2.9), x = s * r.range(bank(y, 1) + 0.25, 5.2); const col = r.pick([C.cream, C.yellow, C.pink]); for (let q = 0; q < 5; q++) a.disc(col, x + 0.07 * Math.cos(q * 1.257), y + 0.07 * Math.sin(q * 1.257), 0.05); a.disc(C.amber, x, y, 0.03); }
      for (let i = 0; i < 5; i++) { const y = r.range(-2.4, 2.6), x = r.range(-0.9, 0.9); a.disc(C.leaf, x, y, 0.2, 0.16); a.path(C.river, (c) => { c.moveTo(x, y); c.lineTo(x + 0.22, y + 0.06); c.lineTo(x + 0.22, y - 0.06); }); }
      if (extra) extra(a, bank);
    });
  };
  const stepNo = (a, n) => { a.disc(C.coral, -3.5, -2.45, 0.46); a.disc(C.cream, -3.5, -2.45, 0.37); a.text(String(n), -3.5, -2.68, 0.66, C.navy); };
  const arm = (a, pts) => { a.line(C.cream, 0.13, (c) => { c.moveTo(pts[0], pts[1]); c.quadraticCurveTo(pts[2], pts[3], pts[4], pts[5]); }); a.line(C.navy, 0.045, (c) => { c.moveTo(pts[0], pts[1]); c.quadraticCurveTo(pts[2], pts[3], pts[4], pts[5]); }, [0.1, 0.12]); };
  const crown = (a, x, y, s) => { a.path(C.yellow, (c) => { c.moveTo(x - 0.5 * s, y); c.lineTo(x - 0.55 * s, y + 0.5 * s); c.lineTo(x - 0.27 * s, y + 0.25 * s); c.lineTo(x, y + 0.62 * s); c.lineTo(x + 0.27 * s, y + 0.25 * s); c.lineTo(x + 0.55 * s, y + 0.5 * s); c.lineTo(x + 0.5 * s, y); }); a.box(C.amber, x - 0.5 * s, y - 0.02, s, 0.12 * s, 0.02); [-0.55, 0, 0.55].forEach((d, i) => a.disc(i === 1 ? C.coral : C.cream, x + d * s, y + (i === 1 ? 0.64 : 0.52) * s, 0.07 * s)); a.disc(C.coral, x, y + 0.2 * s, 0.07 * s); };

  const SPREADS = [
    { // ------------------------------------------------------------ 1. kancil on the bank, hungry; the river and a crocodile in between
      words: ['Kancil ingin', 'menyeberang.'],
      floor(a) { riverFloor(a, 1); stepNo(a, 1); },
      parts: [
        { id: 'far', fold: 'v', z: -1.0, alpha: 76, size: [9.8, 3.2], art(a) {
          a.disc(C.yellow, -2.2, 1.95, 0.9); a.disc('#f9d46c', -2.2, 1.95, 0.62);
          palm(a, -3.9, 2.3, 0.3, 1); palm(a, -3.15, 1.85, -0.25, 2);
          hills(a, -4.9, 4.9, 1.2);
          fruitTree(a, 2.0, 2.0, 0.8, 5); fruitTree(a, 3.4, 2.3, 0.95, 6);
          riverMouth(a, 0.85);
        } },
        { fold: 'box', on: 'far', span: [-4.6, -2.5], depth: 1.35, strap: 0.75, height: 1.9, art(a) { reeds(a, -4.55, -2.55, 1.75, 11); } },
        { fold: 'box', on: 'far', span: [2.45, 4.65], depth: 1.25, strap: 0.7, height: 2.45, art(a) { grass(a, 2.5, 4.6, 0.3, C.deep, 3); fruitTree(a, 3.55, 2.3, 1.0, 9); } },
        { id: 'bank', fold: 'v', z: 0.7, alpha: 58, size: [5.0, 2.55], art(a) {
          water(a, -0.5, 2.4, 0.42, 1);
          mound(a, -2.45, -0.15, 0.62, 4);
          deer(a, -1.3, 0.5, 1.25, 1);
          reeds(a, 1.7, 2.4, 0.9, 21);
        } },
        { fold: 'float', on: 'bank', side: 1, at: [1.05, 0.5], gap: 0.3, sway: 1, area: [0.05, 0.1, 2.1, 1.25], art(a) {   // a crocodile peeking out, just its eyes and snout
          a.path(C.river, (c) => c.roundRect(0.15, 0.2, 1.8, 0.4, 0.1));
          const c = a.ctx; c.save(); c.translate(1.05, 0.6); c.scale(-1.3, 1.3);
          a.disc(C.croc, 0, 0, 0.7, 0.12); a.box(C.croc, 0.2, -0.04, 0.68, 0.12, 0.05); a.disc(C.croc, 0.86, 0.08, 0.05);
          [-0.05, 0.14].forEach((d) => { a.disc(C.croc, d, 0.12, 0.11); a.disc(C.yellow, d + 0.01, 0.14, 0.06); a.box(C.navy, d, 0.09, 0.022, 0.1, 0.01); });
          c.restore();
          a.path(C.river, (c) => { c.moveTo(0.15, 0.25); for (let x = 0.15; x <= 1.95; x += 0.05) c.lineTo(x, 0.58 + 0.04 * Math.sin(x * 8)); c.lineTo(1.95, 0.25); c.closePath(); });
          a.line(C.foam, 0.035, (c) => { c.moveTo(0.35, 0.45); c.lineTo(1.75, 0.45); }, [0.2, 0.14]);
        } },
      ],
    },
    { // ------------------------------------------------------------ 2. the trick: "line up, I'll count you!"
      words: ['“Berbaris!', 'Kuhitung!”'],
      floor(a) { riverFloor(a, 2, (a2) => { for (let i = 0; i < 6; i++) { const x = -0.8 + 0.32 * (i % 3) + 0.15 * Math.floor(i / 3), y = -2.2 + i * 0.85; a2.disc(C.croc, x, y, 0.28, 0.1); a2.disc(C.croc, x - 0.07, y + 0.08, 0.06); a2.disc(C.croc, x + 0.07, y + 0.08, 0.06); a2.disc(C.yellow, x - 0.07, y + 0.09, 0.03); a2.disc(C.yellow, x + 0.07, y + 0.09, 0.03); } }); stepNo(a, 2); },
      parts: [
        { id: 'far', fold: 'v', z: -1.0, alpha: 76, size: [9.8, 3.1], art(a) {
          palm(a, -4.0, 2.2, 0.25, 3); palm(a, 3.9, 2.25, -0.3, 4);
          hills(a, -4.9, 4.9, 2.6);
          water(a, -4.8, 4.8, 0.62, 2);
          [-3.3, -2.1, -0.9, 0.6, 1.8, 3.0].forEach((x, i) => { const y = 0.5 + 0.06 * (i % 2); a.disc(C.croc, x, y, 0.42, 0.12); [-0.12, 0.12].forEach((d) => { a.disc(C.croc, x + d, y + 0.1, 0.09); a.disc(C.yellow, x + d, y + 0.12, 0.05); a.box(C.navy, x + d - 0.01, y + 0.08, 0.02, 0.08, 0.01); }); });   // crocodiles gathering
          water(a, -4.8, 4.8, 0.4, 5);
        } },
        { fold: 'box', on: 'far', span: [-4.6, -2.6], depth: 1.3, strap: 0.7, height: 1.8, art(a) { reeds(a, -4.55, -2.65, 1.65, 31); } },
        { fold: 'box', on: 'far', span: [2.6, 4.6], depth: 1.2, strap: 0.7, height: 1.7, art(a) { reeds(a, 2.65, 4.55, 1.55, 41); } },
        { id: 'face', fold: 'v', z: 0.7, alpha: 58, size: [5.6, 2.75], art(a) {
          bigCroc(a, 1.45, 0.38, 0.95);
          water(a, -0.4, 2.75, 0.4, 4);
          mound(a, -2.75, -0.2, 0.62, 6);
          deer(a, -1.75, 0.5, 1.2, 1, { raise: true, smile: true });
        } },
        { fold: 'float', on: 'face', side: -1, at: [-2.5, 0.95], gap: 0.3, sway: 1, area: [-2.75, 0.8, -0.6, 3.25], art(a) {   // the king's order: a scroll with a crown, on an arm behind kancil's tail
          arm(a, [-2.5, 0.95, -2.65, 1.75, -2.0, 2.3]);
          a.box(C.cream, -2.05, 2.15, 1.3, 0.95, 0.06); a.disc(C.amber, -2.05, 2.62, 0.08, 0.5); a.disc(C.amber, -0.75, 2.62, 0.08, 0.5);
          crown(a, -1.4, 2.45, 0.6);
          a.box(C.navy, -1.85, 2.27, 0.9, 0.045); a.box(C.navy, -1.85, 2.37, 0.6, 0.045);
        } },
      ],
    },
    { // ------------------------------------------------------------ 3. the crocodile bridge, and the far bank
      words: ['Satu, dua,', 'tiga, empat…'],
      floor(a) { riverFloor(a, 3); stepNo(a, 3); a.box(C.navy, 0.9, -2.66, 3.1, 0.075, 0.035); },
      parts: [
        { id: 'far', fold: 'v', z: -1.0, alpha: 76, size: [9.8, 3.2], art(a) {
          a.disc(C.yellow, -1.4, 2.2, 0.75); a.disc('#f9d46c', -1.4, 2.2, 0.5);
          palm(a, -4.0, 2.25, 0.3, 5); palm(a, -3.2, 1.8, -0.2, 6);
          hills(a, -4.9, 4.9, 0.4);
          fruitTree(a, 1.6, 1.9, 0.75, 12); fruitTree(a, 3.9, 2.4, 0.85, 13);
          riverMouth(a, 0.9);
        } },
        { fold: 'box', on: 'far', span: [-4.6, -2.7], depth: 1.3, strap: 0.7, height: 1.55, art(a) { reeds(a, -4.55, -2.75, 1.4, 51); } },
        { fold: 'box', on: 'far', span: [2.35, 4.65], depth: 1.3, strap: 0.7, height: 2.7, art(a) { grass(a, 2.4, 4.6, 0.32, C.deep, 8); fruitTree(a, 3.5, 2.6, 1.08, 14); } },
        { id: 'bridge', fold: 'v', z: 0.45, alpha: 80, size: [10.0, 1.5], art(a) {
          water(a, -3.6, 3.6, 0.8, 6);
          [-2.5, -0.83, 0.83, 2.5].forEach((x) => croc(a, x, 0.72, 1.02, 1, 1.5));
          water(a, -3.6, 3.6, 0.6, 7);
          mound(a, -4.95, -3.3, 1.22, 61); mound(a, 3.2, 4.95, 1.22, 62);
        } },
        { fold: 'rider', on: 'bridge', gap: 0.16, path: hop, area: [-0.6, -0.1, 1.6, 1.45], art(a) { deer(a, 0, 0, 0.95, 1); } },
        ...[0, 1, 2, 3].map((k) => ({ fold: 'tag', on: 'bridge', x: STOPS[k + 1][0] - 0.38, show: tagShow(k), art(a) {
          a.box(C.cream, -0.06, -0.1, 0.12, 2.5, 0.03);
          a.disc(C.coral, 0, 2.7, 0.36); a.disc(C.cream, 0, 2.7, 0.285); a.text(String(k + 1), 0, 2.53, 0.5, C.navy);
        } })),
      ],
    },
  ];

  // ---------------------------------------------------------------- the book's clock (picture and sound both read it)
  const flip = (t, t0) => { const u = (t - t0) / TURN; if (u <= 0) return 0; if (u < 1) return Math.PI * u * u * (2.2 - 1.2 * u); const v = t - t0 - TURN; return Math.PI - 0.034 * Math.abs(Math.sin(v * 11)) * Math.exp(-v * 6); };
  const landed = (s) => TURNS[s] + TURN;

  window.STYLE = registerStyle({
    id: 'paper-pop-up-kancil',
    name: 'Paper Pop-Up',
    family: 'Material worlds',
    look: 'A pop-up book open on a wooden table in lamplight. Every scene is built from flat die-cut card: printed in a few flat colours, creased down the middle, standing in layers on real fold mechanisms, with a pale core showing on every cut edge.',
    motion: 'Only the pages move. As a page turns, the scene on the old spread is pressed flat under it and the next one is pulled up out of the gutter by its own folds, layer after layer; pieces on paper arms tremble when the page lands. A pull tab slides out to change one thing on the last spread.',
    light: 'One warm desk lamp from the upper left with soft-edged shadows, so each layer throws a shadow on the one behind and the two wings of every fold take different light; a faint cool rim from behind; the table falls off into the dark.',
    materials: 'Thick uncoated card with visible fibre and a slight cockle, flat matt ink with a little grain, bare cream card on cut edges and as a thin margin around each shape, cloth-covered boards, dark oiled wood.',
    camera: 'A long lens looking down the gutter from about twenty-five degrees up, close enough that the spread fills the frame. One slow drift from left to right that breathes out a little for each page turn and ends in a gentle push; shallow focus on the middle layers.',
    post: 'Real depth of field, motion blur and area-light shadows from the accumulation renderer; neutral tone mapping so the inks stay true, a soft vignette, very fine grain.',
    explains: 'A story in three spreads with a pull tab on the last.',
    topic: 'Kancil dan Buaya: kancil wants to cross the river, tricks the crocodiles into lining up to be counted, and hops across their backs to the fruit tree',
    duration: DURATION,
    fonts: ['700 100px "Fraunces"'],
    render: { samples: 56, shutter: 0.5, tone: 'neutral', exposure: 0.9, saturation: 1.1, bloom: 0.12, bloomThreshold: 1.1, vignette: 0.42, grain: 0.014, fov: 26, background: '#050403' },
    schedule: { TURNS, TURN, PULL, landAt, takeoff },

    build(S) {
      const { THREE, K, scene, camera } = S;
      S.renderer.localClippingEnabled = true;
      const add = (a, b, s = 1) => [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s], mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
      const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
      const unit = (a) => mul(a, 1 / Math.hypot(a[0], a[1], a[2])), rad = (d) => d * Math.PI / 180;

      // ------------------------------------------------------------ 1. paper
      const CARD_T = 0.03, LEAF_T = 0.045, PX = 150;
      const fibre = K.canvasTex(1024, 1024, (ctx, w, h) => {
        const n = K.noise(3), r = K.rng(8), im = ctx.createImageData(w, h);
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const v = 128 + 70 * n.fbm(x * 0.006, y * 0.006, 0, 2) + 34 * n.fbm(x * 0.05, y * 0.05, 3, 3) + 14 * (K.hash(x, y) - 0.5); im.data.set([v, v, v, 255], (y * w + x) * 4); }
        ctx.putImageData(im, 0, 0); ctx.lineCap = 'round';
        for (let i = 0; i < 5200; i++) { const x = r.range(0, w), y = r.range(0, h), q = r.range(0, 6.3), len = r.range(8, 34); ctx.strokeStyle = `rgba(255,255,255,${r.range(0.05, 0.3)})`; ctx.lineWidth = r.range(0.8, 1.8); ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(q + 0.6) * len * 0.5, y + Math.sin(q + 0.6) * len * 0.5, x + Math.cos(q) * len, y + Math.sin(q) * len); ctx.stroke(); }
      }, { data: true });
      fibre.wrapS = fibre.wrapT = THREE.RepeatWrapping;
      const bumpFor = (w, h) => { const b = fibre.clone(); b.repeat.set(w / 3.2, h / 3.2); b.needsUpdate = true; return b; };
      const speck = document.createElement('canvas'); speck.width = speck.height = 256;
      { const x = speck.getContext('2d'), im = x.createImageData(256, 256), r = K.rng(2); for (let i = 0; i < 65536; i++) { const v = 255 - 30 * Math.pow(r(), 3) - (r.chance(0.012) ? 60 : 0); im.data.set([v, v, v * 0.985, 255], i * 4); } x.putImageData(im, 0, 0); }
      const grain = (ctx, w, h) => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = ctx.createPattern(speck, 'repeat'); ctx.fillRect(0, 0, w, h); ctx.globalCompositeOperation = 'source-over'; };
      const paper = (map, w, h) => new THREE.MeshStandardMaterial({ map, bumpMap: bumpFor(w, h), bumpScale: 0.45, roughness: 0.93, metalness: 0 });
      const core = new THREE.MeshStandardMaterial({ color: '#fbf5e6', roughness: 0.95 });

      const pen = (ctx, back) => {
        const a = {
          ctx, back,
          path(col, fn) { ctx.fillStyle = col; ctx.beginPath(); fn(ctx); ctx.fill(); return a; },
          disc(col, x, y, rx, ry = rx, rot = 0) { return a.path(col, (c) => c.ellipse(x, y, rx, ry, rot, 0, 7)); },
          box(col, x, y, w, h, r = 0) { return a.path(col, (c) => c.roundRect(x, y, w, h, r)); },
          line(col, w, fn, dash) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = ctx.lineJoin = 'round'; ctx.setLineDash(dash || []); ctx.beginPath(); fn(ctx); ctx.stroke(); ctx.setLineDash([]); return a; },
          ridge(col, x0, x1, top, y0 = -0.1) { return a.path(col, (c) => { c.moveTo(x0, y0); for (let x = x0; x <= x1 + 1e-6; x += 0.1) c.lineTo(x, top(x)); c.lineTo(x1, y0); }); },
          clip(fn, inside) { ctx.save(); ctx.beginPath(); fn(ctx); ctx.clip(); inside(); ctx.restore(); return a; },
          text(str, x, y, size, col, align = 'center') { if (a.back) return a; ctx.save(); ctx.translate(x, y); ctx.scale(size / 100, -size / 100); ctx.font = '700 100px "Fraunces"'; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = col; ctx.fillText(str, 0, 0); ctx.restore(); return a; },
        };
        return a;
      };
      const ruler = document.createElement('canvas').getContext('2d'); ruler.font = '700 100px "Fraunces"';
      const widthOf = (str, size) => ruler.measureText(str).width * size / 100;

      // ------------------------------------------------------------ 2. the die-cutter
      function trace(f, w, h, level, i0, i1) {
        const at = (i, j) => (i < i0 || i > i1 || j < 0 || j >= h ? 0 : f[j * w + i]), EW = w + 3;
        const id = (i, j, upright) => ((j + 1) * EW + i + 1) * 2 + upright, next = new Map(), where = new Map();
        const SEG = [[], [3, 2], [2, 1], [3, 1], [1, 0], [3, 2, 1, 0], [2, 0], [3, 0], [0, 3], [0, 2], [0, 3, 2, 1], [0, 1], [1, 3], [1, 2], [2, 3], []];
        for (let j = -1; j < h; j++) for (let i = Math.max(-1, i0 - 1); i <= Math.min(w - 1, i1); i++) {
          const a = at(i, j), b = at(i + 1, j), c = at(i + 1, j + 1), d = at(i, j + 1), seg = SEG[(a >= level ? 8 : 0) | (b >= level ? 4 : 0) | (c >= level ? 2 : 0) | (d >= level ? 1 : 0)];
          if (!seg.length) continue;
          const ids = [id(i, j, 0), id(i + 1, j, 1), id(i, j + 1, 0), id(i, j, 1)];
          const pts = [[i + (level - a) / (b - a), j], [i + 1, j + (level - b) / (c - b)], [i + (level - d) / (c - d), j + 1], [i, j + (level - a) / (d - a)]];
          for (let k = 0; k < seg.length; k += 2) { next.set(ids[seg[k]], ids[seg[k + 1]]); where.set(ids[seg[k]], pts[seg[k]]); where.set(ids[seg[k + 1]], pts[seg[k + 1]]); }
        }
        const loops = [];
        while (next.size) { const start = next.keys().next().value, loop = []; let k = start; do { loop.push(where.get(k)); const n = next.get(k); next.delete(k); k = n; } while (k !== start && k !== undefined); loops.push(loop); }
        return loops;
      }
      function simplify(pts, tol) {
        const n = pts.length; if (n < 8) return pts;
        let far = 0, fd = 0; for (let i = 1; i < n; i++) { const d = (pts[i][0] - pts[0][0]) ** 2 + (pts[i][1] - pts[0][1]) ** 2; if (d > fd) { fd = d; far = i; } }
        const keep = new Uint8Array(n + 1), P = (i) => pts[i % n], stack = [[0, far], [far, n]]; keep[0] = keep[far] = 1;
        while (stack.length) {
          const [i0, i1] = stack.pop(), a = P(i0), b = P(i1), dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1e-9; let m = -1, md = tol;
          for (let i = i0 + 1; i < i1; i++) { const p = P(i), d = Math.abs((p[0] - a[0]) * dy - (p[1] - a[1]) * dx) / len; if (d > md) { md = d; m = i; } }
          if (m > 0) { keep[m] = 1; stack.push([i0, m], [m, i1]); }
        }
        return pts.filter((_, i) => keep[i]);
      }
      const areaOf = (l) => { let s = 0; for (let i = 0; i < l.length; i++) { const p = l[i], q = l[(i + 1) % l.length]; s += p[0] * q[1] - q[0] * p[1]; } return s / 2; };
      const inside = (p, l) => { let c = false; for (let i = 0, j = l.length - 1; i < l.length; j = i++) if ((l[i][1] > p[1]) !== (l[j][1] > p[1]) && p[0] < (l[j][0] - l[i][0]) * (p[1] - l[i][1]) / (l[j][1] - l[i][1]) + l[i][0]) c = !c; return c; };

      const MARGIN = 0.045;
      function dieCut(x0, y0, w, h, draw) {
        const cw = Math.ceil(w * PX / 4) * 4, ch = Math.ceil(h * PX / 2) * 2, mw = cw / 2, mh = ch / 2; w = cw / PX; h = ch / PX;
        const art = document.createElement('canvas'); art.width = cw; art.height = ch;
        const ctx = art.getContext('2d'); ctx.setTransform(PX, 0, 0, -PX, -x0 * PX, (y0 + h) * PX); draw(pen(ctx));
        const soft = document.createElement('canvas'); soft.width = mw; soft.height = mh;
        const sx = soft.getContext('2d', { willReadFrequently: true }); sx.filter = `blur(${(MARGIN * PX / 2 / 0.84).toFixed(2)}px)`; sx.drawImage(art, 0, 0, mw, mh);
        const px = sx.getImageData(0, 0, mw, mh).data, f = new Float32Array(mw * mh); for (let i = 0; i < f.length; i++) f[i] = px[i * 4 + 3] / 255;
        const print = (back) => K.canvasTex(cw, ch, (c) => { c.fillStyle = C.card; c.fillRect(0, 0, cw, ch); if (back) { c.setTransform(PX, 0, 0, -PX, -x0 * PX, (y0 + h) * PX); draw(pen(c, true)); } else c.drawImage(art, 0, 0); grain(c, cw, ch); });
        const tex = print(false), rear = print(true);
        const mid = Math.round(-x0 * PX / 2);
        const outline = (side) => {
          const loops = trace(f, mw, mh, 0.2, side > 0 ? mid : 0, side < 0 ? mid - 1 : mw - 1)
            .map((l) => simplify(l.map(([i, j]) => { const x = x0 + (2 * i + 1) / PX; return [side && Math.abs(x) < 2.4 / PX ? 0 : x, y0 + h - (2 * j + 1) / PX]; }), 0.004))
            .filter((l) => l.length > 2 && Math.abs(areaOf(l)) > 0.004);
          const sign = Math.sign(areaOf(loops.reduce((a, b) => (Math.abs(areaOf(b)) > Math.abs(areaOf(a)) ? b : a), loops[0])));
          const solid = loops.filter((l) => Math.sign(areaOf(l)) === sign).map((l) => ({ l, shape: new THREE.Shape(l.map((p) => new THREE.Vector2(p[0], p[1]))) }));
          loops.filter((l) => Math.sign(areaOf(l)) !== sign).forEach((hole) => { const o = solid.find((s) => inside(hole[0], s.l)); if (o) o.shape.holes.push(new THREE.Path(hole.map((p) => new THREE.Vector2(p[0], p[1])))); });
          return solid.map((s) => s.shape);
        };
        return { tex, rear, outline, x0, y0, w, h };
      }
      let cards = 1;
      function card(cut, side, parent) {
        const g = new THREE.ExtrudeGeometry(cut.outline(side), { depth: CARD_T, bevelEnabled: false }); g.translate(0, 0, -CARD_T / 2);
        const p = g.attributes.position, uv = g.attributes.uv, nm = g.attributes.normal, r = K.rng(cards++), bx = r.range(-0.05, 0.05), by = r.range(0.03, 0.08) * r.sign();
        for (let i = 0; i < p.count; i++) {
          const x = p.getX(i), y = p.getY(i), z = nm.getZ(i); uv.setXY(i, (x - cut.x0) / cut.w, (y - cut.y0) / cut.h);
          if (Math.abs(z) > 0.9) { const k = 1 / Math.hypot(1, bx * x, by * (y - 1)); nm.setXYZ(i, -bx * x * k * z, -by * (y - 1) * k * z, z * k); }
        }
        const all = g.groups.slice(); g.clearGroups();
        all.forEach((q) => { if (q.materialIndex) g.addGroup(q.start, q.count, 1); else { g.addGroup(q.start, q.count / 2, 2); g.addGroup(q.start + q.count / 2, q.count / 2, 0); } });
        const m = new THREE.Mesh(g, [paper(cut.tex, cut.w, cut.h), core, paper(cut.rear, cut.w, cut.h)]); m.castShadow = m.receiveShadow = true; m.matrixAutoUpdate = false; m.frustumCulled = false; parent.add(m);
        return m;
      }
      const seat = (m, X, Y, O) => { const Z = cross(X, Y); m.matrix.set(X[0], Y[0], Z[0], O[0], X[1], Y[1], Z[1], O[1], X[2], Y[2], Z[2], O[2], 0, 0, 0, 1); m.matrixWorldNeedsUpdate = true; };

      // ------------------------------------------------------------ 3. the fold mechanisms
      function hinge(aL, aR) {
        const psi = (Math.PI - aL + aR) / 2, a = Math.min((aL + aR) / 2, Math.PI / 2 - 0.004), s = Math.sin(a), c = Math.cos(a);
        const b = [Math.cos(psi), Math.sin(psi), 0], x = [Math.sin(psi), -Math.cos(psi), 0];
        return { a, b, dL: add(mul(x, -c), b, s), dR: add(mul(x, c), b, s), nL: add(mul(x, s), b, c), nR: add(mul(x, -s), b, c) };
      }
      function solveV(h, alpha, beta, point) {
        const sa = Math.sin(alpha), ca = Math.cos(alpha), A = sa * Math.sin(h.a), g = Math.atan2(A, ca) + Math.acos(K.clamp(Math.cos(beta) / Math.hypot(A, ca), -1, 1));
        const c = [h.b[0] * Math.sin(g), h.b[1] * Math.sin(g), point * Math.cos(g)], out = (d) => { const gl = [d[0] * sa, d[1] * sa, point * ca]; return unit(add(gl, c, -dot(gl, c))); };
        return { c, uL: out(h.dL), uR: out(h.dR) };
      }
      const clipped = (m, plane) => m.material.forEach((mt, k) => { m.material[k] = mt = mt.clone(); mt.clippingPlanes = [plane]; mt.clipShadows = true; });
      const MAKE = {
        v(o, byId, group) {
          const cut = dieCut(-o.size[0] / 2, -0.1, o.size[0], o.size[1] + 0.25, o.art), L = card(cut, -1, group), R = card(cut, 1, group);
          const part = { o, meshes: [L, R], pose(h) {
            const v = solveV(h, rad(o.alpha), rad(o.beta || 90), o.point === 'back' ? 1 : -1), O = [0, 0, o.z];
            part.wing = { '-1': { X: mul(v.uL, -1), Y: v.c, O, n: h.nL }, 1: { X: v.uR, Y: v.c, O, n: h.nR } };
            seat(L, part.wing[-1].X, v.c, O); seat(R, v.uR, v.c, O);
          } };
          return part;
        },
        box(o, byId, group) {
          const side = o.span[0] < 0 ? -1 : 1, cut = dieCut(o.span[0], -0.1, o.span[1] - o.span[0], o.height + 0.25, o.art), front = card(cut, 0, group);
          const g = new THREE.BoxGeometry(0.5, o.depth, CARD_T); g.translate((o.span[0] + o.span[1]) / 2, o.depth / 2, 0);
          const strap = new THREE.Mesh(g, core); strap.castShadow = strap.receiveShadow = true; strap.matrixAutoUpdate = false; group.add(strap);
          return { o, meshes: [front, strap], pose() {
            const w = byId[o.on].wing[side], out = cross(w.X, w.n), O = add(w.O, out, o.depth);
            seat(front, w.X, w.Y, O); seat(strap, w.X, mul(out, -1), add(O, w.Y, o.strap));
          } };
        },
        float(o, byId, group, s) {
          const [x0, y0, x1, y1] = o.area, cut = dieCut(x0, y0, x1 - x0, y1 - y0, o.art), m = card(cut, 0, group);
          return { o, meshes: [m], pose(h, t) {
            const w = byId[o.on].wing[o.side], lift = o.gap * Math.max(0, dot(w.Y, w.n)) + CARD_T * K.clamp((Math.PI / 2 - h.a) * 8), dt = t - landed(s);
            const q = dt > 0 ? 0.085 * (o.sway || 0) * Math.sin(dt * 21) * Math.exp(-dt * 2.4) : 0, X = add(mul(w.X, Math.cos(q)), w.Y, Math.sin(q)), Y = add(mul(w.Y, Math.cos(q)), w.X, -Math.sin(q));
            let O = add(add(w.O, w.X, o.at[0]), w.Y, o.at[1]); O = add(add(O, X, -o.at[0]), Y, -o.at[1]);
            seat(m, X, Y, add(O, cross(w.X, w.Y), lift));
          } };
        },
        // a cut-out that travels along a V-fold wall on a paper runner, crossing the crease: path(t) -> {x, y, q}
        rider(o, byId, group) {
          const [x0, y0, x1, y1] = o.area, cut = dieCut(x0, y0, x1 - x0, y1 - y0, o.art), m = card(cut, 0, group);
          return { o, meshes: [m], pose(h, t) {
            const base = byId[o.on], st = o.path(t), w = base.wing[st.x < 0 ? -1 : 1], k = K.smooth(-0.35, 0.35, st.x);
            const X = unit(add(mul(base.wing[-1].X, 1 - k), base.wing[1].X, k)), Y = w.Y, n = cross(X, Y);
            const lift = o.gap * Math.max(0, dot(w.Y, w.n)) + CARD_T * K.clamp((Math.PI / 2 - h.a) * 8);
            const Xq = add(mul(X, Math.cos(st.q)), Y, Math.sin(st.q)), Yq = add(mul(Y, Math.cos(st.q)), X, -Math.sin(st.q));
            seat(m, Xq, Yq, add(add(add(w.O, w.X, st.x), w.Y, st.y), n, lift));
          } };
        },
        // a card that rises through a slit in the page just behind a V-fold wall: show(t) 0 (hidden under the page) .. 1
        tag(o, byId, group) {
          const cut = dieCut(-0.45, -0.1, 0.9, 3.25, o.art), m = card(cut, 0, group), slit = new THREE.Plane(); clipped(m, slit);
          return { o, meshes: [m], pose(h, t) {
            const w = byId[o.on].wing[o.x < 0 ? -1 : 1], n = cross(w.X, w.Y), up = -3.3 * (1 - o.show(t));
            seat(m, w.X, w.Y, add(add(add(w.O, w.X, o.x), w.Y, up), n, -0.08));
            slit.normal.set(...w.n); slit.constant = -LEAF_T / 2;
          } };
        },
      };
      // the words: a ribbon of card that stands in a shallow V near the front edge, creased between two words
      const ribbon = ([left, right]) => {
        const em = Math.min(0.76, 3.6 / Math.max(widthOf(left, 1), widthOf(right, 1))), gap = 0.2, H = 1.0, xl = -(gap + widthOf(left, em) + 0.3), xr = gap + widthOf(right, em) + 0.3, tail = 0.42;
        return { fold: 'v', z: 1.95, alpha: 78, size: [2 * (Math.max(-xl, xr) + tail) + 0.1, H], art(a) {
          a.path(C.cream, (c) => { c.moveTo(xl - tail, -0.1); c.lineTo(xl - tail + 0.26, H / 2 - 0.05); c.lineTo(xl - tail, H); c.lineTo(xr + tail, H); c.lineTo(xr + tail - 0.26, H / 2 - 0.05); c.lineTo(xr + tail, -0.1); });
          a.box(C.coral, xl - tail + 0.32, H - 0.15, xr - xl + 2 * tail - 0.64, 0.055); a.box(C.coral, xl - tail + 0.32, 0.06, xr - xl + 2 * tail - 0.64, 0.055);
          a.text(left, -gap, 0.27, em, C.navy, 'right'); a.text(right, gap, 0.27, em, C.navy, 'left');
        } };
      };
      const spreads = SPREADS.map((sp, s) => {
        const group = new THREE.Group(), byId = {}; scene.add(group);
        const parts = [...sp.parts, ribbon(sp.words)].map((o) => { const p = MAKE[o.fold](o, byId, group, s); if (o.id) byId[o.id] = p; return p; });
        return { group, parts };
      });
      const corner = new THREE.Vector3();
      spreads.forEach((sp, s) => {
        const h = hinge(0, Math.PI - 0.02); sp.parts.forEach((p) => p.pose(h, 0));
        sp.parts.forEach((p, i) => { let over = 0; p.meshes.forEach((m) => { const q = m.geometry.attributes.position; for (let k = 0; k < q.count; k += 3) { corner.fromBufferAttribute(q, k).applyMatrix4(m.matrix); over = Math.max(over, -corner.x - PAGE_W, Math.abs(corner.z) - PAGE_D / 2); } }); if (over > 0.02 && p.o.fold !== 'tag') console.error(`pop-up: piece ${i} of spread ${s + 1} (${p.o.id || p.o.fold}) sticks ${over.toFixed(2)} out of the closed book`); });
      });

      // ------------------------------------------------------------ 4. the book
      const FPX = 128, book = new THREE.Group(); scene.add(book);
      const printed = (side, draw) => K.canvasTex(Math.round(PAGE_W * FPX), Math.round(PAGE_D * FPX), (ctx, w, h) => {
        ctx.fillStyle = C.card; ctx.fillRect(0, 0, w, h); ctx.setTransform(FPX, 0, 0, -FPX, side < 0 ? PAGE_W * FPX : 0, PAGE_D / 2 * FPX); draw(pen(ctx));
        ctx.setTransform(1, 0, 0, 1, 0, 0); const g = ctx.createLinearGradient(side < 0 ? w : 0, 0, side < 0 ? w - 60 : 60, 0); g.addColorStop(0, 'rgba(70,50,30,0.3)'); g.addColorStop(1, 'rgba(70,50,30,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        grain(ctx, w, h);
      });
      const endpaper = (a) => { a.box(C.leaf, -5.7, -3.3, 11.4, 6.6); for (let i = -11; i <= 11; i++) for (let j = -6; j <= 6; j++) leaf(a, i * 0.55, j * 0.6 + (i & 1 ? 0.3 : 0), 0.34, (i + j) & 1 ? 0.6 : 2.5, C.sage); };
      const face = (side, draw, back) => { const t = printed(side, draw); if (back) { t.center.set(0.5, 0.5); t.rotation = Math.PI; } return paper(t, PAGE_W, PAGE_D); };
      const leaves = TURNS.map((_, j) => {
        const g = new THREE.BoxGeometry(PAGE_W, LEAF_T, PAGE_D); g.translate(PAGE_W / 2, 0, 0);
        const m = new THREE.Mesh(g, [core, core, face(1, j ? SPREADS[j - 1].floor : endpaper), face(-1, SPREADS[j].floor, true), core, core]);
        m.castShadow = m.receiveShadow = true; book.add(m); return m;
      });
      const BLOCK_H = 0.3, TABLE_Y = -BLOCK_H - 0.06;
      const edges = new THREE.MeshStandardMaterial({ roughness: 0.95, map: K.canvasTex(32, 256, (ctx, w, h) => { ctx.fillStyle = '#f4ecda'; ctx.fillRect(0, 0, w, h); for (let k = 0; k < 7; k++) { ctx.fillStyle = k % 2 ? 'rgba(120,96,60,0.5)' : 'rgba(150,126,90,0.35)'; ctx.fillRect(0, (k + 0.5) * h / 7, w, 2.5); } }) });
      const block = (side, top) => { const g = new THREE.BoxGeometry(PAGE_W, BLOCK_H, PAGE_D); g.translate(side * PAGE_W / 2, -BLOCK_H / 2, 0); const m = new THREE.Mesh(g, [edges, edges, top, edges, edges, edges]); m.castShadow = m.receiveShadow = true; book.add(m); return m; };
      const blockL = block(-1, face(-1, endpaper)), blockR = block(1, face(1, SPREADS[SPREADS.length - 1].floor));
      const cloth = new THREE.MeshStandardMaterial({ color: '#7a3a26', roughness: 0.82, bumpScale: 2.5, bumpMap: K.canvasTex(256, 256, (ctx) => { ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, 256, 256); for (let i = 0; i < 256; i += 4) { ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(i, 0, 2, 256); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, i, 256, 2); } }, { data: true, repeat: [14, 9] }) });
      for (const side of [-1, 1]) { const b = new THREE.Mesh(K.roundedBox(PAGE_W + 0.22, 0.07, PAGE_D + 0.44, 0.025, 3), cloth); b.position.set(side * (PAGE_W / 2 + 0.17), TABLE_Y + 0.035, 0); b.castShadow = b.receiveShadow = true; book.add(b); }
      const spine = new THREE.Mesh(K.roundedBox(0.5, 0.05, PAGE_D + 0.44, 0.02, 2), cloth); spine.position.set(0, TABLE_Y + 0.025, 0); spine.receiveShadow = true; book.add(spine);
      const TAB = { x: [1.4, 3.1], z: 2.62 }, grip = dieCut(-0.6, -0.32, 1.2, 0.64, (a) => { a.box(C.coral, -0.52, -0.25, 1.04, 0.5, 0.16); for (const x of [-0.24, 0.06]) a.line(C.cream, 0.09, (c) => { c.moveTo(x, 0.12); c.lineTo(x + 0.16, 0); c.lineTo(x, -0.12); }); });
      const tab = card(grip, 0, blockR); tab.rotation.x = -Math.PI / 2; tab.matrixAutoUpdate = true;

      // ------------------------------------------------------------ 5. the table and the lamp
      const wood = K.canvasTex(1024, 1024, (ctx, w, h) => {
        const n = K.noise(12), r = K.rng(6), im = ctx.createImageData(w, h);
        for (let y = 0; y < h; y++) { const plank = Math.floor(y / 128), tone = 0.82 + 0.3 * K.hash(plank, 3); for (let x = 0; x < w; x++) { const v = K.clamp(0.5 + 1.25 * n.fbm(x * 0.0016 + plank * 9, y * 0.035, plank, 4) + 0.12 * n.n2(x * 0.02, y * 0.7)) * tone; im.data.set([40 + 78 * v, 23 + 46 * v, 12 + 24 * v, 255], (y * w + x) * 4); } }
        ctx.putImageData(im, 0, 0);
        for (let i = 0; i < 2200; i++) { ctx.fillStyle = `rgba(12,6,2,${r.range(0.1, 0.4)})`; ctx.fillRect(r.range(0, w), r.range(0, h), r.range(6, 40), 1); }
        for (let p = 0; p < 8; p++) { ctx.fillStyle = 'rgba(8,4,2,0.75)'; ctx.fillRect(0, p * 128, w, 2); }
      }, { repeat: [5, 5] });
      const table = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ map: wood, bumpMap: wood, bumpScale: 1.2, roughness: 0.58 }));
      table.rotation.x = -Math.PI / 2; table.position.y = TABLE_Y; table.receiveShadow = true; scene.add(table);
      const bits = K.rng(31), inks = [C.leaf, C.coral, C.river, C.cream, C.yellow];
      [[-7.2, 2.6], [-6.7, 3.6], [6.9, 3.1], [7.5, 1.6], [6.6, -3.6], [-7.0, -2.9], [-3.2, 4.4], [2.2, 4.3], [-6.5, -4.6], [4.2, -4.7]].forEach(([x, z], i) => {
        const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(bits.range(0.5, 1.3), bits.range(-0.1, 0.2)); sh.lineTo(bits.range(0.2, 0.9), bits.range(0.35, 0.8)); if (i % 2) sh.lineTo(bits.range(-0.2, 0.1), bits.range(0.4, 0.7));
        const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: CARD_T, bevelEnabled: false }), [new THREE.MeshStandardMaterial({ color: inks[i % inks.length], roughness: 0.93 }), core]);
        m.rotation.set(-Math.PI / 2, 0, bits.range(0, 6.3)); m.position.set(x, TABLE_Y + 0.002, z); m.castShadow = m.receiveShadow = true; scene.add(m);
      });
      const glaze = new THREE.MeshStandardMaterial({ color: '#1d3a44', roughness: 0.3 }), mug = new THREE.Group(); mug.position.set(-6.9, TABLE_Y, -6.2); scene.add(mug);
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.85, 2.0, 40), glaze); cup.position.y = 1.0; const ear = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.13, 12, 32), glaze); ear.position.set(1.05, 1.0, 0.3); ear.rotation.y = -0.3; mug.add(cup, ear); mug.traverse((m) => { m.castShadow = m.receiveShadow = true; });
      const pencil = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 5.2, 6), new THREE.MeshStandardMaterial({ color: '#d99a1e', roughness: 0.45 })); pencil.rotation.set(Math.PI / 2, 0, 1.25); pencil.position.set(6.6, TABLE_Y + 0.1, -5.4); pencil.castShadow = pencil.receiveShadow = true; scene.add(pencil);

      K.env(S, { top: '#2a2119', horizon: '#3d3024', bottom: '#6b5740', intensity: 1.0, panels: [{ pos: [9, 11, 7], size: [7, 7], color: '#ffd9a6', power: 3 }, { pos: [-12, 6, -9], size: [6, 8], color: '#8fa8ff', power: 1.1 }] });
      K.spot(S, { pos: [-4.5, 9.5, 11], target: [0.2, 0.8, 0], color: '#ffe9d0', power: 1250, angle: 0.62, penumbra: 0.85, soft: 1.3, mapSize: 4096 });
      K.spot(S, { pos: [8, 5.5, -10], target: [0, 1, 0], color: '#c2d0ff', power: 150, angle: 0.5, penumbra: 1, shadow: false });
      K.skyLight(S, { color: '#ffe8d2', power: 1.1, size: 9, center: [0, 0, 0] });

      // ------------------------------------------------------------ 6. camera: one slow drift across the three spreads, a push at the end
      const cam = {
        pos: K.path([[0, [-1.6, 6.0, 11.5]], [1.3, [-1.2, 5.85, 11.2]], [2.5, [-0.8, 6.0, 11.4]], [3.3, [-0.4, 6.4, 12.0]], [5.3, [0.1, 6.0, 11.4]], [6.2, [0.3, 6.4, 12.1]], [7.4, [0.3, 6.1, 11.8]], [9.9, [0.8, 5.9, 11.5]], [11.5, [1.0, 5.7, 11.15]]]),
        aim: K.path([[0, [-0.2, 1.05, 0.3]], [2.5, [-0.1, 1.1, 0.3]], [5.3, [0, 1.1, 0.3]], [7.4, [0.1, 1.15, 0.3]], [9.9, [0.4, 1.2, 0.3]], [11.5, [0.55, 1.2, 0.3]]]),
      };

      const riseOf = (j, t) => K.seg(t, TURNS[j], TURNS[j] + TURN * 0.5, K.ease.inOut), sinkOf = (j, t) => K.seg(t, TURNS[j] + TURN * 0.6, TURNS[j] + TURN, K.ease.inOut);
      return {
        update(t) {
          const phi = TURNS.map((t0) => flip(t, t0));
          let onRight = 0, onLeft = 0;
          leaves.forEach((m, j) => { let below = 0; for (let i = 0; i < j; i++) below += 1 - riseOf(i, t); for (let i = j + 1; i < leaves.length; i++) below += sinkOf(i, t); m.rotation.z = phi[j]; m.position.y = -LEAF_T * below; onRight += 1 - riseOf(j, t); onLeft += sinkOf(j, t); });
          blockR.position.y = LEAF_T / 2 - LEAF_T * onRight; blockL.position.y = LEAF_T / 2 - LEAF_T * onLeft;
          tab.position.set(K.lerp(TAB.x[0], TAB.x[1], pulled(t)), CARD_T / 2 + 0.004, TAB.z);
          spreads.forEach((sp, s) => {
            const aL = Math.PI - phi[s], aR = s + 1 < phi.length ? phi[s + 1] : 0;
            sp.group.visible = aL + aR < Math.PI - 0.02;
            if (sp.group.visible) { const h = hinge(aL, aR); sp.parts.forEach((p) => p.pose(h, t)); }
          });
          const p = cam.pos(t), a = cam.aim(t);
          K.look(camera, p, a); K.focus(camera, [K.lerp(0, 0.6, K.seg(t, 7, 11.5)), 1.0, 1.1], 0.11);
        },
      };
    },

    sound(k) {
      const D = DURATION;
      k.bed('room', 0, D, { gain: 1.0 });
      k.noise(0, { dur: D, color: 'pink', filter: 'bandpass', f: 650, q: 0.5, gain: 0.05, a: 0.8, hold: D - 1.6, bus: 'amb' });   // the river, quietly
      { const r = K.rng(77); for (let x = 0.5; x < D - 0.4; x += 0.55 + r() * 0.9) k.tone(x, { f: [[0, 260 + r() * 200], [0.06, 850 + r() * 500]], dur: 0.08, gain: 0.03, bus: 'amb', pan: r() * 1.2 - 0.6, verb: 0.25 }); }   // water plops
      k.music('pad', 0, D, { bpm: 76, chords: [['D3', 'F#3', 'A3', 'C#4'], ['B2', 'D3', 'F#3', 'A3'], ['G2', 'B2', 'D3', 'F#3'], ['A2', 'C#3', 'E3', 'A3']], gain: 0.45 });
      TURNS.forEach((t0, s) => {
        const hit = landed(s);
        if (t0 > 0) { k.play('paper', t0 + 0.02, { gain: 1.5, dur: 0.5, pan: 0.4 }); k.play('whoosh', t0 + 0.3, { gain: 0.6, dur: 0.8, top: 1500 }); k.play('paper', t0 + 0.5, { gain: 1.0, dur: 0.7 }); }
        k.withMinor(() => { for (let i = 0; i < 7; i++) if (hit - 0.62 + i * 0.085 > 0) k.play('tick', hit - 0.62 + i * 0.085, { gain: 0.45 + 0.06 * i, f: 1900 + i * 260, pan: -0.3 + i * 0.1 }); });   // card creaking upright
        k.play('slap', hit, { gain: 0.6, pan: -0.3 }); k.play('thud', hit, { gain: 0.55, f: 105, pan: -0.3 }); k.play('paper', hit + 0.04, { gain: 0.45, dur: 0.22 });
        k.play('ding', hit + 0.14, { gain: 0.34, f: ['D5', 'F#5', 'A5'][s] });
      });
      // spread 1: the crocodile bobbing in the water as the page lands
      k.withMinor(() => { for (let i = 0; i < 3; i++) k.tone(landed(0) + 0.25 + i * 0.3, { f: [[0, 240], [0.07, 700]], dur: 0.09, gain: 0.07 - 0.015 * i, pan: 0.3, verb: 0.2 }); });
      // spread 2: the jaws snap, the king's scroll trembles
      k.play('tock', landed(1) + 0.32, { gain: 0.8, f: 240, pan: 0.35 }); k.play('slap', landed(1) + 0.33, { gain: 0.35, pan: 0.35 });
      k.play('sparkle', landed(1) + 0.22, { gain: 0.55, n: 5 });
      // spread 3: the pull tab, five hops, four numbers
      k.play('tape', PULL[0], { gain: 1.2, dur: PULL[1] - PULL[0], pan: 0.4 }); k.play('paper', PULL[0], { gain: 0.8, dur: 0.6, pan: 0.4 });
      const notes = ['D5', 'E5', 'F#5', 'A5'];
      for (let h = 0; h < 5; h++) {
        const t0 = takeoff(h), tl = landAt(h), pan = -0.7 + h * 0.35;
        k.play('swish', t0 + 0.02, { gain: 0.55, dur: 0.22, pan });
        if (h < 4) {
          k.play('thud', tl, { gain: 0.5, f: 85, pan }); k.noise(tl, { dur: 0.16, color: 'pink', filter: 'bandpass', f: 900, q: 0.8, gain: 0.12, pan });   // a hoof on a wet back
          k.play('pop', tl + 0.04, { gain: 0.7, f: 520 + 60 * h, pan }); k.play('ding', tl + 0.06, { gain: 0.4, f: notes[h], pan });   // the number tag pops up
        } else {
          k.play('slap', tl, { gain: 0.45, pan }); k.play('thud', tl, { gain: 0.4, f: 120, pan });
          k.play('success', tl + 0.12, { gain: 0.65, f: 'D6' }); k.play('sparkle', tl + 0.3, { gain: 0.5, n: 6 });
        }
      }
    },
  });
}
