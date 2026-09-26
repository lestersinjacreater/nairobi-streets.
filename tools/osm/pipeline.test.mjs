// node --test tools/osm/
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMapData, gridAngle, roadSegments, CONFIG } from './pipeline.mjs';

// A fake city in OSM `out geom` form: a street grid tilted by `tilt`, one building per block,
// a diagonal highway, a park and a named landmark.
export function syntheticOSM(tiltDeg = 25) {
  const { lat: lat0, lon: lon0 } = CONFIG.center; const kx = 111320 * Math.cos((lat0 * Math.PI) / 180), kz = 110574;
  const t = (tiltDeg * Math.PI) / 180;
  const geo = (x, z) => { const X = x * Math.cos(t) - z * Math.sin(t), Z = x * Math.sin(t) + z * Math.cos(t); return { lat: lat0 - Z / kz, lon: lon0 + X / kx }; };
  const els = []; let id = 1;
  const way = (tags, pts) => els.push({ type: 'way', id: id++, tags, geometry: pts.map(([x, z]) => geo(x, z)) });
  const S = 120, N = 5; // block pitch in metres, blocks each side of centre
  for (let k = -N; k <= N; k++) {
    // slightly wobbly lines, like real OSM
    way({ highway: k === 0 ? 'primary' : 'tertiary', name: `East ${k}` }, [[-N * S, k * S], [0, k * S + 2], [N * S, k * S]]);
    way({ highway: 'secondary', name: `North ${k}` }, [[k * S, -N * S], [k * S - 2, 0], [k * S, N * S]]);
  }
  for (let i = -N; i < N; i++) for (let j = -N; j < N; j++) {
    const x = i * S + 20, z = j * S + 20, w = S - 40;
    if (i < -3 && j < -3) continue; // park
    const tags = i === 0 && j === 0 ? { building: 'yes', name: 'Kenyatta International Convention Centre' } : { building: 'yes', 'building:levels': String(2 + ((i * 7 + j * 3) & 7)) };
    way(tags, [[x, z], [x + w, z], [x + w, z + w], [x, z + w], [x, z]]);
  }
  way({ highway: 'trunk', name: 'Diagonal Highway' }, [[-N * S, N * S], [N * S, -N * S]]);
  way({ leisure: 'park', name: 'Test Park' }, [[-N * S, -N * S], [-3 * S, -N * S], [-3 * S, -3 * S], [-N * S, -3 * S], [-N * S, -N * S]]);
  els.push({ type: 'node', id: id++, lat: geo(10, 10).lat, lon: geo(10, 10).lon, tags: { name: 'Statue', historic: 'memorial' } });
  return { elements: els };
}

const overlap = (a, b) => a[0] < b[2] - 1e-6 && b[0] < a[2] - 1e-6 && a[1] < b[3] - 1e-6 && b[1] < a[3] - 1e-6;

test('grid angle is recovered and undone', () => {
  for (const tilt of [0, 12, 25, -30, 44]) {
    const d = buildMapData(syntheticOSM(tilt));
    const err = Math.abs(((d.meta.angleDeg - tilt + 45) % 90 + 90) % 90 - 45);
    assert.ok(err < 1.5, `tilt ${tilt}: got ${d.meta.angleDeg}`);
  }
  assert.ok(Math.abs(gridAngle([[[0, 0], [10, 10]], [[0, 0], [-10, 10]]]) - Math.PI / 4) < 1e-9);
});

test('near-axis streets snap into single strips, diagonals stay diagonal', () => {
  const segs = roadSegments([[0, 0], [50, 1], [100, 0]], 6);
  assert.equal(segs.length, 1); assert.equal(segs[0].axis, 'x');
  assert.equal(segs[0].x1, -3); assert.equal(segs[0].x2, 103); assert.equal(segs[0].z1, 0.5 - 3);
  const diag = roadSegments([[0, 0], [50, 50]], 6);
  assert.equal(diag[0].axis, 'diag');
});

test('output is boxes: roads clear of buildings, boxes never overlap', () => {
  const d = buildMapData(syntheticOSM(25));
  const roads = d.roads.flatMap((r) => r.boxes), blds = d.buildings.flatMap((b) => b.boxes);
  assert.ok(roads.length > 10 && blds.length > 50);
  for (const r of roads) for (const b of blds) assert.ok(!overlap(r, b), 'road/building overlap');
  const all = [...roads, ...blds];
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) assert.ok(!overlap(all[i], all[j]));
  const P = d.meta.halfExtent;
  for (const [x1, z1, x2, z2] of all) assert.ok(x1 >= -P && z1 >= -P && x2 <= P && z2 <= P);
  // aligned grid: a straight block building should stay a single box
  const multi = d.buildings.filter((b) => b.boxes.length > 3 && !/Convention/.test(b.name)).length;
  assert.ok(multi < d.buildings.length * 0.4, `${multi}/${d.buildings.length} buildings need >3 boxes`);
  // a diagonal crossing must not chop the straight streets into stairs (11 north-south streets)
  assert.ok(d.roads.find((r) => r.cls === 'secondary').boxes.length <= 11 * 3);
  // the big streets are wide enough to fight on
  assert.ok(d.roads.find((r) => r.cls === 'primary').boxes.some(([x1, z1, x2, z2]) => Math.min(x2 - x1, z2 - z1) >= CONFIG.roadWidths.primary - CONFIG.cell));
});

test('heights, overrides, labels and pois', () => {
  const d = buildMapData(syntheticOSM(25));
  const kicc = d.buildings.find((b) => /Convention/.test(b.name));
  assert.ok(kicc, 'landmark kept'); assert.equal(kicc.h, +(105 / CONFIG.verticalMetersPerUnit).toFixed(1));
  assert.ok(d.buildings.every((b) => b.h >= CONFIG.minHeight && b.h <= CONFIG.maxHeight));
  assert.ok(d.greens.length > 0);
  assert.ok(d.streets.some((s) => s.name === 'Diagonal Highway'));
  assert.ok(d.pois.some((p) => p.name === 'Statue' && Math.hypot(p.x, p.z) < 3));
  assert.match(d.meta.attribution, /OpenStreetMap/);
});
