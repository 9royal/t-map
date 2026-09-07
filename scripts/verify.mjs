import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const dist = path.join(root, 'dist');

if (!existsSync(dist)) throw new Error('找不到 dist/；請先執行 npm run build。');

const expected = [
  'index.html', 'css/style.css', 'js/app.js',
  'lib/d3.min.js', 'lib/topojson-client.min.js',
  'data/counties-10t.json', 'data/towns-10t.json',
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
const c = counties?.objects?.counties?.geometries?.length ?? 0;
const t = towns?.objects?.towns?.geometries?.length ?? 0;
if (c !== 22 || t !== 368) throw new Error(`圖資數量異常：縣市 ${c}、鄉鎮市區 ${t}`);

console.log('✓ 部署檔案完整');
console.log('✓ 執行期無外部 CDN JS/JSON 依賴');
console.log(`✓ 行政區資料完整：${c} 縣市 / ${t} 鄉鎮市區`);
