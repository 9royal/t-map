(() => {
  'use strict';

  const VERSION = '1.03';
  const STORAGE_KEY = 'tmap-v1-state';
  const COUNTY_URL = 'data/counties-10t.json';
  const TOWN_URL = 'data/towns-10t.json';
  const ISLANDS = new Set(['澎湖縣', '金門縣', '連江縣']);
  const REGION_MAP = {
    '基隆市':'north','臺北市':'north','新北市':'north','桃園市':'north','新竹市':'north','新竹縣':'north','宜蘭縣':'north',
    '苗栗縣':'central','臺中市':'central','彰化縣':'central','南投縣':'central','雲林縣':'central',
    '嘉義市':'south','嘉義縣':'south','臺南市':'south','高雄市':'south','屏東縣':'south',
    '花蓮縣':'east','臺東縣':'east',
    '澎湖縣':'islands','金門縣':'islands','連江縣':'islands'
  };

  const state = {
    settings: { speech: true, labels: true, snapHint: true, effects: true, theme: 'light' },
    progress: { taiwan: [], towns: {} },
    last: { screen: 'home', county: null },
    data: { counties: [], towns: [] },
    selected: null,
    currentCounty: null,
    drag: null
  };

  const screens = ['home','taiwan','complete','explorer','town'];
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  let audioContext = null;

  function applyTheme() {
    const theme = state.settings.theme === 'dark' ? 'dark' : 'light';
    state.settings.theme = theme;
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#10181d' : '#f5f7f8');
    $$('.theme-toggle').forEach(button => {
      button.textContent = theme === 'dark' ? '☀️ 淺色' : '🌙 深色';
      button.setAttribute('aria-label', theme === 'dark' ? '切換為淺色主題' : '切換為深色主題');
    });
    const select = $('#setting-theme');
    if (select) select.value = theme;
  }

  function setTheme(theme) {
    state.settings.theme = theme === 'dark' ? 'dark' : 'light';
    applyTheme();
    saveState();
  }

  function toggleTheme() {
    setTheme(state.settings.theme === 'dark' ? 'light' : 'dark');
  }

  function ensureAudioContext() {
    if (!state.settings.effects) return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioContext) audioContext = new AudioCtx();
    if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
    return audioContext;
  }

  function playCelebrationSound() {
    if (!state.settings.effects) return;
    const ctx = ensureAudioContext();
    if (!ctx) return;
    const start = ctx.currentTime + 0.02;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((frequency, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = start + index * 0.11;
      osc.type = index < 3 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(frequency, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.18, t + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.24);
    });
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.settings) Object.assign(state.settings, saved.settings);
      if (!['light','dark'].includes(state.settings.theme)) state.settings.theme = 'light';
      if (saved.progress) {
        state.progress.taiwan = Array.isArray(saved.progress.taiwan) ? saved.progress.taiwan : [];
        state.progress.towns = saved.progress.towns || {};
      }
      if (saved.last) Object.assign(state.last, saved.last);
    } catch (err) {
      console.warn('T map progress could not be loaded.', err);
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: VERSION,
      settings: state.settings,
      progress: state.progress,
      last: state.last
    }));
    updateHomeProgress();
  }

  function showScreen(name, remember = true) {
    if (state.drag) endDrag(true);
    clearNearTargets();
    screens.forEach(key => $('#screen-' + key)?.classList.toggle('is-active', key === name));
    if (remember) {
      state.last.screen = name;
      state.last.county = state.currentCounty;
      saveState();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setFeedback(el, text, type = '') {
    if (!el) return;
    el.textContent = text;
    el.classList.remove('good','try');
    if (type) el.classList.add(type);
  }

  function normalizedName(text='') {
    return String(text).replaceAll('台','臺').trim();
  }

  function countyName(feature) {
    return normalizedName(feature?.properties?.COUNTYNAME || feature?.properties?.name || '');
  }

  function townName(feature) {
    return normalizedName(feature?.properties?.TOWNNAME || feature?.properties?.name || '');
  }

  function countyCode(feature) {
    return String(feature?.properties?.COUNTYCODE || feature?.id || countyName(feature));
  }

  function speak(text) {
    if (!state.settings.speech || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-TW';
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => /zh[-_]TW/i.test(v.lang)) || voices.find(v => /^zh/i.test(v.lang));
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  }

  function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  async function loadData() {
    if (!window.d3 || !window.topojson) throw new Error('地圖函式庫載入失敗。');
    const [countyRes, townRes] = await Promise.all([fetch(COUNTY_URL), fetch(TOWN_URL)]);
    if (!countyRes.ok || !townRes.ok) throw new Error('行政區圖資下載失敗。');
    const [countyTopo, townTopo] = await Promise.all([countyRes.json(), townRes.json()]);
    state.data.counties = topojson.feature(countyTopo, countyTopo.objects.counties).features
      .map(f => ({ ...f, properties: { ...f.properties, COUNTYNAME: normalizedName(f.properties.COUNTYNAME) } }));
    state.data.towns = topojson.feature(townTopo, townTopo.objects.towns).features
      .map(f => ({ ...f, properties: { ...f.properties, COUNTYNAME: normalizedName(f.properties.COUNTYNAME), TOWNNAME: normalizedName(f.properties.TOWNNAME) } }));
    if (state.data.counties.length !== 22) console.warn('Expected 22 counties, received', state.data.counties.length);
  }

  function createProjection(features, width, height, pad = 16) {
    return d3.geoMercator().fitExtent([[pad, pad], [width - pad, height - pad]], { type:'FeatureCollection', features });
  }

  function renderPreviewSvg(feature, width = 112, height = 76) {
    const svg = d3.create('svg').attr('viewBox', `0 0 ${width} ${height}`).attr('aria-hidden', 'true');
    const proj = createProjection([feature], width, height, 6);
    svg.append('path').datum(feature).attr('d', d3.geoPath(proj));
    return svg.node();
  }

  function renderPieces(container, features, placedNames, level) {
    container.innerHTML = '';
    const remaining = shuffle(features.filter(f => !placedNames.includes(level === 'county' ? countyName(f) : townName(f))));
    if (!remaining.length) {
      container.innerHTML = '<div class="empty-state">全部完成 ✓</div>';
      return;
    }
    remaining.forEach(feature => {
      const name = level === 'county' ? countyName(feature) : townName(feature);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'piece-card' + (state.settings.labels ? '' : ' hide-label');
      button.dataset.pieceName = name;
      button.append(renderPreviewSvg(feature));
      const label = document.createElement('span');
      label.className = 'piece-name';
      label.textContent = name;
      button.append(label);
      button.addEventListener('click', event => {
        if (button.dataset.suppressClick) {
          event.preventDefault();
          event.stopPropagation();
          delete button.dataset.suppressClick;
          return;
        }
        selectPiece(feature, level, button);
      });
      button.addEventListener('pointerdown', (event) => beginDrag(event, feature, level, button));
      container.append(button);
    });
  }

  function selectPiece(feature, level, sourceButton = null) {
    const name = level === 'county' ? countyName(feature) : townName(feature);
    state.selected = { feature, level, name };
    $$('.piece-card').forEach(el => el.classList.toggle('is-selected', el.dataset.pieceName === name));
    if (level === 'county') $('#selected-name').textContent = state.settings.labels ? name : '已選取一塊拼圖';
    else $('#town-selected-name').textContent = state.settings.labels ? name : '已選取一塊拼圖';
    speak(name);
    if (sourceButton) sourceButton.focus({ preventScroll: true });
  }

  // The visible hover and the answer hint are deliberately independent.
  function clearNearTargets() {
    $$('.target-region.is-near, .target-region.is-hovered').forEach(el => {
      el.classList.remove('is-near', 'is-hovered');
    });
  }

  function activeMapStage(level) {
    return level === 'county' ? $('#taiwan-map-stage') : $('#town-map').closest('.town-map-wrap');
  }

  function hitRegionAt(x, y, level) {
    const el = document.elementFromPoint(x, y)?.closest?.('.target-region');
    if (!el || el.dataset.level !== level) return null;
    const screen = level === 'county' ? $('#screen-taiwan') : $('#screen-town');
    return screen.contains(el) ? el : null;
  }

  function correctTargetPath(name, level) {
    return $$('.target-region').find(el =>
      el.dataset.level === level && el.dataset.regionName === name &&
      (level === 'town' ? $('#town-map').contains(el) : $('#taiwan-map-stage').contains(el))) || null;
  }

  function measureDrop(x, y, level, name, radius = 18) {
    const hovered = hitRegionAt(x, y, level);
    const correct = correctTargetPath(name, level);
    const nearCorrect = correct && !correct.classList.contains('is-placed') &&
      TMapHints.geometryProximity(correct, x, y, radius);
    return { ...TMapHints.classify({
        hoveredName: hovered?.dataset.regionName,
        selectedName: name,
        nearCorrect,
        snapHint: state.settings.snapHint,
        placed: !!hovered?.classList.contains('is-placed')
      }), hovered, correct, nearCorrect: !!nearCorrect };
  }

  function highlightTargetAt(x, y, name, level, radius) {
    clearNearTargets();
    const stage = activeMapStage(level);
    const overMap = TMapHints.withinRect(x, y, stage?.getBoundingClientRect());
    if (state.drag?.ghost) state.drag.ghost.classList.toggle('is-over-map', overMap);
    if (!overMap) return null;
    const result = measureDrop(x, y, level, name, radius);
    if (result.hovered && !result.hovered.classList.contains('is-placed')) {
      result.hovered.classList.add('is-hovered');
    }
    if (result.showCorrectHint && result.correct) result.correct.classList.add('is-near');
    return result;
  }

  function moveGhost(ghost, x, y) {
    ghost.style.left = x + 'px';
    ghost.style.top = y + 'px';
  }

  function endDrag(cancelled = true) {
    const drag = state.drag;
    if (!drag) return;
    if (drag.frame) cancelAnimationFrame(drag.frame);
    document.removeEventListener('pointermove', drag.move);
    document.removeEventListener('pointerup', drag.up);
    document.removeEventListener('pointercancel', drag.cancel);
    window.removeEventListener('blur', drag.cancel);
    if (drag.source.hasPointerCapture?.(drag.pointerId)) {
      drag.source.releasePointerCapture(drag.pointerId);
    }
    drag.ghost.remove();
    drag.source.classList.remove('is-dragging');
    clearNearTargets();
    state.drag = null;
    if (drag.active) {
      drag.source.dataset.suppressClick = 'true';
      // The following synthetic click is consumed by the piece's click handler.
      setTimeout(() => { delete drag.source.dataset.suppressClick; }, 350);
    }
    if (!cancelled && drag.active) {
      const stage = activeMapStage(drag.level);
      if (!TMapHints.withinRect(drag.x, drag.y, stage?.getBoundingClientRect())) return;
      const result = measureDrop(drag.x, drag.y, drag.level, drag.name, drag.radius);
      if (result.canPlace) {
        state.selected = { feature: drag.feature, level: drag.level, name: drag.name };
        placeSelected(drag.level);
      } else if (result.hovered) {
        attemptPlacement(result.hovered.dataset.regionName, drag.level);
      }
    }
  }

  function beginDrag(event, feature, level, sourceButton) {
    if (event.button !== undefined && event.button !== 0) return;
    if (state.drag) return;
    selectPiece(feature, level);
    const name = level === 'county' ? countyName(feature) : townName(feature);
    const ghost = document.createElement('div');
    ghost.className = 'drag-ghost';
    ghost.textContent = state.settings.labels ? name : '行政區拼圖';
    ghost.setAttribute('aria-hidden', 'true');
    document.body.append(ghost);
    moveGhost(ghost, event.clientX, event.clientY);
    const drag = {
      ghost, level, name, feature, source: sourceButton,
      pointerId: event.pointerId, x: event.clientX, y: event.clientY,
      startX: event.clientX, startY: event.clientY, active: false,
      radius: event.pointerType === 'touch' ? 24 : 18, frame: 0
    };
    state.drag = drag;
    drag.move = e => {
      if (e.pointerId !== drag.pointerId) return;
      drag.x = e.clientX; drag.y = e.clientY;
      if (!drag.active && Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) >= 5) {
        drag.active = true;
        sourceButton.classList.add('is-dragging');
        ghost.style.visibility = 'visible';
      }
      if (!drag.active) return;
      if (!drag.frame) drag.frame = requestAnimationFrame(() => {
        drag.frame = 0;
        if (state.drag !== drag) return;
        moveGhost(ghost, drag.x, drag.y);
        highlightTargetAt(drag.x, drag.y, name, level, drag.radius);
      });
    };
    drag.up = e => {
      if (e.pointerId !== drag.pointerId) return;
      drag.x = e.clientX; drag.y = e.clientY;
      endDrag(false);
    };
    drag.cancel = e => {
      if (e.pointerId !== undefined && e.pointerId !== drag.pointerId) return;
      endDrag(true);
    };
    sourceButton.setPointerCapture?.(event.pointerId);
    document.addEventListener('pointermove', drag.move);
    document.addEventListener('pointerup', drag.up);
    document.addEventListener('pointercancel', drag.cancel);
    window.addEventListener('blur', drag.cancel);
    ghost.style.visibility = 'hidden';
    // A simple click still selects the piece; only an actual drag shows its badge.
    if (event.pointerType === 'touch') event.preventDefault();
  }

  function targetClick(event) {
    const targetName = event.currentTarget.dataset.regionName;
    const level = event.currentTarget.dataset.level;
    if (!state.selected || state.selected.level !== level) {
      speak(targetName);
      return;
    }
    attemptPlacement(targetName, level);
  }

  function attemptPlacement(targetName, level) {
    if (!state.selected || state.selected.level !== level) return;
    const correct = targetName === state.selected.name;
    if (correct) placeSelected(level);
    else {
      const feedback = level === 'county' ? $('#taiwan-feedback') : $('#town-feedback');
      setFeedback(feedback, '再試試看！這塊拼圖不是放在這裡。', 'try');
    }
  }

  function placeSelected(level) {
    const name = state.selected.name;
    if (level === 'county') {
      if (!state.progress.taiwan.includes(name)) state.progress.taiwan.push(name);
      markTargetPlaced(name, 'county');
      speak(name);
      setFeedback($('#taiwan-feedback'), `答對了：${name}！`, 'good');
      state.selected = null;
      saveState();
      renderTaiwanPieces();
      updateTaiwanProgress();
      if (state.progress.taiwan.length === 22) setTimeout(showTaiwanComplete, 350);
    } else {
      const county = state.currentCounty;
      state.progress.towns[county] ||= [];
      if (!state.progress.towns[county].includes(name)) state.progress.towns[county].push(name);
      markTargetPlaced(name, 'town');
      speak(name);
      setFeedback($('#town-feedback'), `答對了：${name}！`, 'good');
      state.selected = null;
      saveState();
      renderTownPieces();
      updateTownProgress();
      const total = townsForCounty(county).length;
      if (state.progress.towns[county].length === total) setTimeout(showTownComplete, 300);
    }
  }

  function markTargetPlaced(name, level) {
    $$(`.target-region[data-level="${level}"]`).filter(el => el.dataset.regionName === name).forEach(el => el.classList.add('is-placed'));
    $$(`.map-label[data-level="${level}"]`).filter(el => el.dataset.regionName === name).forEach(el => el.style.display = state.settings.labels ? '' : 'none');
  }

  function renderTargetSvg(svgEl, features, width, height, level, placedNames, showLabels = true) {
    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();
    const projection = createProjection(features, width, height, 18);
    const path = d3.geoPath(projection);
    svg.selectAll('path.target-region')
      .data(features)
      .join('path')
      .attr('class', f => {
        const n = level === 'county' ? countyName(f) : townName(f);
        return 'target-region' + (placedNames.includes(n) ? ' is-placed' : '');
      })
      .attr('d', path)
      .attr('tabindex', 0)
      .attr('role', 'button')
      .attr('aria-label', f => level === 'county' ? countyName(f) : townName(f))
      .attr('data-region-name', f => level === 'county' ? countyName(f) : townName(f))
      .attr('data-level', level)
      .on('pointerenter', function() {
        if (!state.drag && !this.classList.contains('is-placed')) this.classList.add('is-hovered');
      })
      .on('pointerleave', function() {
        if (!state.drag) this.classList.remove('is-hovered');
      })
      .on('click', targetClick)
      .on('keydown', function(event) { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); targetClick({ currentTarget: this }); } });

    if (showLabels) {
      svg.selectAll('text.map-label')
        .data(features.filter(f => placedNames.includes(level === 'county' ? countyName(f) : townName(f))))
        .join('text')
        .attr('class', 'map-label')
        .attr('data-region-name', f => level === 'county' ? countyName(f) : townName(f))
        .attr('data-level', level)
        .attr('text-anchor', 'middle')
        .attr('x', f => path.centroid(f)[0])
        .attr('y', f => path.centroid(f)[1])
        .style('display', state.settings.labels ? '' : 'none')
        .text(f => level === 'county' ? countyName(f) : townName(f));
    }
  }

  function renderTaiwanMap() {
    const main = state.data.counties.filter(f => !ISLANDS.has(countyName(f)));
    renderTargetSvg($('#taiwan-main-map'), main, 560, 720, 'county', state.progress.taiwan);
    const insetMap = {
      '澎湖縣': '#inset-penghu',
      '金門縣': '#inset-kinmen',
      '連江縣': '#inset-lienchiang'
    };
    Object.entries(insetMap).forEach(([name, selector]) => {
      const feature = state.data.counties.find(f => countyName(f) === name);
      if (feature) renderTargetSvg($(selector), [feature], 180, 130, 'county', state.progress.taiwan, false);
    });
  }

  function renderTaiwanPieces() {
    renderPieces($('#taiwan-piece-list'), state.data.counties, state.progress.taiwan, 'county');
  }

  function updateTaiwanProgress() {
    const n = state.progress.taiwan.length;
    $('#taiwan-progress').textContent = `完成 ${n} / 22`;
    $('#taiwan-remaining').textContent = `${22 - n} 塊`;
    $('#selected-name').textContent = '尚未選取';
  }

  function openTaiwanPuzzle() {
    state.currentCounty = null;
    state.selected = null;
    clearNearTargets();
    renderTaiwanMap();
    renderTaiwanPieces();
    updateTaiwanProgress();
    updateSettingChips();
    showScreen('taiwan');
  }

  function showTaiwanComplete() {
    renderCompleteMap();
    playCelebrationSound();
    showScreen('complete');
  }

  function renderCompleteMap() {
    const host = $('#complete-map');
    host.innerHTML = '<svg viewBox="0 0 560 720" aria-label="完成的臺灣縣市地圖"></svg>';
    const main = state.data.counties.filter(f => !ISLANDS.has(countyName(f)));
    const svg = d3.select(host.querySelector('svg'));
    const projection = createProjection(main, 560, 720, 24);
    svg.selectAll('path').data(main).join('path')
      .attr('class', 'complete-region')
      .attr('d', d3.geoPath(projection));
  }

  function townsForCounty(name) {
    return state.data.towns.filter(f => normalizedName(f.properties.COUNTYNAME) === normalizedName(name));
  }

  function openExplorer() {
    state.currentCounty = null;
    state.selected = null;
    $('#county-search').value = '';
    $('#region-filter').value = 'all';
    renderExplorer();
    showScreen('explorer');
  }

  function renderExplorer() {
    renderExplorerMap();
    renderCountyList();
  }

  function renderExplorerMap() {
    const main = state.data.counties.filter(f => !ISLANDS.has(countyName(f)));
    const svg = d3.select('#explorer-map');
    svg.selectAll('*').remove();
    const projection = createProjection(main, 560, 720, 24);
    const path = d3.geoPath(projection);
    svg.selectAll('path').data(main).join('path')
      .attr('class', 'target-region')
      .attr('d', path)
      .attr('data-region-name', f => countyName(f))
      .attr('tabindex', 0)
      .attr('role', 'button')
      .attr('aria-label', f => `探索 ${countyName(f)}`)
      .on('click', (_, f) => openTownPuzzle(countyName(f)))
      .on('keydown', (event, f) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openTownPuzzle(countyName(f)); } });
  }

  function renderCountyList() {
    const query = normalizedName($('#county-search').value).toLowerCase();
    const region = $('#region-filter').value;
    const list = state.data.counties
      .filter(f => !query || countyName(f).toLowerCase().includes(query))
      .filter(f => region === 'all' || REGION_MAP[countyName(f)] === region)
      .sort((a,b) => countyName(a).localeCompare(countyName(b), 'zh-Hant'));
    $('#explorer-count').textContent = `${list.length} 個`;
    const host = $('#county-list');
    host.innerHTML = '';
    list.forEach(feature => {
      const name = countyName(feature);
      const towns = townsForCounty(name);
      const done = state.progress.towns[name]?.length || 0;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'county-card';
      const status = done === 0 ? '○ 未開始' : done === towns.length && towns.length ? '✓ 已完成' : '◐ 進行中';
      button.innerHTML = `<div class="name">${name}</div><div class="meta"><span>${status}</span><span class="progress-pill ${done === towns.length && towns.length ? 'done' : ''}">${done} / ${towns.length}</span></div>`;
      button.addEventListener('click', () => openTownPuzzle(name));
      host.append(button);
    });
    if (!list.length) host.innerHTML = '<div class="empty-state">沒有符合條件的縣市。</div>';
  }

  function openTownPuzzle(name) {
    state.currentCounty = normalizedName(name);
    state.selected = null;
    state.progress.towns[state.currentCounty] ||= [];
    const towns = townsForCounty(state.currentCounty);
    $('#town-title').textContent = `${state.currentCounty}行政區拼圖`;
    $('#town-piece-heading').textContent = `${state.currentCounty}拼圖片`;
    $('#town-map-heading').textContent = `${state.currentCounty}輪廓`;
    renderTargetSvg($('#town-map'), towns, 700, 700, 'town', state.progress.towns[state.currentCounty]);
    renderTownPieces();
    updateTownProgress();
    updateSettingChips();
    setFeedback($('#town-feedback'), '選一塊行政區開始。');
    showScreen('town');
  }

  function renderTownPieces() {
    const towns = townsForCounty(state.currentCounty);
    renderPieces($('#town-piece-list'), towns, state.progress.towns[state.currentCounty] || [], 'town');
  }

  function updateTownProgress() {
    const towns = townsForCounty(state.currentCounty);
    const done = state.progress.towns[state.currentCounty]?.length || 0;
    $('#town-progress').textContent = `完成 ${done} / ${towns.length}`;
    $('#town-remaining').textContent = `${towns.length - done} 塊`;
    $('#town-selected-name').textContent = '尚未選取';
  }

  function showTownComplete() {
    const towns = townsForCounty(state.currentCounty);
    playCelebrationSound();
    $('#town-complete-title').textContent = `🎉 ${state.currentCounty}完成！`;
    $('#town-complete-text').textContent = `你已完成 ${towns.length} / ${towns.length} 個鄉鎮市區。`;
    $('#town-complete-dialog').showModal();
  }

  function resetTaiwan() {
    state.progress.taiwan = [];
    saveState();
    openTaiwanPuzzle();
  }

  function resetTown() {
    if (!state.currentCounty) return;
    state.progress.towns[state.currentCounty] = [];
    saveState();
    openTownPuzzle(state.currentCounty);
  }

  function updateSettingChips() {
    const specs = [
      ['taiwan-speech','town-speech','speech','🔊 朗讀'],
      ['taiwan-labels','town-labels','labels','🏷 名稱'],
      ['taiwan-snap','town-snap','snapHint','🧲 吸附提示']
    ];
    specs.forEach(([a,b,key,label]) => {
      [a,b].forEach(id => {
        const el = $('#' + id);
        if (!el) return;
        el.textContent = `${label}：${state.settings[key] ? 'ON' : 'OFF'}`;
        el.classList.toggle('is-on', state.settings[key]);
      });
    });
    $('#setting-speech').checked = state.settings.speech;
    $('#setting-labels').checked = state.settings.labels;
    $('#setting-snap').checked = state.settings.snapHint;
    $('#setting-effects').checked = state.settings.effects;
    $('#setting-theme').value = state.settings.theme;
    $$('.piece-card').forEach(el => el.classList.toggle('hide-label', !state.settings.labels));
    $$('.map-label').forEach(el => el.style.display = state.settings.labels ? '' : 'none');
    if (!state.settings.labels) {
      if ($('#selected-name')) $('#selected-name').textContent = state.selected ? '已選取一塊拼圖' : '尚未選取';
      if ($('#town-selected-name')) $('#town-selected-name').textContent = state.selected ? '已選取一塊拼圖' : '尚未選取';
    }
  }

  function toggleSetting(key) {
    state.settings[key] = !state.settings[key];
    if (key === 'effects' && state.settings.effects) ensureAudioContext();
    if (key === 'snapHint' && !state.drag) clearNearTargets();
    if (key === 'snapHint' && state.drag) {
      highlightTargetAt(state.drag.x, state.drag.y, state.drag.name,
        state.drag.level, state.drag.radius);
    }
    saveState();
    updateSettingChips();
  }

  function updateHomeProgress() {
    $('#home-county-progress').textContent = `${state.progress.taiwan.length} / 22`;
    const completed = state.data.counties.length
      ? state.data.counties.filter(f => {
          const name = countyName(f); const total = townsForCounty(name).length; const done = state.progress.towns[name]?.length || 0;
          return total > 0 && done === total;
        }).length
      : Object.values(state.progress.towns).filter(v => Array.isArray(v) && v.length).length;
    $('#home-town-progress').textContent = `${completed} / 22`;
  }

  function continueProgress() {
    if (state.last.screen === 'town' && state.last.county) return openTownPuzzle(state.last.county);
    if (state.progress.taiwan.length === 22) return openExplorer();
    return openTaiwanPuzzle();
  }

  function bindControls() {
    document.addEventListener('pointerdown', () => ensureAudioContext(), { once: true, passive: true });
    document.addEventListener('click', event => {
      const action = event.target.closest('[data-action]')?.dataset.action;
      if (!action) return;
      if (action === 'start-taiwan') openTaiwanPuzzle();
      if (action === 'continue') continueProgress();
      if (action === 'open-explorer') openExplorer();
      if (action === 'go-home') showScreen('home');
      if (action === 'reset-taiwan') resetTaiwan();
      if (action === 'open-help') $('#help-dialog').showModal();
      if (action === 'toggle-theme') toggleTheme();
    });

    $('#setting-speech').addEventListener('change', () => toggleSetting('speech'));
    $('#setting-labels').addEventListener('change', () => toggleSetting('labels'));
    $('#setting-snap').addEventListener('change', () => toggleSetting('snapHint'));
    $('#setting-effects').addEventListener('change', () => toggleSetting('effects'));
    $('#setting-theme').addEventListener('change', event => setTheme(event.target.value));
    $('#taiwan-speech').addEventListener('click', () => toggleSetting('speech'));
    $('#taiwan-labels').addEventListener('click', () => toggleSetting('labels'));
    $('#taiwan-snap').addEventListener('click', () => toggleSetting('snapHint'));
    $('#town-speech').addEventListener('click', () => toggleSetting('speech'));
    $('#town-labels').addEventListener('click', () => toggleSetting('labels'));
    $('#town-snap').addEventListener('click', () => toggleSetting('snapHint'));
    $('#reset-town').addEventListener('click', resetTown);
    $('#county-search').addEventListener('input', renderCountyList);
    $('#region-filter').addEventListener('change', renderCountyList);
    $('#town-complete-explorer').addEventListener('click', event => { event.preventDefault(); $('#town-complete-dialog').close(); openExplorer(); });
    $('#town-complete-replay').addEventListener('click', event => { event.preventDefault(); $('#town-complete-dialog').close(); resetTown(); });
  }

  function showLoadError(err) {
    console.error(err);
    document.querySelector('#app').innerHTML = `<section class="error-card"><p class="eyebrow">T map v1.03</p><h1>地圖資料沒有成功載入</h1><p>本機行政區圖資沒有成功載入。請確認網站已執行 v1.03 建置流程，且 data/ 與 lib/ 目錄完整；若在本機測試，請使用 npm run preview 開啟，不要直接雙擊 index.html。</p><p><strong>錯誤：</strong>${String(err.message || err)}</p></section>`;
  }

  async function init() {
    loadState();
    applyTheme();
    bindControls();
    updateSettingChips();
    updateHomeProgress();
    try {
      await loadData();
      updateHomeProgress();
      showScreen('home', false);
    } catch (err) {
      showLoadError(err);
    }
  }

  init();
})();
