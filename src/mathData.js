/* =========================================================================
   MATH DATA & PROCEDURAL QUESTION GENERATOR
   Procedurally generates Grade 8 "Cartesian Plane" questions.
   Each question carries diagram data for <CoordDiagram/>.
   ========================================================================= */

export const WESTERN_NAMES = [
  "Leo", "Emma", "Alex", "Oliver", "Sophia", "Jack", "Maya", "Lucas",
  "Ethan", "Chloe", "Noah", "Liam", "Harper", "Ava", "Mason", "Ella",
  "James", "Mia", "Logan", "Charlotte"
];

export const PRACTICE_WORLDS = [
  { id: 0, name: "Origin Oasis", icon: "🎯", range: "Q1–10", difficulty: 1 },
  { id: 1, name: "Quadrant Quarry", icon: "🧭", range: "Q11–20", difficulty: 1 },
  { id: 2, name: "Axis Avenue", icon: "➕", range: "Q21–30", difficulty: 2 },
  { id: 3, name: "Pirate Cove", icon: "🏴‍☠️", range: "Q31–40", difficulty: 2 },
  { id: 4, name: "Distance Dunes", icon: "📏", range: "Q41–50", difficulty: 2 },
  { id: 5, name: "Shape Shore", icon: "🔷", range: "Q51–60", difficulty: 3 },
  { id: 6, name: "Mirror Marsh", icon: "🪞", range: "Q61–70", difficulty: 3 },
  { id: 7, name: "Slide Summit", icon: "🛝", range: "Q71–80", difficulty: 3 },
  { id: 8, name: "Robot Ridge", icon: "🤖", range: "Q81–90", difficulty: 4 },
  { id: 9, name: "Navigator's Peak", icon: "🗺️", range: "Q91–100", difficulty: 4 }
];

const PLACES = ["treasure chest", "lighthouse", "campsite", "drone", "robot", "café", "bus stop", "rocket", "fountain", "castle"];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Random non-zero integer in [−m, m]. */
const nz = (m = 6) => { let v = 0; while (v === 0) v = randInt(-m, m); return v; };

export const fmtN = n => (n < 0 ? `−${Math.abs(n)}` : `${n}`);
export const pt = (x, y) => `(${fmtN(x)}, ${fmtN(y)})`;
const quadOf = (x, y) => (x === 0 && y === 0 ? 'Origin' : x === 0 ? 'y-axis' : y === 0 ? 'x-axis' : x > 0 ? (y > 0 ? 'Quadrant I' : 'Quadrant IV') : (y > 0 ? 'Quadrant II' : 'Quadrant III'));

const RULES = {
  read: "✦ x FIRST, THEN y",
  quad: "✦ CHECK THE SIGNS",
  axis: "✦ 0 MEANS ON AN AXIS",
  dist: "✦ SUBTRACT THE COORDINATES",
  shape: "✦ COUNT THE UNITS",
  reflect: "✦ FLIP ONE SIGN",
  move: "✦ RIGHT/UP ADD, LEFT/DOWN SUBTRACT"
};

/** Three wrong ordered pairs that look like common mistakes. */
function pairDistractors(x, y) {
  const c = [[y, x], [-x, y], [x, -y], [-x, -y], [x + 1, y], [x, y - 1], [-y, -x]];
  const out = [];
  for (const [a, b] of c) {
    if ((a !== x || b !== y) && !out.some(([p, q]) => p === a && q === b) && Math.abs(a) <= 9 && Math.abs(b) <= 9) out.push([a, b]);
  }
  return out;
}

/**
 * Generate a procedural question for a given world
 */
