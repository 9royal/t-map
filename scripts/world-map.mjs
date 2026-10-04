import { ISO_NUMERIC_TO_ALPHA2, ZH_HANT_BY_ALPHA2 } from './iso3166.mjs';

export const WORLD_CONTINENTS = Object.freeze([
  Object.freeze({ code: 'AS', id: 'asia', name: '亞洲', nameEn: 'Asia', labelLonLat: [88, 42] }),
  Object.freeze({ code: 'EU', id: 'europe', name: '歐洲', nameEn: 'Europe', labelLonLat: [18, 54] }),
  Object.freeze({ code: 'AF', id: 'africa', name: '非洲', nameEn: 'Africa', labelLonLat: [20, 4] }),
  Object.freeze({ code: 'NA', id: 'north-america', name: '北美洲', nameEn: 'North America', labelLonLat: [-105, 44] }),
  Object.freeze({ code: 'SA', id: 'south-america', name: '南美洲', nameEn: 'South America', labelLonLat: [-60, -18] }),
  Object.freeze({ code: 'OC', id: 'oceania', name: '大洋洲', nameEn: 'Oceania', labelLonLat: [150, -25] }),
  Object.freeze({ code: 'AN', id: 'antarctica', name: '南極洲', nameEn: 'Antarctica', labelLonLat: [0, -80] })
]);

// Per-continent Equal Earth profiles. Rotating the projection before fitExtent keeps
// Asia/Oceania together across the antimeridian and prevents remote geometry from
// forcing the playable countries into one small corner of the viewport.
export const WORLD_CONTINENT_PROFILES = Object.freeze({
  AS: Object.freeze({ centerLon: 100, minDeltaLon: -78, maxDeltaLon: 84, minLat: -12, maxLat: 82, fitPadding: 18 }),
  EU: Object.freeze({ centerLon: 15, minDeltaLon: -40, maxDeltaLon: 48, minLat: 34, maxLat: 72, fitPadding: 18 }),
  AF: Object.freeze({ centerLon: 20, minDeltaLon: -42, maxDeltaLon: 44, minLat: -38, maxLat: 39, fitPadding: 18 }),
  NA: Object.freeze({ centerLon: -100, minDeltaLon: -78, maxDeltaLon: 82, minLat: 5, maxLat: 85, fitPadding: 18 }),
  SA: Object.freeze({ centerLon: -60, minDeltaLon: -42, maxDeltaLon: 36, minLat: -60, maxLat: 16, fitPadding: 18 }),
  OC: Object.freeze({ centerLon: 155, minDeltaLon: -58, maxDeltaLon: 82, minLat: -52, maxLat: 30, fitPadding: 18 }),
  AN: Object.freeze({ centerLon: 0, minDeltaLon: -180, maxDeltaLon: 180, minLat: -90, maxLat: -58, fitPadding: 18 })
});

