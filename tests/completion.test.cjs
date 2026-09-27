const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('China completion gives immediate celebration sound and then visible completion dialog', () => {
  assert.match(app, /chinaProvincial\.length === 33\) \{ playCelebrationSound\(\); setTimeout\(\(\) => showChinaComplete\(false\), 300\); \}/);
  assert.match(app, /function showChinaComplete\(playSound = true\)/);
  assert.match(app, /china-complete-dialog/);
  assert.match(html, /id="china-complete-dialog"/);
  assert.match(html, /中國省級行政區拼圖完成！/);
});

test('World first layer completion has celebration sound and completion dialog', () => {
  assert.match(app, /worldRegions\.length === 11\) \{ playCelebrationSound\(\); setTimeout\(\(\) => showWorldComplete\(false\), 300\); \}/);
  assert.match(app, /function showWorldComplete\(playSound = true\)/);
  assert.match(html, /id="world-complete-dialog"/);
  assert.match(html, /世界第一層完成！/);
});

test('celebration audio resumes AudioContext before scheduling notes', () => {
  assert.match(app, /async function playCelebrationSound\(\)/);
  assert.match(app, /await ctx\.resume\(\)/);
  assert.match(app, /const notes = \[523\.25, 659\.25, 783\.99, 1046\.5\]/);
});
