/**
 * generate_images.mjs  v2
 * Layout rules:
 *   – Grade badge:  y=18  (h=44, so bottom=62)
 *   – Title line 1: y=140 (top of text baseline)
 *   – Title line 2: y=240 (100 px line-height)
 *   – Content zone: y=270 … y=910
 *   – Bottom pill:  y=930
 * No element from one zone ever overlaps another.
 */
import { renderAsync } from '@resvg/resvg-js';
import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT    = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'public', 'assets', 'images');
fs.mkdirSync(OUT_DIR, { recursive: true });

const W = 1024, H = 1024;

/* ══════════════════════════════════════════════════════════════════════
   SHARED HELPERS
   ══════════════════════════════════════════════════════════════════════ */

/** Pseudo-random helper (deterministic so stars are stable across runs) */
const rng = (seed, n) => { const x = Math.sin(seed) * 10000; return Math.abs(x - Math.floor(x)) * n; };

/** Shared defs + dark-purple starfield */
function bgBase() {
  const stars = [];
  for (let i = 0; i < 90; i++) {
    const sx = rng(i * 7.3 + 1, 1020).toFixed(1);
    const sy = rng(i * 3.1 + 2, 1020).toFixed(1);
    const sr = (rng(i * 1.7 + 3, 2.4) + 0.6).toFixed(2);
    const op = (rng(i * 2.9 + 4, 0.6) + 0.3).toFixed(2);
    stars.push(`<circle cx="${sx}" cy="${sy}" r="${sr}" fill="white" opacity="${op}"/>`);
  }
  return `<defs>
    <radialGradient id="bg" cx="50%" cy="38%" r="72%">
      <stop offset="0%"  stop-color="#1a0848"/>
      <stop offset="100%" stop-color="#05001a"/>
    </radialGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="glow2" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="9" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="shadow">
      <feDropShadow dx="0" dy="5" stdDeviation="8" flood-color="#000" flood-opacity="0.55"/>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  ${stars.join('\n  ')}`;
}

/** Decorative corner orbs */
const ORBS = `
  <circle cx="78"  cy="118" r="48" fill="#a855f7" opacity="0.92" filter="url(#glow2)"/>
  <circle cx="946" cy="104" r="40" fill="#22d3ee" opacity="0.92" filter="url(#glow2)"/>`;

/**
 * Grade-8 badge — always at the very top, centred.
 * Rendered BEFORE the title so title can safely start below it.
 */
const BADGE = `
  <rect x="362" y="18" width="300" height="44" rx="22"
    fill="#1c0d38" stroke="#a78bfa" stroke-width="2.5"/>
  <text x="512" y="47" text-anchor="middle"
    font-family="Arial Rounded MT Bold,Arial Black,sans-serif"
    font-size="22" font-weight="900" fill="#a78bfa">Grade 8 Math</text>`;

/**
 * Two-line bubble title.
 * line1 baseline = 140, line2 baseline = 240.
 * Both lines are safely below the badge (bottom≈62) and
 * the content zone starts at 270.
 */
function title2(line1, line2,
                c1 = '#ff6eb4', c2 = '#ffe066') {
  const stroke = `stroke="#120030" stroke-width="11"
    stroke-linejoin="round" paint-order="stroke"`;
  return `
  <text x="512" y="148" text-anchor="middle"
    font-family="Arial Rounded MT Bold,Arial Black,sans-serif"
    font-size="88" font-weight="900" letter-spacing="1"
    ${stroke} fill="${c1}">${line1}</text>
  <text x="512" y="248" text-anchor="middle"
    font-family="Arial Rounded MT Bold,Arial Black,sans-serif"
    font-size="88" font-weight="900" letter-spacing="1"
    ${stroke} fill="${c2}">${line2}</text>`;
}

/** Bottom gold pill — always at y=930 */
function pill(text) {
  return `
  <rect x="72" y="928" width="880" height="70" rx="35"
    fill="#18003e" stroke="#facc15" stroke-width="3"/>
  <text x="512" y="973" text-anchor="middle"
    font-family="Arial Rounded MT Bold,Arial Black,sans-serif"
    font-size="29" font-weight="900" fill="#facc15">${text}</text>`;
}

/**
 * Coordinate grid centred at (cx, cy), total width/height = size.
 * Supports optional axis labels, points, and line segments.
 */
