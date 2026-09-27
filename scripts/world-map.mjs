export const WORLD_CONTINENTS = Object.freeze([
  Object.freeze({ code: 'AS', id: 'asia', name: '亞洲', nameEn: 'Asia', label: [0.70, 0.30] }),
  Object.freeze({ code: 'EU', id: 'europe', name: '歐洲', nameEn: 'Europe', label: [0.50, 0.25] }),
  Object.freeze({ code: 'AF', id: 'africa', name: '非洲', nameEn: 'Africa', label: [0.52, 0.49] }),
  Object.freeze({ code: 'NA', id: 'north-america', name: '北美洲', nameEn: 'North America', label: [0.22, 0.30] }),
  Object.freeze({ code: 'SA', id: 'south-america', name: '南美洲', nameEn: 'South America', label: [0.31, 0.62] }),
  Object.freeze({ code: 'OC', id: 'oceania', name: '大洋洲', nameEn: 'Oceania', label: [0.82, 0.65] }),
  Object.freeze({ code: 'AN', id: 'antarctica', name: '南極洲', nameEn: 'Antarctica', label: [0.50, 0.91] })
]);

export const WORLD_OCEANS = Object.freeze([
  Object.freeze({ id: 'pacific-ocean', name: '太平洋', nameEn: 'Pacific Ocean', zones: [[0.02,0.35,0.10,0.25],[0.88,0.35,0.10,0.25]], labels: [[0.07,0.48],[0.93,0.48]] }),
  Object.freeze({ id: 'atlantic-ocean', name: '大西洋', nameEn: 'Atlantic Ocean', zones: [[0.40,0.38,0.08,0.22]], labels: [[0.44,0.49]] }),
  Object.freeze({ id: 'indian-ocean', name: '印度洋', nameEn: 'Indian Ocean', zones: [[0.61,0.54,0.10,0.18]], labels: [[0.66,0.63]] }),
  Object.freeze({ id: 'arctic-ocean', name: '北極海', nameEn: 'Arctic Ocean', zones: [[0.42,0.03,0.16,0.08]], labels: [[0.50,0.07]] })
]);

const MANUAL_CONTINENT_BY_NAME = Object.freeze({
  'kosovo': 'EU',
  'palestinian territories': 'AS',
  'palestine': 'AS',
  'taiwan': 'AS',
  'vatican city': 'EU',
  'holy see': 'EU',
  'french southern and antarctic lands': 'AN',
  'french southern territories': 'AN',
  'antarctica': 'AN'
});

function normalizeName(value) {
  return String(value || '').trim().toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ');
}

function parseViewBox(value) {
  const parts = String(value || '').trim().split(/[\s,]+/).map(Number);
  if (parts.length !== 4 || parts.some(v => !Number.isFinite(v)) || parts[2] <= 0 || parts[3] <= 0) {
    return [0, 0, 1010, 666];
  }
  return parts;
}

function rectPath(x, y, width, height, radius = 0) {
  if (!radius) return `M${x} ${y}H${x + width}V${y + height}H${x}Z`;
  const r = Math.min(radius, width / 2, height / 2);
  return `M${x + r} ${y}H${x + width - r}Q${x + width} ${y} ${x + width} ${y + r}V${y + height - r}Q${x + width} ${y + height} ${x + width - r} ${y + height}H${x + r}Q${x} ${y + height} ${x} ${y + height - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`;
}

function moduleValue(mod, key) {
  return mod?.[key] ?? mod?.default?.[key];
}

function resolveCountryCode(location, countryModule) {
  const countries = moduleValue(countryModule, 'countries') || {};
  const rawId = String(location?.id || '').trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(rawId) && countries[rawId]) return rawId;
  const getCountryCode = moduleValue(countryModule, 'getCountryCode');
  if (typeof getCountryCode === 'function') {
    try {
      const code = getCountryCode(String(location?.name || ''));
      if (code && countries[code]) return code;
    } catch (_) {}
  }
  const wanted = normalizeName(location?.name);
  for (const [code, info] of Object.entries(countries)) {
    if (normalizeName(info?.name) === wanted || normalizeName(info?.native) === wanted) return code;
  }
  return null;
}

function resolveContinentCode(location, countryModule) {
  const countries = moduleValue(countryModule, 'countries') || {};
  const code = resolveCountryCode(location, countryModule);
  const fromCountry = code ? countries[code]?.continent : null;
  if (WORLD_CONTINENTS.some(item => item.code === fromCountry)) return fromCountry;
  return MANUAL_CONTINENT_BY_NAME[normalizeName(location?.name)] || null;
}

function absolutePoint(pair, viewBox) {
  const [x0, y0, width, height] = viewBox;
  return [x0 + pair[0] * width, y0 + pair[1] * height];
}

export function normalizeWorldMap(source, countryModule) {
  const map = source?.default || source;
  if (!map || !Array.isArray(map.locations)) throw new Error('@svg-maps/world 格式異常：缺少 locations。');
  const viewBox = parseViewBox(map.viewBox);
  const grouped = new Map(WORLD_CONTINENTS.map(item => [item.code, []]));
  const unclassified = [];

  for (const location of map.locations) {
    if (!String(location?.path || '').trim()) continue;
    const continentCode = resolveContinentCode(location, countryModule);
    if (!continentCode || !grouped.has(continentCode)) {
      unclassified.push({ id: String(location?.id || ''), name: String(location?.name || '') });
      continue;
    }
    grouped.get(continentCode).push({
      sourceId: String(location.id || ''),
      nameEn: String(location.name || ''),
      d: String(location.path)
    });
  }

  const continents = WORLD_CONTINENTS.map(item => ({
    id: item.id,
    code: item.code,
    name: item.name,
    nameEn: item.nameEn,
    kind: 'continent',
    labelPoints: [absolutePoint(item.label, viewBox)],
    paths: grouped.get(item.code)
  }));
  const empty = continents.filter(item => !item.paths.length);
  if (empty.length) throw new Error(`世界洲資料缺少：${empty.map(x => x.name).join('、')}`);

  const [x0, y0, width, height] = viewBox;
  const oceans = WORLD_OCEANS.map(item => ({
    id: item.id,
    name: item.name,
    nameEn: item.nameEn,
    kind: 'ocean',
    labelPoints: item.labels.map(pair => absolutePoint(pair, viewBox)),
    zones: item.zones.map(([rx, ry, rw, rh], index) => {
      const x = x0 + rx * width;
      const y = y0 + ry * height;
      const w = rw * width;
      const h = rh * height;
      return { id: `${item.id}-${index + 1}`, d: rectPath(x, y, w, h, Math.min(width, height) * 0.012) };
    })
  }));

  return {
    id: 'world',
    label: '七大洲＋三大洋＋北極海',
    viewBox: String(map.viewBox || viewBox.join(' ')),
    source: {
      package: '@svg-maps/world',
      version: '2.0.0',
      license: 'CC-BY-4.0',
      original: 'MapSVG',
      continentMetadata: 'countries-list 3.4.1 (MIT)'
    },
    note: '三大洋與北極海使用教學定位區，不代表精確海域或海洋邊界。跨洲國家依 countries-list 的單一洲別分類呈現。',
    continents,
    oceans,
    unclassified
  };
}
