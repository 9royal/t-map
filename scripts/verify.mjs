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
  'data/counties-10t.json', 'data/towns-10t.json', 'data/china-provinces.json',
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
const c = counties?.objects?.counties?.geometries?.length ?? 0;
const t = towns?.objects?.towns?.geometries?.length ?? 0;
const chinaLocations = Array.isArray(china?.locations) ? china.locations : [];
if (c !== 22 || t !== 368) throw new Error(`臺灣圖資數量異常：縣市 ${c}、鄉鎮市區 ${t}`);
if (chinaLocations.length !== 33) throw new Error(`中國模組圖資數量異常：${chinaLocations.length}`);
if (new Set(chinaLocations.map(x => x.id)).size !== 33) throw new Error('中國模組 ID 不是 33 個唯一值。');
if (!chinaLocations.some(x => x.name === '香港特別行政區') || !chinaLocations.some(x => x.name === '澳門特別行政區')) {
  throw new Error('中國模組缺少香港或澳門。');
}
if (chinaLocations.some(x => /臺灣|台灣/.test(String(x.name)))) throw new Error('中國模組不應重複收錄臺灣。');
if (chinaLocations.some(x => !String(x.d || '').trim())) throw new Error('中國模組存在空白 SVG path。');

const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const version = (await readFile(path.join(root, 'VERSION'), 'utf8')).trim();
const html = await readFile(path.join(dist, 'index.html'), 'utf8');
const app = await readFile(path.join(dist, 'js/app.js'), 'utf8');
const registry = await readFile(path.join(dist, 'js/map-registry.js'), 'utf8');
const helper = await readFile(path.join(dist, 'js/puzzle-hints.js'), 'utf8');
const info = JSON.parse(await readFile(path.join(dist, 'build-info.json'), 'utf8'));

const checks = [
  [pkg.version === '1.5.4', 'package.json 版本不是 1.5.4'],
  [pkg.dependencies?.['@svg-maps/china'] === '2.0.0', '缺少 @svg-maps/china 2.0.0 依賴'],
  [version === 'T map v1.05.4', 'VERSION 不一致'],
  [info.version === '1.05.4', 'build-info 版本不一致'],
  [html.includes('T map v1.05.4'), 'HTML 版本不一致'],
  [html.includes('screen-china'), '缺少中國模組畫面'],
  [html.includes('style.css?v=1.05.4') && html.includes('app.js?v=1.05.4'), 'HTML 靜態資源版本參數不一致'],
  [app.includes("const VERSION = '1.05.4'"), 'app.js 版本不一致'],
  [app.includes("const CHINA_URL = 'data/china-provinces.json'"), 'app.js 未使用本地中國圖資'],
  [app.includes('renderChinaTargetPath') && app.includes("level === 'china-province'"), '中國拼圖互動未接入 app.js'],
  [app.includes('__tmapPath2D = new Path2D(location.d)'), '中國 SVG 面內命中未接入 Path2D'],
  [app.includes("renderChinaTargetPath($('#inset-hong-kong')") && app.includes("renderChinaTargetPath($('#inset-macau')"), '港澳放大框未接入'],
  [registry.includes("id: 'china-provincial'") && registry.includes("status: 'ready'"), '中國模組 registry 未設為 ready'],
  [helper.includes('correctHintSurface'), '正確提示共用核心遺失'],
  [info.chinaProvincialCount === 33, 'build-info 中國數量不是 33'],
  [Array.isArray(info.readyMaps) && info.readyMaps.join(',') === 'taiwan,china-provincial', 'build-info readyMaps 不一致']
];
for (const [ok, message] of checks) if (!ok) throw new Error(message);

console.log('✓ 部署檔案完整');
console.log('✓ 執行期無外部 CDN JS/JSON 依賴');
console.log(`✓ 臺灣行政區資料完整：${c} 縣市 / ${t} 鄉鎮市區`);
console.log('✓ 中國模組資料完整：33 塊（香港、澳門放大框資料存在；臺灣未重複）');
console.log('✓ v1.05.4 版本、多地圖 registry 與 build-info 一致');