function grid(cx, cy, size, { pts = [], segs = [], axisLabels = true } = {}) {
  const s = size / 12;   // one unit in px
  const out = [];

  // background
  out.push(`<rect x="${cx-6*s}" y="${cy-6*s}" width="${size}" height="${size}"
    rx="14" fill="#0a1530" opacity="0.88"/>`);

  // minor grid lines
  for (let i = -6; i <= 6; i++) {
    const lw = i === 0 ? 2.8 : 0.9;
    const op = i === 0 ? 1   : 0.45;
    out.push(`<line x1="${cx+i*s}" y1="${cy-6*s}" x2="${cx+i*s}" y2="${cy+6*s}"
      stroke="#3a4a6a" stroke-width="${lw}" opacity="${op}"/>`);
    out.push(`<line x1="${cx-6*s}" y1="${cy-i*s}" x2="${cx+6*s}" y2="${cy-i*s}"
      stroke="#3a4a6a" stroke-width="${lw}" opacity="${op}"/>`);
    if (axisLabels && i !== 0 && i % 2 === 0) {
      out.push(`<text x="${cx+i*s}" y="${cy+22}" text-anchor="middle"
        font-size="17" fill="#6a80b8" font-family="Arial">${i}</text>`);
      out.push(`<text x="${cx-20}" y="${cy-i*s+6}" text-anchor="end"
        font-size="17" fill="#6a80b8" font-family="Arial">${i}</text>`);
    }
  }

  // axes
  out.push(`<line x1="${cx-6*s}" y1="${cy}" x2="${cx+6*s}" y2="${cy}" stroke="white" stroke-width="3"/>`);
  out.push(`<line x1="${cx}"     y1="${cy+6*s}" x2="${cx}" y2="${cy-6*s}" stroke="white" stroke-width="3"/>`);
  // arrowheads
  out.push(`<polygon points="${cx+6*s-1},${cy-9} ${cx+6*s+16},${cy} ${cx+6*s-1},${cy+9}" fill="white"/>`);
  out.push(`<polygon points="${cx-9},${cy-6*s+1} ${cx},${cy-6*s-16} ${cx+9},${cy-6*s+1}" fill="white"/>`);
  if (axisLabels) {
    out.push(`<text x="${cx+6*s+22}" y="${cy+7}" text-anchor="start"
      font-size="24" fill="white" font-family="Arial">x</text>`);
    out.push(`<text x="${cx+7}" y="${cy-6*s-18}" text-anchor="start"
      font-size="24" fill="white" font-family="Arial">y</text>`);
  }

  // segments (draw before points so points appear on top)
  for (const seg of segs) {
    const [ax, ay] = seg.a, [bx, by] = seg.b;
    out.push(`<line x1="${cx+ax*s}" y1="${cy-ay*s}" x2="${cx+bx*s}" y2="${cy-by*s}"
      stroke="${seg.col || '#4ade80'}" stroke-width="${seg.w || 3}"
      stroke-dasharray="${seg.dash ? '9,7' : ''}" opacity="${seg.op || 1}"/>`);
  }

  // points
  for (const p of pts) {
    const px = cx + p.x * s, py = cy - p.y * s;
    out.push(`<circle cx="${px}" cy="${py}" r="${p.r || 11}"
      fill="${p.col || '#facc15'}" stroke="white" stroke-width="2.5"
      filter="url(#glow)"/>`);
    if (p.label) {
      const lx = px + (p.lox ?? 15), ly = py + (p.loy ?? -13);
      out.push(`<text x="${lx}" y="${ly}" font-size="${p.fs || 19}"
        fill="${p.col || '#facc15'}" font-family="Arial" font-weight="bold">${p.label}</text>`);
    }
  }

  return `<g>${out.join('\n')}</g>`;
}