// Pacific / Atlantic / Indian Ocean use coarse geographic polygons rather than a
// few isolated circles. Arctic Ocean intentionally keeps the v1.05.6 circles for
// this release; there is no separate Arctic inset in v1.05.7.
export const WORLD_OCEANS = Object.freeze([
  Object.freeze({
    id: 'pacific-ocean', name: '太平洋', nameEn: 'Pacific Ocean', labels: [[-150, 5], [165, 3]],
    zones: Object.freeze([
      Object.freeze([[-179, 57],[-147, 58],[-122, 48],[-108, 28],[-106, 8],[-116,-14],[-132,-35],[-158,-52],[-179,-48],[-179,57]]),
      Object.freeze([[179, 57],[150, 55],[132, 42],[124, 22],[130, 3],[122,-18],[137,-39],[158,-52],[179,-48],[179,57]]),
      Object.freeze([[-176, 20],[-138, 18],[-116, 2],[-122,-25],[-145,-48],[-176,-45],[-176,20]]),
      Object.freeze([[176, 20],[142, 18],[126, 0],[134,-25],[151,-48],[176,-45],[176,20]])
    ])
  }),
  Object.freeze({
    id: 'atlantic-ocean', name: '大西洋', nameEn: 'Atlantic Ocean', labels: [[-35, 18]],
    zones: Object.freeze([
      Object.freeze([[-72,61],[-35,66],[2,61],[14,43],[10,22],[-4,6],[-26,-4],[-52,2],[-70,24],[-72,61]]),
      Object.freeze([[-55,7],[-20,8],[5,-5],[15,-28],[7,-49],[-13,-58],[-40,-55],[-58,-30],[-55,7]])
    ])
  }),
  Object.freeze({
    id: 'indian-ocean', name: '印度洋', nameEn: 'Indian Ocean', labels: [[77, -18]],
    zones: Object.freeze([
      Object.freeze([[38,25],[65,25],[82,19],[101,12],[118,-5],[116,-27],[103,-45],[77,-57],[48,-52],[29,-33],[27,-9],[38,25]]),
      Object.freeze([[58,10],[91,11],[111,-2],[108,-28],[91,-44],[65,-44],[47,-26],[47,-4],[58,10]])
    ])
  }),
  Object.freeze({
    id: 'arctic-ocean', name: '北極海', nameEn: 'Arctic Ocean', labels: [[0, 82]],
    circles: Object.freeze([
      Object.freeze({ center: [0, 86], radius: 11 }), Object.freeze({ center: [-90, 82], radius: 12 }),
      Object.freeze({ center: [95, 82], radius: 12 }), Object.freeze({ center: [165, 82], radius: 10 })
    ])
  })
]);

export const SMALL_COUNTRY_EXCLUDE_ISO2 = Object.freeze(new Set([
  'AD','AG','BH','BB','BN','CV','KM','DM','GD','KI','LI','MV','MT','MH','MU','FM','MC','NR','PW','KN','LC','VC','SM','ST','SC','SG','TO','TV','VA'
]));

// Overseas/dependent territories in Europe and the Americas are intentionally not
// part of the sovereign-country puzzle in v1.05.7. Their names are still listed in
// the explanatory note instead of disappearing silently.
export const DEPENDENT_TERRITORY_EXCLUDE_BY_CONTINENT = Object.freeze({
  EU: Object.freeze(new Set(['AX','FO','GI','GG','IM','JE','SJ'])),
  NA: Object.freeze(new Set(['AI','AW','BL','BM','BQ','CW','GL','GP','KY','MF','MQ','MS','PM','PR','SX','TC','VG','VI'])),
  SA: Object.freeze(new Set(['FK','GF','GS']))
});

// Countries requested to appear in both adjacent continent puzzles.
export const TRANS_CONTINENT_ISO2 = Object.freeze({
  RU: Object.freeze(['EU','AS']),
  TR: Object.freeze(['EU','AS']),
  KZ: Object.freeze(['EU','AS']),
  AZ: Object.freeze(['EU','AS']),
  GE: Object.freeze(['EU','AS']),
  EG: Object.freeze(['AF','AS'])
});

// Clear geographic split rules used only for the continent puzzle display. Georgia
// and Azerbaijan intentionally remain whole in both Europe and Asia because the
// Europe/Asia boundary through the Caucasus varies by convention.
const TRANS_CONTINENT_SPLITS = Object.freeze({
  RU: Object.freeze({ EU: Object.freeze({ maxLon: 60 }), AS: Object.freeze({ minLon: 60 }) }),
  TR: Object.freeze({ EU: Object.freeze({ maxLon: 29.35 }), AS: Object.freeze({ minLon: 29.35 }) }),
  KZ: Object.freeze({ EU: Object.freeze({ maxLon: 53.5 }), AS: Object.freeze({ minLon: 53.5 }) }),
  EG: Object.freeze({ AF: Object.freeze({ maxLon: 32.35 }), AS: Object.freeze({ minLon: 32.35 }) })
});

