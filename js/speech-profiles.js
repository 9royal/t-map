(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.TMapSpeech = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const PROFILES = Object.freeze({
    mandarin: Object.freeze({
      key: 'mandarin',
      label: '國語',
      lang: 'zh-TW',
      voicePattern: /(?:^zh[-_]TW\b|Taiwan.*Mandarin|Mandarin.*Taiwan|國語|中文.*臺灣|中文.*台灣)/i
    }),
    taiwanese: Object.freeze({
      key: 'taiwanese',
      label: '台語',
      lang: 'nan-TW',
      voicePattern: /(?:^nan(?:[-_]|$)|zh[-_]min[-_]nan|Taiwanese|Hokkien|Min[ -]?Nan|Minnan|臺語|台語|閩南)/i
    }),
    english: Object.freeze({
      key: 'english',
      label: 'English',
      lang: 'en',
      voicePattern: /^en(?:[-_]|$)/i
    })
  });

  const TAIWAN_MODES = Object.freeze(['mandarin', 'taiwanese']);

  function normalizeMode(mode, allowed = TAIWAN_MODES) {
    return allowed.includes(mode) ? mode : allowed[0];
  }

  function getProfile(mode) {
    return PROFILES[mode] || PROFILES.mandarin;
  }

  function voiceText(voice) {
    return `${voice?.lang || ''} ${voice?.name || ''}`.trim();
  }

  function voiceMatches(voice, mode) {
    const profile = getProfile(mode);
    return profile.voicePattern.test(voiceText(voice));
  }

  function findVoice(voices, mode) {
    const list = Array.isArray(voices) ? voices : Array.from(voices || []);
    return list.find(voice => voiceMatches(voice, mode)) || null;
  }

  function nextMode(mode, allowed = TAIWAN_MODES) {
    const current = normalizeMode(mode, allowed);
    const index = allowed.indexOf(current);
    return allowed[(index + 1) % allowed.length];
  }

  return { PROFILES, TAIWAN_MODES, normalizeMode, getProfile, voiceMatches, findVoice, nextMode };
});