/** Info card: rounded dark box with coloured border and 1-3 lines of text */
function card(x, y, w, h, { border='#facc15', lines=[] } = {}) {
  const lh = 34;
  const startY = y + h/2 - ((lines.length - 1) * lh) / 2 + 4;
  const textEls = lines.map(({ text, fill='#e2e8f0', size=24, bold=false }, i) =>
    `<text x="${x+w/2}" y="${startY + i*lh}" text-anchor="middle"
      font-size="${size}" fill="${fill}" font-weight="${bold ? 900 : 'normal'}"
      font-family="Arial Rounded MT Bold,Arial Black,sans-serif">${text}</text>`
  ).join('\n');
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20"
    fill="#16003c" stroke="${border}" stroke-width="2.8" filter="url(#shadow)"/>
  ${textEls}`;
}

/* ── CHARACTERS ───────────────────────────────────────────────────────── */

/** Friendly blue robot — centred at (cx, cy), scalable */
function robot(cx, cy, sc = 1) {
  return `<g transform="translate(${cx},${cy}) scale(${sc})">
    <!-- legs -->
    <rect x="-28" y="118" width="24" height="42" rx="12" fill="#1d4ed8" stroke="#93c5fd" stroke-width="2.5"/>
    <rect x="4"   y="118" width="24" height="42" rx="12" fill="#1d4ed8" stroke="#93c5fd" stroke-width="2.5"/>
    <!-- feet -->
    <ellipse cx="-16" cy="162" rx="16" ry="8" fill="#1e40af" stroke="#93c5fd" stroke-width="2"/>
    <ellipse cx="16"  cy="162" rx="16" ry="8" fill="#1e40af" stroke="#93c5fd" stroke-width="2"/>
    <!-- body -->
    <rect x="-44" y="22" width="88" height="98" rx="22" fill="#2563eb" stroke="#93c5fd" stroke-width="3"/>
    <!-- chest screen -->
    <rect x="-28" y="40" width="56" height="36" rx="8" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
    <circle cx="-14" cy="58" r="7" fill="#4ade80" opacity="0.9"/>
    <circle cx="0"   cy="58" r="7" fill="#facc15" opacity="0.9"/>
    <circle cx="14"  cy="58" r="7" fill="#f472b6" opacity="0.9"/>
    <!-- arms -->
    <rect x="-78" y="30" width="36" height="20" rx="10" fill="#2563eb" stroke="#93c5fd" stroke-width="2.5"/>
    <rect x="42"  y="30" width="36" height="20" rx="10" fill="#2563eb" stroke="#93c5fd" stroke-width="2.5"/>
    <!-- hands -->
    <circle cx="-78" cy="40" r="11" fill="#1d4ed8" stroke="#93c5fd" stroke-width="2"/>
    <circle cx="78"  cy="40" r="11" fill="#1d4ed8" stroke="#93c5fd" stroke-width="2"/>
    <!-- neck -->
    <rect x="-14" y="-2" width="28" height="26" rx="8" fill="#1d4ed8" stroke="#93c5fd" stroke-width="2"/>
    <!-- head -->
    <rect x="-42" y="-72" width="84" height="72" rx="20" fill="#1d4ed8" stroke="#93c5fd" stroke-width="3"/>
    <!-- visor -->
    <rect x="-32" y="-60" width="64" height="36" rx="10" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
    <!-- eyes -->
    <circle cx="-16" cy="-42" r="10" fill="#facc15" filter="url(#glow)"/>
    <circle cx="16"  cy="-42" r="10" fill="#facc15" filter="url(#glow)"/>
    <circle cx="-15" cy="-42" r="5"  fill="#1a1a1a"/>
    <circle cx="17"  cy="-42" r="5"  fill="#1a1a1a"/>
    <circle cx="-13" cy="-45" r="2"  fill="white"/>
    <circle cx="19"  cy="-45" r="2"  fill="white"/>
    <!-- mouth -->
    <path d="M-18 -16 Q0 -4 18 -16" stroke="#93c5fd" stroke-width="3"
      fill="none" stroke-linecap="round"/>
    <!-- antenna -->
    <line x1="0" y1="-72" x2="0" y2="-96" stroke="#93c5fd" stroke-width="3"/>
    <circle cx="0" cy="-104" r="10" fill="#f472b6" filter="url(#glow)"/>
  </g>`;
}

/**
 * Captain Ava — proper cartoon pirate girl
 * centred at (cx, cy), scalable.
 * Hat is ABOVE the head, coat is below.
 * Total height ≈ 290 units at scale 1.
 */
function captain(cx, cy, sc = 1) {
  return `<g transform="translate(${cx},${cy}) scale(${sc})">
    <!-- LEGS -->
    <rect x="-24" y="122" width="22" height="46" rx="11" fill="#6d28d9" stroke="#c4b5fd" stroke-width="2.5"/>
    <rect x="2"   y="122" width="22" height="46" rx="11" fill="#6d28d9" stroke="#c4b5fd" stroke-width="2.5"/>
    <!-- boots -->
    <ellipse cx="-13" cy="168" rx="17" ry="9" fill="#451a03" stroke="#92400e" stroke-width="2"/>
    <ellipse cx="13"  cy="168" rx="17" ry="9" fill="#451a03" stroke="#92400e" stroke-width="2"/>
    <!-- COAT body -->
    <rect x="-40" y="20" width="80" height="104" rx="18" fill="#7c3aed" stroke="#c4b5fd" stroke-width="3"/>
    <!-- coat lapels -->
    <polygon points="-40,24 -40,80 -16,24" fill="#6d28d9"/>
    <polygon points="40,24  40,80  16,24"  fill="#6d28d9"/>
    <!-- gold buttons -->
    <circle cx="0" cy="50" r="6" fill="#facc15" stroke="#b45309" stroke-width="1.5"/>
    <circle cx="0" cy="72" r="6" fill="#facc15" stroke="#b45309" stroke-width="1.5"/>
    <circle cx="0" cy="94" r="6" fill="#facc15" stroke="#b45309" stroke-width="1.5"/>
    <!-- ARMS -->
    <rect x="-78" y="26" width="40" height="20" rx="10" fill="#7c3aed" stroke="#c4b5fd" stroke-width="2.5"/>
    <rect x="38"  y="26" width="40" height="20" rx="10" fill="#7c3aed" stroke="#c4b5fd" stroke-width="2.5"/>
    <!-- hands (fists) -->
    <circle cx="-78" cy="36" r="12" fill="#fbbf24" stroke="#b45309" stroke-width="2"/>
    <circle cx="78"  cy="36" r="12" fill="#fbbf24" stroke="#b45309" stroke-width="2"/>
    <!-- right hand holding telescope -->
    <rect x="88" y="20" width="52" height="10" rx="5" fill="#92400e" stroke="#b45309" stroke-width="1.5"/>
    <!-- NECK -->
    <rect x="-12" y="-4" width="24" height="26" rx="8" fill="#fbbf24" stroke="#b45309" stroke-width="2"/>
    <!-- HEAD (round, warm skin tone) -->
    <circle cx="0" cy="-52" r="52" fill="#fbbf24" stroke="#b45309" stroke-width="3"/>
    <!-- HAIR (curly red-brown peeking under hat) -->
    <path d="M-50,-72 Q-56,-44 -52,-28 Q-48,-12 -44,-30" fill="#b45309"/>
    <path d="M 50,-72 Q 56,-44  52,-28 Q 48,-12  44,-30" fill="#b45309"/>
    <path d="M-30,-102 Q 0,-120 30,-102 Q 20,-78 0,-84 Q-20,-78 -30,-102Z" fill="#b45309"/>
    <!-- PIRATE HAT -->
    <!-- brim ellipse -->
    <ellipse cx="0" cy="-96" rx="62" ry="16"
      fill="#1c1917" stroke="#44403c" stroke-width="2"/>
    <!-- hat crown -->
    <path d="M-44,-96 L-36,-152 Q0,-168 36,-152 L44,-96 Z"
      fill="#292524" stroke="#44403c" stroke-width="2"/>
    <!-- hat band -->
    <rect x="-44" y="-108" width="88" height="14" rx="4"
      fill="#7c3aed" stroke="#c4b5fd" stroke-width="1.5"/>
    <!-- skull icon on hat -->
    <circle cx="0" cy="-136" r="12" fill="#facc15"/>
    <circle cx="-5" cy="-138" r="3" fill="#1c1917"/>
    <circle cx="5"  cy="-138" r="3" fill="#1c1917"/>
    <path d="M-5,-130 Q0,-126 5,-130" stroke="#1c1917" stroke-width="2" fill="none"/>
    <!-- EYES -->
    <circle cx="-18" cy="-52" r="10" fill="white"/>
    <circle cx=" 18" cy="-52" r="10" fill="white"/>
    <circle cx="-17" cy="-52" r="5"  fill="#1a1a1a"/>
    <circle cx=" 19" cy="-52" r="5"  fill="#1a1a1a"/>
    <circle cx="-15" cy="-55" r="2"  fill="white"/>
    <circle cx=" 21" cy="-55" r="2"  fill="white"/>
    <!-- ROSY CHEEKS -->
    <circle cx="-30" cy="-40" r="10" fill="#f87171" opacity="0.45"/>
    <circle cx=" 30" cy="-40" r="10" fill="#f87171" opacity="0.45"/>
    <!-- SMILE -->
    <path d="M-16 -34 Q0 -20 16 -34"
      stroke="#92400e" stroke-width="3" fill="none" stroke-linecap="round"/>
  </g>`;
}

/* ══════════════════════════════════════════════════════════════════════
   SLIDE BUILDERS   (content zone: y=268 … y=920)
   ══════════════════════════════════════════════════════════════════════ */

/* ── SLIDE 1: Two Number Lines Meet ──────────────────────────────────── */
function slide1() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  ${bgBase()}
  ${ORBS}
  ${BADGE}
  ${title2('TWO NUMBER', 'LINES MEET!')}

  <!-- grid centred at (340, 616) size 420 -->
  ${grid(340, 616, 420, {
    pts: [{ x:0, y:0, label:'Origin (0,0)', col:'#f472b6', r:13, lox:16, loy:-14 }]
  })}

  <!-- right info cards -->
  ${card(598,348,370,88,{border:'#facc15',lines:[
    {text:'x-axis ↔', fill:'#facc15', size:30, bold:true},
    {text:'horizontal', fill:'#cbd5e1', size:22}
  ]})}
  ${card(598,452,370,88,{border:'#4ade80',lines:[
    {text:'y-axis ↕', fill:'#4ade80', size:30, bold:true},
    {text:'vertical', fill:'#cbd5e1', size:22}
  ]})}
  ${card(598,556,370,74,{border:'#38bdf8',lines:[
    {text:'They cross at 90°', fill:'#38bdf8', size:26, bold:true}
  ]})}

  ${pill('The Cartesian plane: a grid for finding points')}
  </svg>`;
}

