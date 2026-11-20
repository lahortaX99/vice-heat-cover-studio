// Vice Heat Cover Studio — the cover renderer.
// Draws a multi-panel GTA-style key-art cover onto any canvas: hero + five panels,
// gradient Anton title, Pacifico neon script subtitle, per-panel place/time captions,
// print ephemera (starburst seal, VOL. tag, heat meter, press quote, barcode, tagline
// strip), sunset/neon gradient-map grades, and a Poster Ink halftone grade.
// Everything is drawn with the 2D canvas API; no network, no libraries.

export const LAYOUTS = [
  { id: 'hero-left', name: 'Hero Left', panels: 6 },
  { id: 'hero-right', name: 'Hero Right', panels: 6 },
  { id: 'hero-top', name: 'Hero Top', panels: 6 },
  { id: 'hero-bottom', name: 'Hero Bottom', panels: 6 },
  { id: 'slanted', name: 'Slanted Heat', panels: 6 },
  { id: 'nine-grid', name: 'Nine Grid', panels: 6 },
  { id: 'full-bleed', name: 'Full Bleed + Strip', panels: 6 },
  { id: 'comic-stack', name: 'Comic Stack', panels: 6 },
  { id: 'wide-banner', name: 'Wide Banner', panels: 6 },
];

export const GRADES = [
  { id: 'sunset', name: 'Vice Sunset', wash: ['#ff7a18', '#ff2e63'], glow: '#ff9a3d', ink: false },
  { id: 'neon-coast', name: 'Neon Coast', wash: ['#00e5ff', '#ff2e9a'], glow: '#ff5ec4', ink: false },
  { id: 'golden-hour', name: 'Golden Hour', wash: ['#ffb347', '#ff7b00'], glow: '#ffd166', ink: false },
  { id: 'magenta-night', name: 'Magenta Night', wash: ['#b537f2', '#ff2e63'], glow: '#e26bff', ink: false },
  { id: 'teal-dawn', name: 'Teal Dawn', wash: ['#00c9a7', '#ff7a18'], glow: '#5ef2d6', ink: false },
  { id: 'coral-heat', name: 'Coral Heat', wash: ['#ff5e62', '#ff9966'], glow: '#ff8a7a', ink: false },
  { id: 'violet-dusk', name: 'Violet Dusk', wash: ['#7b2ff7', '#f107a3'], glow: '#b388ff', ink: false },
  { id: 'mono-noir', name: 'Mono Noir', wash: ['#888888', '#222222'], glow: '#ffffff', ink: false },
  { id: 'poster-ink', name: 'Poster Ink', wash: ['#ff2e63', '#ff7a18'], glow: '#ff2e63', ink: true },
];

export const PLACES = [
  ['MARINA DEL SOL', '7:40 PM — NO WITNESSES'],
  ['TOWER 2', '6:10 PM — LAST SWIM'],
  ['PIER 26', '5:30 AM — GONE FISHING'],
  ['OCEAN DRIVE', '11:58 PM — NEON HOUR'],
  ['PALM ROW', '4:20 PM — GOLDEN LIGHT'],
  ['THE STRIP', '2:15 AM — NO SLEEP'],
  ['COAST ROAD', '6:45 PM — LAST EXIT'],
  ['NEON ALLEY', '1:05 AM — BACK WAY IN'],
  ['SUNSET KEY', '8:00 PM — LOW TIDE'],
];

export const ROLES = ['THE DRIVER', 'THE ANGLER', 'THE RUNNER', 'THE QUEEN', 'THE FIXER', 'ONE LAST SUMMER'];
export const TITLES = ['SUNSET HEIST', 'VICE HEAT', 'NEON TIDE', 'GOLDEN GETAWAY', 'COASTLINE NIGHTS', 'PALM ROW RUN'];
export const SUBTITLES = ['Six nights in paradise', 'golden hour, vice lights', 'Boardwalk Nights', 'Neon Tide', 'Every summer has a story', 'One coast, no rules'];
export const TAGLINES = [
  'ONE COAST • NO RULES • COMING SOON',
  'EVERY SUMMER HAS A STORY',
  'ONE CITY. EVERY STREET IS A STAGE.',
  'GOLDEN HOUR • NEON LIGHTS • NO WAY BACK',
  'SIX NIGHTS. ONE LAST SCORE.',
];
export const QUOTES = [
  ['"A FEVER DREAM IN NEON"', '— THE COAST HERALD'],
  ['"PURE VICE CITY ENERGY"', '— THE PALM POST'],
  ['"THE SUMMER, DISTILLED"', '— NEON WEEKLY'],
];

