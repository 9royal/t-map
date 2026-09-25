const test = require('node:test');
const assert = require('node:assert/strict');
const engine = require('../js/map-engine.js');

test('progress is unique and bounded', () => {
  assert.deepEqual(engine.progressStatus(3, ['a', 'a', 'b']), { done:2, total:3, remaining:1, complete:false });
  assert.deepEqual(engine.progressStatus(2, ['a', 'b', 'c']), { done:2, total:2, remaining:0, complete:true });
});

test('region normalization keeps multilingual speech labels', () => {
  const region = engine.normalizeRegion({ id:'JPN', name:'日本', speech:{ english:'Japan' } });
  assert.equal(region.playable, true);
  assert.equal(engine.speechText(region, 'english'), 'Japan');
  assert.equal(engine.speechText(region, 'mandarin'), '日本');
});

test('non-playable small regions can be excluded without deleting metadata', () => {
  const regions = [{id:'A',name:'A'}, {id:'B',name:'B',playable:false}];
  assert.deepEqual(engine.playableRegions(regions).map(r => r.id), ['A']);
});

test('regions can be grouped for future continent-based country puzzles', () => {
  const groups = engine.groupRegions([
    {id:'JPN',name:'日本',continent:'Asia'},
    {id:'FRA',name:'法國',continent:'Europe'}
  ], 'continent');
  assert.equal(groups.Asia[0].id, 'JPN');
  assert.equal(groups.Europe[0].id, 'FRA');
});
