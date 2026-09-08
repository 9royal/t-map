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
    assert.equal(h.geometryProximity(path,5,5,2),true);
    assert.equal(h.geometryProximity(path,12,5,3),true);
    assert.equal(h.geometryProximity(path,50,50,3),false);
  } finally {global.DOMPoint=old;}
});
