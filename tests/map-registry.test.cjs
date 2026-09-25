const test = require('node:test');
const assert = require('node:assert/strict');
const registry = require('../js/map-registry.js');

test('registry has unique ids', () => {
  const ids = registry.allMaps().map(m => m.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('Taiwan is the only ready module in v1.05 foundation', () => {
  assert.deepEqual(registry.readyMaps().map(m => m.id), ['taiwan']);
  assert.equal(registry.isReady('taiwan'), true);
});

test('Taiwan retains two puzzle levels and existing counts', () => {
  const taiwan = registry.getMap('taiwan');
  assert.equal(taiwan.levels[0].pieceCount, 22);
  assert.equal(taiwan.levels[1].pieceCount, 368);
  assert.deepEqual(taiwan.speechModes, ['mandarin', 'taiwanese']);
});

test('China project scope is stored as planned 33-piece module', () => {
  const china = registry.getMap('china-provincial');
  assert.equal(china.status, 'planned');
  assert.equal(china.levels[0].plannedPieceCount, 33);
});

test('World first level contains seven continents and four oceans', () => {
  const world = registry.getMap('world');
  assert.equal(world.levels[0].plannedItems.length, 11);
  assert.ok(world.levels[0].plannedItems.includes('北極海'));
  assert.deepEqual(world.speechModes, ['mandarin', 'english']);
});

test('World country layer keeps small-country omission as explicit policy', () => {
  const countries = registry.getMap('world').levels[1];
  assert.equal(countries.groupBy, 'continent');
  assert.equal(countries.smallRegionPolicy, 'exclude-initially');
});
