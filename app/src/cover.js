// Cover drawing engine for the Vice City Cover Maker.
//
// Everything here is drawn in code on a 2D canvas: the multi-panel poster
// layout, the sunset / neon / golden-hour title band with its sun disc and skyline
// silhouettes, the palm trees, and the bold caption lettering. No Rockstar
// logo, wordmark, official artwork, character or font file is used anywhere:
// the lettering is a system sans-serif drawn with outline, gradient fill and
// shadow, and every silhouette is a vector shape drawn below.

export const SIZES = {
  square: { label: '1080 x 1080', w: 1080, h: 1080 },
  portrait: { label: '1080 x 1350', w: 1080, h: 1350 },
  landscape: { label: '1920 x 1080', w: 1920, h: 1080 },
};

export const STYLES = {
  sunset: {
    label: 'Vice City Sunset',
    sky: ['#ff9a3d', '#ff5e7a', '#b13a8e', '#3d1e63'],
    sun: '#ffd166',
    band: '#1c0b2e',
    caption: ['#fff3b0', '#ffb347', '#ff5e7a'],
    subtitle: '#ffd9a0',
    scrim: 'rgba(20, 6, 32, 0.35)',
  },
  neon: {
    label: 'Neon Night',
    sky: ['#00e5ff', '#7b2ff7', '#ff2e88', '#12002e'],
    sun: '#ff5ef1',
    band: '#0a0024',
    caption: ['#d8fbff', '#4de8ff', '#ff5ef1'],
    subtitle: '#9df3ff',
    scrim: 'rgba(4, 0, 28, 0.35)',
  },
  golden: {
    label: 'Golden Hour',
    sky: ['#ffe259', '#ffa751', '#ff7e5f', '#7a2e1d'],
    sun: '#fff7cc',
    band: '#3a1c07',
    caption: ['#fffbe6', '#ffd166', '#ff8c42'],
    subtitle: '#ffe9b8',
    scrim: 'rgba(58, 28, 7, 0.3)',
  },
};

const GAP = 10; // black gutter between panels, in cover pixels (scaled below)

/** Panel rectangles for a cover of `w` x `h`, inside the photo area above the title band. */
export function layoutPanels(w, h) {
  const bandH = Math.round(h * 0.22);
  const top = h - bandH;
  const g = Math.max(6, Math.round(Math.min(w, h) * 0.012));
  const panels = [];
  if (w >= h * 1.5) {
    // Landscape 1920 x 1080: big hero on the left, two stacked panels right.
    const heroW = Math.round(w * 0.56);
    panels.push({ x: 0, y: 0, w: heroW, h: top });
    panels.push({ x: heroW + g, y: 0, w: w - heroW - g, h: Math.round(top / 2) - Math.floor(g / 2) });
    panels.push({ x: heroW + g, y: Math.round(top / 2) + Math.ceil(g / 2), w: w - heroW - g, h: top - Math.round(top / 2) - Math.ceil(g / 2) });
  } else if (w === h) {
    // Square 1080 x 1080: hero across the top, two panels side by side below.
    const heroH = Math.round(top * 0.58);
    panels.push({ x: 0, y: 0, w, h: heroH });
    panels.push({ x: 0, y: heroH + g, w: Math.round(w / 2) - Math.floor(g / 2), h: top - heroH - g });
    panels.push({ x: Math.round(w / 2) + Math.ceil(g / 2), y: heroH + g, w: w - Math.round(w / 2) - Math.ceil(g / 2), h: top - heroH - g });
  } else {
    // Portrait 1080 x 1350: hero on top, two panels side by side below.
    const heroH = Math.round(top * 0.56);
    panels.push({ x: 0, y: 0, w, h: heroH });
    panels.push({ x: 0, y: heroH + g, w: Math.round(w / 2) - Math.floor(g / 2), h: top - heroH - g });
    panels.push({ x: Math.round(w / 2) + Math.ceil(g / 2), y: heroH + g, w: w - Math.round(w / 2) - Math.ceil(g / 2), h: top - heroH - g });
  }
  return { panels, band: { x: 0, y: top, w, h: bandH }, gap: g };
}

