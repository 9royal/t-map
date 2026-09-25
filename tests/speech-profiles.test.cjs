const test = require('node:test');
const assert = require('node:assert/strict');
const speech = require('../js/speech-profiles.js');

test('Taiwan map language modes are Mandarin and Taiwanese', () => {
  assert.deepEqual([...speech.TAIWAN_MODES], ['mandarin', 'taiwanese']);
});

test('Mandarin profile finds zh-TW voice', () => {
  const voice = speech.findVoice([{ name: 'Mei-Jia', lang: 'zh-TW' }], 'mandarin');
  assert.equal(voice?.name, 'Mei-Jia');
});

test('Taiwanese profile accepts nan-TW and Hokkien voice names', () => {
  assert.equal(speech.voiceMatches({ name: 'Taiwanese', lang: 'nan-TW' }, 'taiwanese'), true);
  assert.equal(speech.voiceMatches({ name: 'Hokkien Taiwan', lang: 'nan' }, 'taiwanese'), true);
  assert.equal(speech.voiceMatches({ name: 'Mandarin Taiwan', lang: 'zh-TW' }, 'taiwanese'), false);
});

test('English profile is available for future world-map modules', () => {
  assert.equal(speech.getProfile('english').lang, 'en');
  assert.equal(speech.voiceMatches({ name: 'Samantha', lang: 'en-US' }, 'english'), true);
});
