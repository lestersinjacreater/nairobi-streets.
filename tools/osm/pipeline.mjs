// OSM -> Doodle Nairobi. Pure functions, no I/O, so the tests can feed it synthetic data.
//
// Steps:
//   1. project lon/lat to local metres around the map centre (x east, z south, like the game)
//   2. find the dominant street-grid angle and rotate everything so the grid lines up with X/Z
//   3. scale to game units and crop to a square
//   4. rasterise roads, buildings, parks and water onto one fine grid (roads win over buildings,
//      buildings over water, water over parks), then merge each label's cells into boxes
// The game only collides axis-aligned boxes, so the output is boxes. Nearly-straight streets are
// snapped to an axis first so they come out as single clean strips instead of stairs.

export const CONFIG = {
  center: { lat: -1.2860, lon: 36.8215 },  // between Uhuru Park and Tom Mboya Street
  fetchRadiusM: 1100,                      // download a bit more than we keep, so any rotation still fills the square
  metersPerUnit: 8,                        // horizontal compression
  verticalMetersPerUnit: 3.5,              // vertical compression (buildings keep their real height ratios)
  halfExtent: 88,                          // kept square is 2*halfExtent game units (~1.4 km at 8 m/unit)
  cell: 0.5,                               // raster resolution in game units
  snapTolDeg: 12,                          // segments within this of an axis get snapped onto it
  simplifyTol: 0.6,                        // polyline simplification before snapping, game units
  levelHeightM: 3.2,
  defaultLevels: 4,
  minHeight: 3, maxHeight: 50,             // game units
  minBuildingCells: 4,                     // drop slivers left after roads are cut out
  // Minimum on-screen widths (game units): real widths would be 2-3 units, too tight to fight in
  roadWidths: { motorway: 10, trunk: 9, primary: 8, secondary: 7, tertiary: 6, unclassified: 5, residential: 5, living_street: 5, pedestrian: 5, service: 3.5 },
  // Heights (metres) for landmarks whose OSM tags are missing or wrong; matched against the name
  heightOverrides: [
    [/kenyatta international (convention|conference) cent/i, 105],
    [/^kicc$/i, 105],
    [/times tower/i, 140],
  ],
};

export const ROAD_CLASSES = Object.keys(CONFIG.roadWidths);
const LABEL = { EMPTY: 0, GREEN: 1, WATER: 2 }; // buildings are 1000+id, roads 100+class index

export function bboxFor(cfg = CONFIG) {
  const { lat, lon } = cfg.center, r = cfg.fetchRadiusM;
  const dLat = r / 110574, dLon = r / (111320 * Math.cos((lat * Math.PI) / 180));
  return { s: lat - dLat, w: lon - dLon, n: lat + dLat, e: lon + dLon };
}

export function overpassQuery(cfg = CONFIG) {
  const b = bboxFor(cfg); const bb = `${b.s.toFixed(5)},${b.w.toFixed(5)},${b.n.toFixed(5)},${b.e.toFixed(5)}`;
  return `[out:json][timeout:120];
(
  way["highway"~"^(${ROAD_CLASSES.join('|')})$"](${bb});
  way["building"](${bb});
  relation["building"]["type"="multipolygon"](${bb});
  way["leisure"~"^(park|garden)$"](${bb});
  relation["leisure"~"^(park|garden)$"](${bb});
  way["landuse"~"^(grass|recreation_ground|village_green)$"](${bb});
  way["natural"="water"](${bb});
  relation["natural"="water"](${bb});
  node["name"]["historic"](${bb});
  node["name"]["tourism"~"^(artwork|attraction)$"](${bb});
  node["name"]["amenity"="fountain"](${bb});
);
out geom;`;
}

// ---------------- geometry helpers ----------------
export function projector(cfg = CONFIG) {
  const { lat: lat0, lon: lon0 } = cfg.center; const kx = 111320 * Math.cos((lat0 * Math.PI) / 180), kz = 110574;
  return (lat, lon) => [(lon - lon0) * kx, -(lat - lat0) * kz];
}
export const rotate = ([x, z], a) => { const c = Math.cos(a), s = Math.sin(a); return [x * c + z * s, -x * s + z * c]; };

// Dominant grid angle in (-45deg, 45deg]: length-weighted mean of segment bearings folded mod 90deg.
export function gridAngle(polylines) {
  let C = 0, S = 0;
  for (const pts of polylines) for (let i = 1; i < pts.length; i++) {
    const dx = pts[i][0] - pts[i - 1][0], dz = pts[i][1] - pts[i - 1][1]; const len = Math.hypot(dx, dz); if (len < 1e-6) continue;
    const a = Math.atan2(dz, dx) * 4; C += len * Math.cos(a); S += len * Math.sin(a);
  }
  return Math.atan2(S, C) / 4;
}

