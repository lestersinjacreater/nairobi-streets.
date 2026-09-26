// node --test tools/pwa.test.mjs
// The service worker precaches the game so the installed app starts offline. A file missing from
// its list would only break offline, which is easy to miss, so check the list against the disk.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sw = readFileSync(join(root, 'sw.js'), 'utf8');
const shell = [...sw.match(/const SHELL = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);

test('every game module is precached', () => {
  for (const f of readdirSync(join(root, 'src')).filter((f) => f.endsWith('.js'))) assert.ok(shell.includes(`./src/${f}`), `sw.js SHELL is missing ./src/${f}`);
});
test('every precached file exists', () => {
  for (const f of shell) if (f !== './') assert.ok(existsSync(join(root, f)), `sw.js lists ${f}, which does not exist`);
});
test('manifest icons exist and are precached', () => {
  const m = JSON.parse(readFileSync(join(root, 'manifest.webmanifest'), 'utf8'));
  assert.equal(m.display, 'fullscreen'); assert.equal(m.orientation, 'landscape');
  for (const i of m.icons) { assert.ok(existsSync(join(root, i.src)), i.src); assert.ok(shell.includes('./' + i.src), `${i.src} not precached`); }
});
