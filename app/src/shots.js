// Fixed scenes for screenshots: ?shot=editor shows the editor with a sample photo
// loaded; ?shot=cover shows the cover alone, full-bleed; ?shot=export renders the
// app's real PNG export at the requested post size and shows that exact PNG file
// full-bleed (the screenshot is then a picture of the exported file itself).
// `photo` picks the sample, `caption` the title, `layout`/`grade` pick indices,
// `size` picks landscape | portrait | square | story. window.__shotReady is set
// once the scene is painted.
import { drawCover, EXPORT_SIZES, LAYOUTS, GRADES, SUBTITLES, TAGLINES } from './cover.js';

function applyQuery(app, query) {
  const st = app.state;
  if (query.get('caption')) st.title = query.get('caption');
  if (query.get('subtitle')) st.subtitle = query.get('subtitle');
  if (query.get('layout') !== null) st.layout = Number(query.get('layout')) % LAYOUTS.length;
  if (query.get('grade') !== null) st.grade = Number(query.get('grade')) % GRADES.length;
  if (query.get('tagline')) st.tagline = query.get('tagline');
  const photo = query.get('photo') || 'pier';
  st.panels.forEach((p, i) => {
    p.photo = i % 2 === 0 ? photo : (photo === 'pier' ? 'boulevard' : 'pier');
  });
  if (query.get('hero') === 'boulevard') st.panels[0].photo = 'boulevard';
  app.setState(st);
  app.syncInputs();
}

export async function runShot(shot, query, app) {
  await document.fonts.ready;
  applyQuery(app, query);
  const canvas = document.getElementById('cover');
  if (shot === 'cover' || shot === 'export') {
    document.body.classList.add('shot-cover');
    const size = EXPORT_SIZES.find((s) => s.id === (query.get('size') || 'landscape')) || EXPORT_SIZES[0];
    canvas.width = size.w;
    canvas.height = size.h;
    app.redraw();
    if (shot === 'export') {
      // Show the actual exported PNG bytes, not a live canvas.
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      const url = URL.createObjectURL(blob);
      const img = document.createElement('img');
      img.id = 'export-shot';
      img.src = url;
      img.alt = 'Exported cover PNG';
      canvas.replaceWith(img);
      window.__exportBlob = blob;
      window.__exportSize = size;
    }
  } else {
    app.redraw();
  }
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
