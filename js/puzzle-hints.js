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
      showCorrectHint: !!snapHint && !!selectedName && (correctHit || !!nearCorrect),
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



  function pointOnSegment2D(x, y, ax, ay, bx, by, epsilon = 1e-7) {
    return distanceToSegment(x, y, ax, ay, bx, by) <= epsilon;
  }

  function pointInRing2D(x, y, ring) {
    if (!Array.isArray(ring) || ring.length < 3) return false;
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const a = ring[j], b = ring[i];
      if (!Array.isArray(a) || !Array.isArray(b)) continue;
      const ax = Number(a[0]), ay = Number(a[1]);
      const bx = Number(b[0]), by = Number(b[1]);
      if (![ax, ay, bx, by].every(Number.isFinite)) continue;
      if (pointOnSegment2D(x, y, ax, ay, bx, by)) return true;
      const crosses = (ay > y) !== (by > y);
      if (!crosses) continue;
      const xAtY = ax + (y - ay) * (bx - ax) / (by - ay);
      if (x < xAtY) inside = !inside;
    }
    return inside;
  }

  function pointInPolygon2D(x, y, rings) {
    if (!Array.isArray(rings) || !rings.length || !pointInRing2D(x, y, rings[0])) return false;
    for (let i = 1; i < rings.length; i++) {
      if (pointInRing2D(x, y, rings[i])) return false;
    }
    return true;
  }

  function planarContains(geometry, x, y) {
    if (!geometry || !Number.isFinite(x) || !Number.isFinite(y)) return false;
    if (geometry.type === 'Polygon') return pointInPolygon2D(x, y, geometry.coordinates);
    if (geometry.type === 'MultiPolygon') {
      return Array.isArray(geometry.coordinates) && geometry.coordinates.some(poly => pointInPolygon2D(x, y, poly));
    }
    return false;
  }

  function ringBoundaryDistance2D(x, y, ring) {
    if (!Array.isArray(ring) || ring.length < 2) return Infinity;
    let best = Infinity;
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i], b = ring[(i + 1) % ring.length];
      if (!Array.isArray(a) || !Array.isArray(b)) continue;
      const ax = Number(a[0]), ay = Number(a[1]);
      const bx = Number(b[0]), by = Number(b[1]);
      if (![ax, ay, bx, by].every(Number.isFinite)) continue;
      best = Math.min(best, distanceToSegment(x, y, ax, ay, bx, by));
    }
    return best;
  }

  function planarBoundaryDistance(geometry, x, y) {
    if (!geometry || !Number.isFinite(x) || !Number.isFinite(y)) return Infinity;
    const polygons = geometry.type === 'Polygon' ? [geometry.coordinates]
      : geometry.type === 'MultiPolygon' ? geometry.coordinates : [];
    let best = Infinity;
    for (const poly of polygons || []) {
      for (const ring of poly || []) best = Math.min(best, ringBoundaryDistance2D(x, y, ring));
    }
    return best;
  }

  function geometryDistance(path, x, y, maxRadius = Infinity) {
    if (!path || !path.getScreenCTM) return Infinity;
    const matrix = path.getScreenCTM();
    if (!matrix) return Infinity;
    const local = new DOMPoint(x, y).matrixTransform(matrix.inverse());
    if (typeof path.isPointInFill === 'function') {
      try { if (path.isPointInFill(local)) return 0; } catch (_) { /* Safari/WebKit fallback: boundary test below. */ }
    }
    const rect = path.getBoundingClientRect();
    if (Number.isFinite(maxRadius) && (x < rect.left - maxRadius || x > rect.right + maxRadius ||
        y < rect.top - maxRadius || y > rect.bottom + maxRadius)) return Infinity;
    const length = path.getTotalLength();
    if (!Number.isFinite(length) || length <= 0) return Infinity;
    const scale = Math.max(0.01, Math.hypot(matrix.a, matrix.b));
    const count = Math.max(2, Math.min(2000, Math.ceil(length * scale / 3)));
    let previous = null, best = Infinity;
    for (let i = 0; i <= count; i++) {
      const point = path.getPointAtLength(length * i / count);
      const p = new DOMPoint(point.x, point.y).matrixTransform(matrix);
      if (previous) {
        // Avoid treating the gap between separate islands/subpaths as a real boundary.
        const gap = Math.hypot(p.x - previous.x, p.y - previous.y);
        const d = gap > 12 ? Math.min(Math.hypot(x - previous.x, y - previous.y),
          Math.hypot(x - p.x, y - p.y)) :
          distanceToSegment(x, y, previous.x, previous.y, p.x, p.y);
        best = Math.min(best, d);
      }
      previous = p;
      if (best <= 0.35) return best;
    }
    return best;
  }

  function geometryProximity(path, x, y, radius = 18) {
    return geometryDistance(path, x, y, radius) <= radius;
  }

  function correctHintSurface(showCorrectHint, usingMagnifier) {
    if (!showCorrectHint) return 'none';
    return usingMagnifier ? 'magnifier' : 'map';
  }

  function magnifierSourceRadius(crosshairOuterRadius = 8, magnifierScale = 2.35) {
    if (!Number.isFinite(crosshairOuterRadius) || crosshairOuterRadius < 0 ||
        !Number.isFinite(magnifierScale) || magnifierScale <= 0) return 0;
    return crosshairOuterRadius / magnifierScale;
  }

  function crosshairCircleContact({ centerInside = false, boundaryDistance = Infinity, radius = 0 } = {}) {
    if (centerInside) return true;
    if (!Number.isFinite(radius) || radius < 0) return false;
    return Number.isFinite(boundaryDistance) && boundaryDistance <= radius;
  }

  function magnifierContact({ touchesCorrect = false, selectedName = null,
                              snapHint = false, placed = false } = {}) {
    const canPlace = !placed && !!selectedName && !!touchesCorrect;
    return {
      canPlace,
      showCorrectHint: canPlace && !!snapHint,
      hintName: canPlace && !!snapHint ? selectedName : null
    };
  }

  function magnifierHintName(options = {}) {
    return magnifierContact(options).hintName;
  }

  return { withinRect, classify, distanceToSegment, distanceToPolyline, pointInRing2D, pointInPolygon2D, planarContains, planarBoundaryDistance, geometryDistance, geometryProximity, correctHintSurface, magnifierSourceRadius, crosshairCircleContact, magnifierContact, magnifierHintName };
});
