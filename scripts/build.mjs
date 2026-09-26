import { cp, copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { normalizeChinaMap } from './china-map.mjs';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const dist = path.join(root, 'dist');

const required = [
  ['D3', 'node_modules/d3/dist/d3.min.js'],
  ['TopoJSON Client', 'node_modules/topojson-client/dist/topojson-client.min.js'],
  ['臺灣縣市圖資', 'node_modules/taiwan-atlas/counties-10t.json'],
  ['臺灣鄉鎮市區圖資', 'node_modules/taiwan-atlas/towns-10t.json'],
  ['中國省級行政區 SVG 套件', 'node_modules/@svg-maps/china/index.js']
];
for (const [label, rel] of required) {
  if (!existsSync(path.join(root, rel))) throw new Error(`${label} 尚未安裝：${rel}。請先執行 npm install。`);
}

await rm(dist, { recursive: true, force: true });
for (const dir of ['css', 'js', 'lib', 'data', 'licenses']) await mkdir(path.join(dist, dir), { recursive: true });
for (const file of ['index.html', 'VERSION', 'README.md', 'CHANGELOG.md', '_headers']) {
  const src = path.join(root, file); if (existsSync(src)) await copyFile(src, path.join(dist, file));
}
await cp(path.join(root, 'css'), path.join(dist, 'css'), { recursive: true });
await cp(path.join(root, 'js'), path.join(dist, 'js'), { recursive: true });
await copyFile(path.join(root, 'node_modules/d3/dist/d3.min.js'), path.join(dist, 'lib/d3.min.js'));
await copyFile(path.join(root, 'node_modules/topojson-client/dist/topojson-client.min.js'), path.join(dist, 'lib/topojson-client.min.js'));
await copyFile(path.join(root, 'node_modules/taiwan-atlas/counties-10t.json'), path.join(dist, 'data/counties-10t.json'));
await copyFile(path.join(root, 'node_modules/taiwan-atlas/towns-10t.json'), path.join(dist, 'data/towns-10t.json'));

const chinaSource = require('@svg-maps/china');
const chinaData = normalizeChinaMap(chinaSource);
await writeFile(path.join(dist, 'data/china-provinces.json'), JSON.stringify(chinaData) + '\n', 'utf8');

const licenseCandidates = [
  ['D3-ISC.txt', 'node_modules/d3/LICENSE'],
  ['topojson-client-ISC.txt', 'node_modules/topojson-client/LICENSE'],
  ['taiwan-atlas-package.json', 'node_modules/taiwan-atlas/package.json'],
  ['svg-maps-china-package.json', 'node_modules/@svg-maps/china/package.json'],
  ['svg-maps-china-LICENSE.md', 'node_modules/@svg-maps/china/LICENSE.md']
];
for (const [target, rel] of licenseCandidates) {
  const src = path.join(root, rel); if (existsSync(src)) await copyFile(src, path.join(dist, 'licenses', target));
}

const countyTopo = JSON.parse(await readFile(path.join(dist, 'data/counties-10t.json'), 'utf8'));
const townTopo = JSON.parse(await readFile(path.join(dist, 'data/towns-10t.json'), 'utf8'));
const countyCount = countyTopo?.objects?.counties?.geometries?.length ?? 0;
const townCount = townTopo?.objects?.towns?.geometries?.length ?? 0;
const chinaCount = chinaData.locations.length;
if (countyCount !== 22) throw new Error(`縣市圖資完整性檢查失敗：預期 22，實際 ${countyCount}`);
if (townCount !== 368) throw new Error(`鄉鎮市區圖資完整性檢查失敗：預期 368，實際 ${townCount}`);
if (chinaCount !== 33) throw new Error(`中國省級行政區圖資完整性檢查失敗：預期 33，實際 ${chinaCount}`);

const stamp = {
  app: 'T map', version: '1.05.4', builtAt: new Date().toISOString(), localizedAssets: true,
  countyCount, townCount, chinaProvincialCount: chinaCount, runtimeExternalCdn: false,
  platformMaps: ['taiwan', 'china-provincial', 'world'], readyMaps: ['taiwan', 'china-provincial']
};
await writeFile(path.join(dist, 'build-info.json'), JSON.stringify(stamp, null, 2) + '\n', 'utf8');
console.log(`T map v1.05.4 build completed: ${countyCount} counties, ${townCount} towns, ${chinaCount} China provincial regions.`);
