// node --test tools/arsenal.test.mjs
// The armoury is plain data, so it can be checked without a browser. The main thing guarded here is the ORDER of ARSENAL:
// online play sends a weapon's position in the list, so reordering or deleting an entry would show other players the wrong gun.
import test from 'node:test';
import assert from 'node:assert/strict';
import { ARSENAL, GUN_STATS, GUN_IDS, CLASSES, DEFAULT_LOADOUT, gunBars } from '../src/arsenal.js';

test('the first ten entries keep the order older versions of the game know', () => {
  const frozen = ['rifle', 'shotgun', 'sniper', 'katana', 'boxing', 'machinegun', 'm134', 'gau19', 'yakb', 'gshg'];
  assert.deepEqual(ARSENAL.slice(0, 10).map((a) => a.id), frozen);
});
test('ids are unique and every gun has stats', () => {
  const ids = ARSENAL.map((a) => a.id); assert.equal(new Set(ids).size, ids.length);
  for (const id of GUN_IDS) assert.ok(GUN_STATS[id], `${id} has no stats`);
});
test('there are plenty of guns, and every class has some', () => {
  assert.ok(GUN_IDS.length >= 30, 'fewer than 30 guns');
  for (const c of CLASSES) assert.ok(GUN_IDS.some((id) => GUN_STATS[id].cls === c), `no ${c}`);
});
test('every gun has sane numbers', () => {
  for (const id of GUN_IDS) {
    const g = GUN_STATS[id];
    assert.ok(g.name && g.cls && g.prop, id);
    for (const k of ['interval', 'damage', 'magSize', 'reserve', 'reloadDur', 'spread', 'adsSpread']) assert.ok(g[k] > 0, `${id}.${k}`);
    assert.ok(g.maxReserve >= g.reserve, `${id} maxReserve`);
    assert.ok(g.interval >= 1 / 40, `${id} fires faster than 40 a second`);
    assert.ok(Array.isArray(g.sight) && g.sight.length === 4, `${id} sight`);
    assert.ok(g.pvp && g.pvp[0] > 0, `${id} pvp`);
  }
});
test('the default loadout is three real, different guns', () => {
  assert.equal(DEFAULT_LOADOUT.length, 3); assert.equal(new Set(DEFAULT_LOADOUT).size, 3);
  for (const id of DEFAULT_LOADOUT) assert.ok(GUN_STATS[id]);
});
test('stat bars stay between 0 and 100', () => {
  for (const id of GUN_IDS) for (const v of Object.values(gunBars(id))) assert.ok(v >= 0 && v <= 100, id);
});
