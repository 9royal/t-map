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


test('correct-region interior stays highlighted even when boundary proximity is false', () => {
  const r = h.classify({hoveredName:'新店區', selectedName:'新店區', nearCorrect:false, snapHint:true});
  assert.equal(r.correctHit, true);
  assert.equal(r.showCorrectHint, true);
  assert.equal(r.canPlace, true);
});

test('correct-region interior does not reveal the answer when hint is OFF', () => {
  const r = h.classify({hoveredName:'新店區', selectedName:'新店區', nearCorrect:false, snapHint:false});
  assert.equal(r.correctHit, true);
  assert.equal(r.showCorrectHint, false);
  assert.equal(r.canPlace, true);
});

test('magnifier circle contact stays true after the centre enters the correct region', () => {
  assert.equal(h.crosshairCircleContact({centerInside:true, boundaryDistance:99, radius:3.4}), true);
  assert.equal(h.magnifierContact({touchesCorrect:true, selectedName:'澎湖縣', snapHint:true}).hintName, '澎湖縣');
});

test('magnifier circle edge contact and miss are distinguished precisely', () => {
  assert.equal(h.crosshairCircleContact({centerInside:false, boundaryDistance:3.3, radius:3.4}), true);
  assert.equal(h.crosshairCircleContact({centerInside:false, boundaryDistance:3.5, radius:3.4}), false);
});

test('planar containment stays true throughout a polygon interior and includes its border', () => {
  const square = { type:'Polygon', coordinates:[[[0,0],[10,0],[10,10],[0,10],[0,0]]] };
  assert.equal(h.planarContains(square, 0, 5), true);
  assert.equal(h.planarContains(square, 5, 5), true);
  assert.equal(h.planarContains(square, 9.9, 5), true);
  assert.equal(h.planarContains(square, 12, 5), false);
});

test('planar containment supports holes without relying on ring winding', () => {
  const donut = { type:'Polygon', coordinates:[
    [[0,0],[10,0],[10,10],[0,10],[0,0]],
    [[3,3],[3,7],[7,7],[7,3],[3,3]]
  ] };
  assert.equal(h.planarContains(donut, 1, 1), true);
  assert.equal(h.planarContains(donut, 5, 5), false);
});

test('planar containment and boundary distance support MultiPolygon island geometry', () => {
  const islands = { type:'MultiPolygon', coordinates:[
    [[[0,0],[2,0],[2,2],[0,2],[0,0]]],
    [[[10,10],[14,10],[14,14],[10,14],[10,10]]]
  ] };
  assert.equal(h.planarContains(islands, 1, 1), true);
  assert.equal(h.planarContains(islands, 12, 12), true);
  assert.equal(h.planarContains(islands, 6, 6), false);
  assert.equal(h.planarBoundaryDistance(islands, 12, 12), 2);
  assert.equal(h.planarBoundaryDistance(islands, 15, 12), 1);
});