export function makeQuestion(worldIndex = 0) {
  const world = PRACTICE_WORLDS[worldIndex] || PRACTICE_WORLDS[0];
  const name = pick(WESTERN_NAMES);
  const diff = world.difficulty;

  const allowed = ['read', 'read', 'quad', 'quad'];
  if (diff >= 2) allowed.push('axis', 'distH', 'distV', 'move', 'read');
  if (diff >= 3) allowed.push('reflectX', 'reflectY', 'vertex', 'area', 'perimeter');
  if (diff >= 4) allowed.push('vertex', 'area', 'triArea', 'move2', 'reflectDist');
  const archetype = pick(allowed);

  let prompt = "";
  let options = null;       // labels, first one correct
  let correctNum = null;    // for numeric answers
  let unit = '';
  let distractors = [];
  let diagramData = { points: [] };
  let explanation = "";
  let rule = RULES.read;

  switch (archetype) {
    case 'read': {
      const x = nz(6), y = nz(6);
      prompt = `What are the coordinates of point P?`;
      diagramData = { points: [{ x, y, label: 'P', color: '#facc15' }] };
      const ds = pairDistractors(x, y).slice(0, 3);
      options = [pt(x, y), ...ds.map(([a, b]) => pt(a, b))];
      explanation = `From the origin go ${Math.abs(x)} ${x > 0 ? 'right' : 'left'}, then ${Math.abs(y)} ${y > 0 ? 'up' : 'down'}: P = ${pt(x, y)}.`;
      break;
    }

    case 'quad': {
      const x = nz(9), y = nz(9);
      const q = quadOf(x, y);
      prompt = `${name}'s ${pick(PLACES)} is at ${pt(x, y)}. In which quadrant is it?`;
      diagramData = { points: [], quadLabels: true };
      options = [q, ...['Quadrant I', 'Quadrant II', 'Quadrant III', 'Quadrant IV'].filter(v => v !== q)];
      explanation = `x is ${x > 0 ? 'positive' : 'negative'} and y is ${y > 0 ? 'positive' : 'negative'}, so it is in ${q}.`;
      rule = RULES.quad;
      break;
    }

    case 'axis': {
      const onX = Math.random() < 0.5;
      const v = nz(6);
      const correct = onX ? [v, 0] : [0, v];
      const wrong = [];
      while (wrong.length < 3) {
        const c = [nz(6), nz(6)];
        if (!wrong.some(w => w[0] === c[0] && w[1] === c[1])) wrong.push(c);
      }
      if (Math.random() < 0.6) wrong[0] = onX ? [0, nz(6)] : [nz(6), 0]; // a point on the OTHER axis
      prompt = `Which of these points lies on the ${onX ? 'x' : 'y'}-axis?`;
      diagramData = { points: [] };
      options = [pt(...correct), ...wrong.map(w => pt(...w))];
      explanation = onX ? `Points on the x-axis have y = 0, so ${pt(...correct)}.` : `Points on the y-axis have x = 0, so ${pt(...correct)}.`;
      rule = RULES.axis;
      break;
    }

    case 'distH': {
      const y = nz(5);
      const x1 = randInt(-6, 0), x2 = randInt(1, 6);
      correctNum = x2 - x1; unit = 'units';
      prompt = `Find the distance between A${pt(x1, y)} and B${pt(x2, y)}.`;
      diagramData = { points: [{ x: x1, y, label: 'A', color: '#38bdf8' }, { x: x2, y, label: 'B', color: '#f472b6' }], segments: [{ a: [x1, y], b: [x2, y], color: '#facc15', dashed: true }] };
      distractors = [x2 + x1 === 0 ? x2 : Math.abs(x2 + x1), correctNum + 1, Math.abs(x1) + Math.abs(x2) + 2, x2];
      explanation = `Same y-coordinate, so subtract x: ${fmtN(x2)} − (${fmtN(x1)}) = ${correctNum} units.`;
      rule = RULES.dist;
      break;
    }

    case 'distV': {
      const x = nz(5);
      const y1 = randInt(-6, -1), y2 = randInt(0, 6);
      correctNum = y2 - y1; unit = 'units';
      prompt = `A ${pick(PLACES)} is at ${pt(x, y2)} and a ${pick(PLACES)} is at ${pt(x, y1)}. How far apart are they?`;
      diagramData = { points: [{ x, y: y2, label: 'A', color: '#38bdf8' }, { x, y: y1, label: 'B', color: '#f472b6' }], segments: [{ a: [x, y1], b: [x, y2], color: '#facc15', dashed: true }] };
      distractors = [Math.abs(y2 + y1) || correctNum + 2, correctNum - 1, correctNum + 1, Math.abs(x)];
      explanation = `Same x-coordinate, so subtract y: ${fmtN(y2)} − (${fmtN(y1)}) = ${correctNum} units.`;
      rule = RULES.dist;
      break;
    }

    case 'move':
    case 'move2': {
      const x = randInt(-5, 5), y = randInt(-5, 5);
      const dx = nz(5), dy = nz(5);
      const nx = x + dx, ny = y + dy;
      if (Math.abs(nx) > 6 || Math.abs(ny) > 6) return makeQuestion(worldIndex);
      const h = `${Math.abs(dx)} unit${Math.abs(dx) > 1 ? 's' : ''} ${dx > 0 ? 'right' : 'left'}`;
      const v = `${Math.abs(dy)} unit${Math.abs(dy) > 1 ? 's' : ''} ${dy > 0 ? 'up' : 'down'}`;
      prompt = archetype === 'move'
        ? `A ${pick(PLACES)} at ${pt(x, y)} moves ${h} and ${v}. What are its new coordinates?`
        : `${name}'s robot starts at ${pt(x, y)}. It moves ${v}, then ${h}. Where does it end up?`;
      diagramData = { points: [{ x, y, label: 'Start', color: '#4ade80' }] };
      options = [pt(nx, ny), pt(x - dx, y - dy), pt(x + dy, y + dx), pt(nx, y - dy)];
      if (new Set(options).size < 4) options = [pt(nx, ny), pt(x - dx, y - dy), pt(x + dy, y + dx), pt(nx + 1, ny)];
      explanation = `x: ${fmtN(x)} ${dx > 0 ? '+' : '−'} ${Math.abs(dx)} = ${fmtN(nx)};  y: ${fmtN(y)} ${dy > 0 ? '+' : '−'} ${Math.abs(dy)} = ${fmtN(ny)}. New point ${pt(nx, ny)}.`;
      rule = RULES.move;
      break;
    }

    case 'reflectX':
    case 'reflectY': {
      const x = nz(6), y = nz(6);
      const inX = archetype === 'reflectX';
      const [rx, ry] = inX ? [x, -y] : [-x, y];
      prompt = `Point Q${pt(x, y)} is reflected in the ${inX ? 'x' : 'y'}-axis. What are the coordinates of its image Q'?`;
      diagramData = { points: [{ x, y, label: 'Q', color: '#facc15' }] };
      options = [pt(rx, ry), pt(inX ? -x : x, inX ? y : -y), pt(-x, -y), pt(y, x)];
      if (new Set(options).size < 4) options = [pt(rx, ry), pt(-x, -y), pt(y, x), pt(rx + 1, ry)];
      explanation = inX ? `Reflecting in the x-axis keeps x and changes the sign of y: ${pt(rx, ry)}.` : `Reflecting in the y-axis keeps y and changes the sign of x: ${pt(rx, ry)}.`;
      rule = RULES.reflect;
      break;
    }

    case 'reflectDist': {
      const x = nz(5), y = nz(5);
      correctNum = 2 * Math.abs(y); unit = 'units';
      prompt = `Point R${pt(x, y)} is reflected in the x-axis to R'. How far apart are R and R'?`;
      diagramData = { points: [{ x, y, label: 'R', color: '#facc15' }, { x, y: -y, label: "R'", color: '#38bdf8' }], segments: [{ a: [x, y], b: [x, -y], color: '#f472b6', dashed: true }] };
      distractors = [Math.abs(y), 2 * Math.abs(x), Math.abs(y) + 1, 0];
      explanation = `R' = ${pt(x, -y)}. Same x, so distance = ${fmtN(Math.abs(y))} − (${fmtN(-Math.abs(y))}) = ${correctNum} units.`;
      rule = RULES.reflect;
      break;
    }

    case 'vertex': {
      const x1 = randInt(-6, -1), x2 = randInt(1, 6), y1 = randInt(1, 6), y2 = randInt(-6, -1);
      const corners = [[x1, y1], [x2, y1], [x2, y2], [x1, y2]];
      const miss = randInt(0, 3);
      const given = corners.filter((_, i) => i !== miss);
      const [mx, my] = corners[miss];
      const labels = ['A', 'B', 'C', 'D'];
      prompt = `Three corners of a rectangle are ${given.map(p => pt(...p)).join(', ')}. Find the fourth corner.`;
      diagramData = { points: given.map((p, i) => ({ x: p[0], y: p[1], label: labels[i], color: '#facc15' })) };
      options = [pt(mx, my), pt(-mx, my), pt(mx, -my), pt(my, mx)];
      if (new Set(options).size < 4) options = [pt(mx, my), pt(-mx, my), pt(mx, -my), pt(mx + 1, my)];
      explanation = `The missing corner shares its x with one neighbour and its y with the other: ${pt(mx, my)}.`;
      rule = RULES.shape;
      break;
    }

    case 'area':
    case 'perimeter': {
      const x1 = randInt(-6, -1), x2 = randInt(1, 6), y1 = randInt(1, 6), y2 = randInt(-6, -1);
      const L = x2 - x1, W = y1 - y2;
      const corners = [[x1, y1], [x2, y1], [x2, y2], [x1, y2]];
      const isArea = archetype === 'area';
      correctNum = isArea ? L * W : 2 * (L + W);
      unit = isArea ? 'sq units' : 'units';
      prompt = `A rectangle has corners ${corners.map(p => pt(...p)).join(', ')}. Find its ${isArea ? 'area' : 'perimeter'}.`;
      diagramData = { points: corners.map((p, i) => ({ x: p[0], y: p[1], label: 'ABCD'[i], color: '#facc15', r: 5 })), polygon: { pts: corners, color: '#38bdf8' } };
      distractors = isArea
        ? [2 * (L + W), L * W + W, L * W + L, L + W]
        : [L * W, L + W, 2 * (L + W) + 2, 2 * L + W];
      explanation = `Length = ${fmtN(x2)} − (${fmtN(x1)}) = ${L}, width = ${fmtN(y1)} − (${fmtN(y2)}) = ${W}. ${isArea ? `Area = ${L} × ${W} = ${correctNum}` : `Perimeter = 2 × (${L} + ${W}) = ${correctNum}`}.`;
      rule = RULES.shape;
      break;
    }

    case 'triArea': {
      const x1 = randInt(-6, -1), x2 = randInt(1, 6), y1 = randInt(-6, -1), y2 = randInt(1, 6);
      const b = x2 - x1, h = y2 - y1;
      if ((b * h) % 2 !== 0) return makeQuestion(worldIndex);
      correctNum = (b * h) / 2; unit = 'sq units';
      const P = [[x1, y1], [x2, y1], [x1, y2]];
      prompt = `A right triangle has vertices ${P.map(p => pt(...p)).join(', ')}. Find its area.`;
      diagramData = { points: P.map((p, i) => ({ x: p[0], y: p[1], label: 'JKL'[i], color: '#facc15', r: 5 })), polygon: { pts: P, color: '#f472b6' } };
      distractors = [b * h, b + h, (b * h) / 2 + b, b * h / 4];
      explanation = `Base = ${b}, height = ${h}. Area = ½ × ${b} × ${h} = ${correctNum}.`;
      rule = RULES.shape;
      break;
    }

    default:
      break;
  }

  // Build numeric options
  if (!options) {
    const c = `${correctNum} ${unit}`;
    const uniq = [];
    for (const d of distractors) {
      const f = `${d} ${unit}`;
      if (Number.isInteger(d) && d > 0 && f !== c && !uniq.includes(f)) uniq.push(f);
    }
    for (const fb of [correctNum + 2, correctNum * 2, correctNum + 1, correctNum + 3, correctNum + 5]) {
      if (uniq.length >= 3) break;
      const f = `${fb} ${unit}`;
      if (fb > 0 && f !== c && !uniq.includes(f)) uniq.push(f);
    }
    options = [c, ...uniq.slice(0, 3)];
  }

  // Coordinate options: guarantee 4 distinct labels
  if (new Set(options).size < options.length || options.length < 4) {
    const uniq = [...new Set(options)];
    const m = options[0].match(/\((−?\d+), (−?\d+)\)/);
    if (m) {
      const n = v => Number(v.replace('−', '-'));
      const [x, y] = [n(m[1]), n(m[2])];
      for (const [a, b] of [[x + 1, y], [x, y + 1], [x - 1, y], [x, y - 1], [y, x], [-x, -y]]) {
        if (uniq.length >= 4) break;
        const l = pt(a, b);
        if (!uniq.includes(l)) uniq.push(l);
      }
    }
    options = uniq;
  }
  options = options.slice(0, 4);
  const target = options[0];
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return {
    world,
    name,
    archetype,
    prompt,
    correctIndex: shuffled.indexOf(target),
    correctValue: target,
    options: shuffled,
    diagramData,
    rule,
    explanation
  };
}
