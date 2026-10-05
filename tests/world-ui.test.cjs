const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');

test('world placed labels use explicit high-contrast fill and halo in light and dark themes', () => {
  assert.match(css, /--world-label-fill:\s*#111827/);
  assert.match(css, /--world-label-halo:\s*#ffffff/);
  assert.match(css, /--world-label-fill:\s*#f8fbff/);
  assert.match(css, /--world-label-halo:\s*#071218/);
  assert.match(css, /\.world-country-label\s*\{[\s\S]*fill:\s*var\(--world-label-fill\)[\s\S]*stroke:\s*var\(--world-label-halo\)/);
  assert.match(css, /\.world-map-label\s*\{[\s\S]*fill:\s*var\(--world-label-fill\)[\s\S]*stroke:\s*var\(--world-label-halo\)/);
});

test('world ocean polygon winding is normalized before rendered Path2D hit zones are created', () => {
  assert.match(app, /function oceanPolygonFeature\(ring, oceanId\)/);
  assert.match(app, /d3\.geoArea\(feature\) > Math\.PI \* 2/);
  assert.match(app, /clean\.slice\(\)\.reverse\(\)/);
  assert.match(app, /path\.dataset\.worldId = item\.id \|\| ''/);
});

test('continent country preview uses the same rotated central meridian as its active continent', () => {
  assert.match(app, /const centerLon = Number\(continent\?\.projection\?\.centerLon \|\| 0\)/);
  assert.match(app, /createRotatedEqualEarthProjection\(112, 76, feature, centerLon, 6\)/);
});