function simplify(pts, tol) {
  if (pts.length < 3) return pts.slice();
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop(); const [ax, az] = pts[a], [bx, bz] = pts[b]; const L = Math.hypot(bx - ax, bz - az) || 1e-9;
    let best = -1, bi = -1;
    for (let i = a + 1; i < b; i++) { const d = Math.abs((bx - ax) * (az - pts[i][1]) - (ax - pts[i][0]) * (bz - az)) / L; if (d > best) { best = d; bi = i; } }
    if (best > tol) { keep[bi] = 1; stack.push([a, bi], [bi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}

// Split a road polyline into segments, snapping near-axis ones. Consecutive snapped segments on the
// same axis merge into one run at their length-weighted mean offset, so a wobbly street stays one
// strip. Snapped ends extend by half the width so joints with the next segment close.
export function roadSegments(pts, width, cfg = CONFIG) {
  const tol = (cfg.snapTolDeg * Math.PI) / 180; const h = width / 2; const runs = [];
  const p = simplify(pts, cfg.simplifyTol);
  for (let i = 1; i < p.length; i++) {
    const [x1, z1] = p[i - 1], [x2, z2] = p[i]; const dx = x2 - x1, dz = z2 - z1; const len = Math.hypot(dx, dz); if (len < 1e-6) continue;
    const a = Math.atan2(Math.abs(dz), Math.abs(dx));
    const axis = a < tol ? 'x' : Math.PI / 2 - a < tol ? 'z' : 'diag';
    const prev = runs[runs.length - 1];
    if (axis === 'diag') { runs.push({ axis, a: [x1, z1], b: [x2, z2], h }); continue; }
    const lo = axis === 'x' ? Math.min(x1, x2) : Math.min(z1, z2), hi = axis === 'x' ? Math.max(x1, x2) : Math.max(z1, z2);
    const off = axis === 'x' ? (z1 + z2) / 2 : (x1 + x2) / 2;
    if (prev && prev.axis === axis) { prev.lo = Math.min(prev.lo, lo); prev.hi = Math.max(prev.hi, hi); prev.sum += off * len; prev.len += len; }
    else runs.push({ axis, lo, hi, sum: off * len, len });
  }
  return runs.map((r) => {
    if (r.axis === 'diag') return r;
    const off = r.sum / r.len;
    return r.axis === 'x' ? { axis: 'x', x1: r.lo - h, x2: r.hi + h, z1: off - h, z2: off + h, h0: h } : { axis: 'z', x1: off - h, x2: off + h, z1: r.lo - h, z2: r.hi + h, h0: h };
  });
}

function pointInPoly(x, z, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

// Greedy rectangle cover of all cells with the given label (cells are consumed).
function mergeRects(grid, n, label, used, win = [0, 0, n - 1, n - 1]) {
  const rects = [];
  for (let j = win[1]; j <= win[3]; j++) for (let i = win[0]; i <= win[2]; i++) {
    const k = j * n + i; if (used[k] || grid[k] !== label) continue;
    let w = 1; while (i + w < n && !used[k + w] && grid[k + w] === label) w++;
    let h = 1;
    grow: while (j + h < n) { const row = (j + h) * n + i; for (let t = 0; t < w; t++) if (used[row + t] || grid[row + t] !== label) break grow; h++; }
    for (let jj = j; jj < j + h; jj++) for (let t = 0; t < w; t++) used[jj * n + i + t] = 1;
    rects.push([i, j, i + w, j + h]);
  }
  return rects;
}

function parseHeightM(tags, name, cfg) {
  for (const [re, m] of cfg.heightOverrides) if (name && re.test(name)) return m;
  const h = parseFloat(String(tags.height ?? '').replace(',', '.')); if (Number.isFinite(h) && h > 0) return h;
  const lv = parseFloat(tags['building:levels']); if (Number.isFinite(lv) && lv > 0) return lv * cfg.levelHeightM + 2;
  return cfg.defaultLevels * cfg.levelHeightM + 2;
}

// Overpass `out geom` gives ways a `geometry` array and relations `members[].geometry`.
function rings(el) {
  if (el.type === 'way' && el.geometry) return [el.geometry];
  if (el.type === 'relation' && el.members) return el.members.filter((m) => m.role === 'outer' && m.geometry).map((m) => m.geometry);
  return [];
}

// ---------------- main entry ----------------
export function buildMapData(osm, cfg = CONFIG, meta = {}) {
  const proj = projector(cfg); const els = osm.elements || [];
  const toM = (g) => g.map((p) => proj(p.lat, p.lon));

  const roadsRaw = [], buildingsRaw = [], greensRaw = [], waterRaw = [], poisRaw = [];
  for (const el of els) {
    const t = el.tags || {};
    if (el.type === 'node') { if (t.name) poisRaw.push({ name: t.name, kind: t.historic || t.tourism || t.amenity || 'poi', p: proj(el.lat, el.lon) }); continue; }
    if (t.highway && ROAD_CLASSES.includes(t.highway) && el.type === 'way' && el.geometry) roadsRaw.push({ cls: t.highway, name: t.name || '', pts: toM(el.geometry), tags: t });
    else if (t.building) for (const r of rings(el)) buildingsRaw.push({ name: t.name || '', tags: t, pts: toM(r) });
    else if (t.natural === 'water' || t.water) for (const r of rings(el)) waterRaw.push(toM(r));
    else if (t.leisure || t.landuse) for (const r of rings(el)) greensRaw.push(toM(r));
  }

  // grid angle from the street network (service roads are too noisy)
  const angle = meta.angle ?? gridAngle(roadsRaw.filter((r) => r.cls !== 'service').map((r) => r.pts));
  const k = 1 / cfg.metersPerUnit; const tf = (p) => { const [x, z] = rotate(p, angle); return [x * k, z * k]; };

  const P = cfg.halfExtent, c = cfg.cell, n = Math.round((2 * P) / c);
  const grid = new Int32Array(n * n); // label per cell
  const cx = (i) => -P + (i + 0.5) * c;
  const range = (lo, hi) => [Math.max(0, Math.floor((lo + P) / c)), Math.min(n - 1, Math.ceil((hi + P) / c))];
  const paintPoly = (poly, label, canPaint) => {
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (const [x, z] of poly) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); }
    const [i0, i1] = range(x0, x1), [j0, j1] = range(z0, z1); let count = 0;
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const idx = j * n + i; if (!canPaint(grid[idx])) continue;
      if (pointInPoly(cx(i), cx(j), poly)) { grid[idx] = label; count++; }
    }
    return count;
  };

  // parks, then water, then buildings (taller wins an overlap), then roads over everything
  for (const g of greensRaw) paintPoly(g.map(tf), LABEL.GREEN, (v) => v === LABEL.EMPTY);
  for (const w of waterRaw) paintPoly(w.map(tf), LABEL.WATER, (v) => v <= LABEL.WATER);
  const buildings = buildingsRaw.map((b) => {
    const name = b.name; const hM = parseHeightM(b.tags, name, cfg);
    const h = Math.min(cfg.maxHeight, Math.max(cfg.minHeight, hM / cfg.verticalMetersPerUnit));
    return { name, h, pts: b.pts.map(tf), tags: b.tags };
  }).sort((a, b) => b.h - a.h);
  buildings.forEach((b, id) => paintPoly(b.pts, 1000 + id, (v) => v < 1000));

  const roadSegs = [];
  for (const r of roadsRaw) {
    const real = parseFloat(r.tags.width) * k; const lanes = parseFloat(r.tags.lanes);
    const w = Math.max(cfg.roadWidths[r.cls], Number.isFinite(real) ? real : 0, Number.isFinite(lanes) ? lanes * 3.4 * k : 0);
    for (const s of roadSegments(r.pts.map(tf), w, cfg)) roadSegs.push({ ...s, cls: r.cls, name: r.name });
  }
  // Straight strips first (the bigger road wins a crossing), then diagonals only where no strip is,
  // so crossings never chop a straight street into stairs. A diagonal is a chain of squares a
  // little under half its width apart: chunky steps, but few boxes and no gaps.
  const paintRect = (x1, z1, x2, z2, label, ok) => {
    const [i0, i1] = range(x1, x2), [j0, j1] = range(z1, z2);
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const x = cx(i), z = cx(j); if (x >= x1 && x <= x2 && z >= z1 && z <= z2 && ok(grid[j * n + i])) grid[j * n + i] = label; }
  };
  const notRoad = (v) => v < 100 || v >= 1000;
  for (const s of roadSegs.filter((r) => r.axis !== 'diag')) {
    const label = 100 + ROAD_CLASSES.indexOf(s.cls);
    paintRect(s.x1, s.z1, s.x2, s.z2, label, (v) => notRoad(v) || v > label); // lower index = bigger road
  }
  for (const s of roadSegs.filter((r) => r.axis === 'diag')) {
    const label = 100 + ROAD_CLASSES.indexOf(s.cls); const len = Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]);
    const steps = Math.max(1, Math.ceil(len / (s.h * 0.9)));
    for (let q = 0; q <= steps; q++) {
      const x = s.a[0] + ((s.b[0] - s.a[0]) * q) / steps, z = s.a[1] + ((s.b[1] - s.a[1]) * q) / steps;
      const snap = (v) => Math.round(v / c) * c; // square edges on cell lines so the merge stays tidy
      paintRect(snap(x - s.h), snap(z - s.h), snap(x + s.h), snap(z + s.h), label, notRoad);
    }
  }

  // ---------------- merge cells into boxes ----------------
  const used = new Uint8Array(n * n); const W = (i) => +(-P + i * c).toFixed(2);
  const toBox = ([i0, j0, i1, j1]) => [W(i0), W(j0), W(i1), W(j1)];
  const count = new Map(), win = new Map();
  for (let q = 0; q < grid.length; q++) {
    const v = grid[q]; count.set(v, (count.get(v) || 0) + 1); if (v < 1000) continue;
    const i = q % n, j = (q - i) / n; const w = win.get(v);
    if (!w) win.set(v, [i, j, i, j]); else { w[0] = Math.min(w[0], i); w[1] = Math.min(w[1], j); w[2] = Math.max(w[2], i); w[3] = Math.max(w[3], j); }
  }

  const outBuildings = [];
  buildings.forEach((b, id) => {
    const label = 1000 + id; const cells = count.get(label) || 0;
    if (cells < cfg.minBuildingCells) return; // slivers left after roads were cut out
    const boxes = mergeRects(grid, n, label, used, win.get(label)).map(toBox);
    const area = cells * c * c; let sx = 0, sz = 0; for (const [x1, z1, x2, z2] of boxes) { const a = (x2 - x1) * (z2 - z1); sx += a * (x1 + x2) / 2; sz += a * (z1 + z2) / 2; }
    outBuildings.push({ name: b.name, h: +b.h.toFixed(1), kind: b.tags.building, c: [+(sx / area).toFixed(1), +(sz / area).toFixed(1)], boxes });
  });
  const roads = ROAD_CLASSES.map((cls, ci) => ({ cls, boxes: mergeRects(grid, n, 100 + ci, used).map(toBox) })).filter((r) => r.boxes.length);
  const greens = mergeRects(grid, n, LABEL.GREEN, used).map(toBox);
  const water = mergeRects(grid, n, LABEL.WATER, used).map(toBox);

  // ---------------- labels ----------------
  const inside = ([x, z]) => Math.abs(x) < P - 2 && Math.abs(z) < P - 2;
  const byName = new Map();
  for (const s of roadSegs) {
    if (!s.name) continue;
    const [a, b] = s.axis === 'diag' ? [s.a, s.b] : s.axis === 'x' ? [[s.x1 + s.h0, (s.z1 + s.z2) / 2], [s.x2 - s.h0, (s.z1 + s.z2) / 2]] : [[(s.x1 + s.x2) / 2, s.z1 + s.h0], [(s.x1 + s.x2) / 2, s.z2 - s.h0]];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]); const cur = byName.get(s.name); if (!cur || len > cur.len) byName.set(s.name, { len, a, b });
  }
  // put each name somewhere along its longest run, as far as possible from the names already placed
  const streets = [];
  for (const [name, v] of [...byName].filter(([, v]) => v.len > 12).sort((p, q) => q[1].len - p[1].len)) {
    let best = null, bestD = -1;
    for (let t = 0.15; t <= 0.851; t += 0.05) {
      const p = [v.a[0] + (v.b[0] - v.a[0]) * t, v.a[1] + (v.b[1] - v.a[1]) * t]; if (!inside(p)) continue;
      const d = streets.reduce((m, s) => Math.min(m, Math.hypot((s.x - p[0]) / 3, s.z - p[1])), 1e9); // labels are wide: weigh x less
      if (d > bestD) { bestD = d; best = p; }
    }
    if (best) streets.push({ name, x: +best[0].toFixed(1), z: +best[1].toFixed(1) });
  }
  const pois = poisRaw.map((p) => { const [x, z] = tf(p.p); return { name: p.name, kind: p.kind, x: +x.toFixed(1), z: +z.toFixed(1) }; }).filter((p) => inside([p.x, p.z]));

  return {
    meta: {
      source: 'OpenStreetMap', attribution: '© OpenStreetMap contributors, ODbL 1.0', ...meta.extra,
      center: cfg.center, angleDeg: +((angle * 180) / Math.PI).toFixed(2), metersPerUnit: cfg.metersPerUnit, verticalMetersPerUnit: cfg.verticalMetersPerUnit, halfExtent: P, cell: c,
    },
    roads, buildings: outBuildings, greens, water, streets, pois,
  };
}
