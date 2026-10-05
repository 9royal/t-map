const test = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

async function load() {
  return import(pathToFileURL(path.join(__dirname, '..', 'scripts', 'world-map.mjs')).href + `?t=${Date.now()}`);
}

function box(lon, lat, w = 8, h = 6) {
  return { type:'Polygon', coordinates:[[[lon,lat],[lon+w,lat],[lon+w,lat+h],[lon,lat+h],[lon,lat]]] };
}
function multi(...geometries) {
  return { type:'MultiPolygon', coordinates:geometries.map(g => g.coordinates) };
}
function feature(id, name, geometryOrLon, lat, w, h) {
  const geometry = typeof geometryOrLon === 'object' ? geometryOrLon : box(geometryOrLon, lat, w, h);
  return { type:'Feature', id, properties:{name}, geometry };
}
function polygonCount(geometry) {
  if (!geometry) return 0;
  return geometry.type === 'Polygon' ? 1 : geometry.type === 'MultiPolygon' ? geometry.coordinates.length : 0;
}

function fixture() {
  const france = multi(box(0,43,8,8), box(-54,2,4,5));
  const features = [
    feature('156','China',90,25,18,14),
    feature('250','France',france),
    feature('710','South Africa',18,-34,12,10),
    feature('840','United States of America',-125,28,30,18),
    feature('630','Puerto Rico',-67,17,2,2),
    feature('076','Brazil',-65,-30,22,28),
    feature('036','Australia',115,-38,30,25),
    feature('036','Australia',116,-37,28,23),
    feature('554','New Zealand',multi(box(166,-47,7,6),box(173,-41,6,7),box(167,-49,1,1),box(-176,-45,1,1))),
    feature('598','Papua New Guinea',141,-11,14,10),
    feature('090','Solomon Islands',155,-12,9,9),
    feature('548','Vanuatu',166,-21,4,8),
    feature('626','Timor-Leste',124,-10,4,3),
    feature('540','New Caledonia',163,-23,5,5),
    feature('242','Fiji',multi(box(177,-19,2,2),box(179,-17,2,2),box(-180,-18,1.2,1.2),box(178,-20,1,1),box(-179,-16,0.7,0.7))),
    feature('882','Samoa',-173,-15,2,2),
    feature('010','Antarctica',-150,-86,300,10),
    feature('702','Singapore',103,1,1,1),
    feature('643','Russia',30,50,120,20),
    feature('792','Turkey',25,35,20,8),
    feature('398','Kazakhstan',45,42,40,13),
    feature('031','Azerbaijan',44,38,7,6),
    feature('268','Georgia',40,40,7,5),
    feature('818','Egypt',25,20,13,12)
  ];
  const countries = {
    CN:{name:'China',continent:'AS'}, FR:{name:'France',continent:'EU'}, ZA:{name:'South Africa',continent:'AF'},
    US:{name:'United States',continent:'NA'}, PR:{name:'Puerto Rico',continent:'NA'}, BR:{name:'Brazil',continent:'SA'}, AU:{name:'Australia',continent:'OC'},
    NZ:{name:'New Zealand',continent:'OC'}, PG:{name:'Papua New Guinea',continent:'OC'}, SB:{name:'Solomon Islands',continent:'OC'},
    VU:{name:'Vanuatu',continent:'OC'}, TL:{name:'Timor-Leste',continent:'AS'}, NC:{name:'New Caledonia',continent:'OC'}, FJ:{name:'Fiji',continent:'OC'}, WS:{name:'Samoa',continent:'OC'},
    AQ:{name:'Antarctica',continent:'AN'}, SG:{name:'Singapore',continent:'AS'}, RU:{name:'Russia',continent:'EU'},
    TR:{name:'Turkey',continent:'AS'}, KZ:{name:'Kazakhstan',continent:'AS'}, AZ:{name:'Azerbaijan',continent:'AS'},
    GE:{name:'Georgia',continent:'AS'}, EG:{name:'Egypt',continent:'AF'}
  };
  return { features, countryModule:{countries} };
}