export function defaultState() {
  return {
    title: 'VICE HEAT',
    subtitle: 'Six nights in paradise',
    tagline: TAGLINES[0],
    layout: 0,
    grade: 0,
    vol: 'VOL. 06',
    seal: 'NEW SUMMER 2026',
    quote: 0,
    stars: 5,
    panels: PLACES.slice(0, 6).map((p, i) => ({
      photo: i % 2 === 0 ? 'pier' : 'boulevard',
      zoom: 1,
      ox: 0,
      oy: 0,
      place: p[0],
      time: p[1],
      role: i === 0 ? ROLES[0] : '',
    })),
  };
}

// Panel rects in fractions of the canvas, per layout. Rects are [x, y, w, h].
export function layoutRects(layoutId, W, H) {
  const g = 0.008; // gutter
  const heroFirst = (hero, rest) => [hero, ...rest];
  switch (layoutId) {
    case 'hero-left': {
      const hero = [0, 0, 0.56, 1];
      const rx = 0.56 + g, rw = 1 - rx;
      const rows = [[0, 0.5], [0.5, 0.5], [0, 0.5], [0.5, 0.5], [0, 1]];
      // right side: 2 cols x 3 rows, last panel spans full width of right area
      return heroFirst(hero, [
        [rx, 0, rw / 2 - g / 2, 1 / 3 - g / 2],
        [rx + rw / 2 + g / 2, 0, rw / 2 - g / 2, 1 / 3 - g / 2],
        [rx, 1 / 3 + g / 2, rw / 2 - g / 2, 1 / 3 - g / 2],
        [rx + rw / 2 + g / 2, 1 / 3 + g / 2, rw / 2 - g / 2, 1 / 3 - g / 2],
        [rx, 2 / 3 + g, rw, 1 / 3 - g],
      ]);
    }
    case 'hero-right': {
      const hero = [0.44, 0, 0.56, 1];
      const rw = 0.44 - g;
      return heroFirst(hero, [
        [0, 0, rw / 2 - g / 2, 1 / 3 - g / 2],
        [rw / 2 + g / 2, 0, rw / 2 - g / 2, 1 / 3 - g / 2],
        [0, 1 / 3 + g / 2, rw / 2 - g / 2, 1 / 3 - g / 2],
        [rw / 2 + g / 2, 1 / 3 + g / 2, rw / 2 - g / 2, 1 / 3 - g / 2],
        [0, 2 / 3 + g, rw, 1 / 3 - g],
      ]);
    }
    case 'hero-top':
      return heroFirst([0, 0, 1, 0.58], [0, 0.58 + g, 0.2 - g / 2, 0.42 - g].map((r, i) => [
        i * 0.2 + (i ? g / 2 : 0), 0.58 + g, 0.2 - g, 0.42 - g,
      ]));
    case 'hero-bottom':
      return heroFirst([0, 0.42, 1, 0.58], [0, 0, 0.2 - g, 0.42 - g].map((r, i) => [
        i * 0.2 + (i ? g / 2 : 0), 0, 0.2 - g, 0.42 - g,
      ]));
    case 'slanted': {
      // Same grid as hero-left; the slant is applied when clipping panels.
      const hero = [0, 0, 0.56, 1];
      const rx = 0.56 + g, rw = 1 - rx;
      return heroFirst(hero, [
        [rx, 0, rw / 2 - g / 2, 1 / 3 - g / 2],
        [rx + rw / 2 + g / 2, 0, rw / 2 - g / 2, 1 / 3 - g / 2],
        [rx, 1 / 3 + g / 2, rw / 2 - g / 2, 1 / 3 - g / 2],
        [rx + rw / 2 + g / 2, 1 / 3 + g / 2, rw / 2 - g / 2, 1 / 3 - g / 2],
        [rx, 2 / 3 + g, rw, 1 / 3 - g],
      ]);
    }
    case 'nine-grid': {
      // Hero spans 2x2 top-left of a 3x3 grid; five small panels fill the rest.
      const c = 1 / 3;
      return [
        [0, 0, 2 * c - g / 2, 2 * c - g / 2],
        [2 * c + g / 2, 0, c - g / 2, c - g / 2],
        [2 * c + g / 2, c + g / 2, c - g / 2, c - g / 2],
        [0, 2 * c + g / 2, c - g / 2, c - g / 2],
        [c + g / 2, 2 * c + g / 2, c - g / 2, c - g / 2],
        [2 * c + g / 2, 2 * c + g / 2, c - g / 2, c - g / 2],
      ];
    }
    case 'full-bleed': {
      // Hero bleeds full canvas; five small panels ride along the bottom strip.
      const stripY = 0.74, stripH = 0.26 - g;
      const small = [0, stripY, 0.2 - g, stripH].map((r, i) => [
        i * 0.2 + (i ? g / 2 : 0), stripY, 0.2 - g, stripH,
      ]);
      return [[0, 0, 1, 1], ...small];
    }
    case 'comic-stack': {
      return [
        [0.3, 0, 0.4, 0.62],
        [0, 0, 0.3 - g, 0.31 - g / 2],
        [0, 0.31 + g / 2, 0.3 - g, 0.31 - g / 2],
        [0.7 + g, 0, 0.3 - g, 0.31 - g / 2],
        [0.7 + g, 0.31 + g / 2, 0.3 - g, 0.31 - g / 2],
        [0, 0.62 + g, 1, 0.38 - g],
      ];
    }
    case 'wide-banner': {
      return [
        [0, 0, 1, 0.42],
        [0, 0.42 + g, 1 / 3 - g / 2, 0.29 - g],
        [1 / 3 + g / 2, 0.42 + g, 1 / 3 - g / 2, 0.29 - g],
        [2 / 3 + g, 0.42 + g, 1 / 3 - g / 2, 0.29 - g],
        [0, 0.71 + g, 0.5 - g / 2, 0.29 - g],
        [0.5 + g / 2, 0.71 + g, 0.5 - g / 2, 0.29 - g],
      ];
    }
    default:
      return layoutRects('hero-left', W, H);
  }
}

