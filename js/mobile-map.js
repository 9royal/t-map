(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.TMapMobile = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function parseViewBox(value) {
    const nums = String(value || '').trim().split(/[\s,]+/).map(Number);
    if (nums.length !== 4 || nums.some(n => !Number.isFinite(n))) return null;
    const [x, y, width, height] = nums;
    if (width <= 0 || height <= 0) return null;
    return { x, y, width, height };
  }

  function formatViewBox(box) {
    return [box.x, box.y, box.width, box.height].map(n => Number(n.toFixed(4))).join(' ');
  }

  function clampViewBox(box, base) {
    if (!box || !base) return box;
    const width = clamp(box.width, base.width / 4, base.width);
    const height = clamp(box.height, base.height / 4, base.height);
    const maxX = base.x + base.width - width;
    const maxY = base.y + base.height - height;
    return {
      x: clamp(box.x, base.x, maxX),
      y: clamp(box.y, base.y, maxY),
      width,
      height
    };
  }

  function zoomViewBox(current, base, factor, focus) {
    if (!current || !base || !Number.isFinite(factor) || factor <= 0) return current;
    const fx = Number.isFinite(focus?.x) ? focus.x : current.x + current.width / 2;
    const fy = Number.isFinite(focus?.y) ? focus.y : current.y + current.height / 2;
    const width = current.width / factor;
    const height = current.height / factor;
    const rx = current.width ? (fx - current.x) / current.width : 0.5;
    const ry = current.height ? (fy - current.y) / current.height : 0.5;
    return clampViewBox({
      x: fx - rx * width,
      y: fy - ry * height,
      width,
      height
    }, base);
  }

  function panViewBox(current, base, dxCss, dyCss, rectWidth, rectHeight) {
    if (!current || !base || !rectWidth || !rectHeight) return current;
    return clampViewBox({
      x: current.x - dxCss * current.width / rectWidth,
      y: current.y - dyCss * current.height / rectHeight,
      width: current.width,
      height: current.height
    }, base);
  }

  function isZoomed(current, base, epsilon = 0.001) {
    if (!current || !base) return false;
    return Math.abs(current.width - base.width) > epsilon || Math.abs(current.height - base.height) > epsilon;
  }

  const DRAWER_STATES = ['collapsed', 'half', 'full'];

  function normalizeDrawerState(value) {
    return DRAWER_STATES.includes(value) ? value : 'collapsed';
  }

  function stepDrawerState(current, direction) {
    const state = normalizeDrawerState(current);
    const index = DRAWER_STATES.indexOf(state);
    const delta = direction > 0 ? 1 : direction < 0 ? -1 : 0;
    return DRAWER_STATES[clamp(index + delta, 0, DRAWER_STATES.length - 1)];
  }

  function cycleDrawerState(current) {
    const state = normalizeDrawerState(current);
    if (state === 'collapsed') return 'half';
    if (state === 'half') return 'full';
    return 'collapsed';
  }

  function drawerStateFromSwipe(current, deltaY, threshold = 34) {
    if (!Number.isFinite(deltaY) || Math.abs(deltaY) < threshold) return normalizeDrawerState(current);
    return stepDrawerState(current, deltaY < 0 ? 1 : -1);
  }

  function magnifierGeometry(pointerX, pointerY, viewportWidth, viewportHeight,
                             size = 112, gap = 42, margin = 8) {
    if (![pointerX, pointerY, viewportWidth, viewportHeight, size, gap, margin].every(Number.isFinite)) return null;
    const maxLeft = Math.max(margin, viewportWidth - size - margin);
    const left = clamp(pointerX - size / 2, margin, maxLeft);
    let top = pointerY - size - gap;
    if (top < margin) top = pointerY + 30;
    const maxTop = Math.max(margin, viewportHeight - size - margin);
    top = clamp(top, margin, maxTop);
    return {
      left,
      top,
      centerX: left + size / 2,
      centerY: top + size / 2,
      size
    };
  }

  return { clamp, parseViewBox, formatViewBox, clampViewBox, zoomViewBox, panViewBox, isZoomed,
    normalizeDrawerState, stepDrawerState, cycleDrawerState, drawerStateFromSwipe, magnifierGeometry };
});