test('world first layer keeps Equal Earth and uses polygon zones for 3 oceans while Arctic remains unchanged', async () => {
  const mod = await load();
  const {features,countryModule} = fixture();
  const out = mod.normalizeWorldMap(features,countryModule);
  assert.equal(out.projection, 'Equal Earth');
  assert.equal(out.continents.length, 7);
  assert.equal(out.oceans.length, 4);
  const pacific = out.oceans.find(x=>x.name==='太平洋');
  const atlantic = out.oceans.find(x=>x.name==='大西洋');
  const indian = out.oceans.find(x=>x.name==='印度洋');
  const arctic = out.oceans.find(x=>x.name==='北極海');
  assert.ok(pacific.zones.length >= 4);
  assert.ok(atlantic.zones.length >= 2);
  assert.ok(indian.zones.length >= 2);
  assert.equal(Array.isArray(arctic.zones), false);
  assert.equal(arctic.circles.length, 4);
  assert.match(out.note, /不新增北極海獨立放大定位區/);
  assert.ok(out.continents.find(x=>x.code==='AN').features.some(x=>x.iso2==='AQ'));
});

test('continent country layer exposes separate Equal Earth projection profiles', async () => {
  const mod = await load();
  const {features,countryModule} = fixture();
  const out = mod.normalizeWorldCountries(features,countryModule);
  assert.equal(out.continents.find(x=>x.code==='AS').projection.centerLon, 100);
  assert.equal(out.continents.find(x=>x.code==='EU').projection.centerLon, 15);
  assert.equal(out.continents.find(x=>x.code==='NA').projection.centerLon, -100);
  assert.equal(out.continents.find(x=>x.code==='OC').projection.centerLon, 155);
  assert.ok(out.continents.every(x => x.projection.type === 'Equal Earth'));
});

test('continent profiles use extra scale boost, especially Africa and South America', async () => {
  const mod = await load();
  const {features,countryModule} = fixture();
  const out = mod.normalizeWorldCountries(features,countryModule);
  const af = out.continents.find(x=>x.code==='AF');
  const sa = out.continents.find(x=>x.code==='SA');
  assert.ok(af.projection.scaleBoost >= 1.1);
  assert.ok(sa.projection.scaleBoost >= 1.1);
  assert.ok(out.continents.filter(x=>x.code!=='AN').every(x => x.projection.scaleBoost >= 1));
});

test('Oceania puzzle is deduplicated and restricted to the requested eight playable regions', async () => {
  const mod = await load();
  const {features,countryModule} = fixture();
  const out = mod.normalizeWorldCountries(features,countryModule);
  const oc = out.continents.find(x=>x.code==='OC');
  const playable = oc.countries.filter(x=>x.playable);
  assert.deepEqual(new Set(playable.map(x=>x.iso2)), new Set(['AU','NZ','PG','SB','VU','TL','NC','FJ']));
  assert.equal(playable.length, 8);
  assert.equal(oc.countries.filter(x=>x.iso2==='AU').length, 1, 'Australia must not be duplicated');
  const excluded = oc.excludedGroups.find(x=>x.reason==='not-in-oceania-whitelist');
  assert.ok(excluded);
  assert.ok(excluded.names.some(name => /Samoa|薩摩亞/.test(name)));
});

test('New Zealand keeps only its two largest main islands and Fiji drops remote tiny components', async () => {
  const mod = await load();
  const {features,countryModule} = fixture();
  const out = mod.normalizeWorldCountries(features,countryModule);
  const oc = out.continents.find(x=>x.code==='OC');
  const nz = oc.countries.find(x=>x.iso2==='NZ');
  const fj = oc.countries.find(x=>x.iso2==='FJ');
  assert.equal(polygonCount(nz.geometry), 2);
  assert.ok(polygonCount(fj.geometry) <= 4);
  assert.equal(nz.playable, true);
  assert.equal(fj.playable, true);
});

