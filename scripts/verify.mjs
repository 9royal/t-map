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
  'data/counties-10t.json', 'data/towns-10t.json', 'data/china-provinces.json', 'data/world-regions.json', 'data/world-countries.json',
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
const worldCountries = JSON.parse(await readFile(path.join(dist, 'data/world-countries.json'), 'utf8'));
const c = counties?.objects?.counties?.geometries?.length ?? 0;
const t = towns?.objects?.towns?.geometries?.length ?? 0;
const chinaLocations = Array.isArray(china?.locations) ? china.locations : [];
const worldContinents = Array.isArray(world?.continents) ? world.continents : [];
const worldOceans = Array.isArray(world?.oceans) ? world.oceans : [];
const worldCountryContinents = Array.isArray(worldCountries?.continents) ? worldCountries.continents : [];
const playableCountryCount = worldCountryContinents.reduce((sum, continent) => sum + (continent.playableCount || 0), 0);

if (c !== 22 || t !== 368) throw new Error(`臺灣圖資數量異常：縣市 ${c}、鄉鎮市區 ${t}`);
if (chinaLocations.length !== 33) throw new Error(`中國模組圖資數量異常：${chinaLocations.length}`);
if (new Set(chinaLocations.map(x => x.id)).size !== 33) throw new Error('中國模組 ID 不是 33 個唯一值。');
if (!chinaLocations.some(x => x.name === '香港特別行政區') || !chinaLocations.some(x => x.name === '澳門特別行政區')) throw new Error('中國模組缺少香港或澳門。');
if (chinaLocations.some(x => /臺灣|台灣/.test(String(x.name)))) throw new Error('中國模組不應重複收錄臺灣。');
if (chinaLocations.some(x => !String(x.d || '').trim())) throw new Error('中國模組存在空白 SVG path。');

if (world.projection !== 'Equal Earth') throw new Error(`世界第一層投影不是 Equal Earth：${world.projection}`);
if (worldContinents.length !== 7 || worldOceans.length !== 4) throw new Error(`世界第一層數量異常：洲 ${worldContinents.length}、海洋 ${worldOceans.length}`);
if (new Set([...worldContinents, ...worldOceans].map(x => x.id)).size !== 11) throw new Error('世界第一層 ID 不是 11 個唯一值。');
if (worldContinents.some(x => !Array.isArray(x.features) || !x.features.length || x.features.some(f => !f.geometry))) throw new Error('世界洲資料存在缺少 GeoJSON geometry 的區域。');
const arcticOcean = worldOceans.find(x => x.id === 'arctic-ocean');
const nonArcticOceans = worldOceans.filter(x => x.id !== 'arctic-ocean');
if (nonArcticOceans.some(x => !Array.isArray(x.zones) || !x.zones.length || x.zones.some(ring => !Array.isArray(ring) || ring.length < 4))) throw new Error('太平洋／大西洋／印度洋多邊形感應資料不完整。');
if (!arcticOcean || !Array.isArray(arcticOcean.circles) || arcticOcean.circles.length < 3 || arcticOcean.circles.some(z => !Array.isArray(z.center) || !Number.isFinite(z.radius))) throw new Error('北極海應維持 v1.05.6 主圖感應資料。');
if (Array.isArray(arcticOcean.zones) && arcticOcean.zones.length) throw new Error('v1.05.8 不應新增北極海獨立多邊形／放大定位區。');
for (const name of ['亞洲','歐洲','非洲','北美洲','南美洲','大洋洲','南極洲','太平洋','大西洋','印度洋','北極海']) {
  if (![...worldContinents, ...worldOceans].some(x => x.name === name)) throw new Error(`世界第一層缺少：${name}`);
}
const antarctica = worldContinents.find(x => x.code === 'AN');
if (!antarctica?.features?.some(f => f.iso2 === 'AQ' || /Antarctica/i.test(String(f.nameEn)))) throw new Error('Equal Earth 世界地圖缺少南極大陸。');

