/**
 * generate_anime_images.mjs  — Stability AI "Stable Image Core"
 * ─────────────────────────────────────────────────────────────
 * Generates 8 × 1024×1024 Pixar/Disney-3D-CGI-style images for the story slides.
 *
 * Cost:  $0.03 / image  →  8 images = $0.24 total
 *        New accounts get 25 FREE credits ($0.25) — so all 8 are covered by the
 *        free trial if you sign up with Google.
 *
 * Setup (one-time):
 *   1. Go to  https://platform.stability.ai  and sign up WITH Google
 *      (Google sign-up gives 25 free credits automatically).
 *   2. Go to  https://platform.stability.ai/account/keys  and copy your API key.
 *   3. Paste it in .env.local:
 *        VITE_STABILITY_API_KEY=sk-xxxxxxxxxxxxxxxx
 *   4. Run:  node scripts/generate_anime_images.mjs
 *
 * Usage:
 *   node scripts/generate_anime_images.mjs           ← skips existing files
 *   node scripts/generate_anime_images.mjs --force   ← regenerates everything
 */

import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT    = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'public', 'assets', 'images');
fs.mkdirSync(OUT_DIR, { recursive: true });

const FORCE = process.argv.includes('--force');

/* ── Read API key ──────────────────────────────────────────────────── */
function readKey() {
  if (process.env.VITE_STABILITY_API_KEY) return process.env.VITE_STABILITY_API_KEY.trim();
  for (const f of ['.env.local', '.env']) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) continue;
    const m = fs.readFileSync(p, 'utf8')
      .match(/^\s*VITE_STABILITY_API_KEY\s*=\s*"?([^"\r\n]+)"?/m);
    if (m) return m[1].trim();
  }
  return '';
}

const API_KEY = readKey();
if (!API_KEY) {
  console.error(`
╔══════════════════════════════════════════════════════════════════╗
║  VITE_STABILITY_API_KEY not found — follow these steps:          ║
║                                                                  ║
║  1. Go to  https://platform.stability.ai                         ║
║     Sign up WITH Google to get 25 FREE credits ($0.25).          ║
║                                                                  ║
║  2. Go to  https://platform.stability.ai/account/keys            ║
║     Click "Create API Key" and copy the sk-xxxxxxx value.        ║
║                                                                  ║
║  3. Open .env.local and add:                                     ║
║       VITE_STABILITY_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx         ║
║                                                                  ║
║  4. Run this script again:                                       ║
║       node scripts/generate_anime_images.mjs                     ║
╚══════════════════════════════════════════════════════════════════╝
`);
  process.exit(1);
}

