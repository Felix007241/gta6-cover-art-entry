// Wires the Vice City Cover Maker: photo slots, per-panel crop controls,
// caption / style / size presets, drag-to-pan on the live preview, PNG
// export, and the `?shot=` scenes for screenshots (./shots.js).
import { drawCover, layoutPanels, SIZES } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const captionInput = document.getElementById('caption');
const subtitleInput = document.getElementById('subtitle');
const status = document.getElementById('status');
const panelName = document.getElementById('panel-name');
const panelPhoto = document.getElementById('panel-photo');
const zoomInput = document.getElementById('zoom');
const fitSelect = document.getElementById('fit');

const PANEL_NAMES = ['Hero (top / left)', 'Panel 2', 'Panel 3'];

const state = {
  photos: [null, null, null], // Image objects (or null) in the three slots
  photoNames: ['Empty', 'Empty', 'Empty'],
  panels: [
    { photo: 0, zoom: 1, panX: 0, panY: 0, fit: 'cover' },
    { photo: 1, zoom: 1, panX: 0, panY: 0, fit: 'cover' },
    { photo: 2, zoom: 1, panX: 0, panY: 0, fit: 'cover' },
  ],
  caption: 'Sunset Heist',
  subtitle: 'Vice City Nights',
  size: 'landscape',
  style: 'sunset',
  selectedPanel: 0,
};

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function redraw() {
  const size = SIZES[state.size];
  canvas.width = size.w;
  canvas.height = size.h;
  drawCover(canvas, state);
}

function refreshSlotLabels() {
  document.querySelectorAll('[data-slot-name]').forEach((el, i) => {
    el.textContent = state.photoNames[i];
  });
}

function refreshPanelControls() {
  const crop = state.panels[state.selectedPanel];
  panelName.textContent = PANEL_NAMES[state.selectedPanel];
  panelPhoto.value = String(crop.photo);
  zoomInput.value = String(crop.zoom);
  fitSelect.value = crop.fit;
}

function selectPanel(i) {
  state.selectedPanel = i;
  refreshPanelControls();
}

/** Puts an image into photo slot `slot` and repaints. */
function setPhoto(slot, img, name) {
  state.photos[slot] = img;
  state.photoNames[slot] = name;
  refreshSlotLabels();
  redraw();
}

document.querySelectorAll('.slot').forEach((slotEl) => {
  const slot = Number(slotEl.dataset.slot);
  slotEl.querySelector('.photo-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(slot, await loadImage(URL.createObjectURL(file)), file.name);
    status.textContent = `Photo ${slot + 1} loaded from your machine.`;
  });
  slotEl.querySelectorAll('.sample').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const name = btn.dataset.sample;
      setPhoto(slot, await loadImage(`samples/${name}.jpg`), `Sample: ${name}`);
      status.textContent = `Photo ${slot + 1} set to the ${name} sample.`;
    });
  });
});

panelPhoto.addEventListener('change', () => {
  state.panels[state.selectedPanel].photo = Number(panelPhoto.value);
  redraw();
});
zoomInput.addEventListener('input', () => {
  state.panels[state.selectedPanel].zoom = Number(zoomInput.value);
  redraw();
});
fitSelect.addEventListener('change', () => {
  state.panels[state.selectedPanel].fit = fitSelect.value;
  redraw();
});
document.getElementById('fill-all').addEventListener('click', () => {
  const photo = state.panels[state.selectedPanel].photo;
  state.panels.forEach((p) => { p.photo = photo; });
  redraw();
  status.textContent = 'All three panels now show the same photo.';
});
document.getElementById('reset-crop').addEventListener('click', () => {
  Object.assign(state.panels[state.selectedPanel], { zoom: 1, panX: 0, panY: 0, fit: 'cover' });
  refreshPanelControls();
  redraw();
});

captionInput.addEventListener('input', () => { state.caption = captionInput.value; redraw(); });
subtitleInput.addEventListener('input', () => { state.subtitle = subtitleInput.value; redraw(); });

document.querySelectorAll('.style-preset').forEach((btn) => {
  btn.addEventListener('click', () => {
    state.style = btn.dataset.style;
    document.querySelectorAll('.style-preset').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    redraw();
  });
});
document.querySelectorAll('.size-preset').forEach((btn) => {
  btn.addEventListener('click', () => {
    state.size = btn.dataset.size;
    document.querySelectorAll('.size-preset').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    redraw();
  });
});

// Click a panel to select it; drag inside it to pan its photo.
let dragging = null;
function canvasPoint(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) / r.width) * canvas.width,
    y: ((e.clientY - r.top) / r.height) * canvas.height,
  };
}
canvas.addEventListener('pointerdown', (e) => {
  const p = canvasPoint(e);
  const { panels } = layoutPanels(canvas.width, canvas.height);
  const hit = panels.findIndex((rect) => p.x >= rect.x && p.x <= rect.x + rect.w && p.y >= rect.y && p.y <= rect.y + rect.h);
  if (hit === -1) return;
  selectPanel(hit);
  dragging = { x: p.x, y: p.y, panel: hit };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const p = canvasPoint(e);
  const { panels } = layoutPanels(canvas.width, canvas.height);
  const rect = panels[dragging.panel];
  const crop = state.panels[dragging.panel];
  crop.panX = Math.max(-1, Math.min(1, crop.panX + ((p.x - dragging.x) / (rect.w / 2)) * 0.6));
  crop.panY = Math.max(-1, Math.min(1, crop.panY + ((p.y - dragging.y) / (rect.h / 2)) * 0.6));
  dragging = { x: p.x, y: p.y, panel: dragging.panel };
  redraw();
});
canvas.addEventListener('pointerup', () => { dragging = null; });

function exportPng() {
  const size = SIZES[state.size];
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  drawCover(off, state);
  off.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cover-${size.w}x${size.h}.png`;
    a.click();
    status.textContent = `Saved cover-${size.w}x${size.h}.png`;
  }, 'image/png');
}

document.getElementById('export').addEventListener('click', exportPng);

// Keyboard shortcuts: E exports, R resets the selected panel's crop.
// Ignored while typing in a text field, so captions stay typeable.
document.addEventListener('keydown', (e) => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA')) return;
  if (e.key === 'e' || e.key === 'E') exportPng();
  if (e.key === 'r' || e.key === 'R') {
    Object.assign(state.panels[state.selectedPanel], { zoom: 1, panX: 0, panY: 0, fit: 'cover' });
    refreshPanelControls();
    redraw();
    status.textContent = 'Crop reset for the selected panel.';
  }
});

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), async (shotState, urlFor) => {
    const loaded = await Promise.all(shotState.photos.map(async (name, i) => {
      if (!name) return null;
      try {
        const img = await loadImage(urlFor(name));
        state.photoNames[i] = `Sample: ${name}`;
        return img;
      } catch {
        // Missing sample file: leave this slot empty instead of failing the shot.
        state.photoNames[i] = 'Empty';
        return null;
      }
    }));
    state.photos = loaded;
    state.panels = shotState.panels;
    state.caption = shotState.caption;
    state.subtitle = shotState.subtitle;
    state.size = shotState.size;
    state.style = shotState.style;
    captionInput.value = state.caption;
    subtitleInput.value = state.subtitle;
    document.querySelectorAll('.style-preset').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.style === state.style)));
    document.querySelectorAll('.size-preset').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.size === state.size)));
    refreshSlotLabels();
    refreshPanelControls();
    redraw();
  });
} else {
  refreshSlotLabels();
  refreshPanelControls();
  redraw();
}
