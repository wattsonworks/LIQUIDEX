/* ╔══════════════════════════════════════════════════════════════╗
   ║  LIQUIDEX — chart recreations (pure SVG, no deps)             ║
   ║  Renders into <div data-chart="hero|liqpool|cascade|profile| ║
   ║  cvd|confluence|fvgob"></div>.  To use a REAL screenshot       ║
   ║  instead: put <img src="assets/img/NAME.png"> in the div and  ║
   ║  delete the data-chart attribute.                             ║
   ╚══════════════════════════════════════════════════════════════╝ */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const C = {
    bg: "#0e1116", panel: "#11151c", grid: "#1b2029", axis: "#5c6470",
    ink: "#e8eaed", sub: "#7a8290", leg: "#9aa3b0",
    bull: "#26a69a", bear: "#ef5350",
    bsl: "#FF5252", bslSoft: "#FF8A65", ssl: "#26C6DA", swept: "#717b8a",
    green: "#00FF41", cyan: "#00E5FF", amber: "#FFB800", poc: "#FF3B30",
    vah: "#007AFF", buy: "#2196F3", sell: "#FF9500", casc: "#FF0040",
  };
  const el = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
  const txt = (p, s, cls) => { const e = el("text", p); e.setAttribute("font-family", 'JetBrains Mono,Consolas,monospace'); if (cls) e.setAttribute("class", cls); e.textContent = s; return e; };
  function svg(w, h) { const s = el("svg", { viewBox: `0 0 ${w} ${h}`, width: w, height: h, preserveAspectRatio: "xMidYMid meet" }); s.style.width = "100%"; s.style.height = "auto"; s.style.display = "block"; return s; }
  // seeded RNG (stable candles)
  function rng(seed) { let r = seed; return () => { r = (r * 9301 + 49297) % 233280; return r / 233280; }; }

  /* generic candle series from waypoints */
  function series(N, way, seed, tweak) {
    const interp = (i) => { for (let k = 0; k < way.length - 1; k++) { const [a, va] = way[k], [b, vb] = way[k + 1]; if (i >= a && i <= b) return va + (vb - va) * (i - a) / (b - a); } return way[way.length - 1][1]; };
    const rnd = rng(seed); const out = []; let prev = interp(0);
    for (let i = 0; i < N; i++) { const c = interp(i), o = prev; let h = Math.max(o, c) + 0.12 + rnd() * 0.5, l = Math.min(o, c) - 0.12 - rnd() * 0.5; const k = { o, h, l, c }; if (tweak) tweak(i, k); out.push(k); prev = k.c; }
    return out;
  }
  function drawCandles(s, cs, xOf, yOf, cw) {
    cs.forEach((k, i) => {
      const x = xOf(i), up = k.c >= k.o, col = up ? C.bull : C.bear;
      s.appendChild(el("line", { x1: x, y1: yOf(k.h), x2: x, y2: yOf(k.l), stroke: col, "stroke-width": 1 }));
      const yo = yOf(k.o), yc = yOf(k.c), top = Math.min(yo, yc), hgt = Math.max(1.5, Math.abs(yo - yc));
      s.appendChild(el("rect", { x: x - cw / 2, y: top, width: cw, height: hgt, fill: col }));
    });
  }
  function frame(s, w, h, L, R, T, B, title, sub) {
    s.appendChild(el("rect", { x: 0, y: 0, width: w, height: h, fill: C.bg }));
    s.appendChild(el("rect", { x: L, y: T, width: R - L, height: B - T, fill: C.panel }));
    if (title) s.appendChild(txt({ x: L, y: 24, "font-size": 14, fill: C.ink }, title));
    if (sub) s.appendChild(txt({ x: L, y: 40, "font-size": 10.5, fill: C.sub }, sub));
  }
  function priceGrid(s, L, R, lo, hi, step, yOf) {
    for (let p = Math.ceil(lo); p <= hi; p += step) { const y = yOf(p); s.appendChild(el("line", { x1: L, y1: y, x2: R, y2: y, stroke: C.grid, "stroke-width": 1 })); s.appendChild(txt({ x: R + 6, y: y + 3, "font-size": 9.5, fill: C.axis }, p.toFixed(1))); }
  }

  /* ── HERO: composite chart ─────────────────────────────────── */
  function hero(host) {
    const w = 1000, h = 560, L = 26, R = 832, T = 54, B = 506;
    const PMIN = 98.6, PMAX = 108.4, N = 46;
    const yOf = p => T + (PMAX - p) / (PMAX - PMIN) * (B - T);
    const xOf = i => L + i / (N - 1) * (R - L), cw = (R - L) / N * 0.58;
    const s = svg(w, h); frame(s, w, h, L, R, T, B, "LIQUIDEX  —  Institutional Liquidity Scanner", "BTCUSDT · 5m · MICRO · multi-exchange CVD");
    priceGrid(s, L, R, 99, 108, 1, yOf);
    const way = [[0, 103], [4, 100.6], [9, 106.6], [14, 104], [19, 102.2], [24, 107], [30, 102.4], [36, 107.6], [41, 104.4], [45, 105.6]];
    const cs = series(N, way, 0.987, (i, k) => { if (i === 4) k.l = 99.5; if (i === 9 || i === 24) k.h = 107.0; if (i === 36) k.h = 108.0; if (i === 19 || i === 30) k.l = 101.6; });
    // VWAP (smooth)
    let vp = ""; for (let i = 0; i < N; i++) { const v = 103.4 + Math.sin(i / 6) * 1.1 + i * 0.02; vp += (i ? "L" : "M") + xOf(i) + " " + yOf(v); }
    s.appendChild(el("path", { d: vp, fill: "none", stroke: C.amber, "stroke-width": 1.4, "stroke-opacity": .7 }));
    s.appendChild(txt({ x: L + 6, y: yOf(103.4) - 5, "font-size": 9.5, fill: C.amber }, "VWAP"));
    // POC + VA
    [["POC 104.4", 104.4, C.poc, 2], ["VAH 106.3", 106.3, C.vah, 1], ["VAL 102.1", 102.1, C.vah, 1]].forEach(([t, p, c, wd]) => {
      const y = yOf(p); s.appendChild(el("line", { x1: L, y1: y, x2: R, y2: y, stroke: c, "stroke-width": wd, "stroke-dasharray": wd === 2 ? "" : "4 4", "stroke-opacity": .8 }));
      s.appendChild(txt({ x: L + 6, y: y - 4, "font-size": 9.5, fill: c }, t));
    });
    // FVG box
    s.appendChild(el("rect", { x: xOf(31), y: yOf(106.2), width: xOf(45) - xOf(31), height: yOf(105.2) - yOf(106.2), fill: "rgba(160,120,252,.16)", stroke: "rgba(160,120,252,.5)" }));
    s.appendChild(txt({ x: xOf(45) - 4, y: yOf(106.2) + 11, "font-size": 9, fill: "#b79cff", "text-anchor": "end" }, "FVG 5m"));
    // liquidity pools
    const pools = [
      { p: 107.0, c: C.bsl, w: 3, op: .95, dash: "", lab: "EQH ×3  $$$" },
      { p: 108.0, c: C.bslSoft, w: 1, op: .5, dash: "5 4", lab: "BSL ×1  $" },
      { p: 101.6, c: C.ssl, w: 2.2, op: .85, dash: "", lab: "SSL ×2  $$" },
      { p: 99.5, c: C.swept, w: 1.2, op: .7, dash: "2 4", lab: "EQL  SWEPT" },
    ];
    pools.forEach(q => { const y = yOf(q.p); s.appendChild(el("line", { x1: L, y1: y, x2: R, y2: y, stroke: q.c, "stroke-width": q.w, "stroke-opacity": q.op, "stroke-dasharray": q.dash })); const lx = R + 30, ly = y - 9; s.appendChild(el("rect", { x: lx, y: ly, width: 112, height: 18, rx: 3, fill: C.bg, stroke: q.c, "stroke-opacity": .9 })); s.appendChild(txt({ x: lx + 7, y: ly + 13, "font-size": 10.5, fill: q.c, "font-weight": "bold" }, q.lab)); });
    // CASCADE box (the run into EQH then exhaust)
    s.appendChild(el("rect", { x: xOf(30) - cw, y: yOf(107.2), width: xOf(36) - xOf(30) + cw * 2, height: yOf(102.2) - yOf(107.2), fill: "rgba(255,0,64,.10)", stroke: "rgba(255,0,64,.55)", "stroke-dasharray": "3 3" }));
    s.appendChild(txt({ x: xOf(33), y: yOf(107.2) - 4, "font-size": 9.5, fill: C.casc, "text-anchor": "middle", "font-weight": "bold" }, "💥 CASCADE ×6"));
    drawCandles(s, cs, xOf, yOf, cw);
    // signal labels
    s.appendChild(txt({ x: xOf(36), y: yOf(108.0) - 8, "font-size": 10, fill: C.cyan, "text-anchor": "middle" }, "EXH ▲"));
    s.appendChild(txt({ x: xOf(4), y: yOf(99.5) + 16, "font-size": 9.5, fill: C.swept, "text-anchor": "middle" }, "↑ sweep"));
    // last price tag
    const last = cs[N - 1].c, yl = yOf(last);
    s.appendChild(el("line", { x1: L, y1: yl, x2: R, y2: yl, stroke: "#c7ccd6", "stroke-width": 1, "stroke-dasharray": "1 4", "stroke-opacity": .6 }));
    s.appendChild(el("rect", { x: R, y: yl - 8, width: 46, height: 16, rx: 2, fill: "#2a2f3a" }));
    s.appendChild(txt({ x: R + 5, y: yl + 4, "font-size": 10, fill: C.ink }, last.toFixed(2)));
    // legend
    const lg = [[C.bsl, "buy-side liq (short stops)"], [C.ssl, "sell-side liq (long stops)"], [C.swept, "swept = fuel spent"]];
    lg.forEach((r, i) => { const x = L + i * 270; s.appendChild(el("rect", { x, y: 528, width: 14, height: 6, fill: r[0] })); s.appendChild(txt({ x: x + 20, y: 534, "font-size": 10, fill: C.leg }, r[1])); });
    host.appendChild(s);
  }

  /* ── LIQUIDITY POOL MAP ────────────────────────────────────── */
  function liqpool(host) {
    const w = 1000, h = 520, L = 22, R = 840, T = 50, B = 470;
    const PMIN = 99.2, PMAX = 108.1, N = 42;
    const yOf = p => T + (PMAX - p) / (PMAX - PMIN) * (B - T), xOf = i => L + i / (N - 1) * (R - L), cw = (R - L) / N * 0.56;
    const s = svg(w, h); frame(s, w, h, L, R, T, B, "🧲 Liquidity-Pool Map", "EQH/EQL = magnets · brightness+width = resting fuel · swept = greyed");
    priceGrid(s, L, R, 100, 108, 1, yOf);
    const way = [[0, 103], [3, 100.4], [8, 106.5], [12, 103.6], [16, 102], [20, 106.7], [24, 102], [28, 106.6], [33, 103.2], [41, 104.5]];
    const cs = series(N, way, 0.55, (i, k) => { if (i === 3) k.l = 99.7; if (i === 8 || i === 28) k.h = 107; if (i === 20) k.h = 106.95; if (i === 16 || i === 24) k.l = 101.4; });
    const pools = [
      { p: 107.0, c: C.bsl, w: 3.2, op: .95, dash: "", lab: "EQH ×3   $$$" },
      { p: 105.6, c: C.bslSoft, w: 1, op: .45, dash: "5 4", lab: "BSL ×1   $" },
      { p: 101.4, c: C.ssl, w: 2.2, op: .85, dash: "", lab: "SSL ×2   $$" },
      { p: 100.0, c: C.swept, w: 1.2, op: .7, dash: "2 4", lab: "EQL ×2   SWEPT" },
    ];
    pools.forEach(q => { const y = yOf(q.p); s.appendChild(el("line", { x1: L, y1: y, x2: R, y2: y, stroke: q.c, "stroke-width": q.w, "stroke-opacity": q.op, "stroke-dasharray": q.dash })); const lx = R + 34, ly = y - 9; s.appendChild(el("rect", { x: lx, y: ly, width: 116, height: 18, rx: 3, fill: C.bg, stroke: q.c, "stroke-opacity": .9 })); s.appendChild(txt({ x: lx + 7, y: ly + 13, "font-size": 11, fill: q.c, "font-weight": "bold" }, q.lab)); });
    drawCandles(s, cs, xOf, yOf, cw);
    const yl = yOf(cs[N - 1].c); s.appendChild(el("line", { x1: L, y1: yl, x2: R, y2: yl, stroke: "#c7ccd6", "stroke-width": 1, "stroke-dasharray": "1 4", "stroke-opacity": .6 }));
    s.appendChild(txt({ x: xOf(3) - 4, y: yOf(99.7) + 22, "font-size": 10, fill: C.swept }, "↑ sweep"));
    host.appendChild(s);
  }

  /* ── CASCADE FLOW (teaching sequence) ──────────────────────── */
  function cascade(host) {
    const w = 1000, h = 500, L = 26, R = 860, T = 54, B = 452;
    const PMIN = 98, PMAX = 109, N = 44;
    const yOf = p => T + (PMAX - p) / (PMAX - PMIN) * (B - T), xOf = i => L + i / (N - 1) * (R - L), cw = (R - L) / N * 0.56;
    const s = svg(w, h); frame(s, w, h, L, R, T, B, "💥 Liquidation Cascade → Exhaustion", "sweep pool → 3+ bars on volume = cascade → first break = EXH reversal");
    priceGrid(s, L, R, 99, 109, 2, yOf);
    // EQH magnet at top that price runs toward
    const eqh = 107.5, ey = yOf(eqh); s.appendChild(el("line", { x1: L, y1: ey, x2: R, y2: ey, stroke: C.bsl, "stroke-width": 3, "stroke-opacity": .9 }));
    s.appendChild(txt({ x: R + 8, y: ey + 4, "font-size": 11, fill: C.bsl, "font-weight": "bold" }, "EQH ×4 $$$$"));
    const way = [[0, 102], [10, 100.3], [16, 101.2], [22, 103.2], [30, 107.6], [34, 108.2], [38, 105.2], [43, 103.4]];
    const cs = series(N, way, 0.71, (i, k) => { if (i >= 24 && i <= 33) { k.o = k.c - 0.1; } if (i === 33) k.h = 108.4; });
    // cascade box over the run
    s.appendChild(el("rect", { x: xOf(24) - cw, y: yOf(108.6), width: xOf(33) - xOf(24) + cw * 2, height: yOf(102.6) - yOf(108.6), fill: "rgba(255,0,64,.10)", stroke: "rgba(255,0,64,.6)", "stroke-dasharray": "3 3" }));
    s.appendChild(txt({ x: xOf(28.5), y: yOf(108.6) - 6, "font-size": 11, fill: C.casc, "text-anchor": "middle", "font-weight": "bold" }, "CASCADE ×8 (shorts liquidating)"));
    drawCandles(s, cs, xOf, yOf, cw);
    // sweep + EXH markers
    s.appendChild(txt({ x: xOf(33), y: yOf(108.4) - 8, "font-size": 12, fill: C.exh, "text-anchor": "middle", "font-weight": "bold" }, "EXH ▼ reversal"));
    s.appendChild(el("path", { d: `M${xOf(33)} ${yOf(108.4) - 22} l-5 8 h10 z`, fill: C.exh }));
    s.appendChild(txt({ x: xOf(30), y: ey - 6, "font-size": 10, fill: C.amber, "text-anchor": "middle" }, "← pool swept (fuel spent)"));
    // annotation lane at bottom
    const notes = [["①", "stops rest at EQH", xOf(6)], ["②", "price hunts the pool", xOf(20)], ["③", "sweep → cascade", xOf(30)], ["④", "EXH = enter reversal", xOf(40)]];
    notes.forEach(([n, t, x]) => { s.appendChild(txt({ x, y: 478, "font-size": 12, fill: C.green, "text-anchor": "middle", "font-weight": "bold" }, n)); s.appendChild(txt({ x, y: 492, "font-size": 9.5, fill: C.leg, "text-anchor": "middle" }, t)); });
    host.appendChild(s);
  }

  /* ── VOLUME PROFILE ────────────────────────────────────────── */
  function profile(host) {
    const w = 1000, h = 500, L = 26, R = 720, T = 54, B = 452;
    const PMIN = 99, PMAX = 108, N = 34, rows = 22;
    const yOf = p => T + (PMAX - p) / (PMAX - PMIN) * (B - T), xOf = i => L + i / (N - 1) * (R - L), cw = (R - L) / N * 0.55;
    const s = svg(w, h); frame(s, w, h, L, R, T, B, "📊 Volume Profile + Double POC", "per-segment value area · delta-split bins · POC tail");
    priceGrid(s, L, R, 99, 108, 1, yOf);
    // profile bins on the right gutter
    const gx = R + 6, gw = 250;
    const poc1 = 104.2, poc2 = 101.6, vah = 105.8, val = 100.6;
    s.appendChild(el("rect", { x: gx, y: yOf(vah), width: gw, height: yOf(val) - yOf(vah), fill: "rgba(0,122,255,.07)" }));
    for (let r = 0; r < rows; r++) {
      const p = PMAX - (r + .5) * (PMAX - PMIN) / rows; const y = yOf(p); const d = Math.exp(-Math.pow((p - poc1) / 1.3, 2)) + 0.7 * Math.exp(-Math.pow((p - poc2) / 0.9, 2));
      const bw = 18 + d * (gw - 24); const buyFrac = 0.5 + 0.35 * Math.sin(p);
      s.appendChild(el("rect", { x: gx, y: y - 4, width: bw * buyFrac, height: 8, fill: C.buy, "fill-opacity": .85 }));
      s.appendChild(el("rect", { x: gx + bw * buyFrac, y: y - 4, width: bw * (1 - buyFrac), height: 8, fill: C.sell, "fill-opacity": .85 }));
    }
    [["POC 104.2", poc1, C.poc], ["POC₂ 101.6", poc2, C.amber], ["VAH 105.8", vah, C.vah], ["VAL 100.6", val, C.vah]].forEach(([t, p, c]) => { const y = yOf(p); s.appendChild(el("line", { x1: L, y1: y, x2: R + gw + 6, y2: y, stroke: c, "stroke-width": p === poc1 ? 2 : 1, "stroke-dasharray": p === poc1 || p === poc2 ? "" : "4 4", "stroke-opacity": .85 })); s.appendChild(txt({ x: L + 6, y: y - 4, "font-size": 9.5, fill: c }, t)); });
    const way = [[0, 101], [8, 103.5], [16, 100.8], [24, 104.6], [33, 103.8]];
    drawCandles(s, series(N, way, 0.4), xOf, yOf, cw);
    s.appendChild(txt({ x: gx + gw / 2, y: 532, "font-size": 10, fill: C.leg, "text-anchor": "middle" }, "▮ buy volume   ▮ sell volume   ·   width = volume at price"));
    host.appendChild(s);
  }

  /* ── CVD / VPIN panel ──────────────────────────────────────── */
  function cvd(host) {
    const w = 1000, h = 420, L = 26, R = 900, T = 54, B = 360, N = 80;
    const s = svg(w, h); frame(s, w, h, L, R, T, B, "📡 Aggregated CVD + VPIN Toxicity", "5-exchange cumulative delta · divergence · toxic-flow shading");
    const xOf = i => L + i / (N - 1) * (R - L);
    // price (top half) vs cvd (line) divergence
    const rnd = rng(0.9);
    let price = [], cvd = [], pc = 0, cc = 0;
    for (let i = 0; i < N; i++) { pc += Math.sin(i / 9) * 0.6 + (rnd() - .5) * .5 + (i > 55 ? 0.18 : 0); cc += Math.sin(i / 9) * 0.6 + (rnd() - .5) * .5 - (i > 55 ? 0.34 : 0); price.push(pc); cvd.push(cc); }
    const pmin = Math.min(...price, ...cvd) - 1, pmax = Math.max(...price, ...cvd) + 1;
    const yOf = v => T + (pmax - v) / (pmax - pmin) * (B - T);
    // toxic zone shading
    s.appendChild(el("rect", { x: xOf(56), y: T, width: xOf(N - 1) - xOf(56), height: B - T, fill: "rgba(255,0,64,.07)" }));
    s.appendChild(txt({ x: xOf(68), y: T + 16, "font-size": 10.5, fill: C.casc, "text-anchor": "middle" }, "VPIN TOXIC 71%  ⚠"));
    const path = (arr, c, wd, dash) => { let d = ""; arr.forEach((v, i) => d += (i ? "L" : "M") + xOf(i) + " " + yOf(v)); s.appendChild(el("path", { d, fill: "none", stroke: c, "stroke-width": wd, "stroke-dasharray": dash || "", "stroke-opacity": .92 })); };
    path(price, C.ink, 1.6); path(cvd, C.green, 1.8);
    // divergence marker
    s.appendChild(el("line", { x1: xOf(56), y1: yOf(price[56]), x2: xOf(72), y2: yOf(price[72]), stroke: C.ink, "stroke-width": 1, "stroke-dasharray": "3 3", "stroke-opacity": .5 }));
    s.appendChild(el("line", { x1: xOf(56), y1: yOf(cvd[56]), x2: xOf(72), y2: yOf(cvd[72]), stroke: C.green, "stroke-width": 1, "stroke-dasharray": "3 3", "stroke-opacity": .5 }));
    s.appendChild(txt({ x: xOf(64), y: yOf((price[64] + cvd[64]) / 2), "font-size": 11, fill: C.cyan, "text-anchor": "middle", "font-weight": "bold" }, "↕ DIV"));
    // VPIN bars at bottom
    for (let i = 0; i < N; i += 2) { const v = (Math.sin(i / 7) + 1) / 2 * (i > 56 ? 1.4 : .8); const bh = v * 34; s.appendChild(el("rect", { x: xOf(i) - 2, y: B - bh, width: 4, height: bh, fill: i > 56 ? C.casc : C.cyan, "fill-opacity": .6 })); }
    s.appendChild(txt({ x: L + 6, y: T - 4 + 14, "font-size": 9.5, fill: C.ink }, "price"));
    s.appendChild(txt({ x: L + 56, y: T - 4 + 14, "font-size": 9.5, fill: C.green }, "CVD"));
    host.appendChild(s);
  }

  /* ── CONFLUENCE STACK ──────────────────────────────────────── */
  function confluence(host) {
    const w = 1000, h = 480, L = 26, R = 820, T = 54, B = 432;
    const PMIN = 100, PMAX = 107, N = 38;
    const yOf = p => T + (PMAX - p) / (PMAX - PMIN) * (B - T), xOf = i => L + i / (N - 1) * (R - L), cw = (R - L) / N * 0.55;
    const s = svg(w, h); frame(s, w, h, L, R, T, B, "🎯 Confluence Zone", "where FVG + Order Block + POC + liquidity pool overlap = highest-probability target");
    priceGrid(s, L, R, 100, 107, 1, yOf);
    const zTop = 103.9, zBot = 103.0;
    // stacked layers converging into the zone
    s.appendChild(el("rect", { x: L, y: yOf(zTop), width: R - L, height: yOf(zBot) - yOf(zTop), fill: "rgba(0,255,136,.13)", stroke: "rgba(0,255,136,.7)" }));
    s.appendChild(el("rect", { x: xOf(22), y: yOf(104.1), width: xOf(37) - xOf(22), height: yOf(103.4) - yOf(104.1), fill: "rgba(160,120,252,.14)", stroke: "rgba(160,120,252,.45)" }));
    s.appendChild(txt({ x: xOf(37) - 4, y: yOf(104.1) + 11, "font-size": 9, fill: "#b79cff", "text-anchor": "end" }, "FVG"));
    s.appendChild(el("rect", { x: xOf(10), y: yOf(103.8), width: xOf(24) - xOf(10), height: yOf(103.1) - yOf(103.8), fill: "rgba(0,188,212,.12)", stroke: "rgba(0,188,212,.45)" }));
    s.appendChild(txt({ x: xOf(11), y: yOf(103.8) + 11, "font-size": 9, fill: C.ssl }, "OB+"));
    const py = yOf(103.5); s.appendChild(el("line", { x1: L, y1: py, x2: R, y2: py, stroke: C.poc, "stroke-width": 2, "stroke-opacity": .85 })); s.appendChild(txt({ x: L + 6, y: py - 4, "font-size": 9.5, fill: C.poc }, "POC 103.5"));
    const sy = yOf(103.7); s.appendChild(el("line", { x1: L, y1: sy, x2: R, y2: sy, stroke: C.ssl, "stroke-width": 2, "stroke-opacity": .7 })); s.appendChild(txt({ x: R - 70, y: sy - 4, "font-size": 9.5, fill: C.ssl }, "SSL ×2 $$"));
    // chip
    s.appendChild(el("rect", { x: R + 8, y: yOf(zTop) - 2, width: 150, height: 34, rx: 4, fill: C.bg, stroke: "rgba(0,255,136,.7)" }));
    s.appendChild(txt({ x: R + 16, y: yOf(zTop) + 12, "font-size": 11, fill: C.green, "font-weight": "bold" }, "CONFLUENCE ×4"));
    s.appendChild(txt({ x: R + 16, y: yOf(zTop) + 26, "font-size": 9, fill: C.leg }, "FVG·OB·POC·SSL"));
    const way = [[0, 105.8], [9, 102.2], [16, 104.8], [24, 103.5], [31, 102.6], [37, 104.6]];
    drawCandles(s, series(N, way, 0.33, (i, k) => { if (i === 24) k.l = 103.0; }), xOf, yOf, cw);
    host.appendChild(s);
  }

  /* ── FVG / OB structure ────────────────────────────────────── */
  function fvgob(host) {
    const w = 1000, h = 460, L = 26, R = 880, T = 54, B = 412;
    const PMIN = 100, PMAX = 108, N = 40;
    const yOf = p => T + (PMAX - p) / (PMAX - PMIN) * (B - T), xOf = i => L + i / (N - 1) * (R - L), cw = (R - L) / N * 0.55;
    const s = svg(w, h); frame(s, w, h, L, R, T, B, "🧱 Order Blocks + 🟣 MTF Fair-Value Gaps", "structural OBs · ICS fractal OBs · multi-timeframe FVG magnets");
    priceGrid(s, L, R, 100, 108, 1, yOf);
    // OB zones
    s.appendChild(el("rect", { x: xOf(6), y: yOf(102.6), width: R - xOf(6), height: yOf(101.7) - yOf(102.6), fill: "rgba(0,188,212,.12)", stroke: "rgba(0,188,212,.5)" }));
    s.appendChild(txt({ x: R - 4, y: yOf(102.6) + 11, "font-size": 9.5, fill: C.ssl, "text-anchor": "end" }, "OB+ 1H"));
    s.appendChild(el("rect", { x: xOf(18), y: yOf(106.4), width: R - xOf(18), height: yOf(105.5) - yOf(106.4), fill: "rgba(206,147,168,.13)", stroke: "rgba(206,147,168,.5)" }));
    s.appendChild(txt({ x: R - 4, y: yOf(106.4) + 11, "font-size": 9.5, fill: "#CE93A8", "text-anchor": "end" }, "OB- 15m"));
    // FVG magnet
    s.appendChild(el("rect", { x: xOf(24), y: yOf(105.2), width: R - xOf(24), height: yOf(104.3) - yOf(105.2), fill: "rgba(160,120,252,.16)", stroke: "rgba(160,120,252,.55)" }));
    s.appendChild(txt({ x: R - 4, y: yOf(105.2) + 11, "font-size": 9.5, fill: "#b79cff", "text-anchor": "end" }, "FVG 5m  ⟵ magnet"));
    const way = [[0, 104], [7, 102], [13, 105.5], [20, 106], [27, 104.6], [34, 103], [39, 104.4]];
    drawCandles(s, series(N, way, 0.62), xOf, yOf, cw);
    host.appendChild(s);
  }

  const R = { hero, liqpool, cascade, profile, cvd, confluence, fvgob };
  function render() {
    document.querySelectorAll("[data-chart]").forEach((host) => {
      const k = host.getAttribute("data-chart");
      if (host.dataset.rendered) return;
      if (R[k]) { try { R[k](host); host.dataset.rendered = "1"; } catch (e) { console.warn("chart", k, e); } }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render); else render();
  window.LIQ_CHARTS = { render };
})();
