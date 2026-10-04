const test = require('node:test');
const assert = require('node:assert/strict');
const registry = require('../js/map-registry.js');

test('registry has unique ids', () => {
  const ids = registry.allMaps().map(m => m.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('Taiwan, China and World modules are ready in v1.05.7', () => {
  assert.deepEqual(registry.readyMaps().map(m => m.id), ['taiwan', 'china-provincial', 'world']);
  assert.equal(registry.isReady('taiwan'), true);
  assert.equal(registry.isReady('china-provincial'), true);
  assert.equal(registry.isReady('world'), true);
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

test('World first level is ready with seven continents, three major oceans and Arctic Ocean', () => {
  const world = registry.getMap('world');
  const first = world.levels[0];
  assert.equal(first.status, 'ready');
  assert.equal(first.pieceCount, 11);
  assert.equal(first.items.length, 11);
  assert.ok(first.items.includes('北極海'));
  assert.ok(first.items.includes('太平洋'));
  assert.deepEqual(world.speechModes, ['mandarin', 'english']);
});

test('World country layer is ready, grouped by continent and uses Equal Earth', () => {
  const countries = registry.getMap('world').levels[1];
  assert.equal(countries.status, 'ready');
  assert.equal(countries.groupBy, 'continent');
  assert.equal(countries.smallRegionPolicy, 'exclude-with-full-name-list');
  assert.equal(countries.continentProjectionProfiles, true);
  assert.equal(countries.transcontinentalPolicy, 'show-in-both-adjacent-continents');
  assert.equal(countries.projection, 'Equal Earth');
});