function fitDraw(ctx, img, x, y, w, h, zoom, ox, oy) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * zoom;
  const pw = img.naturalWidth * scale;
  const ph = img.naturalHeight * scale;
  ctx.drawImage(img, x + (w - pw) / 2 + ox * w, y + (h - ph) / 2 + oy * h, pw, ph);
}

function posterizePanel(ctx, x, y, w, h, grade) {
  // Poster Ink: quantize the panel to a hot pink/orange duotone and add halftone dots.
  const tmp = document.createElement('canvas');
  tmp.width = Math.max(2, Math.round(w));
  tmp.height = Math.max(2, Math.round(h));
  const t = tmp.getContext('2d');
  t.drawImage(ctx.canvas, x, y, w, h, 0, 0, tmp.width, tmp.height);
  const data = t.getImageData(0, 0, tmp.width, tmp.height);
  const px = data.data;
  const lo = [26, 8, 40]; // deep purple shadow
  const mid = [255, 46, 99]; // hot pink
  const hi = [255, 190, 60]; // amber highlight
  for (let i = 0; i < px.length; i += 4) {
    const lum = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
    const q = lum < 70 ? lo : lum < 150 ? mid : hi;
    px[i] = q[0]; px[i + 1] = q[1]; px[i + 2] = q[2];
  }
  t.putImageData(data, 0, 0);
  ctx.save();
  ctx.drawImage(tmp, x, y, w, h);
  // Halftone dots over the mid-tones.
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = '#1a0520';
  const step = Math.max(7, w * 0.012);
  for (let yy = y + step / 2; yy < y + h; yy += step) {
    for (let xx = x + step / 2; xx < x + w; xx += step) {
      const r = step * 0.16 * (1 + ((xx * 7 + yy * 13) % 3) * 0.4);
      ctx.beginPath();
      ctx.arc(xx, yy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function gradeWash(ctx, x, y, w, h, grade) {
  if (grade.ink) return;
  ctx.save();
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, grade.wash[0]);
  grad.addColorStop(1, grade.wash[1]);
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = grade.glow;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

function vignetteAndGrain(ctx, W, H, seed) {
  ctx.save();
  const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(10,0,20,0.42)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
  // Deterministic grain so exports are stable.
  let s = seed;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = '#fff';
  const n = Math.round((W * H) / 9000);
  for (let i = 0; i < n; i++) ctx.fillRect(rnd() * W, rnd() * H, 1.6, 1.6);
  ctx.restore();
}

function panelCaption(ctx, x, y, w, h, panel, isHero, scale, H, W, abovePanel) {
  const pad = 10 * scale;
  const fs = 15 * scale;
  ctx.save();
  ctx.font = `700 ${fs}px Anton, 'Arial Narrow', sans-serif`;
  const place = panel.place || '';
  const time = panel.time || '';
  const th = fs * 1.15;
  ctx.font = `600 ${fs * 0.72}px system-ui, sans-serif`;
  const timeW = ctx.measureText(time).width;
  ctx.font = `700 ${fs}px Anton, 'Arial Narrow', sans-serif`;
  const pw = Math.max(ctx.measureText(place).width, timeW) + pad * 2;
  // Keep captions out of the title band (bottom ~32%): if the panel straddles the
  // band, anchor the caption just above it; if the panel sits entirely below the
  // band (bottom strip), caption at the panel's top instead.
  const bandTop = H * 0.68;
  let capBottom;
  let topAnchored = false;
  // Full-bleed strip panels: the subtitle sits on the strip, so the caption floats
  // on the hero photo just above the strip instead.
  if (abovePanel) { capBottom = y - 16 * scale; topAnchored = true; }
  else if (y + h <= bandTop) capBottom = y + h;
  // Panel below the band, or only just straddling it: caption at the panel's top,
  // so it never collides with the panel above.
  else if (y >= bandTop || bandTop - y < H * 0.15) { capBottom = y + th * 2 + pad * 1.6; topAnchored = true; }
  // Tall panel straddling the band (the hero): caption just above the band.
  else capBottom = bandTop;
  // A top-anchored caption on the right half sits under the centered subtitle, so
  // anchor it to the panel's right edge instead.
  const rightAlign = topAnchored && (x + w / 2) > W * 0.5;
  const chipX = rightAlign ? x + w - pad * 0.5 - pw : x + pad * 0.5;
  const textX = rightAlign ? chipX + pad : x + pad * 1.5;
  ctx.fillStyle = 'rgba(8,2,16,0.88)';
  ctx.fillRect(chipX, capBottom - th * 2 - pad, pw, th * 2 + pad * 0.4);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(place, textX, capBottom - th - pad * 0.7);
  ctx.font = `600 ${fs * 0.72}px system-ui, sans-serif`;
  ctx.fillStyle = '#ffb347';
  ctx.fillText(time, textX, capBottom - pad * 0.7 - th * 0.1);
  if (isHero && panel.role) {
    ctx.font = `700 ${fs * 0.9}px Anton, 'Arial Narrow', sans-serif`;
    const rw = ctx.measureText(panel.role).width + pad * 2;
    // Drop below the VOL. tag when the hero starts at the top-left corner.
    const roleY = (x < 20 && y < 20) ? y + pad * 0.5 + 34 * scale : y + pad * 0.5;
    ctx.fillStyle = '#ff2e63';
    ctx.fillRect(x + pad * 0.5, roleY, rw, th * 1.1);
    ctx.fillStyle = '#fff';
    ctx.fillText(panel.role, x + pad * 1.5, roleY + th * 0.55);
  }
  ctx.restore();
}

function starburst(ctx, cx, cy, r, fill, label, scale) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  const spikes = 14;
  for (let i = 0; i < spikes * 2; i++) {
    const ang = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.78;
    const px = Math.cos(ang) * rad, py = Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 2 * scale;
  ctx.strokeStyle = '#fff';
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${11 * scale}px Anton, 'Arial Narrow', sans-serif`;
  const words = label.split(' ');
  words.forEach((word, i) => ctx.fillText(word, 0, (i - (words.length - 1) / 2) * 13 * scale));
  ctx.restore();
}

function drawBarcode(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = '#fff';
  ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
  ctx.fillStyle = '#111';
  let bx = x;
  let s = 7;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  while (bx < x + w) {
    const bw = 1 + Math.floor(rnd() * 4);
    if (rnd() > 0.45) ctx.fillRect(bx, y, bw, h);
    bx += bw + 1;
  }
  ctx.restore();
}

/** Draws the whole cover. `images` is an array of HTMLImageElement|null, one per panel. */
export function drawCover(canvas, state, images) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const scale = W / 1080;
  const grade = GRADES[state.grade] || GRADES[0];
  const layout = LAYOUTS[state.layout] || LAYOUTS[0];
  const slanted = layout.id === 'slanted';

  ctx.fillStyle = '#14061f';
  ctx.fillRect(0, 0, W, H);

  const rects = layoutRects(layout.id, W, H);
  rects.forEach(([fx, fy, fw, fh], i) => {
    const panel = state.panels[i];
    if (!panel) return;
    const x = fx * W, y = fy * H, w = fw * W, h = fh * H;
    ctx.save();
    ctx.beginPath();
    if (slanted && i === 0) {
      // Hero leans: right edge slants inward.
      ctx.moveTo(x, y);
      ctx.lineTo(x + w - W * 0.03, y);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x, y + h);
      ctx.closePath();
    } else {
      ctx.rect(x, y, w, h);
    }
    ctx.clip();
    const img = images[i];
    if (img) fitDraw(ctx, img, x, y, w, h, panel.zoom, panel.ox, panel.oy);
    else {
      const g2 = ctx.createLinearGradient(x, y, x + w, y + h);
      g2.addColorStop(0, '#3d1a5e');
      g2.addColorStop(1, '#ff2e63');
      ctx.fillStyle = g2;
      ctx.fillRect(x, y, w, h);
    }
    if (grade.ink) posterizePanel(ctx, x, y, w, h, grade);
    else gradeWash(ctx, x, y, w, h, grade);
    // Panel inner edge.
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = Math.max(2, 3 * scale);
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    ctx.restore();
    panelCaption(ctx, x, y, w, h, panel, i === 0, scale, H, W, layout.id === 'full-bleed' && i > 0);
  });

  vignetteAndGrain(ctx, W, H, 1234567);

  // ---- Title block across the bottom third ----
  const title = (state.title || 'VICE HEAT').toUpperCase();
  const titleY = H * 0.88;
  let size = H * 0.16;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const measure = (s) => {
    ctx.font = `${s}px Anton, 'Arial Narrow', sans-serif`;
    return ctx.measureText(title).width;
  };
  while (measure(size) > W * 0.94 && size > 20) size -= 4;
  // Soft dark band so the title reads over any photo.
  const band = ctx.createLinearGradient(0, H * 0.68, 0, H);
  band.addColorStop(0, 'rgba(10,2,18,0)');
  band.addColorStop(1, 'rgba(10,2,18,0.55)');
  ctx.fillStyle = band;
  ctx.fillRect(0, H * 0.68, W, H * 0.32);
  ctx.translate(W / 2, titleY);
  ctx.transform(1, 0, -0.07, 1, 0, 0); // slight italic slant
  ctx.font = `${size}px Anton, 'Arial Narrow', sans-serif`;
  const grad = ctx.createLinearGradient(-W * 0.45, 0, W * 0.45, 0);
  grad.addColorStop(0, '#ff7a18');
  grad.addColorStop(0.45, '#ffd166');
  grad.addColorStop(0.75, '#ff5e8a');
  grad.addColorStop(1, '#ff2e9a');
  ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.16;
  ctx.strokeStyle = '#12041c';
  ctx.strokeText(title, 0, 0);
  ctx.fillStyle = grad;
  ctx.fillText(title, 0, 0);
  ctx.restore();

  // Neon script subtitle, overlapping the top of the title.
  const sub = state.subtitle || '';
  if (sub) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let ss = H * 0.055;
    ctx.font = `${ss}px Pacifico, cursive`;
    while (ctx.measureText(sub).width > W * 0.7 && ss > 12) {
      ss -= 2;
      ctx.font = `${ss}px Pacifico, cursive`;
    }
    ctx.translate(W / 2, H * 0.755);
    ctx.rotate(-0.03);
    ctx.shadowColor = '#ff2e9a';
    ctx.shadowBlur = 18 * scale;
    ctx.fillStyle = '#fff';
    ctx.fillText(sub, 0, 0);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ff5ec4';
    ctx.fillText(sub, 0, 0);
    ctx.restore();
  }

  // ---- Print ephemera ----
  // VOL. tag, top-left.
  ctx.save();
  ctx.font = `700 ${15 * scale}px Anton, 'Arial Narrow', sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const volW = ctx.measureText(state.vol || 'VOL. 06').width + 18 * scale;
  ctx.fillStyle = '#12041c';
  ctx.fillRect(0, 0, volW, 26 * scale);
  ctx.fillStyle = '#ffd166';
  ctx.fillText(state.vol || 'VOL. 06', 9 * scale, 13 * scale);
  ctx.restore();

  // Starburst seal, top-right.
  starburst(ctx, W - 62 * scale, 62 * scale, 52 * scale, '#ff2e63', state.seal || 'NEW SUMMER 2026', scale);

  // Heat meter, under the seal.
  ctx.save();
  ctx.font = `700 ${15 * scale}px Anton, 'Arial Narrow', sans-serif`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  const stars = '★'.repeat(Math.max(0, Math.min(5, state.stars || 5))) + '☆'.repeat(5 - Math.max(0, Math.min(5, state.stars || 5)));
  ctx.fillStyle = 'rgba(8,2,16,0.85)';
  const hw = ctx.measureText('HEAT ' + stars).width + 16 * scale;
  ctx.fillRect(W - hw, 122 * scale, hw, 26 * scale);
  ctx.fillStyle = '#ffd166';
  ctx.fillText('HEAT ' + stars, W - 8 * scale, 135 * scale);
  ctx.restore();

  // Press quote, bottom-left above the tagline strip.
  const [quoteText, quoteSrc] = QUOTES[state.quote % QUOTES.length];
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = `italic 700 ${15 * scale}px system-ui, sans-serif`;
  ctx.fillStyle = '#fff';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 6 * scale;
  ctx.fillText(quoteText, 14 * scale, H - 44 * scale);
  ctx.font = `600 ${11 * scale}px system-ui, sans-serif`;
  ctx.fillStyle = '#ffd166';
  ctx.fillText(quoteSrc, 14 * scale, H - 28 * scale);
  ctx.restore();

  // Barcode, bottom-right above the tagline strip.
  drawBarcode(ctx, W - 96 * scale, H - 56 * scale, 82 * scale, 30 * scale);

  // Tagline strip along the very bottom.
  ctx.save();
  ctx.fillStyle = '#12041c';
  ctx.fillRect(0, H - 20 * scale, W, 20 * scale);
  ctx.font = `700 ${11 * scale}px Anton, 'Arial Narrow', sans-serif`;
  ctx.fillStyle = '#ffd166';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText((state.tagline || '').toUpperCase(), W / 2, H - 10 * scale);
  ctx.restore();
}

export const EXPORT_SIZES = [
  { id: 'landscape', label: 'Landscape 1920×1080', w: 1920, h: 1080 },
  { id: 'portrait', label: 'Portrait 1080×1350', w: 1080, h: 1350 },
  { id: 'square', label: 'Square 1080×1080', w: 1080, h: 1080 },
  { id: 'story', label: 'Story 1080×1920', w: 1080, h: 1920 },
];

/** Renders the cover at an export size and resolves with a PNG blob. */
export function exportCoverPng(state, images, size) {
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  drawCover(canvas, state, images);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}