/** Draws one photo into a panel rect, honouring zoom, pan and fit/cover. */
export function drawPanelPhoto(ctx, photo, rect, crop) {
  const { x, y, w, h } = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (!photo) {
    const sky = ctx.createLinearGradient(x, y, x, y + h);
    sky.addColorStop(0, '#3d1e63');
    sky.addColorStop(0.55, '#ff5e7a');
    sky.addColorStop(1, '#ff9a3d');
    ctx.fillStyle = sky;
    ctx.fillRect(x, y, w, h);
    drawSunDisc(ctx, x + w * 0.72, y + h * 0.34, Math.min(w, h) * 0.17, '#ffd166');
    ctx.restore();
    return;
  }
  const iw = photo.naturalWidth || photo.width;
  const ih = photo.naturalHeight || photo.height;
  const zoom = crop?.zoom ?? 1;
  const fit = crop?.fit === 'fit';
  let scale = fit
    ? Math.min(w / iw, h / ih) * zoom
    : Math.max(w / iw, h / ih) * zoom;
  const pw = iw * scale;
  const ph = ih * scale;
  const panX = crop?.panX ?? 0; // -1..1, fraction of the spare room
  const panY = crop?.panY ?? 0;
  const dx = x + (w - pw) / 2 + panX * Math.max(0, (pw - w) / 2);
  const dy = y + (h - ph) / 2 + panY * Math.max(0, (ph - h) / 2);
  if (fit) {
    ctx.fillStyle = '#14081f';
    ctx.fillRect(x, y, w, h);
  }
  ctx.drawImage(photo, dx, dy, pw, ph);
  ctx.restore();
}

/** A flat sun disc with a soft halo, drawn in code. */
export function drawSunDisc(ctx, cx, cy, r, colour) {
  const halo = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 2.1);
  halo.addColorStop(0, colour);
  halo.addColorStop(1, 'rgba(255, 120, 80, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 2.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

/** One palm tree silhouette: a curved trunk and seven drooping fronds. */
export function drawPalmTree(ctx, bx, by, height, lean) {
  ctx.save();
  ctx.translate(bx, by);
  ctx.scale(lean, 1);
  ctx.strokeStyle = '#0d0518';
  ctx.lineWidth = Math.max(2, height * 0.045);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(height * 0.06, -height * 0.55, height * 0.16, -height * 0.92);
  ctx.stroke();
  const tx = height * 0.16;
  const ty = -height * 0.92;
  ctx.lineWidth = Math.max(1.5, height * 0.03);
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI * (0.08 + (i / 6) * 0.84);
    const len = height * (0.42 - Math.abs(i - 3) * 0.03);
    const ex = tx + Math.cos(a) * len;
    const ey = ty + Math.sin(a) * len * 0.55 + height * 0.16;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(tx + Math.cos(a) * len * 0.5, ty + Math.sin(a) * len * 0.4 - height * 0.05, ex, ey);
    ctx.stroke();
  }
  ctx.restore();
}

/** A city skyline silhouette with a few lit windows, drawn in code. */
export function drawSkyline(ctx, x, y, w, h, seed) {
  ctx.fillStyle = '#0d0518';
  let cx = x;
  let i = 0;
  let s = seed;
  const next = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  while (cx < x + w) {
    const bw = w * (0.05 + next() * 0.07);
    const bh = h * (0.35 + next() * 0.65);
    ctx.fillRect(cx, y + h - bh, bw, bh);
    if (next() > 0.5) ctx.fillRect(cx + bw * 0.3, y + h - bh - h * 0.14, bw * 0.4, h * 0.14); // rooftop box
    // Lit windows.
    ctx.fillStyle = 'rgba(255, 209, 102, 0.85)';
    const rows = Math.floor(bh / (h * 0.16));
    const cols = Math.floor(bw / (w * 0.03));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (next() > 0.72) ctx.fillRect(cx + 4 + c * (w * 0.03), y + h - bh + 5 + r * (h * 0.16), 3, 4);
      }
    }
    ctx.fillStyle = '#0d0518';
    cx += bw + 2;
    i++;
    if (i > 40) break;
  }
}