if (worldCountries.projection !== 'Equal Earth') throw new Error('世界國家拼圖未使用 Equal Earth metadata。');
if (worldCountryContinents.length !== 7) throw new Error(`世界國家洲別數量不是 7：${worldCountryContinents.length}`);
if (playableCountryCount < 120) throw new Error(`世界國家可玩數量過低：${playableCountryCount}`);
const antarcticaCountries = worldCountryContinents.find(x => x.code === 'AN');
if (!antarcticaCountries || antarcticaCountries.playableCount !== 0) throw new Error('南極洲不應建立主權國家拼圖。');
if (!worldCountryContinents.some(x => x.countries?.some(country => country.playable === false && country.excludedReason === 'small-on-phone-map'))) throw new Error('世界國家圖資未保留小國排除策略。');
if (worldCountryContinents.some(x => !Number.isFinite(x.projection?.centerLon))) throw new Error('世界洲別拼圖缺少個別 Equal Earth 中央經線設定。');
if (worldCountryContinents.some(x => x.excludedCount && (!Array.isArray(x.excludedGroups) || !x.excludedGroups.some(g => Array.isArray(g.names) && g.names.length)))) throw new Error('世界洲別拼圖未完整列出暫不出題國名。');
const transcontinentalPairs = [
  ['RU','EU','AS'], ['TR','EU','AS'], ['KZ','EU','AS'], ['AZ','EU','AS'], ['GE','EU','AS'], ['EG','AF','AS']
];
for (const [iso2,a,b] of transcontinentalPairs) {
  if (!worldCountryContinents.find(x=>x.code===a)?.countries?.some(c=>c.iso2===iso2) || !worldCountryContinents.find(x=>x.code===b)?.countries?.some(c=>c.iso2===iso2)) {
    throw new Error(`跨洲國家 ${iso2} 未同時出現在 ${a}/${b}`);
  }
}

const oceania = worldCountryContinents.find(x => x.code === 'OC');
const expectedOceania = ['AU','FJ','NC','NZ','PG','SB','VU'];
const actualOceania = (oceania?.countries || []).filter(c => c.playable).map(c => c.iso2).sort();
if (!oceania || actualOceania.join(',') !== expectedOceania.join(',')) {
  throw new Error(`大洋洲可玩白名單不一致：${actualOceania.join(',')}`);
}
if ((oceania.countries || []).filter(c => c.iso2 === 'AU').length !== 1) throw new Error('大洋洲澳洲拼圖重複。');
const nz = oceania.countries.find(c => c.iso2 === 'NZ');
const nzPolygons = nz?.geometry?.type === 'Polygon' ? 1 : nz?.geometry?.type === 'MultiPolygon' ? nz.geometry.coordinates.length : 0;
if (nzPolygons !== 2) throw new Error(`紐西蘭應只保留南北兩大島，實際 polygon 數：${nzPolygons}`);
if (!worldCountryContinents.find(x=>x.code==='AS')?.countries?.some(c=>c.iso2==='TL' && c.playable && c.geometry && !c.transcontinental)) throw new Error('東帝汶應保留亞洲可玩關卡。');
if (worldCountryContinents.some(x=>x.code!=='AS' && x.countries?.some(c=>c.iso2==='TL'))) throw new Error('東帝汶不應出現在亞洲以外的國家關卡。');
if (!worldContinents.find(x=>x.code==='AS')?.features?.some(f=>f.iso2==='TL') || worldContinents.some(x=>x.code!=='AS' && x.features?.some(f=>f.iso2==='TL'))) throw new Error('世界第一層東帝汶應僅屬亞洲。');

const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const version = (await readFile(path.join(root, 'VERSION'), 'utf8')).trim();
const html = await readFile(path.join(dist, 'index.html'), 'utf8');
const app = await readFile(path.join(dist, 'js/app.js'), 'utf8');
const registry = await readFile(path.join(dist, 'js/map-registry.js'), 'utf8');
const helper = await readFile(path.join(dist, 'js/puzzle-hints.js'), 'utf8');
const style = await readFile(path.join(dist, 'css/style.css'), 'utf8');
const info = JSON.parse(await readFile(path.join(dist, 'build-info.json'), 'utf8'));

