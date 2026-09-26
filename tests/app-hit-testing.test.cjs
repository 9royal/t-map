const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');

test('rendered target paths cache their exact projected polygon geometry', () => {
  assert.match(app, /__tmapProjectedGeometry\s*=\s*projectFeatureGeometry\(f,\s*projection\)/);
  assert.match(app, /TMapHints\.planarContains\(projectedGeometry,\s*local\.x,\s*local\.y\)/);
  assert.doesNotMatch(app, /d3\.geoContains\(feature,\s*lonLat\)/);
});

test('screen to SVG conversion uses viewBox metrics before browser CTM fallback', () => {
  assert.match(app, /function svgViewportMetrics\(svg\)/);
  assert.match(app, /Math\.min\(rect\.width \/ vb\.width, rect\.height \/ vb\.height\)/);
  assert.match(app, /clientX - rect\.left - offsetX/);
});

test('inside and edge distance share projected geometry for main map and island insets', () => {
  assert.match(app, /function projectedBoundaryDistance/);
  assert.match(app, /TMapHints\.planarBoundaryDistance\(geometry,\s*local\.x,\s*local\.y\)/);
  assert.match(app, /correctInside \|\| correctDistance <= radius/);
});

test('magnifier hint and final snap share the same crosshair circle contact rule', () => {
  assert.match(app, /crosshairTouchesTarget\(correct,\s*drag\.aimX,\s*drag\.aimY,\s*radius\)/);
  assert.match(app, /const magnifierCanPlace = !!drag\.magnifierTouchesCorrect/);
});

test('optional hit diagnostics can be enabled without changing normal UI', () => {
  assert.match(app, /get\('hitdebug'\) === '1'/);
  assert.match(app, /中心在內:/);
  assert.match(app, /正確SVG:/);
});
