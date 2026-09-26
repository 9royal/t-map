export const CHINA_REGIONS = Object.freeze([
  ['anhui', ['Anhui'], '安徽省', '安徽', 'province'],
  ['beijing', ['Beijing'], '北京市', '北京', 'municipality'],
  ['chongqing', ['Chongqing'], '重慶市', '重慶', 'municipality'],
  ['fujian', ['Fujian'], '福建省', '福建', 'province'],
  ['gansu', ['Gansu'], '甘肅省', '甘肅', 'province'],
  ['guangdong', ['Guangdong'], '廣東省', '廣東', 'province'],
  ['guangxi-zhuang', ['Guangxi Zhuang', 'Guangxi'], '廣西壯族自治區', '廣西', 'autonomous-region'],
  ['guizhou', ['Guizhou'], '貴州省', '貴州', 'province'],
  ['hainan', ['Hainan'], '海南省', '海南', 'province'],
  ['hebei', ['Hebei'], '河北省', '河北', 'province'],
  ['heilongjiang', ['Heilongjiang'], '黑龍江省', '黑龍江', 'province'],
  ['henan', ['Henan'], '河南省', '河南', 'province'],
  ['hong-kong', ['Hong Kong'], '香港特別行政區', '香港', 'sar'],
  ['hubei', ['Hubei'], '湖北省', '湖北', 'province'],
  ['hunan', ['Hunan'], '湖南省', '湖南', 'province'],
  ['jiangsu', ['Jiangsu'], '江蘇省', '江蘇', 'province'],
  ['jiangxi', ['Jiangxi'], '江西省', '江西', 'province'],
  ['jilin', ['Jilin'], '吉林省', '吉林', 'province'],
  ['liaoning', ['Liaoning'], '遼寧省', '遼寧', 'province'],
  ['macau', ['Macau', 'Macao'], '澳門特別行政區', '澳門', 'sar'],
  ['nei-mongol', ['Nei Mongol', 'Inner Mongolia'], '內蒙古自治區', '內蒙古', 'autonomous-region'],
  ['ningxia-hui', ['Ningxia Hui', 'Ningxia'], '寧夏回族自治區', '寧夏', 'autonomous-region'],
  ['qinghai', ['Quinghai', 'Qinghai'], '青海省', '青海', 'province'],
  ['shaanxi', ['Shaanxi'], '陝西省', '陝西', 'province'],
  ['shandong', ['Shandong'], '山東省', '山東', 'province'],
  ['shanghai', ['Shanghai'], '上海市', '上海', 'municipality'],
  ['shanxi', ['Shanxi'], '山西省', '山西', 'province'],
  ['sichuan', ['Sichuan'], '四川省', '四川', 'province'],
  ['tianjin', ['Tianjin'], '天津市', '天津', 'municipality'],
  ['xinjiang-uygur', ['Xinjiang Uygur', 'Xinjiang'], '新疆維吾爾自治區', '新疆', 'autonomous-region'],
  ['xizang', ['Xizang (Tibet)', 'Xizang', 'Tibet'], '西藏自治區', '西藏', 'autonomous-region'],
  ['yunnan', ['Yunnan'], '雲南省', '雲南', 'province'],
  ['zhejiang', ['Zhejiang'], '浙江省', '浙江', 'province']
].map(([id, aliases, name, shortName, kind]) => Object.freeze({ id, aliases: Object.freeze(aliases), name, shortName, kind })));

function normalizeText(value) {
  return String(value ?? '').trim().toLowerCase().replace(/[_.]+/g, '-').replace(/\s+/g, ' ');
}

function matchesLocation(region, location) {
  const name = normalizeText(location?.name);
  const id = normalizeText(location?.id).replace(/\s+/g, '-');
  if (id === region.id) return true;
  return region.aliases.some(alias => normalizeText(alias) === name || normalizeText(alias).replace(/\s+/g, '-') === id);
}

export function normalizeChinaMap(source) {
  const map = source?.default || source;
  if (!map || !Array.isArray(map.locations)) throw new Error('@svg-maps/china 格式異常：缺少 locations。');
  const locations = CHINA_REGIONS.map(region => {
    const location = map.locations.find(item => matchesLocation(region, item));
    if (!location?.path) throw new Error(`@svg-maps/china 缺少區域：${region.name} (${region.id})`);
    return {
      id: region.id,
      sourceId: String(location.id || region.id),
      name: region.name,
      shortName: region.shortName,
      nameEn: String(location.name || region.aliases[0]),
      kind: region.kind,
      d: String(location.path)
    };
  });

  if (locations.length !== 33 || new Set(locations.map(item => item.id)).size !== 33) {
    throw new Error(`中國省級行政區資料數量異常：${locations.length}`);
  }

  return {
    id: 'china-provincial',
    label: '中國大陸省級行政區＋香港、澳門',
    viewBox: String(map.viewBox || '0 0 1000 1000'),
    source: {
      package: '@svg-maps/china',
      version: '2.0.0',
      license: 'CC-BY-4.0',
      original: 'MapSVG'
    },
    locations
  };
}