/* ── SLIDE 2: Ordered Pairs ───────────────────────────────────────────── */
function slide2() {
  const cx = 350, cy = 620, sz = 420, s = sz / 12;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  ${bgBase()}
  ${ORBS}
  ${BADGE}
  ${title2('ORDERED', 'PAIRS  (x, y)', '#ff6eb4','#ffe066')}

  ${grid(cx, cy, sz, {
    pts:  [{ x:4, y:3, label:'(4, 3)', col:'#4ade80', lox:14, loy:-14 }],
    segs: [
      { a:[0,0], b:[4,0], col:'#38bdf8', w:4 },
      { a:[4,0], b:[4,3], col:'#f472b6', w:4 }
    ]
  })}

  <!-- step annotation: "4 right" below midpoint of horizontal seg -->
  <rect x="${cx+s}" y="${cy+8}" width="104" height="30" rx="12"
    fill="#0c2a4a" stroke="#38bdf8" stroke-width="1.8"/>
  <text x="${cx+2*s}" y="${cy+28}" text-anchor="middle"
    font-size="19" fill="#38bdf8" font-family="Arial" font-weight="bold">4 right →</text>

  <!-- step annotation: "3 up" right of vertical seg -->
  <rect x="${cx+4*s+10}" y="${cy-2.5*s-16}" width="92" height="30" rx="12"
    fill="#3b0764" stroke="#f472b6" stroke-width="1.8"/>
  <text x="${cx+4*s+56}" y="${cy-2.5*s+4}" text-anchor="middle"
    font-size="19" fill="#f472b6" font-family="Arial" font-weight="bold">3 up ↑</text>

  <!-- right panel -->
  ${card(598,330,374,110,{border:'#facc15',lines:[
    {text:'(4, 3)', fill:'#facc15', size:56, bold:true},
    {text:'x first, then y', fill:'#cbd5e1', size:22}
  ]})}
  ${card(598,458,374,86,{border:'#a78bfa',lines:[
    {text:'Along the corridor →', fill:'#a78bfa', size:22, bold:true},
    {text:'Then up the stairs ↑', fill:'#f472b6', size:22, bold:true}
  ]})}

  <!-- robot sits in lower-right, well below cards -->
  ${robot(758, 752, 1.0)}

  ${pill('x comes FIRST — always!')}
  </svg>`;
}

/* ── SLIDE 3: The Four Quadrants ─────────────────────────────────────── */
function slide3() {
  const cx = 512, cy = 616, sz = 500, h2 = sz / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  ${bgBase()}
  ${ORBS}
  ${BADGE}
  ${title2('THE FOUR', 'QUADRANTS', '#ff6eb4','#ffe066')}

  <!-- tinted quadrant zones drawn BEFORE the grid -->
  <rect x="${cx-h2}" y="${cy-h2}" width="${h2}" height="${h2}" rx="4" fill="#4ade80" opacity="0.10"/>
  <rect x="${cx}"    y="${cy-h2}" width="${h2}" height="${h2}" rx="4" fill="#facc15" opacity="0.10"/>
  <rect x="${cx-h2}" y="${cy}"    width="${h2}" height="${h2}" rx="4" fill="#f472b6" opacity="0.10"/>
  <rect x="${cx}"    y="${cy}"    width="${h2}" height="${h2}" rx="4" fill="#38bdf8" opacity="0.10"/>

  ${grid(cx, cy, sz, {
    pts: [
      { x:-3, y: 2, col:'#4ade80' },
      { x: 3, y: 2, col:'#facc15' },
      { x:-3, y:-2, col:'#f472b6' },
      { x: 3, y:-2, col:'#38bdf8' }
    ]
  })}

  <!-- Quadrant label pills (corner of each quadrant) -->
  ${card(cx-h2+10, cy-h2+10, 128,56,{border:'#4ade80',lines:[
    {text:'II  (−,+)', fill:'#4ade80', size:21, bold:true}
  ]})}
  ${card(cx+h2-138, cy-h2+10, 128,56,{border:'#facc15',lines:[
    {text:'I  (+,+)', fill:'#facc15', size:21, bold:true}
  ]})}
  ${card(cx-h2+10, cy+h2-66, 128,56,{border:'#f472b6',lines:[
    {text:'III (−,−)', fill:'#f472b6', size:21, bold:true}
  ]})}
  ${card(cx+h2-138, cy+h2-66, 128,56,{border:'#38bdf8',lines:[
    {text:'IV  (+,−)', fill:'#38bdf8', size:21, bold:true}
  ]})}

  ${pill('Quadrants are numbered anti-clockwise!')}
  </svg>`;
}

