// Fixed scenes for screenshots: ?shot=editor shows the editor with sample
// photos loaded; ?shot=cover shows the finished cover alone, full viewport.
// Query knobs: photo, photo2, photo3 (samples/<name>.jpg), caption,
// subtitle, size (square | portrait | landscape), style (sunset | neon),
// panels (e.g. "0,1,0" = which photo each panel shows).
// window.__shotReady is set once the cover has been painted.

/** Builds the cover state for a shot from the page query. */
export function shotState(query) {
  const photos = ['photo', 'photo2', 'photo3'].map((key) => query.get(key) ?? null);
  const panelPhotos = (query.get('panels') ?? '0,1,0').split(',').map((n) => {
    const v = Number.parseInt(n, 10);
    return Number.isNaN(v) ? 0 : v;
  });
  // pans: "panX,panY;panX,panY;panX,panY" per panel, each -1..1.
  const panelPans = (query.get('pans') ?? '').split(';').map((pair) => {
    const [x, y] = pair.split(',').map((n) => Number.parseFloat(n) || 0);
    return { panX: x, panY: y };
  });
  return {
    photos,
    panels: [0, 1, 2].map((i) => ({
      photo: panelPhotos[i] ?? 0,
      zoom: 1,
      panX: panelPans[i]?.panX ?? 0,
      panY: panelPans[i]?.panY ?? 0,
      fit: 'cover',
    })),
    caption: query.get('caption') ?? 'Sunset Heist',
    subtitle: query.get('subtitle') ?? 'Vice City Nights',
    size: query.get('size') ?? 'landscape',
    style: query.get('style') ?? 'sunset',
  };
}

export async function runShot(shot, query, load) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const state = shotState(query);
  await load(state, (name) => `samples/${name}.jpg`);
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
