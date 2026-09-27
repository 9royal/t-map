const test = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

async function load() {
  return import(pathToFileURL(path.join(__dirname, '..', 'scripts', 'world-map.mjs')).href);
}

function fixture() {
  const locations = [
    ['cn','China','M700 220h30v25h-30z'],
    ['fr','France','M500 200h18v18h-18z'],
    ['za','South Africa','M520 500h24v18h-24z'],
    ['us','United States','M170 240h80v35h-80z'],
    ['br','Brazil','M300 430h55v70h-55z'],
    ['au','Australia','M790 500h60v45h-60z'],
    ['aq','Antarctica','M180 620h650v25h-650z']
  ].map(([id,name,path]) => ({id,name,path}));
  const countries = {
    CN:{name:'China',continent:'AS'}, FR:{name:'France',continent:'EU'}, ZA:{name:'South Africa',continent:'AF'},
    US:{name:'United States',continent:'NA'}, BR:{name:'Brazil',continent:'SA'}, AU:{name:'Australia',continent:'OC'},
    AQ:{name:'Antarctica',continent:'AN'}
  };
  const codeByName = Object.fromEntries(Object.entries(countries).map(([code,info]) => [info.name, code]));
  return {
    source:{viewBox:'0 0 1010 666', locations},
    countryModule:{countries, getCountryCode:name => codeByName[name] || null}
  };
}

test('world normalizer builds seven continent groups and four ocean teaching zones', async () => {
  const mod = await load();
  const {source,countryModule} = fixture();
  const out = mod.normalizeWorldMap(source,countryModule);
  assert.equal(out.continents.length, 7);
  assert.equal(out.oceans.length, 4);
  assert.equal(out.continents.reduce((n,x)=>n+x.paths.length,0), 7);
  assert.deepEqual(out.continents.map(x=>x.name), ['亞洲','歐洲','非洲','北美洲','南美洲','大洋洲','南極洲']);
  assert.deepEqual(out.oceans.map(x=>x.name), ['太平洋','大西洋','印度洋','北極海']);
  assert.ok(out.oceans.every(x => x.zones.length && x.zones.every(z => z.d.includes('M'))));
});

test('world normalizer retains multilingual names and source metadata', async () => {
  const mod = await load();
  const {source,countryModule} = fixture();
  const out = mod.normalizeWorldMap(source,countryModule);
  assert.equal(out.continents.find(x=>x.name==='亞洲').nameEn, 'Asia');
  assert.equal(out.oceans.find(x=>x.name==='太平洋').nameEn, 'Pacific Ocean');
  assert.equal(out.source.package, '@svg-maps/world');
  assert.match(out.note, /教學定位區/);
});
