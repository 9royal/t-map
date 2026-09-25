const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');

test('rendered target maps retain their geographic projection for browser-independent interior hit testing', () => {
  assert.match(app, /svgEl\.__tmapProjection\s*=\s*projection/);
  assert.match(app, /d3\.geoContains\(feature,\s*lonLat\)/);
});

test('drag hit testing falls back to geographic containment instead of boundary-only proximity', () => {
  assert.match(app, /pointInsideTarget\(path,\s*x,\s*y\)/);
  assert.match(app, /correctInside\s*\|\|\s*TMapHints\.geometryProximity/);
});

test('magnifier hint and snap use the same visible crosshair contact rule', () => {
  assert.match(app, /crosshairTouchesTarget\(correct,\s*drag\.aimX,\s*drag\.aimY,\s*radius\)/);
  assert.doesNotMatch(app, /const centerHit\s*=\s*hitRegionAt\(drag\.aimX,\s*drag\.aimY/);
});
