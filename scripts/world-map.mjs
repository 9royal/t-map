import { ISO_NUMERIC_TO_ALPHA2, ZH_HANT_BY_ALPHA2 } from './iso3166.mjs';

export const WORLD_CONTINENTS = Object.freeze([
  Object.freeze({ code: 'AS', id: 'asia', name: '亞洲', nameEn: 'Asia', labelLonLat: [88, 42] }),
  Object.freeze({ code: 'EU', id: 'europe', name: '歐洲', nameEn: 'Europe', labelLonLat: [18, 54] }),
  Object.freeze({ code: 'AF', id: 'africa', name: '非洲', nameEn: 'Africa', labelLonLat: [20, 4] }),
  Object.freeze({ code: 'NA', id: 'north-america', name: '北美洲', nameEn: 'North America', labelLonLat: [-105, 44] }),
  Object.freeze({ code: 'SA', id: 'south-america', name: '南美洲', nameEn: 'South America', labelLonLat: [-60, -18] }),
  Object.freeze({ code: 'OC', id: 'oceania', name: '大洋洲', nameEn: 'Oceania', labelLonLat: [145, -27] }),
  Object.freeze({ code: 'AN', id: 'antarctica', name: '南極洲', nameEn: 'Antarctica', labelLonLat: [0, -80] })
]);

// Multiple broad, open-water hit zones are used for each ocean. They deliberately
// cover several parts of the same basin instead of one small rectangle. The zones
// are teaching targets, not legal or hydrographic boundaries.
export const WORLD_OCEANS = Object.freeze([
  Object.freeze({
    id: 'pacific-ocean', name: '太平洋', nameEn: 'Pacific Ocean',
    labels: [[-150, 5], [165, 3]],
    circles: [
      { center: [-150, 35], radius: 25 }, { center: [-155, -10], radius: 29 },
      { center: [-115, -34], radius: 19 }, { center: [164, 35], radius: 22 },
      { center: [165, -12], radius: 27 }, { center: [145, -38], radius: 15 }
    ]
  }),
  Object.freeze({
    id: 'atlantic-ocean', name: '大西洋', nameEn: 'Atlantic Ocean',
    labels: [[-35, 18]],
    circles: [
      { center: [-38, 42], radius: 18 }, { center: [-32, 10], radius: 20 },
      { center: [-27, -25], radius: 21 }, { center: [-18, -43], radius: 13 }
    ]
  }),
  Object.freeze({
    id: 'indian-ocean', name: '印度洋', nameEn: 'Indian Ocean',
    labels: [[77, -18]],
    circles: [
      { center: [72, 5], radius: 16 }, { center: [74, -23], radius: 22 },
      { center: [103, -24], radius: 15 }, { center: [52, -38], radius: 12 }
    ]
  }),
  Object.freeze({
    id: 'arctic-ocean', name: '北極海', nameEn: 'Arctic Ocean',
    labels: [[0, 82]],
    circles: [
      { center: [0, 86], radius: 11 }, { center: [-90, 82], radius: 12 },
      { center: [95, 82], radius: 12 }, { center: [165, 82], radius: 10 }
    ]
  })
]);

// Tiny states/island states that are not comfortable to target on a phone-sized
// continent map are retained in the data but excluded from the first country-puzzle release.
export const SMALL_COUNTRY_EXCLUDE_ISO2 = Object.freeze(new Set([
  'AD','AG','BH','BB','BN','CV','KM','DM','GD','KI','LI','MV','MT','MH','MU','FM','MC','NR','PW','KN','LC','VC','SM','ST','SC','SG','TO','TV','VA'
]));

const MANUAL_CONTINENT_BY_NAME = Object.freeze({
  'kosovo': 'EU',
  'somaliland': 'AF',
  'northern cyprus': 'AS',
  'antarctica': 'AN'
});

const MANUAL_CONTINENT_BY_ISO2 = Object.freeze({
  RU: 'AS', TR: 'AS', KZ: 'AS', EG: 'AF', GE: 'AS', AM: 'AS', AZ: 'AS', CY: 'AS'
});

const NAME_ZH_OVERRIDES = Object.freeze({
  XK: '科索沃'
});

function moduleValue(mod, key) {
  return mod?.[key] ?? mod?.default?.[key];
}

function normalizeName(value) {
  return String(value || '').trim().toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ');
}

function normalizeNumericId(value) {
  const text = String(value ?? '').trim();
  return /^\d+$/.test(text) ? text.padStart(3, '0') : '';
}

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

function continentCodeForFeature(feature, countryModule) {
  const iso2 = iso2FromFeature(feature);
  if (MANUAL_CONTINENT_BY_ISO2[iso2]) return MANUAL_CONTINENT_BY_ISO2[iso2];
  const fromCountry = iso2 ? countryInfo(countryModule, iso2)?.continent : null;
  if (WORLD_CONTINENTS.some(item => item.code === fromCountry)) return fromCountry;
  return MANUAL_CONTINENT_BY_NAME[normalizeName(feature?.properties?.name)] || null;
}

function namesForFeature(feature, countryModule) {
  const iso2 = iso2FromFeature(feature);
  const info = iso2 ? countryInfo(countryModule, iso2) : null;
  const nameEn = String(info?.name || feature?.properties?.name || iso2 || 'Unknown').trim();
  const nameZh = String(NAME_ZH_OVERRIDES[iso2] || ZH_HANT_BY_ALPHA2[iso2] || nameEn).trim();
  return { iso2, nameEn, nameZh };
}

