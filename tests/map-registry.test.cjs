const test = require('node:test');
const assert = require('node:assert/strict');
const registry = require('../js/map-registry.js');

test('registry has unique ids', () => {
  const ids = registry.allMaps().map(m => m.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('Taiwan and China are ready modules in v1.05.4', () => {
  assert.deepEqual(registry.readyMaps().map(m => m.id), ['taiwan', 'china-provincial']);
  assert.equal(registry.isReady('taiwan'), true);
  assert.equal(registry.isReady('china-provincial'), true);
  assert.equal(registry.isReady('world'), false);
});

test('Taiwan retains two puzzle levels and existing counts', () => {
  const taiwan = registry.getMap('taiwan');
  assert.equal(taiwan.levels[0].pieceCount, 22);
  assert.equal(taiwan.levels[1].pieceCount, 368);
  assert.deepEqual(taiwan.speechModes, ['mandarin', 'taiwanese']);
});

test('China project scope is a ready 33-piece module', () => {
  const china = registry.getMap('china-provincial');
  assert.equal(china.status, 'ready');
  assert.equal(china.levels[0].pieceCount, 33);
  assert.equal(china.levels[0].type, 'svg-path-puzzle');
  assert.deepEqual(china.speechModes, ['mandarin']);
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
