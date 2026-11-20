// Vice Heat Cover Studio — page wiring: photo library, per-panel crop/drag, layouts,
// grades, Surprise me, undo/redo, and PNG export in four post sizes.
// A `?shot=` query sets up a fixed scene for screenshots (./shots.js).
import { drawCover, exportCoverPng, EXPORT_SIZES, LAYOUTS, GRADES, PLACES, ROLES, TITLES, SUBTITLES, TAGLINES, defaultState } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const titleInput = document.getElementById('title');
const subtitleInput = document.getElementById('subtitle');
const taglineInput = document.getElementById('tagline');
const layoutRow = document.getElementById('layouts');
const gradeRow = document.getElementById('grades');
const panelList = document.getElementById('panels');
const library = document.getElementById('library');
const zoomInput = document.getElementById('zoom');
const panXInput = document.getElementById('panx');
const panYInput = document.getElementById('pany');
const photoInput = document.getElementById('photo');

const SAMPLES = ['pier', 'boulevard'];
const sampleImages = {};
const uploadedImages = {};
let state = defaultState();
let selectedPanel = 0;
let history = [];
let future = [];

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function loadSamples() {
  for (const name of SAMPLES) {
    if (!sampleImages[name]) sampleImages[name] = await loadImage(`samples/${name}.jpg`);
  }
}

function panelImage(panel) {
  if (!panel || !panel.photo) return null;
  if (panel.photo.startsWith('upload:')) return uploadedImages[panel.photo] || null;
  return sampleImages[panel.photo] || null;
}

function images() {
  return state.panels.map(panelImage);
}

function redraw() {
  drawCover(canvas, state, images());
}

function pushHistory() {
  history.push(JSON.stringify(state));
  if (history.length > 60) history.shift();
  future = [];
  updateUndoButtons();
}

function applyState(next) {
  state = next;
  syncInputs();
  redraw();
}

function updateUndoButtons() {
  document.getElementById('undo').disabled = history.length === 0;
  document.getElementById('redo').disabled = future.length === 0;
}

function syncInputs() {
  titleInput.value = state.title;
  subtitleInput.value = state.subtitle;
  taglineInput.value = state.tagline;
  [...layoutRow.children].forEach((b, i) => b.classList.toggle('active', i === state.layout));
  [...gradeRow.children].forEach((b, i) => b.classList.toggle('active', i === state.grade));
  renderPanels();
  const p = state.panels[selectedPanel];
  zoomInput.value = p.zoom;
  panXInput.value = Math.round(p.ox * 100);
  panYInput.value = Math.round(p.oy * 100);
  document.getElementById('panel-label').textContent = `Panel ${selectedPanel + 1} — ${p.place}`;
}

function renderPanels() {
  panelList.innerHTML = '';
  state.panels.forEach((panel, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'panel-chip' + (i === selectedPanel ? ' active' : '');
    b.textContent = `${i + 1} · ${panel.place}`;
    b.addEventListener('click', () => { selectedPanel = i; syncInputs(); });
    panelList.appendChild(b);
  });
}

// Layout + grade pickers.
LAYOUTS.forEach((layout, i) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = layout.name;
  b.addEventListener('click', () => { pushHistory(); state.layout = i; syncInputs(); redraw(); });
  layoutRow.appendChild(b);
});
GRADES.forEach((grade, i) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = grade.name;
  b.addEventListener('click', () => { pushHistory(); state.grade = i; syncInputs(); redraw(); });
  gradeRow.appendChild(b);
});

// Sample-photo library: assigns the photo to the selected panel.
SAMPLES.forEach((name) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'lib-btn';
  b.innerHTML = `<img src="samples/${name}.jpg" alt="${name} sample photo"><span>${name === 'pier' ? 'Pier Dawn' : 'Boulevard Night'}</span>`;
  b.addEventListener('click', () => {
    pushHistory();
    state.panels[selectedPanel].photo = name;
    redraw();
    status.textContent = `Panel ${selectedPanel + 1} now uses the ${name} photo.`;
  });
  library.appendChild(b);
});

const fillAll = document.createElement('button');
fillAll.type = 'button';
fillAll.textContent = 'Fill all panels from library';
fillAll.addEventListener('click', () => {
  pushHistory();
  state.panels.forEach((p, i) => { p.photo = SAMPLES[i % SAMPLES.length]; });
  redraw();
  status.textContent = 'All six panels filled from the sample library.';
});
library.appendChild(fillAll);

photoInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const key = 'upload:' + Date.now();
  uploadedImages[key] = await loadImage(URL.createObjectURL(file));
  pushHistory();
  state.panels[selectedPanel].photo = key;
  redraw();
  status.textContent = `Your photo is in panel ${selectedPanel + 1}. It never leaves this machine.`;
});