// For Europe we intentionally keep the main European territory only so remote
// components do not compress the continent puzzle. These are display rules, not
// sovereignty statements. Independent island countries such as Iceland remain.
const MAIN_TERRITORY_ZONES = Object.freeze({
  EU: Object.freeze({
    FR: Object.freeze([Object.freeze({ minLon: -6.5, maxLon: 10.5, minLat: 41, maxLat: 52.5 })]),
    ES: Object.freeze([Object.freeze({ minLon: -10.5, maxLon: 5.5, minLat: 35, maxLat: 44.5 })]),
    PT: Object.freeze([Object.freeze({ minLon: -10.5, maxLon: -5.5, minLat: 36, maxLat: 43 })]),
    NL: Object.freeze([Object.freeze({ minLon: 3, maxLon: 8, minLat: 50, maxLat: 54 })]),
    GB: Object.freeze([Object.freeze({ minLon: -9.5, maxLon: 3, minLat: 49, maxLat: 61.5 })]),
    DK: Object.freeze([Object.freeze({ minLon: 7, maxLon: 15.5, minLat: 54, maxLat: 58.5 })])
  }),
  NA: Object.freeze({
    US: Object.freeze([
      Object.freeze({ minLon: -130, maxLon: -60, minLat: 23, maxLat: 51 }),
      Object.freeze({ minLon: -180, maxLon: -129, minLat: 50, maxLat: 72 }),
      Object.freeze({ minLon: -162, maxLon: -154, minLat: 18, maxLat: 23 })
    ])
  }),
  SA: Object.freeze({
    CL: Object.freeze([Object.freeze({ minLon: -76.5, maxLon: -65, minLat: -57, maxLat: -16 })]),
    EC: Object.freeze([Object.freeze({ minLon: -82.5, maxLon: -74, minLat: -6, maxLat: 2.5 })])
  })
});

const MANUAL_CONTINENT_BY_NAME = Object.freeze({
  'kosovo': 'EU',
  'somaliland': 'AF',
  'northern cyprus': 'AS',
  'antarctica': 'AN'
});

const MANUAL_CONTINENT_BY_ISO2 = Object.freeze({
  RU: 'AS', TR: 'AS', KZ: 'AS', EG: 'AF', GE: 'AS', AM: 'AS', AZ: 'AS', CY: 'AS'
});

const NAME_ZH_OVERRIDES = Object.freeze({ XK: '科索沃' });

const EXCLUDED_REASON_LABELS = Object.freeze({
  'small-on-phone-map': '國土／畫面比例過小，暫不列入拼圖',
  'overseas-territory': '海外／附屬領地，本版暫不列入國家拼圖',
  'no-iso-code': '特殊／爭議圖資沒有可用 ISO 代碼，暫不列入拼圖',
  'no-geometry-in-continent': '洲別切分後沒有可用拼圖輪廓，暫不列入拼圖',
  'no-sovereign-country-puzzle': '本層沒有主權國家拼圖',
  'unclassified': '洲別資料未能分類，暫不列入拼圖'
});

function moduleValue(mod, key) { return mod?.[key] ?? mod?.default?.[key]; }
function normalizeName(value) { return String(value || '').trim().toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' '); }
function normalizeNumericId(value) { const text = String(value ?? '').trim(); return /^\d+$/.test(text) ? text.padStart(3, '0') : ''; }
function cloneGeometry(geometry) { return geometry ? JSON.parse(JSON.stringify(geometry)) : null; }

function iso2FromFeature(feature) {
  const numeric = normalizeNumericId(feature?.id);
  if (numeric && ISO_NUMERIC_TO_ALPHA2[numeric]) return ISO_NUMERIC_TO_ALPHA2[numeric];
  const name = normalizeName(feature?.properties?.name);
  if (name === 'kosovo') return 'XK';
  return '';
}

function countryInfo(countryModule, iso2) {
  const countries = moduleValue(countryModule, 'countries') || {};
  return countries?.[iso2] || null;
}

function primaryContinentCodeForFeature(feature, countryModule) {
  const iso2 = iso2FromFeature(feature);
  if (MANUAL_CONTINENT_BY_ISO2[iso2]) return MANUAL_CONTINENT_BY_ISO2[iso2];
  const fromCountry = iso2 ? countryInfo(countryModule, iso2)?.continent : null;
  if (WORLD_CONTINENTS.some(item => item.code === fromCountry)) return fromCountry;
  return MANUAL_CONTINENT_BY_NAME[normalizeName(feature?.properties?.name)] || null;
}

