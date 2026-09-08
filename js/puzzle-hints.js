(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.TMapHints = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function withinRect(x, y, rect) {
    return !!rect && x >= rect.left && x <= rect.right &&
      y >= rect.top && y <= rect.bottom;
  }

  function classify({ hoveredName = null, selectedName = null,
                      nearCorrect = false, snapHint = false, placed = false }) {
    const correctHit = !placed && !!selectedName && hoveredName === selectedName;
    return {
      hovered: !!hoveredName,
      correctHit,
      showCorrectHint: !!snapHint && !!selectedName && !!nearCorrect,
      canPlace: !!selectedName && (correctHit || !!nearCorrect)
    };
  }

  function distanceToSegment(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay;
    const length2 = dx * dx + dy * dy;
    const t = length2 ? Math.max(0, Math.min(1,
      ((px - ax) * dx + (py - ay) * dy) / length2)) : 0;
    return Math.hypot(px - ax - t * dx, py - ay - t * dy);
  }

  function distanceToPolyline(x, y, points) {
    if (!points || !points.length) return Infinity;
    if (points.length === 1) return Math.hypot(x - points[0].x, y - points[0].y);
    let best = Infinity;
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1], b = points[i];
      best = Math.min(best, distanceToSegment(x, y, a.x, a.y, b.x, b.y));
    }
    return best;
  }

  function geometryProximity(path, x, y, radius = 18) {
    if (!path || !path.getScreenCTM || !path.isPointInFill) return false;
    const matrix = path.getScreenCTM();
    if (!matrix) return false;
    const local = new DOMPoint(x, y).matrixTransform(matrix.inverse());
    if (path.isPointInFill(local)) return true;
    const rect = path.getBoundingClientRect();
    if (x < rect.left - radius || x > rect.right + radius ||
        y < rect.top - radius || y > rect.bottom + radius) return false;
    const length = path.getTotalLength();
    if (!Number.isFinite(length) || length <= 0) return false;
    // Sample only the selected region, not all 368 boundaries on every move.
    const scale = Math.max(0.01, Math.hypot(matrix.a, matrix.b));
    const count = Math.max(2, Math.min(2000, Math.ceil(length * scale / 3)));
    let previous = null, best = Infinity;
    for (let i = 0; i <= count; i++) {
      const point = path.getPointAtLength(length * i / count);
      const p = new DOMPoint(point.x, point.y).matrixTransform(matrix);
      if (previous) {
        // Do not create an imaginary bridge between disconnected islands.
        const gap = Math.hypot(p.x - previous.x, p.y - previous.y);
        const d = gap > 12 ? Math.min(Math.hypot(x - previous.x, y - previous.y),
          Math.hypot(x - p.x, y - p.y)) :
          distanceToSegment(x, y, previous.x, previous.y, p.x, p.y);
        best = Math.min(best, d);
      }
      previous = p;
      if (best <= radius) return true;
    }
    return false;
  }

  return { withinRect, classify, distanceToSegment, distanceToPolyline, geometryProximity };
});
