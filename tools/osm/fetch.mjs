#!/usr/bin/env node
// Download the Nairobi CBD from the Overpass API into tools/osm/nairobi-cbd.osm.json.
//   node tools/osm/fetch.mjs [--endpoint https://overpass-api.de/api/interpreter]
// Uses curl so proxy settings from the environment are honoured.
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { overpassQuery, bboxFor, CONFIG } from './pipeline.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const endpoint = arg('--endpoint', 'https://overpass-api.de/api/interpreter');
const out = arg('--out', join(here, 'nairobi-cbd.osm.json'));

const q = overpassQuery(CONFIG); const tmp = join(mkdtempSync(join(tmpdir(), 'osm-')), 'query.txt'); writeFileSync(tmp, q);
console.log('bbox', bboxFor(CONFIG), '\nPOST', endpoint);
const body = execFileSync('curl', ['-sS', '--fail', '-m', '180', '--data-urlencode', `data@${tmp}`, endpoint], { maxBuffer: 1 << 28 }).toString();
const json = JSON.parse(body);
json.fetchedAt = new Date().toISOString(); json.endpoint = endpoint;
writeFileSync(out, JSON.stringify(json));
console.log(`wrote ${out}: ${json.elements.length} elements`);
