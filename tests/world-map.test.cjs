const test = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

async function load() {
  return import(pathToFileURL(path.join(__dirname, '..', 'scripts', 'world-map.mjs')).href);
}

function box(lon, lat, w = 8, h = 6) {
  return { type:'Polygon', coordinates:[[[lon,lat],[lon+w,lat],[lon+w,lat+h],[lon,lat+h],[lon,lat]]] };
}

function feature(id, name, lon, lat, w, h) {
  return { type:'Feature', id, properties:{name}, geometry:box(lon,lat,w,h) };
}

function fixture() {
  const features = [
    feature('156','China',90,25,18,14),
    feature('250','France',0,43,8,8),
    feature('710','South Africa',18,-34,12,10),
    feature('840','United States of America',-125,28,30,18),
    feature('076','Brazil',-65,-30,22,28),
    feature('036','Australia',115,-38,30,25),
    feature('010','Antarctica',-150,-86,300,10),
    feature('702','Singapore',103,1,1,1)
  ];
  const countries = {
    CN:{name:'China',continent:'AS'}, FR:{name:'France',continent:'EU'}, ZA:{name:'South Africa',continent:'AF'},
    US:{name:'United States',continent:'NA'}, BR:{name:'Brazil',continent:'SA'}, AU:{name:'Australia',continent:'OC'},
    AQ:{name:'Antarctica',continent:'AN'}, SG:{name:'Singapore',continent:'AS'}
  };
  return { features, countryModule:{countries} };
}

test('world normalizer builds Equal Earth-ready seven continents and four broad ocean targets', async () => {
  const mod = await load();
  const {features,countryModule} = fixture();
  const out = mod.normalizeWorldMap(features,countryModule);
  assert.equal(out.projection, 'Equal Earth');
  assert.equal(out.continents.length, 7);
  assert.equal(out.oceans.length, 4);
  assert.deepEqual(out.continents.map(x=>x.name), ['亞洲','歐洲','非洲','北美洲','南美洲','大洋洲','南極洲']);
  assert.deepEqual(out.oceans.map(x=>x.name), ['太平洋','大西洋','印度洋','北極海']);
  assert.ok(out.oceans.every(x => x.circles.length >= 3));
  assert.ok(out.continents.find(x=>x.code==='AN').features.some(x=>x.iso2==='AQ'));
});

test('world country layer groups countries by continent and excludes tiny countries initially', async () => {
  const mod = await load();
  const {features,countryModule} = fixture();
  const out = mod.normalizeWorldCountries(features,countryModule);
  const asia = out.continents.find(x=>x.code==='AS');
  const antarctica = out.continents.find(x=>x.code==='AN');
  assert.equal(out.projection, 'Equal Earth');
  assert.equal(asia.countries.find(x=>x.iso2==='CN').playable, true);
  assert.equal(asia.countries.find(x=>x.iso2==='SG').playable, false);
  assert.equal(asia.countries.find(x=>x.iso2==='SG').excludedReason, 'small-on-phone-map');
  assert.equal(antarctica.playableCount, 0);
  assert.ok(antarctica.countries.every(x=>x.playable===false));
});

test('world data retains Traditional Chinese and English names', async () => {
  const mod = await load();
  const {features,countryModule} = fixture();
  const out = mod.normalizeWorldCountries(features,countryModule);
  const us = out.continents.find(x=>x.code==='NA').countries.find(x=>x.iso2==='US');
  assert.equal(us.name, '美國');
  assert.equal(us.nameEn, 'United States');
});