function continentCodesForFeature(feature, countryModule) {
  const iso2 = iso2FromFeature(feature);
  if (TRANS_CONTINENT_ISO2[iso2]) return TRANS_CONTINENT_ISO2[iso2].slice();
  const primary = primaryContinentCodeForFeature(feature, countryModule);
  return primary ? [primary] : [];
}

function namesForFeature(feature, countryModule) {
  const iso2 = iso2FromFeature(feature);
  const info = iso2 ? countryInfo(countryModule, iso2) : null;
  const nameEn = String(info?.name || feature?.properties?.name || iso2 || 'Unknown').trim();
  const nameZh = String(NAME_ZH_OVERRIDES[iso2] || ZH_HANT_BY_ALPHA2[iso2] || nameEn).trim();
  return { iso2, nameEn, nameZh };
}

function wrapDeltaLon(lon, centerLon) {
  let value = Number(lon) - Number(centerLon);
  while (value <= -180) value += 360;
  while (value > 180) value -= 360;
  return value;
}

function unwrapDeltaLon(delta, centerLon) {
  let value = Number(delta) + Number(centerLon);
  while (value <= -180) value += 360;
  while (value > 180) value -= 360;
  return value;
}

function pointInZone(lon, lat, zone) {
  return lon >= zone.minLon && lon <= zone.maxLon && lat >= zone.minLat && lat <= zone.maxLat;
}

function polygonRepresentativePoint(poly) {
  const ring = poly?.[0] || [];
  if (!ring.length) return null;
  let x = 0, y = 0, n = 0;
  ring.forEach(point => {
    if (!Array.isArray(point) || point.length < 2) return;
    x += Number(point[0]); y += Number(point[1]); n += 1;
  });
  return n ? [x / n, y / n] : null;
}

function geometryPolygons(geometry) {
  if (!geometry) return [];
  if (geometry.type === 'Polygon') return [geometry.coordinates || []];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates || [];
  return [];
}

function geometryFromPolygons(polygons) {
  const valid = (polygons || []).filter(poly => Array.isArray(poly) && Array.isArray(poly[0]) && poly[0].length >= 4);
  if (!valid.length) return null;
  return valid.length === 1 ? { type: 'Polygon', coordinates: valid[0] } : { type: 'MultiPolygon', coordinates: valid };
}

function filterGeometryComponents(geometry, zones) {
  if (!geometry || !Array.isArray(zones) || !zones.length) return cloneGeometry(geometry);
  const kept = geometryPolygons(geometry).filter(poly => {
    const point = polygonRepresentativePoint(poly);
    return !!point && zones.some(zone => pointInZone(point[0], point[1], zone));
  });
  return geometryFromPolygons(kept);
}

function closeRing(ring) {
  if (!Array.isArray(ring) || ring.length < 3) return [];
  const out = ring.map(point => [Number(point[0]), Number(point[1])]);
  const first = out[0], last = out[out.length - 1];
  if (!last || first[0] !== last[0] || first[1] !== last[1]) out.push(first.slice());
  return out;
}

function clipRingEdge(ring, inside, intersect) {
  if (!ring.length) return [];
  const input = ring.slice(0, -1);
  if (!input.length) return [];
  const out = [];
  let a = input[input.length - 1];
  let aInside = inside(a);
  input.forEach(b => {
    const bInside = inside(b);
    if (bInside) {
      if (!aInside) out.push(intersect(a, b));
      out.push(b);
    } else if (aInside) {
      out.push(intersect(a, b));
    }
    a = b; aInside = bInside;
  });
  return closeRing(out);
}

function interpolateAtX(a, b, x) {
  const dx = b[0] - a[0];
  const t = Math.abs(dx) < 1e-12 ? 0 : (x - a[0]) / dx;
  return [x, a[1] + (b[1] - a[1]) * t];
}
function interpolateAtY(a, b, y) {
  const dy = b[1] - a[1];
  const t = Math.abs(dy) < 1e-12 ? 0 : (y - a[1]) / dy;
  return [a[0] + (b[0] - a[0]) * t, y];
}

