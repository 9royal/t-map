import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const dist = path.join(root, 'dist');

if (!existsSync(dist)) throw new Error('找不到 dist/；請先執行 npm run build。');

const expected = [
  'index.html', 'css/style.css',
  'js/app.js', 'js/puzzle-hints.js', 'js/mobile-map.js', 'js/map-registry.js', 'js/map-engine.js', 'js/speech-profiles.js',
  'lib/d3.min.js', 'lib/topojson-client.min.js',
  'data/counties-10t.json', 'data/towns-10t.json', 'data/china-provinces.json', 'data/world-regions.json',
  'build-info.json'
];
for (const rel of expected) {
  if (!existsSync(path.join(dist, rel))) throw new Error(`缺少部署檔案：${rel}`);
}

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir)) {
    const full = path.join(dir, entry);
    const s = await stat(full);
    if (s.isDirectory()) out.push(...await walk(full));
    else out.push(full);
  }
  return out;
}

const textFiles = (await walk(dist)).filter(f => /\.(html|css|js|json|md)$/i.test(f));
const forbidden = [
  /cdn\.jsdelivr\.net/i,
  /unpkg\.com/i,
  /cdnjs\.cloudflare\.com/i,
  /https?:\/\/[^\s"')]+(?:\.js|\.json)/i
];
for (const file of textFiles) {
  const text = await readFile(file, 'utf8');
  for (const pattern of forbidden) {
    if (pattern.test(text)) throw new Error(`偵測到執行期外部資源網址：${path.relative(dist, file)} → ${pattern}`);
  }
}

const counties = JSON.parse(await readFile(path.join(dist, 'data/counties-10t.json'), 'utf8'));
const towns = JSON.parse(await readFile(path.join(dist, 'data/towns-10t.json'), 'utf8'));
const china = JSON.parse(await readFile(path.join(dist, 'data/china-provinces.json'), 'utf8'));
const world = JSON.parse(await readFile(path.join(dist, 'data/world-regions.json'), 'utf8'));
const c = counties?.objects?.counties?.geometries?.length ?? 0;
const t = towns?.objects?.towns?.geometries?.length ?? 0;
const chinaLocations = Array.isArray(china?.locations) ? china.locations : [];
const worldContinents = Array.isArray(world?.continents) ? world.continents : [];
const worldOceans = Array.isArray(world?.oceans) ? world.oceans : [];
if (c !== 22 || t !== 368) throw new Error(`臺灣圖資數量異常：縣市 ${c}、鄉鎮市區 ${t}`);
if (chinaLocations.length !== 33) throw new Error(`中國模組圖資數量異常：${chinaLocations.length}`);
if (new Set(chinaLocations.map(x => x.id)).size !== 33) throw new Error('中國模組 ID 不是 33 個唯一值。');
if (!chinaLocations.some(x => x.name === '香港特別行政區') || !chinaLocations.some(x => x.name === '澳門特別行政區')) {
  throw new Error('中國模組缺少香港或澳門。');
}
if (chinaLocations.some(x => /臺灣|台灣/.test(String(x.name)))) throw new Error('中國模組不應重複收錄臺灣。');
if (chinaLocations.some(x => !String(x.d || '').trim())) throw new Error('中國模組存在空白 SVG path。');
if (worldContinents.length !== 7 || worldOceans.length !== 4) {
  throw new Error(`世界第一層數量異常：洲 ${worldContinents.length}、海洋 ${worldOceans.length}`);
}
if (new Set([...worldContinents, ...worldOceans].map(x => x.id)).size !== 11) throw new Error('世界第一層 ID 不是 11 個唯一值。');
if (worldContinents.some(x => !Array.isArray(x.paths) || !x.paths.length || x.paths.some(p => !String(p.d || '').trim()))) {
  throw new Error('世界洲資料存在空白 SVG path。');
}
if (worldOceans.some(x => !Array.isArray(x.zones) || !x.zones.length || x.zones.some(z => !String(z.d || '').trim()))) {
  throw new Error('世界海洋教學定位區資料不完整。');
}
for (const name of ['亞洲','歐洲','非洲','北美洲','南美洲','大洋洲','南極洲','太平洋','大西洋','印度洋','北極海']) {
  if (![...worldContinents, ...worldOceans].some(x => x.name === name)) throw new Error(`世界第一層缺少：${name}`);
}

const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const version = (await readFile(path.join(root, 'VERSION'), 'utf8')).trim();
const html = await readFile(path.join(dist, 'index.html'), 'utf8');
const app = await readFile(path.join(dist, 'js/app.js'), 'utf8');
const registry = await readFile(path.join(dist, 'js/map-registry.js'), 'utf8');
const helper = await readFile(path.join(dist, 'js/puzzle-hints.js'), 'utf8');
const info = JSON.parse(await readFile(path.join(dist, 'build-info.json'), 'utf8'));

const checks = [
  [pkg.version === '1.5.5', 'package.json 版本不是 1.5.5'],
  [pkg.dependencies?.['@svg-maps/china'] === '2.0.0', '缺少 @svg-maps/china 2.0.0 依賴'],
  [pkg.dependencies?.['@svg-maps/world'] === '2.0.0', '缺少 @svg-maps/world 2.0.0 依賴'],
  [pkg.dependencies?.['countries-list'] === '3.4.1', '缺少 countries-list 3.4.1 依賴'],
  [version === 'T map v1.05.5', 'VERSION 不一致'],
  [info.version === '1.05.5', 'build-info 版本不一致'],
  [html.includes('T map v1.05.5'), 'HTML 版本不一致'],
  [html.includes('screen-china') && html.includes('screen-world'), '缺少中國或世界模組畫面'],
  [html.includes('china-complete-dialog') && html.includes('world-complete-dialog'), '缺少中國或世界完成提示'],
  [html.includes('style.css?v=1.05.5') && html.includes('app.js?v=1.05.5'), 'HTML 靜態資源版本參數不一致'],
  [app.includes("const VERSION = '1.05.5'"), 'app.js 版本不一致'],
  [app.includes("const CHINA_URL = 'data/china-provinces.json'"), 'app.js 未使用本地中國圖資'],
  [app.includes("const WORLD_URL = 'data/world-regions.json'"), 'app.js 未使用本地世界第一層圖資'],
  [app.includes('renderChinaTargetPath') && app.includes("level === 'china-province'"), '中國拼圖互動未接入 app.js'],
  [app.includes('renderWorldMap') && app.includes("level === 'world-region'"), '世界第一層互動未接入 app.js'],
  [app.includes('showChinaComplete(false)') && app.includes('showWorldComplete(false)'), '完成提示／音效未接入最後一塊的使用者操作'],
  [app.includes('__tmapPath2D = new Path2D(location.d)'), '中國 SVG 面內命中未接入 Path2D'],
  [app.includes("renderChinaTargetPath($('#inset-hong-kong')") && app.includes("renderChinaTargetPath($('#inset-macau')"), '港澳放大框未接入'],
  [registry.includes("id: 'china-provincial'") && registry.includes("id: 'world'") && registry.match(/status: 'ready'/g)?.length >= 3, '多地圖 registry ready 狀態不一致'],
  [helper.includes('correctHintSurface'), '正確提示共用核心遺失'],
  [info.chinaProvincialCount === 33, 'build-info 中國數量不是 33'],
  [info.worldContinentCount === 7 && info.worldOceanCount === 4 && info.worldFirstLevelCount === 11, 'build-info 世界第一層數量不一致'],
  [Array.isArray(info.readyMaps) && info.readyMaps.join(',') === 'taiwan,china-provincial,world', 'build-info readyMaps 不一致']
];
for (const [ok, message] of checks) if (!ok) throw new Error(message);

console.log('✓ 部署檔案完整');
console.log('✓ 執行期無外部 CDN JS/JSON 依賴');
console.log(`✓ 臺灣行政區資料完整：${c} 縣市 / ${t} 鄉鎮市區`);
console.log('✓ 中國模組資料完整：33 塊（香港、澳門放大框資料存在；臺灣未重複）');
console.log('✓ 世界第一層資料完整：7 大洲＋3 大洋＋北極海，共 11 塊');
console.log('✓ 中國／世界完成提示、完成音效接線與 v1.05.5 build-info 一致');
