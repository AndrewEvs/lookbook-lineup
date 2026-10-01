// Builds preview/index.html from sections/lookbook-lineup.liquid with demo data.
// The section renders everything in JS from one JSON blob, so the preview only supplies
// that JSON plus the CSS variables the Liquid would print. All images are drawn here as
// SVG placeholders, so no store or product photos are needed.
//   node preview/build.js   then open preview/index.html
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'sections/lookbook-lineup.liquid'), 'utf8');
const css = src.match(/{% stylesheet %}([\s\S]*?){% endstylesheet %}/)[1];
const js = src.match(/{% javascript %}([\s\S]*?){% endjavascript %}/)[1];
const img = path.join(__dirname, 'img');
fs.mkdirSync(img, { recursive: true });

/* ---------- placeholder model figures ---------- */
const shade = (hex, amt) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(v + amt * (amt < 0 ? v : 255 - v)))));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
};

function figure({ body = 'f', skin, hair, top, topType, bottom, bottomType, shoe = '#2a2522', inner = '#f3efe8' }) {
  const sh = body === 'f' ? 70 : 84;   // shoulder half-width
  const hip = body === 'f' ? 80 : 76;
  const L = 200 - sh, R = 200 + sh;
  const waist = topType === 'crop' ? 415 : 468;
  const parts = [];
  const g = (d, fill, extra = '') => parts.push(`<path d="${d}" fill="${fill}" ${extra}/>`, `<path d="${d}" fill="url(#sh)"/>`);

  // long hair behind
  if (body === 'f') parts.push(`<path d="M150 80q0-62 50-62t50 62l14 150q-30 18-64 18t-64-18z" fill="${hair}"/>`);

  // legs / bottoms
  if (bottomType === 'skirt') {
    parts.push(`<rect x="163" y="680" width="28" height="250" rx="12" fill="${skin}"/><rect x="209" y="680" width="28" height="250" rx="12" fill="${skin}"/>`);
    g(`M${200 - hip + 4} ${waist - 8}h${2 * hip - 8}l34 300h-${2 * hip + 60}z`, bottom);
  } else {
    const flare = bottomType === 'wide' ? 22 : 0;
    const len = 932 - (waist - 10);
    g(`M${200 - hip} ${waist - 10}h${2 * hip}l${-14 + flare} ${len}h-${66 + flare}l-8-${len - 100}-8 ${len - 100}h-${66 + flare}z`, bottom);
    if (bottomType === 'jeans') parts.push(`<path d="M150 ${waist + 20}l10 440M250 ${waist + 20}l-10 440" stroke="${shade(bottom, 0.25)}" stroke-width="2" fill="none" opacity=".6"/>`);
  }
  parts.push(`<ellipse cx="157" cy="940" rx="34" ry="14" fill="${shoe}"/><ellipse cx="243" cy="940" rx="34" ry="14" fill="${shoe}"/>`);

  // arms (skin) for short sleeves
  if (topType === 'tee') {
    parts.push(`<path d="M${L} 196l-26 254h26l24-226z" fill="${skin}"/><path d="M${R} 196l26 254h-26l-24-226z" fill="${skin}"/>`);
  }
  parts.push(`<rect x="184" y="128" width="32" height="48" rx="12" fill="${skin}"/>`);

  // torso
  const torso = `M${L} 192q4-24 54-28h${2 * sh - 108}q50 4 54 28l${hip - sh + 6} ${waist - 192}h-${2 * hip + 12}z`;
  if (topType === 'jacket') {
    parts.push(`<path d="M180 160h40l-4 ${waist - 160}h-32z" fill="${inner}"/>`);
    g(`M${L} 192q4-24 54-28l14 0 6 ${waist - 164}h-${76 + hip - sh}z`, top);
    g(`M${R} 192q-4-24-54-28l-14 0-6 ${waist - 164}h${76 + hip - sh}z`, top);
    parts.push(`<path d="M176 164l-16 70 22-10zM224 164l16 70-22-10z" fill="${shade(top, -0.25)}"/>`);
  } else {
    g(torso, top);
  }
  if (topType === 'hoodie' || topType === 'crop') {
    parts.push(`<ellipse cx="200" cy="168" rx="42" ry="16" fill="${shade(top, -0.18)}"/>`);
    parts.push(`<path d="M188 176v70M212 176v70" stroke="${shade(top, -0.3)}" stroke-width="3" stroke-linecap="round"/>`);
    if (topType === 'hoodie') parts.push(`<path d="M150 360h100l10 76h-120z" fill="${shade(top, -0.08)}"/>`);
  }
  if (topType === 'sweat') parts.push(`<rect x="${200 - hip - 4}" y="${waist - 16}" width="${2 * hip + 8}" height="16" fill="${shade(top, -0.12)}"/>`);
  if (topType === 'tee' || topType === 'sweat') parts.push(`<circle cx="200" cy="260" r="26" fill="none" stroke="${shade(top, top === '#1f1f22' ? 0.5 : -0.35)}" stroke-width="5" opacity=".7"/>`);

  // sleeves
  if (topType === 'tee') {
    g(`M${L} 194l-20 92h30l18-62z`, top);
    g(`M${R} 194l20 92h-30l-18-62z`, top);
  } else {
    g(`M${L} 194l-28 254h28l24-224z`, top);
    g(`M${R} 194l28 254h-28l-24-224z`, top);
  }
  parts.push(`<ellipse cx="${L - 14}" cy="464" rx="13" ry="18" fill="${skin}"/><ellipse cx="${R + 14}" cy="464" rx="13" ry="18" fill="${skin}"/>`);

  // head + hair
  parts.push(`<ellipse cx="200" cy="88" rx="38" ry="48" fill="${skin}"/>`);
  parts.push(body === 'f'
    ? `<path d="M160 86q-4-58 40-60t42 52q-22-26-46-30-20 14-36 38z" fill="${hair}"/>`
    : `<path d="M162 82q-2-50 38-52t40 46q-10-20-40-22t-38 28z" fill="${hair}"/>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 1000">
<defs><linearGradient id="sh" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".16"/><stop offset=".35" stop-color="#000" stop-opacity="0"/><stop offset=".6" stop-color="#fff" stop-opacity=".07"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient></defs>
${parts.join('\n')}
</svg>`;
}

function flatBottom(type, color) {
  const body = type === 'skirt'
    ? `<path d="M120 70h160l40 300H80z" fill="${color}"/><rect x="120" y="58" width="160" height="22" fill="${shade(color, -0.15)}"/>`
    : `<path d="M110 60h180l${type === 'wide' ? 30 : 12} 360h-96l-34-260-34 260h-96z" fill="${color}"/><rect x="110" y="50" width="180" height="22" fill="${shade(color, -0.15)}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 460">${body}</svg>`;
}

function flatTop(type, color) {
  const sleeve = type === 'tee' ? 'l-60 70 40 30 40-40' : 'l-80 220 44 10 56-180';
  const sleeveR = type === 'tee' ? 'l60 70-40 30-40-40' : 'l80 220-44 10-56-180';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 460"><path d="M130 60 ${sleeve}z" fill="${shade(color, -0.08)}"/><path d="M270 60 ${sleeveR}z" fill="${shade(color, -0.08)}"/><path d="M130 60q70 40 140 0l20 360H110z" fill="${color}"/><path d="M165 52q35 28 70 0" stroke="${shade(color, -0.2)}" stroke-width="8" fill="none"/></svg>`;
}

/* ---------- demo looks ---------- */
const SKIN = ['#c99a7a', '#8d5a3e', '#e6bfa2', '#6e4630', '#d7a885', '#a8714f'];
const HAIR = ['#2b1e17', '#14100d', '#6b4a2e', '#3a2a1f', '#1d1612', '#8a6a46'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
let pid = 1000, vid = 50000;

function piece(title, handle, price, colorways, draw) {
  const variants = [];
  colorways.forEach((c, ci) => SIZES.forEach((s, si) => variants.push({
    id: vid++, available: (si + ci * 2 + title.length) % 7 !== 0, price, options: [c.name, s], image: `img/${handle}-${ci}.svg`,
  })));
  colorways.forEach((c, ci) => fs.writeFileSync(path.join(img, `${handle}-${ci}.svg`), draw(c)));
  return { id: pid++, title, url: '#', image: `img/${handle}-0.svg`, options: ['Color', 'Size'], variants };
}

// group, title, story, body, topType, topName, topPrice, bottomType, bottomName, bottomPrice, colourways [name, swatch, top, bottom]
const LOOKS = [
  ['Women', 'Morning Walk', 'A cropped hoodie over a wide, easy pant.', 'f', 'crop', 'Cropped Hoodie', 6400, 'wide', 'Wide-Leg Pant', 7800,
    [['Sand', '#d6c4a6', '#e3d6c1', '#b9a585'], ['Sage', '#9fae95', '#c2ccb8', '#7f8e76'], ['Clay', '#b8644a', '#d9a48d', '#8f4a36']]],
  ['Women', 'Park Day', 'A graphic tee tucked into a flowy skirt.', 'f', 'tee', 'Graphic Tee', 4800, 'skirt', 'Midi Skirt', 6400,
    [['Bone', '#ece6da', '#f1ece2', '#cdbfa8'], ['Black', '#26231f', '#2c2926', '#3b3733']]],
  ['Women', 'Golden Hour', 'A heavy sweatshirt with a relaxed trouser.', 'f', 'sweat', 'Crew Sweatshirt', 6800, 'pant', 'Relaxed Trouser', 7200,
    [['Oat', '#d9cdb8', '#e6dccb', '#8c7b63'], ['Dusk', '#6d6a86', '#8a87a3', '#3f3d52']]],
  ['Women', 'Weekend', 'Soft tee, straight-leg denim.', 'f', 'tee', 'Everyday Tee', 4200, 'jeans', 'Straight Jean', 8800,
    [['Light Wash', '#9db6cf', '#f2efe9', '#9db6cf'], ['Rinse', '#2f3d55', '#f2efe9', '#2f3d55']]],
  ['Men', 'Trailhead', 'A tee, light denim and a long walk.', 'm', 'tee', 'Pocket Tee', 4200, 'jeans', 'Relaxed Jean', 8800,
    [['Stone', '#cfc8bb', '#e6e1d8', '#9fb5cc'], ['Black', '#1f1f22', '#1f1f22', '#4a5a72']]],
  ['Men', 'Workwear Easy', 'An overshirt over a clean tee.', 'm', 'jacket', 'Chore Overshirt', 9800, 'pant', 'Utility Chino', 7600,
    [['Olive', '#707552', '#707552', '#c9bfa8'], ['Navy', '#283550', '#283550', '#cfc6b3']]],
  ['Men', 'Night Out', 'Hoodie and tapered jogger.', 'm', 'hoodie', 'Pullover Hoodie', 7400, 'pant', 'Tapered Jogger', 6200,
    [['Charcoal', '#4a4a4c', '#5a5a5d', '#2d2d2f'], ['Chocolate', '#5c3a2c', '#6e4636', '#3b261d']]],
];

const slug = (s) => s.toLowerCase().replace(/[^a-z]+/g, '-');
const looks = LOOKS.map(([group, title, story, body, topType, topName, topPrice, bottomType, bottomName, bottomPrice, cws], li) => {
  const colorways = cws.map(([name, swatch, top, bottom], ci) => {
    const file = `look${li}-${ci}.svg`;
    fs.writeFileSync(path.join(img, file), figure({ body, skin: SKIN[li % SKIN.length], hair: HAIR[(li + 2) % HAIR.length], top, topType, bottom, bottomType, shoe: ci % 2 ? '#f1eee8' : '#2a2522' }));
    return { name, swatch, image: `img/${file}`, alt: `${title} in ${name}`, top, bottom };
  });
  const flatType = (t) => (t === 'tee' ? 'tee' : 'long');
  return {
    id: `look-${li}`, group, title, story, sort: li,
    colorways: colorways.map(({ top, bottom, ...c }) => c),
    pieces: [
      piece(topName, `${slug(topName)}-${li}`, topPrice, colorways, (c) => flatTop(flatType(topType), c.top)),
      piece(bottomName, `${slug(bottomName)}-${li}`, bottomPrice, colorways, (c) => flatBottom(bottomType === 'jeans' ? 'pant' : bottomType, c.bottom)),
    ],
  };
});

const data = {
  currency: 'USD', locale: 'en', root: '/', tabOrder: 'Women, Men',
  settings: {
    eyebrow: 'Lookbook', heading: "Fall '26", subheading: 'Styled head to toe. Pick a colour, then shop the whole look.',
    railLabel: 'In this look', shopLabel: 'Shop the look', addLabel: 'Add the look to bag',
    secondaryLabel: '', secondaryUrl: '', showRail: true,
  },
  looks,
};

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Lookbook Lineup Preview</title>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<style>
  body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #f6f3ee; color: #1f1c19; }
  .demo-note { padding: 10px clamp(16px, 3vw, 40px); font-size: 12px; color: #6b645c; background: #fff8e6; }
${css}
</style>
</head>
<body>
<div class="demo-note">Local preview with placeholder figures. The cart is mocked.</div>
<lookbook-lineup class="lookbook-lineup" id="lookbook-lineup-preview" style="--lb-bg-top:#F6F3EE;--lb-bg-bottom:#E7E3DC;--lb-text:#1F1C19;--lb-accent:#1F1C19;--lb-accent-text:#FFFFFF;--lb-ratio:0.4;--lb-stage-h:560px;--lb-pad-top:40px;--lb-pad-bottom:0px;">
<script type="application/json" data-lookbook-data>${JSON.stringify(data)}</script>
</lookbook-lineup>
<script>
  const realFetch = window.fetch;
  window.fetch = (url, opts) => /cart\\/add\\.js$/.test(url)
    ? new Promise((r) => setTimeout(() => r(new Response(JSON.stringify({ items: JSON.parse(opts.body).items }), { status: 200 })), 450))
    : realFetch(url, opts);
</script>
<script>${js}</script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log(`preview/index.html: ${looks.length} looks`);