function clipShiftedRing(ring, bounds) {
  let out = closeRing(ring);
  out = clipRingEdge(out, p => p[0] >= bounds.minX, (a,b) => interpolateAtX(a,b,bounds.minX));
  out = clipRingEdge(out, p => p[0] <= bounds.maxX, (a,b) => interpolateAtX(a,b,bounds.maxX));
  out = clipRingEdge(out, p => p[1] >= bounds.minY, (a,b) => interpolateAtY(a,b,bounds.minY));
  out = clipRingEdge(out, p => p[1] <= bounds.maxY, (a,b) => interpolateAtY(a,b,bounds.maxY));
  return out;
}

function clipGeometryToContinent(geometry, continentCode, splitRule = null) {
  const profile = WORLD_CONTINENT_PROFILES[continentCode];
  if (!geometry || !profile) return null;
  let minX = profile.minDeltaLon, maxX = profile.maxDeltaLon;
  if (splitRule?.minLon != null) minX = Math.max(minX, wrapDeltaLon(splitRule.minLon, profile.centerLon));
  if (splitRule?.maxLon != null) maxX = Math.min(maxX, wrapDeltaLon(splitRule.maxLon, profile.centerLon));
  const bounds = { minX, maxX, minY: profile.minLat, maxY: profile.maxLat };
  const polygons = geometryPolygons(geometry).map(poly => {
    const clippedRings = (poly || []).map(ring => {
      const shifted = (ring || []).map(point => [wrapDeltaLon(point[0], profile.centerLon), Number(point[1])]);
      const clipped = clipShiftedRing(shifted, bounds);
      return clipped.map(point => [unwrapDeltaLon(point[0], profile.centerLon), point[1]]);
    }).filter(ring => ring.length >= 4);
    return clippedRings;
  }).filter(poly => poly[0]?.length >= 4);
  return geometryFromPolygons(polygons);
}

function geometryCoordinateCount(geometry) {
  const polygons = geometryPolygons(geometry);
  return polygons.reduce((sum, poly) => sum + poly.reduce((s, ring) => s + (ring?.length || 0), 0), 0);
}

function geometryForContinent(baseGeometry, iso2, continentCode) {
  let geometry = cloneGeometry(baseGeometry);
  const zones = MAIN_TERRITORY_ZONES?.[continentCode]?.[iso2];
  if (zones) geometry = filterGeometryComponents(geometry, zones);
  const splitRule = TRANS_CONTINENT_SPLITS?.[iso2]?.[continentCode] || null;
  return clipGeometryToContinent(geometry, continentCode, splitRule);
}

function countryRecordForContinent(feature, countryModule, continentCode, allContinentCodes) {
  const { iso2, nameEn, nameZh } = namesForFeature(feature, countryModule);
  const isAntarctica = iso2 === 'AQ' || normalizeName(feature?.properties?.name) === 'antarctica';
  const dependentTerritory = !!iso2 && !!DEPENDENT_TERRITORY_EXCLUDE_BY_CONTINENT?.[continentCode]?.has(iso2);
  const geometry = dependentTerritory ? null : geometryForContinent(feature?.geometry, iso2, continentCode);
  const hasGeometry = !!geometry;
  const small = !!iso2 && SMALL_COUNTRY_EXCLUDE_ISO2.has(iso2);
  const playable = !isAntarctica && !dependentTerritory && !!iso2 && hasGeometry && !small;
  const originalCount = geometryCoordinateCount(feature?.geometry);
  const displayCount = geometryCoordinateCount(geometry);
  const trimmed = hasGeometry && originalCount > 0 && displayCount < originalCount * 0.97;
  const transcontinental = allContinentCodes.length > 1;
  const splitRule = TRANS_CONTINENT_SPLITS?.[iso2]?.[continentCode] || null;
  return {
    id: `${String(feature?.id ?? (iso2 || nameEn))}-${continentCode}`,
    sourceId: String(feature?.id ?? (iso2 || nameEn)),
    iso2,
    name: nameZh,
    nameEn,
    continent: continentCode,
    continents: allContinentCodes.slice(),
    transcontinental,
    transcontinentalDisplay: transcontinental ? (splitRule ? 'continent-part' : 'whole-country-in-both') : null,
    playable,
    excludedReason: isAntarctica ? 'no-sovereign-country-puzzle' : dependentTerritory ? 'overseas-territory' : !iso2 ? 'no-iso-code' : !hasGeometry ? 'no-geometry-in-continent' : small ? 'small-on-phone-map' : null,
    displayTrimmed: trimmed,
    geometry
  };
}

