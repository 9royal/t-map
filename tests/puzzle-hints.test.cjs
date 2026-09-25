const test = require('node:test');
const assert = require('node:assert/strict');
const h = require('../js/puzzle-hints.js');

test('OFF retains hover and snap but never reveals the answer', () => {
  const r = h.classify({hoveredName:'板橋區', selectedName:'新店區', nearCorrect:false, snapHint:false});
  assert.equal(r.hovered, true);
  assert.equal(r.showCorrectHint, false);
  assert.equal(r.canPlace, false);
  const correct = h.classify({hoveredName:'新店區', selectedName:'新店區', nearCorrect:true, snapHint:false});
  assert.equal(correct.canPlace, true);
  assert.equal(correct.showCorrectHint, false);
});

test('ON highlights the correct answer but retains ordinary wrong hover', () => {
  const wrong = h.classify({hoveredName:'板橋區', selectedName:'新店區', nearCorrect:false, snapHint:true});
  assert.equal(wrong.hovered, true);
  assert.equal(wrong.showCorrectHint, false);
  const near = h.classify({hoveredName:'板橋區', selectedName:'新店區', nearCorrect:true, snapHint:true});
  assert.equal(near.showCorrectHint, true);
  assert.equal(near.canPlace, true);
});

test('placed regions cannot be placed twice', () => {
  const r = h.classify({hoveredName:'板橋區', selectedName:'板橋區', placed:true, nearCorrect:false, snapHint:true});
  assert.equal(r.canPlace, false);
});

test('map bounds include edges and reject points outside', () => {
  const r={left:10,right:110,top:20,bottom:220};
  assert.equal(h.withinRect(10,20,r),true);
  assert.equal(h.withinRect(111,20,r),false);
  assert.equal(h.withinRect(30,40,null),false);
});

test('distance calculations use actual segments instead of bounding boxes', () => {
  assert.equal(h.distanceToSegment(5,5,0,0,10,0),5);
  assert.equal(h.distanceToPolyline(50,50,[{x:0,y:0},{x:100,y:0},{x:100,y:100}]),50);
  assert.equal(h.distanceToPolyline(0,0,[]),Infinity);
});

test('proximity accepts a true fill and nearby boundary, rejects distant points', () => {
  const old=global.DOMPoint;
  global.DOMPoint=class { constructor(x,y){this.x=x;this.y=y;} matrixTransform(){return this;} };
  const path={getScreenCTM:()=>({a:1,b:0,inverse(){return this;}}),
    isPointInFill:p=>p.x>=0&&p.x<=10&&p.y>=0&&p.y<=10,
    getBoundingClientRect:()=>({left:0,right:10,top:0,bottom:10}),
    getTotalLength:()=>40,
    getPointAtLength:d=>{d%=40;if(d<10)return{x:d,y:0};if(d<20)return{x:10,y:d-10};if(d<30)return{x:30-d,y:10};return{x:0,y:40-d};}};
  try {
    assert.equal(h.geometryDistance(path,5,5,2),0);
    assert.ok(h.geometryDistance(path,12,5,3) <= 3);
    assert.equal(h.geometryDistance(path,50,50,3),Infinity);
    assert.equal(h.geometryProximity(path,5,5,2),true);
    assert.equal(h.geometryProximity(path,12,5,3),true);
    assert.equal(h.geometryProximity(path,50,50,3),false);
  } finally {global.DOMPoint=old;}
});


test('correct hint renders on exactly one surface', () => {
  assert.equal(h.correctHintSurface(false, false), 'none');
  assert.equal(h.correctHintSurface(false, true), 'none');
  assert.equal(h.correctHintSurface(true, false), 'map');
  assert.equal(h.correctHintSurface(true, true), 'magnifier');
});


test('magnifier contact uses the visible crosshair circle, not the label position', () => {
  const touch = h.magnifierContact({touchesCorrect:true, selectedName:'新店區', snapHint:true});
  assert.equal(touch.canPlace, true);
  assert.equal(touch.showCorrectHint, true);
  assert.equal(touch.hintName, '新店區');

  const miss = h.magnifierContact({touchesCorrect:false, selectedName:'新店區', snapHint:true});
  assert.equal(miss.canPlace, false);
  assert.equal(miss.showCorrectHint, false);
  assert.equal(miss.hintName, null);
});

test('magnifier hint and final placement remain aligned even when hint is OFF', () => {
  const r = h.magnifierContact({touchesCorrect:true, selectedName:'新店區', snapHint:false});
  assert.equal(r.canPlace, true);
  assert.equal(r.showCorrectHint, false);
  assert.equal(r.hintName, null);
  assert.equal(h.magnifierContact({touchesCorrect:true, selectedName:'新店區', snapHint:true, placed:true}).canPlace, false);
});

test('crosshair visual radius is converted through magnifier scale', () => {
  const radius = h.magnifierSourceRadius(8, 2.35);
  assert.ok(Math.abs(radius - (8 / 2.35)) < 1e-12);
  assert.ok(radius > 3.4 && radius < 3.5);
  assert.equal(h.magnifierSourceRadius(8, 0), 0);
});

test('magnifier hint name follows physical contact only', () => {
  assert.equal(h.magnifierHintName({touchesCorrect:true, selectedName:'新店區', snapHint:true}), '新店區');
  assert.equal(h.magnifierHintName({touchesCorrect:false, selectedName:'新店區', snapHint:true}), null);
});


test('crosshair circle stays in contact while its centre is inside the correct region', () => {
  assert.equal(h.crosshairCircleContact({centerInside:true, boundaryDistance:50, radius:3.4}), true);
  assert.equal(h.crosshairCircleContact({centerInside:true, boundaryDistance:Infinity, radius:3.4}), true);
});

test('crosshair circle edge contact is precise and does not use the old wide mobile radius', () => {
  assert.equal(h.crosshairCircleContact({centerInside:false, boundaryDistance:3.39, radius:3.4}), true);
  assert.equal(h.crosshairCircleContact({centerInside:false, boundaryDistance:3.41, radius:3.4}), false);
  assert.equal(h.crosshairCircleContact({centerInside:false, boundaryDistance:24, radius:3.4}), false);
});

test('crosshair contact helper is geometry-agnostic so inset islands use the same rule', () => {
  for (const name of ['澎湖縣','金門縣','連江縣']) {
    const contact = h.crosshairCircleContact({centerInside:true, boundaryDistance:Infinity, radius:3.4});
    assert.equal(contact, true, `${name} centre-inside contact should count`);
  }
});
