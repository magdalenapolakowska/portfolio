// Small helpers shared by the other modules.

export var root = document.documentElement;
export var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export function token(n) { return getComputedStyle(root).getPropertyValue(n).trim(); }
export function rng(seed) {
  var a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