/* ── SLIDE 4: Points on the Axes ────────────────────────────────────── */
function slide4() {
  const cx = 340, cy = 616, sz = 420;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  ${bgBase()}
  ${ORBS}
  ${BADGE}
  ${title2('POINTS ON', 'THE AXES', '#38bdf8','#f472b6')}

  ${grid(cx, cy, sz, {
    pts: [
      { x: 5, y: 0, label:'(5, 0)',   col:'#38bdf8', lox:14, loy:-14 },
      { x:-4, y: 0, label:'(−4, 0)',  col:'#38bdf8', lox:14, loy:-14 },
      { x: 0, y: 3, label:'(0, 3)',   col:'#f472b6', lox:14, loy:-14 },
      { x: 0, y:-2, label:'(0, −2)',  col:'#f472b6', lox:14, loy:-14 }
    ]
  })}

  <!-- Right info cards -->
  ${card(598,330,374,98,{border:'#38bdf8',lines:[
    {text:'On x-axis: y = 0', fill:'#38bdf8', size:27, bold:true},
    {text:'e.g. (5, 0) or (−4, 0)', fill:'#cbd5e1', size:21}
  ]})}
  ${card(598,444,374,98,{border:'#f472b6',lines:[
    {text:'On y-axis: x = 0', fill:'#f472b6', size:27, bold:true},
    {text:'e.g. (0, 3) or (0, −2)', fill:'#cbd5e1', size:21}
  ]})}
  ${card(598,558,374,78,{border:'#facc15',lines:[
    {text:'⚠ NOT in any quadrant!', fill:'#facc15', size:24, bold:true}
  ]})}

  ${robot(758, 756, 0.98)}

  ${pill('Axis points belong to NO quadrant!')}
  </svg>`;
}

/* ── SLIDE 5: Distance Along a Line ─────────────────────────────────── */
function slide5() {
  const cx = 370, cy = 616, sz = 460, s = sz / 12;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  ${bgBase()}
  ${ORBS}
  ${BADGE}
  ${title2('DISTANCE', 'ALONG A LINE', '#ffe066','#4ade80')}

  ${grid(cx, cy, sz, {
    pts: [
      { x:-2, y:3, label:'(−2, 3)', col:'#f472b6', lox:-92, loy:-14 },
      { x: 5, y:3, label:'(5, 3)',  col:'#4ade80',  lox: 14, loy:-14 }
    ],
    segs: [{ a:[-2,3], b:[5,3], col:'#facc15', w:4 }]
  })}

  <!-- double-headed distance arrow above the segment -->
  <line x1="${cx-2*s}" y1="${cy-3*s-18}" x2="${cx+5*s}" y2="${cy-3*s-18}"
    stroke="#facc15" stroke-width="3"/>
  <polygon points="${cx-2*s},${cy-3*s-18} ${cx-2*s-14},${cy-3*s-26} ${cx-2*s-14},${cy-3*s-10}"
    fill="#facc15"/>
  <polygon points="${cx+5*s},${cy-3*s-18} ${cx+5*s+14},${cy-3*s-26} ${cx+5*s+14},${cy-3*s-10}"
    fill="#facc15"/>
  <rect x="${cx+0.5*s-44}" y="${cy-3*s-42}" width="102" height="30" rx="12"
    fill="#16003c" stroke="#facc15" stroke-width="2"/>
  <text x="${cx+0.5*s+7}" y="${cy-3*s-21}" text-anchor="middle"
    font-size="21" fill="#facc15" font-family="Arial" font-weight="bold">7 units</text>

  <!-- right formula card -->
  ${card(600,330,374,142,{border:'#facc15',lines:[
    {text:'Same y → subtract x', fill:'#cbd5e1', size:23, bold:false},
    {text:'5 − (−2) = 7', fill:'#4ade80', size:34, bold:true},
    {text:'7 units apart!', fill:'#facc15', size:24, bold:true}
  ]})}

  ${robot(758, 750, 1.0)}

  ${pill('Same y? Subtract the x-coordinates!')}
  </svg>`;
}