/* ── API helper ────────────────────────────────────────────────────── */
const ENDPOINT = 'https://api.stability.ai/v2beta/stable-image/generate/core';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function generateImage(prompt, negPrompt, outPath) {
  // Sanitize: strip non-ASCII characters that break multipart/form-data headers
  const clean = s => s.replace(/[^\x00-\x7F]/g, '').replace(/\s+/g, ' ').trim();
  const form = new FormData();
  form.append('prompt',          clean(prompt));
  form.append('negative_prompt', clean(negPrompt));
  form.append('aspect_ratio',    '1:1');
  form.append('output_format',   'png');

  for (let attempt = 1; attempt <= 4; attempt++) {
    let res;
    try {
      res = await fetch(ENDPOINT, {
        method:  'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          Accept:        'image/*'
        },
        body: form
      });
    } catch (err) {
      console.log(`    network error: ${err.message} — retrying (${attempt}/4)`);
      await sleep(5000);
      continue;
    }

    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 2000) {
        console.log(`    ⚠ Tiny response (${buf.length} B), retrying…`);
        await sleep(4000);
        continue;
      }
      fs.writeFileSync(outPath, buf);
      return { ok: true, bytes: buf.length };
    }

    const body = await res.text().catch(() => '');
    if (res.status === 429 || res.status === 503) {
      const wait = res.status === 429 ? 20000 : 10000;
      console.log(`    ⏳ ${res.status} — waiting ${wait/1000}s… (attempt ${attempt}/4)`);
      await sleep(wait);
    } else {
      return { ok: false, error: `HTTP ${res.status}: ${body.slice(0, 300)}` };
    }
  }
  return { ok: false, error: 'Max retries exceeded' };
}

/* ── Shared style prefix & negative prompt ─────────────────────────── */
// This prefix locks every image into Pixar/Disney 3D CGI style.
const STYLE_PREFIX = [
  '3D animated CGI movie style, Pixar Disney quality,',
  'highly detailed digital art, vibrant colors,',
  'cinematic lighting, soft subsurface scattering skin,',
  'expressive large eyes, smooth rounded shapes,',
  'dark deep-purple cosmic background with stars and nebula,',
  'educational math theme, colorful neon coordinate grid elements,'
].join(' ');

const NEG = [
  'flat 2D, sketch, watercolor, photography, realistic photo, low quality,',
  'blurry, noisy, bad anatomy, extra limbs, deformed, text, watermark,',
  'adult content, violence, nsfw, dark, scary, horror'
].join(' ');

/* ── 8 Slide prompts ───────────────────────────────────────────────── */
const SLIDES = [
  // Slide 1 — Two Number Lines Meet
  {
    file: 'slide1.png',
    prompt: `${STYLE_PREFIX}
      cute 3D animated girl student with big expressive eyes and purple hair,
      standing beside a giant glowing Cartesian coordinate plane floating in space,
      x-axis glowing golden yellow, y-axis glowing cyan blue, they cross at a
      bright pink origin dot labeled (0,0), neon grid lines fill the background,
      stars and purple nebula behind her, wonder and curiosity expression,
      colorful school-themed cosmic classroom setting`
  },

  // Slide 2 — Ordered Pairs (x, y)
  {
    file: 'slide2.png',
    prompt: `${STYLE_PREFIX}
      cute 3D animated girl adventurer with orange jacket and big expressive eyes,
      running 4 steps right along a glowing blue x-axis then jumping 3 steps up
      a glowing pink y-axis on a neon coordinate grid floating in space,
      a bright green glowing dot marks the destination point (4,3),
      blue arrow labeled "4 right" and pink arrow labeled "3 up",
      joyful excitement expression, stars and purple nebula in background`
  },

  // Slide 3 — The Four Quadrants
  {
    file: 'slide3.png',
    prompt: `${STYLE_PREFIX}
      four cute 3D animated chibi characters each floating in one quadrant
      of a giant glowing Cartesian plane in outer space,
      quadrant I top-right glowing gold with cheerful character,
      quadrant II top-left glowing green with curious character,
      quadrant III bottom-left glowing magenta pink with thinking character,
      quadrant IV bottom-right glowing cyan with excited character,
      each quadrant has Roman numeral label, coordinate axes glow white,
      deep purple starry nebula background`
  },

  // Slide 4 — Points on the Axes
  {
    file: 'slide4.png',
    prompt: `${STYLE_PREFIX}
      cute 3D animated robot character with glowing blue eyes standing
      precisely on the x-axis of a giant floating coordinate plane in space,
      a second cute character balancing on the y-axis, glowing bright dots
      on the axes highlighted in neon cyan and magenta, labels (5,0) and (0,3)
      float beside the dots in colorful text, warning sign saying "No Quadrant!"
      glows in golden light, purple cosmic background with stars`
  },

  // Slide 5 — Distance Along a Line
  {
    file: 'slide5.png',
    prompt: `${STYLE_PREFIX}
      two cute 3D animated characters facing each other across a glowing
      horizontal coordinate line in space, one character at point (-2,3)
      glowing pink, another at point (5,3) glowing green,
      a bright golden measuring tape stretches between them labeled "7 units"
      in large glowing text, coordinate grid floats in deep purple starry space,
      both characters have surprised happy expressions, neon mathematical symbols`
  },

  // Slide 6 — Shapes on the Plane
  {
    file: 'slide6.png',
    prompt: `${STYLE_PREFIX}
      cute 3D animated architect girl with blueprints and hard hat standing
      inside a glowing purple semi-transparent rectangle on a coordinate plane
      floating in space, four colorful corner dots glow pink green cyan yellow
      labeled A B C D, golden formula "6 × 4 = 24" glows above the shape,
      measuring lines appear along the sides, wonder and pride expression,
      deep purple starry nebula background`
  },

  // Slide 7 — Captain Ava's Treasure
  {
    file: 'slide7.png',
    prompt: `${STYLE_PREFIX}
      cute 3D animated pirate captain girl named Ava with a large pirate hat
      decorated with skull, orange and purple coat, holding a glowing treasure map,
      standing between two glowing coordinate grids floating in space,
      left grid has a red X mark at point (4,-3) labeled "Wrong!",
      right grid has a golden treasure chest emoji at point (-3,4) labeled "Treasure!",
      Ava points excitedly at the correct grid, bright stars and purple nebula background,
      adventurous and triumphant expression`
  },

  // Slide 8 — Step Into the Simulation Lab
  {
    file: 'slide8.png',
    prompt: `${STYLE_PREFIX}
      cute 3D animated girl and robot walking through a glowing futuristic portal
      into a cosmic mathematics laboratory in space, holographic coordinate planes
      float all around them, neon mathematical symbols and coordinates glow in the air,
      glowing flask and test-tube decorations, two small rockets fly past in the background,
      sparkles and stars fill the purple nebula sky, excitement and wonder expressions,
      cinematic wide shot, vibrant purple cyan gold color palette`
  }
];

/* ── Main ──────────────────────────────────────────────────────────── */
console.log('Stability AI — Stable Image Core  ($0.03/image)');
console.log(`Generating ${SLIDES.length} Pixar-style 3D CGI images…\n`);

let made = 0, skipped = 0, failed = 0;

for (const [i, s] of SLIDES.entries()) {
  const outPath = path.join(OUT_DIR, s.file);
  if (!FORCE && fs.existsSync(outPath) && fs.statSync(outPath).size > 10000) {
    console.log(`[${i+1}/${SLIDES.length}] ${s.file}  ⟳ exists, skipping`);
    skipped++;
    continue;
  }

  process.stdout.write(`[${i+1}/${SLIDES.length}] ${s.file}… `);
  const result = await generateImage(s.prompt, NEG, outPath);

  if (result.ok) {
    console.log(`✔  (${(result.bytes/1024).toFixed(0)} KB)`);
    made++;
  } else {
    console.log(`✖  ${result.error}`);
    failed++;
  }

  // Rate-limit pause between calls
  if (i < SLIDES.length - 1) await sleep(1200);
}

console.log(`\nDone.  generated ${made}, skipped ${skipped}, failed ${failed}.`);
if (failed > 0) {
  console.log('Re-run to retry failed slides (use --force to redo all).');
  process.exitCode = 1;
}