const checks = [
  [pkg.version === '1.5.8', 'package.json 版本不是 1.5.8'],
  [pkg.dependencies?.['@svg-maps/china'] === '2.0.0', '缺少 @svg-maps/china 2.0.0 依賴'],
  [pkg.dependencies?.['world-atlas'] === '2.0.2', '缺少 world-atlas 2.0.2 依賴'],
  [pkg.dependencies?.['countries-list'] === '3.4.1', '缺少 countries-list 3.4.1 依賴'],
  [version === 'T map v1.05.8', 'VERSION 不一致'],
  [info.version === '1.05.8', 'build-info 版本不一致'],
  [info.worldProjection === 'Equal Earth', 'build-info 世界投影不是 Equal Earth'],
  [html.includes('T map v1.05.8'), 'HTML 版本不一致'],
  [html.includes('screen-china') && html.includes('screen-world') && html.includes('screen-world-continents') && html.includes('screen-world-country'), '缺少中國或世界第二層畫面'],
  [html.includes('china-complete-dialog') && html.includes('world-complete-dialog') && html.includes('world-country-complete-dialog'), '缺少完成提示'],
  [html.includes('style.css?v=1.05.8') && html.includes('app.js?v=1.05.8'), 'HTML 靜態資源版本參數不一致'],
  [app.includes("const VERSION = '1.05.8'"), 'app.js 版本不一致'],
  [app.includes("const WORLD_URL = 'data/world-regions.json'") && app.includes("const WORLD_COUNTRIES_URL = 'data/world-countries.json'"), 'app.js 未使用本地世界圖資'],
  [app.includes('d3.geoEqualEarth()') && app.includes('d3.geoGraticule10()'), 'Equal Earth 世界投影未接入 app.js'],
  [app.includes('Array.isArray(ocean?.zones)') && app.includes('oceanPolygonFeature(ring, ocean.id)') && app.includes('d3.geoArea(feature) > Math.PI * 2') && app.includes('d3.geoCircle().center(circle.center).radius(circle.radius)'), '海洋多邊形／環繞方向／北極海 fallback 感應未接入 app.js'],
  [app.includes("item.kind === 'ocean'") && app.includes('new Path2D(d)') && app.includes('pointInsideWorldLand'), '海洋 Path2D／陸地遮罩未接入 app.js'],
  [app.includes("level === 'world-country'") && app.includes('renderWorldCountryMap'), '世界國家拼圖未接入共用互動引擎'],
  [app.includes('createContinentEqualEarthProjection') && app.includes('createRotatedEqualEarthProjection') && app.includes('projection.scale(projection.scale() * boost)'), '洲別 Equal Earth 中央經線／再放大投影未接入'],
  [app.includes('continent.excludedGroups') && app.includes('displayTrimmedCountries') && app.includes('transcontinentalCountries'), '完整排除名單／海外領地／跨洲說明未接入 UI'],
  [app.includes('showChinaComplete(false)') && app.includes('showWorldComplete(false)') && app.includes('showWorldCountryComplete(continent)'), '完成提示／音效未完整接入'],
  [registry.includes("id: 'world'") && registry.includes("id: 'countries'") && registry.includes("status: 'ready'"), '多地圖 registry 世界第二層狀態不一致'],
  [helper.includes('correctHintSurface'), '正確提示共用核心遺失'],
  [info.chinaProvincialCount === 33, 'build-info 中國數量不是 33'],
  [info.worldContinentCount === 7 && info.worldOceanCount === 4 && info.worldFirstLevelCount === 11, 'build-info 世界第一層數量不一致'],
  [info.worldPlayableCountryCount === playableCountryCount, 'build-info 世界國家可玩數量不一致'],
  [info.continentProjectionProfiles === true, 'build-info 未標記洲別投影設定'],
  [info.continentScaleBoosts === true, 'build-info 未標記洲別再放大設定'],
  [Array.isArray(info.oceaniaPlayableIso2) && info.oceaniaPlayableIso2.slice().sort().join(',') === expectedOceania.join(','), 'build-info 大洋洲 7 區白名單不一致'],
  [info.worldLabelHighContrast === true && style.includes('--world-label-fill') && style.includes('--world-label-halo'), '世界地圖高對比國名樣式未接入'],
  [info.oceanWindingNormalized === true && app.includes('d3.geoArea(feature) > Math.PI * 2'), '海洋多邊形環繞方向修正未接入'],
  [info.arcticInset === false, 'v1.05.8 不應啟用北極海獨立放大框'],
  [Array.isArray(info.readyMaps) && info.readyMaps.join(',') === 'taiwan,china-provincial,world', 'build-info readyMaps 不一致']
];
for (const [ok, message] of checks) if (!ok) throw new Error(message);

console.log('✓ 部署檔案完整');
console.log('✓ 執行期無外部 CDN JS/JSON 依賴');
console.log(`✓ 臺灣行政區資料完整：${c} 縣市 / ${t} 鄉鎮市區`);
console.log('✓ 中國模組資料完整：33 塊（香港、澳門存在；臺灣未重複）');
console.log('✓ 世界第一層：Equal Earth 等積投影、南極大陸、7 大洲＋3 大洋＋北極海');
console.log(`✓ 世界第二層：七大洲國家分組，可玩國家 ${playableCountryCount}，小國保留但暫不出題`);
console.log('✓ v1.05.8 修正版：東帝汶僅屬亞洲；大洋洲 7 區白名單、國名對比、洲別放大與海洋高亮一致');