/* ── SLIDE 6: Shapes on the Plane ───────────────────────────────────── */
function slide6() {
  const cx = 370, cy = 616, sz = 460, s = sz / 12;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  ${bgBase()}
  ${ORBS}
  ${BADGE}
  ${title2('SHAPES ON', 'THE PLANE', '#a78bfa','#38bdf8')}

  <!-- rectangle fill (draw first so grid is on top) -->
  <rect x="${cx-3*s}" y="${cy-2*s}" width="${6*s}" height="${4*s}"
    fill="#a78bfa" opacity="0.16"/>

  ${grid(cx, cy, sz, {
    pts: [
      { x:-3, y: 2, label:'A(−3,2)',  col:'#f472b6', lox:-86, loy:-14 },
      { x: 3, y: 2, label:'B(3,2)',   col:'#4ade80',  lox: 14, loy:-14 },
      { x: 3, y:-2, label:'C(3,−2)', col:'#38bdf8',  lox: 14, loy:-14 },
      { x:-3, y:-2, label:'D(−3,−2)',col:'#facc15',  lox:-92, loy:-14 }
    ],
    segs: [
      { a:[-3, 2], b:[ 3, 2], col:'white', w:3 },
      { a:[ 3, 2], b:[ 3,-2], col:'white', w:3 },
      { a:[ 3,-2], b:[-3,-2], col:'white', w:3 },
      { a:[-3,-2], b:[-3, 2], col:'white', w:3 }
    ]
  })}

  <!-- area label centred in rectangle -->
  <text x="${cx}" y="${cy+6}" text-anchor="middle"
    font-size="22" fill="#c4b5fd" font-family="Arial" font-weight="bold">24 sq</text>

  <!-- right panel -->
  ${card(598,330,374,152,{border:'#a78bfa',lines:[
    {text:'Length = 6 units', fill:'#cbd5e1', size:25, bold:false},
    {text:'Width  = 4 units', fill:'#cbd5e1', size:25, bold:false},
    {text:'Area = 24 sq units', fill:'#facc15', size:28, bold:true}
  ]})}

  ${robot(758, 756, 1.0)}

  ${pill('Count the units between corners!')}
  </svg>`;
}

/* ── SLIDE 7: Captain Ava's Treasure ────────────────────────────────── */
function slide7() {
  // Two small grids, captain between them, nothing overlapping title
  const gsz = 290, gcy = 690;
  const gcx1 = 80  + gsz/2;   // left grid centre-x
  const gcx2 = 654 + gsz/2;   // right grid centre-x
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  ${bgBase()}
  ${ORBS}
  ${BADGE}
  ${title2("CAPTAIN AVA'S", 'TREASURE', '#facc15','#f472b6')}

  <!-- Captain centred between the two grids, well below title (y≈268) -->
  ${captain(512, 448, 0.75)}

  <!-- label pills above grids (y≈596 so below captain's feet at ≈448+168=616) -->
  <rect x="80"  y="588" width="${gsz}" height="36" rx="14"
    fill="#7f1d1d" stroke="#f87171" stroke-width="2"/>
  <text x="${gcx1}" y="612" text-anchor="middle"
    font-size="19" fill="#f87171" font-family="Arial" font-weight="bold">❌ Crew dug at (4, −3)</text>

  <rect x="654" y="588" width="${gsz}" height="36" rx="14"
    fill="#14532d" stroke="#4ade80" stroke-width="2"/>
  <text x="${gcx2}" y="612" text-anchor="middle"
    font-size="19" fill="#4ade80" font-family="Arial" font-weight="bold">✅ Ava finds (−3, 4)</text>

  <!-- left grid: wrong point -->
  ${grid(gcx1, gcy, gsz, {
    axisLabels: false,
    pts: [{ x:4, y:-3, label:'✗ (4,−3)', col:'#f87171', lox:14, loy:-14 }]
  })}

  <!-- right grid: correct point -->
  ${grid(gcx2, gcy, gsz, {
    axisLabels: false,
    pts: [{ x:-3, y:4, label:'💰(−3,4)', col:'#facc15', lox:14, loy:-14 }]
  })}

  <!-- ≠ badge between grids -->
  <circle cx="512" cy="${gcy}" r="40" fill="#16003c" stroke="#facc15" stroke-width="3"/>
  <text x="512" y="${gcy+14}" text-anchor="middle"
    font-size="38" fill="#facc15"
    font-family="Arial Rounded MT Bold,Arial Black,sans-serif" font-weight="900">≠</text>

  ${pill('Order matters: x always comes first!')}
  </svg>`;
}

