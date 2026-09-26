(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.TMapRegistry = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const MAPS = Object.freeze([
    Object.freeze({
      id: 'taiwan',
      status: 'ready',
      mark: 'TW',
      title: '臺灣行政區',
      subtitle: '22 縣市 → 鄉鎮市區',
      description: '先完成臺灣 22 縣市，再進入各縣市探索鄉、鎮、市、區。',
      speechModes: Object.freeze(['mandarin', 'taiwanese']),
      levels: Object.freeze([
        Object.freeze({ id: 'counties', title: '22 縣市', type: 'polygon-puzzle', pieceCount: 22 }),
        Object.freeze({ id: 'towns', title: '鄉鎮市區', type: 'polygon-puzzle', parent: 'counties', pieceCount: 368 })
      ])
    }),
    Object.freeze({
      id: 'china-provincial',
      status: 'ready',
      mark: 'CN',
      title: '中國大陸省級行政區＋香港、澳門',
      subtitle: '33 塊',
      description: '中國大陸省級行政區加上香港、澳門，共 33 塊；臺灣維持在獨立模組，不在此關重複出題。',
      speechModes: Object.freeze(['mandarin']),
      levels: Object.freeze([
        Object.freeze({ id: 'provincial', title: '省級行政區＋港澳', type: 'svg-path-puzzle', pieceCount: 33 })
      ])
    }),
    Object.freeze({
      id: 'world',
      status: 'planned',
      mark: '🌍',
      title: '世界地圖',
      subtitle: '7 大洲＋4 海洋 → 各洲國家',
      description: '第一層辨識七大洲與太平洋、大西洋、印度洋、北極海；第二層依洲進入國家拼圖。',
      speechModes: Object.freeze(['mandarin', 'english']),
      levels: Object.freeze([
        Object.freeze({
          id: 'continents-oceans',
          title: '七大洲＋四海洋',
          type: 'mixed-region-puzzle',
          plannedItems: Object.freeze([
            '亞洲','歐洲','非洲','北美洲','南美洲','大洋洲','南極洲',
            '太平洋','大西洋','印度洋','北極海'
          ])
        }),
        Object.freeze({
          id: 'countries',
          title: '各洲國家',
          type: 'polygon-puzzle',
          parent: 'continents-oceans',
          groupBy: 'continent',
          smallRegionPolicy: 'exclude-initially'
        })
      ])
    })
  ]);

  const BY_ID = new Map(MAPS.map(map => [map.id, map]));

  function allMaps() { return MAPS.slice(); }
  function getMap(id) { return BY_ID.get(id) || null; }
  function isReady(id) { return getMap(id)?.status === 'ready'; }
  function readyMaps() { return MAPS.filter(map => map.status === 'ready'); }
  function plannedMaps() { return MAPS.filter(map => map.status === 'planned'); }
  function speechModesFor(id) { return getMap(id)?.speechModes?.slice() || ['mandarin']; }

  return { MAPS, allMaps, getMap, isReady, readyMaps, plannedMaps, speechModesFor };
});