function firstLevelFeatureRecord(feature, countryModule) {
  const { iso2, nameEn, nameZh } = namesForFeature(feature, countryModule);
  const continent = primaryContinentCodeForFeature(feature, countryModule);
  return {
    id: String(feature?.id ?? (iso2 || nameEn)), iso2, name: nameZh, nameEn, continent,
    geometry: cloneGeometry(feature?.geometry)
  };
}

function buildExcludedGroups(countries) {
  const byReason = new Map();
  countries.filter(country => !country.playable && country.excludedReason).forEach(country => {
    if (!byReason.has(country.excludedReason)) byReason.set(country.excludedReason, []);
    byReason.get(country.excludedReason).push(country.name);
  });
  return Array.from(byReason, ([reason, names]) => ({
    reason,
    label: EXCLUDED_REASON_LABELS[reason] || reason,
    names: Array.from(new Set(names)).sort((a,b) => a.localeCompare(b, 'zh-Hant'))
  }));
}

export function normalizeWorldMap(features, countryModule) {
  if (!Array.isArray(features) || !features.length) throw new Error('世界國家 GeoJSON 格式異常。');
  const grouped = new Map(WORLD_CONTINENTS.map(item => [item.code, []]));
  const unclassified = [];
  for (const feature of features) {
    if (!feature?.geometry) continue;
    const record = firstLevelFeatureRecord(feature, countryModule);
    if (!record.continent || !grouped.has(record.continent)) {
      unclassified.push({ id: record.id, name: record.nameEn, iso2: record.iso2 });
      continue;
    }
    grouped.get(record.continent).push({ id: record.id, iso2: record.iso2, name: record.name, nameEn: record.nameEn, geometry: record.geometry });
  }

  const continents = WORLD_CONTINENTS.map(item => ({
    id: item.id, code: item.code, name: item.name, nameEn: item.nameEn, kind: 'continent',
    labelLonLat: item.labelLonLat, features: grouped.get(item.code)
  }));
  const empty = continents.filter(item => !item.features.length);
  if (empty.length) throw new Error(`世界洲資料缺少：${empty.map(x => x.name).join('、')}`);
  const antarctica = continents.find(item => item.code === 'AN');
  if (!antarctica?.features?.some(feature => feature.iso2 === 'AQ' || normalizeName(feature.nameEn) === 'antarctica')) {
    throw new Error('Equal Earth 世界圖缺少南極大陸。');
  }

  const oceans = WORLD_OCEANS.map(item => ({
    id: item.id, name: item.name, nameEn: item.nameEn, kind: 'ocean', labelLonLat: item.labels,
    ...(item.zones ? { zones: item.zones } : {}), ...(item.circles ? { circles: item.circles } : {})
  }));

  return {
    id: 'world', label: '七大洲＋三大洋＋北極海', projection: 'Equal Earth', viewBox: '0 0 1000 600',
    source: {
      package: 'world-atlas', version: '2.0.2', upstream: 'Natural Earth 4.1.0', license: 'ISC',
      continentMetadata: 'countries-list 3.4.1 (MIT)'
    },
    note: '世界主圖使用 Equal Earth 等積投影。太平洋、大西洋與印度洋使用多邊形教學感應區並套用陸地遮罩；北極海暫沿用 v1.05.6 主圖感應方式。本版不新增北極海獨立放大定位區。',
    continents, oceans, unclassified
  };
}

