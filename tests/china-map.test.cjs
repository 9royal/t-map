const test = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

async function load() {
  return import(pathToFileURL(path.join(__dirname, '..', 'scripts', 'china-map.mjs')).href);
}

test('China metadata contains exactly 33 project puzzle regions', async () => {
  const mod = await load();
  assert.equal(mod.CHINA_REGIONS.length, 33);
  assert.equal(new Set(mod.CHINA_REGIONS.map(x => x.id)).size, 33);
  assert.ok(mod.CHINA_REGIONS.some(x => x.name === '香港特別行政區'));
  assert.ok(mod.CHINA_REGIONS.some(x => x.name === '澳門特別行政區'));
  assert.ok(!mod.CHINA_REGIONS.some(x => x.name.includes('臺灣')));
});

test('normalizeChinaMap converts package locations into localized runtime data', async () => {
  const mod = await load();
  const locations = mod.CHINA_REGIONS.map((r, i) => ({
    id: r.id,
    name: r.aliases[0],
    path: `M${i} 0h1v1h-1z`
  }));
  const out = mod.normalizeChinaMap({ label: 'China', viewBox: '0 0 500 400', locations });
  assert.equal(out.locations.length, 33);
  assert.equal(out.viewBox, '0 0 500 400');
  assert.equal(out.locations.find(x => x.id === 'hong-kong').shortName, '香港');
  assert.equal(out.locations.find(x => x.id === 'macau').kind, 'sar');
});