/** Bold caption lettering: outline, gradient fill and drop shadow. */
export function drawCaptionLettering(ctx, text, cx, cy, maxW, size, gradientStops) {
  const words = text.trim().toUpperCase();
  if (!words) return;
  let s = size;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 ${s}px "Arial Black", Arial, sans-serif`;
  while (ctx.measureText(words).width > maxW && s > 10) {
    s -= 2;
    ctx.font = `900 ${s}px "Arial Black", Arial, sans-serif`;
  }
  const grad = ctx.createLinearGradient(0, cy - s * 0.6, 0, cy + s * 0.6);
  gradientStops.forEach(([stop, colour], i) => grad.addColorStop(stop, colour));
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#12041f';
  ctx.lineWidth = Math.max(3, s * 0.16);
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = s * 0.12;
  ctx.shadowOffsetY = s * 0.05;
  ctx.strokeText(words, cx, cy);
  ctx.fillStyle = grad;
  ctx.fillText(words, cx, cy);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

/**
 * Draws the whole cover onto `canvas` (which must already be sized to the
 * chosen size). `state` is { photos, panels, caption, subtitle, style } where
 * photos is an array of images (or null), panels an array of 3 crop objects
 * { photo, zoom, panX, panY, fit }, and style a key of STYLES.
 */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const style = STYLES[state.style] ?? STYLES.sunset;
  const { panels, band, gap } = layoutPanels(w, h);

  ctx.fillStyle = '#0d0518'; // black gutters show between panels
  ctx.fillRect(0, 0, w, h);

  panels.forEach((rect, i) => {
    const crop = state.panels[i];
    const photo = crop && crop.photo != null ? state.photos[crop.photo] : null;
    drawPanelPhoto(ctx, photo, rect, crop);
    // White inner frame line, poster style.
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = Math.max(2, gap * 0.35);
    ctx.strokeRect(rect.x + ctx.lineWidth, rect.y + ctx.lineWidth, rect.w - ctx.lineWidth * 2, rect.h - ctx.lineWidth * 2);
    // Warm colour grade over the photo.
    const grade = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
    grade.addColorStop(0, 'rgba(255, 94, 122, 0)');
    grade.addColorStop(1, style.scrim);
    ctx.fillStyle = grade;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  });

  // Title band: sunset / neon gradient sky, sun disc, skyline + palms.
  const sky = ctx.createLinearGradient(0, band.y, 0, band.y + band.h);
  style.sky.forEach((colour, i) => sky.addColorStop(i / (style.sky.length - 1), colour));
  ctx.fillStyle = sky;
  ctx.fillRect(band.x, band.y, band.w, band.h);
  const sunR = band.h * 0.34;
  drawSunDisc(ctx, band.w - sunR * 1.6, band.y + band.h * 0.42, sunR, style.sun);
  drawSkyline(ctx, band.x, band.y + band.h * 0.82, band.w, band.h * 0.18, 7);
  drawPalmTree(ctx, band.w * 0.06, band.y + band.h, band.h * 0.92, 1);
  drawPalmTree(ctx, band.w * 0.94, band.y + band.h, band.h * 0.8, -1);

  // Caption and subtitle across the band, above the skyline strip.
  const captionSize = band.h * 0.44;
  drawCaptionLettering(
    ctx, state.caption || 'SUNSET HEIST',
    band.w / 2, band.y + band.h * 0.34, band.w * 0.86, captionSize,
    style.caption.map((c, i) => [i / (style.caption.length - 1), c]),
  );
  const sub = (state.subtitle || '').trim().toUpperCase();
  if (sub) {
    ctx.font = `700 ${Math.max(10, band.h * 0.13)}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = style.subtitle;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 4;
    const spaced = sub.split('').join(' ');
    ctx.fillText(spaced, band.w / 2, band.y + band.h * 0.7);
    ctx.shadowColor = 'transparent';
  }
}