titleInput.addEventListener('input', () => { state.title = titleInput.value; redraw(); });
subtitleInput.addEventListener('input', () => { state.subtitle = subtitleInput.value; redraw(); });
taglineInput.addEventListener('input', () => { state.tagline = taglineInput.value; redraw(); });
titleInput.addEventListener('change', pushHistory);
subtitleInput.addEventListener('change', pushHistory);
taglineInput.addEventListener('change', pushHistory);

zoomInput.addEventListener('input', () => {
  state.panels[selectedPanel].zoom = Number(zoomInput.value);
  redraw();
});
panXInput.addEventListener('input', () => {
  state.panels[selectedPanel].ox = Number(panXInput.value) / 100;
  redraw();
});
panYInput.addEventListener('input', () => {
  state.panels[selectedPanel].oy = Number(panYInput.value) / 100;
  redraw();
});
[zoomInput, panXInput, panYInput].forEach((el) => el.addEventListener('change', pushHistory));

// Drag a panel to reposition its photo; scroll over it to zoom.
let drag = null;
function canvasPos(e) {
  const r = canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
}
canvas.addEventListener('pointerdown', (e) => {
  const { x, y } = canvasPos(e);
  drag = { x, y, panel: selectedPanel, moved: false };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const { x, y } = canvasPos(e);
  const dx = x - drag.x, dy = y - drag.y;
  if (Math.abs(dx) + Math.abs(dy) > 0.005) drag.moved = true;
  const p = state.panels[drag.panel];
  p.ox = Math.max(-0.5, Math.min(0.5, p.ox + dx));
  p.oy = Math.max(-0.5, Math.min(0.5, p.oy + dy));
  drag.x = x; drag.y = y;
  redraw();
});
canvas.addEventListener('pointerup', () => {
  if (drag && drag.moved) pushHistory();
  drag = null;
  syncInputs();
});
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  pushHistory();
  const p = state.panels[selectedPanel];
  p.zoom = Math.max(1, Math.min(2.5, p.zoom + (e.deltaY < 0 ? 0.1 : -0.1)));
  syncInputs();
  redraw();
}, { passive: false });

// Click a panel chip area on the canvas to select that panel.
canvas.addEventListener('click', (e) => {
  const { x, y } = canvasPos(e);
  // Recompute rects from the current layout; the last rect wins for overlaps.
  import('./cover.js').then(({ layoutRects, LAYOUTS }) => {
    const rects = layoutRects(LAYOUTS[state.layout].id, 1, 1);
    for (let i = rects.length - 1; i >= 0; i--) {
      const [rx, ry, rw, rh] = rects[i];
      if (x >= rx && x <= rx + rw && y >= ry && y <= ry + rh) {
        selectedPanel = i;
        syncInputs();
        break;
      }
    }
  });
});

document.getElementById('surprise').addEventListener('click', () => {
  pushHistory();
  const rnd = (n) => Math.floor(Math.random() * n);
  state.layout = rnd(LAYOUTS.length);
  state.grade = rnd(GRADES.length);
  state.title = TITLES[rnd(TITLES.length)];
  state.subtitle = SUBTITLES[rnd(SUBTITLES.length)];
  state.tagline = TAGLINES[rnd(TAGLINES.length)];
  state.quote = rnd(3);
  const places = [...PLACES].sort(() => Math.random() - 0.5);
  state.panels.forEach((p, i) => {
    p.place = places[i][0];
    p.time = places[i][1];
    p.photo = SAMPLES[rnd(SAMPLES.length)];
    p.role = i === 0 ? ROLES[rnd(ROLES.length)] : '';
  });
  syncInputs();
  redraw();
  status.textContent = `Surprise me: ${LAYOUTS[state.layout].name} + ${GRADES[state.grade].name}.`;
});

document.getElementById('undo').addEventListener('click', () => {
  if (!history.length) return;
  future.push(JSON.stringify(state));
  applyState(JSON.parse(history.pop()));
  updateUndoButtons();
});
document.getElementById('redo').addEventListener('click', () => {
  if (!future.length) return;
  history.push(JSON.stringify(state));
  applyState(JSON.parse(future.pop()));
  updateUndoButtons();
});

// Export buttons, one per post size.
EXPORT_SIZES.forEach((size) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'export-btn';
  b.textContent = `Export PNG ${size.label}`;
  b.addEventListener('click', async () => {
    status.textContent = `Exporting ${size.w}×${size.h}…`;
    const blob = await exportCoverPng(state, images(), size);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-heat-cover-${size.id}-${size.w}x${size.h}.png`;
    a.click();
    status.textContent = `Saved vice-heat-cover-${size.id}-${size.w}x${size.h}.png`;
  });
  document.getElementById('exports').appendChild(b);
});

const shot = new URLSearchParams(location.search).get('shot');
async function start() {
  await loadSamples();
  await document.fonts.ready;
  if (shot) {
    await runShot(shot, new URLSearchParams(location.search), {
      state,
      images,
      redraw,
      syncInputs,
      setState(next) { state = next; },
      loadSamples,
    });
  } else {
    syncInputs();
    redraw();
  }
}
start();
