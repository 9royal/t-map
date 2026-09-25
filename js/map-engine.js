(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.TMapEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function unique(values) {
    return [...new Set((values || []).filter(value => value !== null && value !== undefined))];
  }

  function progressStatus(total, completedIds) {
    const safeTotal = Math.max(0, Number(total) || 0);
    const done = Math.min(safeTotal, unique(completedIds).length);
    return Object.freeze({ done, total: safeTotal, remaining: Math.max(0, safeTotal - done), complete: safeTotal > 0 && done === safeTotal });
  }

  function normalizeRegion(region = {}) {
    const id = String(region.id ?? region.code ?? region.name ?? '').trim();
    const name = String(region.name ?? region.label ?? id).trim();
    return Object.freeze({
      ...region,
      id,
      name,
      playable: region.playable !== false,
      speech: Object.freeze({ ...(region.speech || {}) })
    });
  }

  function playableRegions(regions) {
    return (regions || []).map(normalizeRegion).filter(region => region.playable);
  }

  function groupRegions(regions, key = 'group') {
    return playableRegions(regions).reduce((groups, region) => {
      const group = String(region[key] ?? 'other');
      (groups[group] ||= []).push(region);
      return groups;
    }, {});
  }

  function speechText(region, mode = 'mandarin') {
    const normalized = normalizeRegion(region);
    return normalized.speech[mode] || normalized.name;
  }

  return { progressStatus, normalizeRegion, playableRegions, groupRegions, speechText };
});