test('Timor-Leste remains in Asia and is additionally available in the Oceania teaching puzzle', async () => {
  const mod = await load();
  const {features,countryModule} = fixture();
  const out = mod.normalizeWorldCountries(features,countryModule);
  const asia = out.continents.find(x=>x.code==='AS').countries.find(x=>x.iso2==='TL');
  const oceania = out.continents.find(x=>x.code==='OC').countries.find(x=>x.iso2==='TL');
  assert.ok(asia);
  assert.ok(oceania?.playable);
  assert.equal(oceania.transcontinental, false);
});

test('requested transcontinental countries appear in both adjacent continent puzzles', async () => {
  const mod = await load();
  const {features,countryModule} = fixture();
  const out = mod.normalizeWorldCountries(features,countryModule);
  const byCode = code => out.continents.find(x=>x.code===code).countries;
  for (const iso2 of ['RU','TR','KZ','AZ','GE']) {
    assert.ok(byCode('EU').some(x=>x.iso2===iso2), `${iso2} missing from Europe`);
    assert.ok(byCode('AS').some(x=>x.iso2===iso2), `${iso2} missing from Asia`);
  }
  assert.ok(byCode('AF').some(x=>x.iso2==='EG'));
  assert.ok(byCode('AS').some(x=>x.iso2==='EG'));
  const ruEu = byCode('EU').find(x=>x.iso2==='RU');
  const ruAs = byCode('AS').find(x=>x.iso2==='RU');
  assert.equal(ruEu.transcontinentalDisplay, 'continent-part');
  assert.equal(ruAs.transcontinentalDisplay, 'continent-part');
  assert.notDeepEqual(ruEu.geometry, ruAs.geometry);
  const geEu = byCode('EU').find(x=>x.iso2==='GE');
  assert.equal(geEu.transcontinentalDisplay, 'whole-country-in-both');
});

test('Europe removes remote overseas components from the displayed country geometry', async () => {
  const mod = await load();
  const {features,countryModule} = fixture();
  const out = mod.normalizeWorldCountries(features,countryModule);
  const france = out.continents.find(x=>x.code==='EU').countries.find(x=>x.iso2==='FR');
  assert.equal(france.playable, true);
  assert.equal(france.displayTrimmed, true);
  assert.equal(polygonCount(france.geometry), 1);
  assert.ok(out.continents.find(x=>x.code==='EU').displayTrimmedCountries.includes('法國'));
});

test('excluded countries are listed by name and reason rather than only by count', async () => {
  const mod = await load();
  const {features,countryModule} = fixture();
  const out = mod.normalizeWorldCountries(features,countryModule);
  const asia = out.continents.find(x=>x.code==='AS');
  const group = asia.excludedGroups.find(x=>x.reason==='small-on-phone-map');
  assert.ok(group);
  assert.ok(group.names.includes('新加坡'));
  assert.match(group.label, /暫不列入拼圖/);
  assert.equal(asia.countries.find(x=>x.iso2==='SG').playable, false);
});


test('overseas/dependent territories in Europe and the Americas are listed but not displayed as country targets', async () => {
  const mod = await load();
  const {features,countryModule} = fixture();
  const out = mod.normalizeWorldCountries(features,countryModule);
  const na = out.continents.find(x=>x.code==='NA');
  const pr = na.countries.find(x=>x.iso2==='PR');
  assert.ok(pr);
  assert.equal(pr.playable, false);
  assert.equal(pr.excludedReason, 'overseas-territory');
  assert.equal(pr.geometry, null);
  const group = na.excludedGroups.find(x=>x.reason==='overseas-territory');
  assert.ok(group.names.includes('波多黎各'));
});

test('world data retains Traditional Chinese and English names', async () => {
  const mod = await load();
  const {features,countryModule} = fixture();
  const out = mod.normalizeWorldCountries(features,countryModule);
  const us = out.continents.find(x=>x.code==='NA').countries.find(x=>x.iso2==='US');
  assert.equal(us.name, '美國');
  assert.equal(us.nameEn, 'United States');
});