/* ── SLIDE 8: Step Into the Simulation Lab ───────────────────────────── */
function slide8() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  ${bgBase()}
  ${ORBS}
  ${BADGE}
  ${title2('STEP INTO THE', 'SIMULATION LAB!', '#38bdf8','#4ade80')}

  <!-- glow rings -->
  <circle cx="512" cy="630" r="240" fill="none" stroke="#a78bfa" stroke-width="2" opacity="0.4"/>
  <circle cx="512" cy="630" r="210" fill="none" stroke="#a78bfa" stroke-width="1" opacity="0.25"/>
  <!-- inner badge -->
  <circle cx="512" cy="630" r="195" fill="#0d0030" stroke="#a78bfa" stroke-width="3.5" opacity="0.95"/>

  <!-- flask emoji -->
  <text x="512" y="568" text-anchor="middle" font-size="96"
    fill="#facc15" filter="url(#glow2)">🧪</text>

  <!-- label text -->
  <text x="512" y="636" text-anchor="middle"
    font-family="Arial Rounded MT Bold,Arial Black,sans-serif"
    font-size="34" font-weight="900" fill="white">Interactive Lab</text>
  <text x="512" y="682" text-anchor="middle"
    font-family="Arial Rounded MT Bold,Arial Black,sans-serif"
    font-size="26" font-weight="700" fill="#a78bfa">Plot · Navigate · Discover</text>

  <!-- rocket left -->
  <text x="162" y="626" text-anchor="middle" font-size="68" opacity="0.85"
    transform="rotate(-28,162,626)">🚀</text>
  <!-- rocket right -->
  <text x="862" y="634" text-anchor="middle" font-size="68" opacity="0.85"
    transform="rotate(22,862,634)">🚀</text>

  <!-- decorative stars -->
  <text x="264" y="440" font-size="42" fill="#facc15" filter="url(#glow)">⭐</text>
  <text x="732" y="446" font-size="38" fill="#38bdf8" filter="url(#glow)">⭐</text>
  <text x="210" y="790" font-size="34" fill="#f472b6" filter="url(#glow)">✨</text>
  <text x="790" y="798" font-size="38" fill="#4ade80" filter="url(#glow)">✨</text>

  <!-- robot at bottom-left of badge -->
  ${robot(292, 834, 0.78)}

  ${pill('Ready to become a coordinate navigator?')}
  </svg>`;
}

/* ══════════════════════════════════════════════════════════════════════
   RENDER LOOP
   ══════════════════════════════════════════════════════════════════════ */
const SLIDES = [slide1, slide2, slide3, slide4, slide5, slide6, slide7, slide8];

for (let i = 0; i < SLIDES.length; i++) {
  const svg = SLIDES[i]();
  const png = await renderAsync(svg, {
    fitTo: { mode: 'width', value: W },
    font:  { loadSystemFonts: true }
  });
  const outPath = path.join(OUT_DIR, `slide${i + 1}.png`);
  fs.writeFileSync(outPath, png.asPng());
  const kb = (fs.statSync(outPath).size / 1024).toFixed(0);
  console.log(`✔ slide${i + 1}.png  (${kb} KB)`);
}
console.log('\nAll 8 slide images generated successfully.');