export function normalizeWorldCountries(features, countryModule) {
  if (!Array.isArray(features) || !features.length) throw new Error('世界國家 GeoJSON 格式異常。');
  const grouped = new Map(WORLD_CONTINENTS.map(item => [item.code, []]));
  const unclassified = [];

  features.forEach(feature => {
    if (!feature?.geometry) return;
    const codes = continentCodesForFeature(feature, countryModule);
    const { iso2, nameEn } = namesForFeature(feature, countryModule);
    if (!codes.length) {
      unclassified.push({ id: String(feature?.id ?? nameEn), name: nameEn, iso2 });
      return;
    }
    codes.forEach(code => {
      if (!grouped.has(code)) return;
      grouped.get(code).push(countryRecordForContinent(feature, countryModule, code, codes));
    });
  });

  // Some microstates can disappear entirely from the Natural Earth resolution used
  // by world-atlas. They still need to be named explicitly in the teaching note,
  // rather than being silently omitted.
  SMALL_COUNTRY_EXCLUDE_ISO2.forEach(iso2 => {
    const info = countryInfo(countryModule, iso2);
    const code = info?.continent;
    if (!code || !grouped.has(code)) return;
    if (grouped.get(code).some(country => country.iso2 === iso2)) return;
    grouped.get(code).push({
      id: `omitted-${iso2}-${code}`,
      sourceId: `omitted-${iso2}`,
      iso2,
      name: ZH_HANT_BY_ALPHA2[iso2] || info?.name || iso2,
      nameEn: info?.name || iso2,
      continent: code,
      continents: [code],
      transcontinental: false,
      transcontinentalDisplay: null,
      playable: false,
      excludedReason: 'small-on-phone-map',
      displayTrimmed: false,
      geometry: null
    });
  });

  const continents = WORLD_CONTINENTS.map(item => {
    const countries = grouped.get(item.code).sort((a,b) => a.name.localeCompare(b.name, 'zh-Hant'));
    if (item.code === 'AN') {
      countries.forEach(country => { country.playable = false; country.excludedReason = 'no-sovereign-country-puzzle'; });
    }
    const profile = WORLD_CONTINENT_PROFILES[item.code];
    const playableCount = countries.filter(country => country.playable).length;
    const excludedGroups = buildExcludedGroups(countries);
    const displayTrimmedCountries = Array.from(new Set(countries.filter(country => country.displayTrimmed && !country.transcontinental).map(country => country.name))).sort((a,b) => a.localeCompare(b,'zh-Hant'));
    const transcontinentalCountries = Array.from(new Set(countries.filter(country => country.transcontinental).map(country => country.name))).sort((a,b) => a.localeCompare(b,'zh-Hant'));
    return {
      id: item.id, code: item.code, name: item.name, nameEn: item.nameEn,
      projection: { type: 'Equal Earth', centerLon: profile.centerLon, fitPadding: profile.fitPadding },
      countries,
      playableCount,
      excludedCount: countries.filter(country => !country.playable).length,
      excludedGroups,
      displayTrimmedCountries,
      transcontinentalCountries
    };
  });

  return {
    id: 'world-countries', projection: 'Equal Earth', viewBox: '0 0 1000 680',
    source: {
      package: 'world-atlas', version: '2.0.2', upstream: 'Natural Earth 4.1.0', license: 'ISC',
      names: 'ISO 3166-1 / CLDR Traditional Chinese snapshot generated for T map',
      continentMetadata: 'countries-list 3.4.1 (MIT)'
    },
    smallCountryPolicy: '手機洲別地圖上過小的國家先不列入拼圖；每一洲都會完整列出被排除國名與原因。',
    territoryDisplayPolicy: '洲別國家拼圖以本洲主要領土為主；歐洲與美洲遠離本洲、會壓縮主圖的海外領地／遠距離附屬部分暫不顯示。',
    transcontinentalPolicy: '俄羅斯、土耳其、哈薩克、亞塞拜然、喬治亞、埃及會在相鄰兩洲皆出現；邊界明確者顯示洲內部分，高加索邊界具多種慣例的喬治亞與亞塞拜然在兩洲皆保留完整國形。',
    continents,
    unclassified
  };
}
