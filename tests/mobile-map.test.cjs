const test = require('node:test');
const assert = require('node:assert/strict');
const m = require('../js/mobile-map.js');

test('viewBox parser accepts four positive dimensions', () => {
  assert.deepEqual(m.parseViewBox('0 0 560 720'), {x:0,y:0,width:560,height:720});
  assert.equal(m.parseViewBox('0 0 0 720'), null);
  assert.equal(m.parseViewBox('bad'), null);
});

test('zoom preserves focus and clamps between 1x and 4x', () => {
  const base = {x:0,y:0,width:100,height:100};
  const z = m.zoomViewBox(base, base, 2, {x:25,y:25});
  assert.deepEqual(z, {x:12.5,y:12.5,width:50,height:50});
  const tooFar = m.zoomViewBox(z, base, 20, {x:25,y:25});
  assert.equal(tooFar.width, 25);
  assert.equal(tooFar.height, 25);
});

test('pan stays inside original viewBox bounds', () => {
  const base={x:0,y:0,width:100,height:100};
  const current={x:25,y:25,width:50,height:50};
  const p=m.panViewBox(current,base,100,100,200,200);
  assert.equal(p.x,0);
  assert.equal(p.y,0);
  const q=m.panViewBox(current,base,-100,-100,200,200);
  assert.equal(q.x,50);
  assert.equal(q.y,50);
});

test('isZoomed distinguishes base and magnified view', () => {
  const base={x:0,y:0,width:100,height:100};
  assert.equal(m.isZoomed(base,base),false);
  assert.equal(m.isZoomed({x:0,y:0,width:80,height:80},base),true);
});


test('drawer uses three stable snap states', () => {
  assert.equal(m.normalizeDrawerState('bad'), 'collapsed');
  assert.equal(m.cycleDrawerState('collapsed'), 'half');
  assert.equal(m.cycleDrawerState('half'), 'full');
  assert.equal(m.cycleDrawerState('full'), 'collapsed');
  assert.equal(m.drawerStateFromSwipe('collapsed', -60), 'half');
  assert.equal(m.drawerStateFromSwipe('half', -60), 'full');
  assert.equal(m.drawerStateFromSwipe('full', 60), 'half');
  assert.equal(m.drawerStateFromSwipe('half', 10), 'half');
});

test('magnifier center is the interaction aim point and stays on screen', () => {
  const g = m.magnifierGeometry(200, 500, 390, 844, 112, 42, 8);
  assert.deepEqual(g, {left:144, top:346, centerX:200, centerY:402, size:112});
  const edge = m.magnifierGeometry(10, 40, 390, 844, 112, 42, 8);
  assert.ok(edge.left >= 8);
  assert.ok(edge.top >= 8);
  assert.ok(edge.centerX >= 64);
});