function cloneGeometry(geometry) {
  return geometry ? JSON.parse(JSON.stringify(geometry)) : null;
}

function featureRecord(feature, countryModule) {
  const { iso2, nameEn, nameZh } = namesForFeature(feature, countryModule);
  const continent = continentCodeForFeature(feature, countryModule);
  const isAntarctica = iso2 === 'AQ' || normalizeName(feature?.properties?.name) === 'antarctica';
  const playable = !!continent && !isAntarctica && !!iso2 && !SMALL_COUNTRY_EXCLUDE_ISO2.has(iso2);
  return {
    id: String(feature?.id ?? (iso2 || nameEn)),
    iso2,
    name: nameZh,
    nameEn,
    continent,
    playable,
    excludedReason: !continent ? 'unclassified' : isAntarctica ? 'no-sovereign-country-puzzle' : !iso2 ? 'no-iso-code' : SMALL_COUNTRY_EXCLUDE_ISO2.has(iso2) ? 'small-on-phone-map' : null,
    geometry: cloneGeometry(feature?.geometry)
  };
}

export function normalizeWorldMap(features, countryModule) {
  if (!Array.isArray(features) || !features.length) throw new Error('世界國家 GeoJSON 格式異常。');
  const grouped = new Map(WORLD_CONTINENTS.map(item => [item.code, []]));
  const unclassified = [];
  for (const feature of features) {
    if (!feature?.geometry) continue;
    const record = featureRecord(feature, countryModule);
    if (!record.continent || !grouped.has(record.continent)) {
      unclassified.push({ id: record.id, name: record.nameEn, iso2: record.iso2 });
      continue;
    }
    grouped.get(record.continent).push({ id: record.id, iso2: record.iso2, name: record.name, nameEn: record.nameEn, geometry: record.geometry });
  }

  const continents = WORLD_CONTINENTS.map(item => ({
    id: item.id,
    code: item.code,
    name: item.name,
    nameEn: item.nameEn,
    kind: 'continent',
    labelLonLat: item.labelLonLat,
    features: grouped.get(item.code)
  }));
  const empty = continents.filter(item => !item.features.length);
  if (empty.length) throw new Error(`世界洲資料缺少：${empty.map(x => x.name).join('、')}`);
  const antarctica = continents.find(item => item.code === 'AN');
  if (!antarctica?.features?.some(feature => feature.iso2 === 'AQ' || normalizeName(feature.nameEn) === 'antarctica')) {
    throw new Error('Equal Earth 世界圖缺少南極大陸。');
  }

  const oceans = WORLD_OCEANS.map(item => ({
    id: item.id,
    name: item.name,
    nameEn: item.nameEn,
    kind: 'ocean',
    labelLonLat: item.labels,
    circles: item.circles
  }));

  return {
    id: 'world',
    label: '七大洲＋三大洋＋北極海',
    projection: 'Equal Earth',
    viewBox: '0 0 1000 600',
    source: {
      package: 'world-atlas',
      version: '2.0.2',
      upstream: 'Natural Earth 4.1.0',
      license: 'ISC',
      continentMetadata: 'countries-list 3.4.1 (MIT)'
    },
    note: '世界主圖使用 Equal Earth 等積投影。三大洋與北極海使用多個開放水域教學感應區，盡量覆蓋主要海盆，但不代表精確海洋或法律邊界。',
    continents,
    oceans,
    unclassified
  };
}

export function normalizeWorldCountries(features, countryModule) {
  if (!Array.isArray(features) || !features.length) throw new Error('世界國家 GeoJSON 格式異常。');
  const grouped = new Map(WORLD_CONTINENTS.map(item => [item.code, []]));
  const unclassified = [];
  features.forEach(feature => {
    if (!feature?.geometry) return;
    const record = featureRecord(feature, countryModule);
    if (!record.continent || !grouped.has(record.continent)) {
      unclassified.push({ id: record.id, name: record.nameEn, iso2: record.iso2 });
      return;
    }
    grouped.get(record.continent).push(record);
  });

  const continents = WORLD_CONTINENTS.map(item => {
    const countries = grouped.get(item.code).sort((a,b) => a.name.localeCompare(b.name, 'zh-Hant'));
    return {
      id: item.id,
      code: item.code,
      name: item.name,
      nameEn: item.nameEn,
      countries,
      playableCount: countries.filter(country => country.playable).length,
      excludedCount: countries.filter(country => !country.playable).length
    };
  });
  const antarctica = continents.find(item => item.code === 'AN');
  if (antarctica) {
    antarctica.countries.forEach(country => {
      country.playable = false;
      country.excludedReason = 'no-sovereign-country-puzzle';
    });
    antarctica.playableCount = 0;
    antarctica.excludedCount = antarctica.countries.length;
  }

  return {
    id: 'world-countries',
    projection: 'Equal Earth',
    viewBox: '0 0 1000 680',
    source: {
      package: 'world-atlas', version: '2.0.2', upstream: 'Natural Earth 4.1.0', license: 'ISC',
      names: 'ISO 3166-1 / CLDR Traditional Chinese snapshot generated for T map',
      continentMetadata: 'countries-list 3.4.1 (MIT)'
    },
    smallCountryPolicy: '第一版先排除手機洲別地圖上過小的國家；資料仍保留，可在後續加入放大框。',
    continents,
    unclassified
  };
}
