// The animated illustration on each project card, drawn from the theme colours.

import { reduced, token, rng } from './util.js';

function rr(c, x, y, w, h, rad) {
  c.beginPath();
  c.moveTo(x + rad, y);
  c.arcTo(x + w, y, x + w, y + h, rad);
  c.arcTo(x + w, y + h, x, y + h, rad);
  c.arcTo(x, y + h, x, y, rad);
  c.arcTo(x, y, x + w, y, rad);
  c.closePath();
}
function sway(x) { return Math.max(-1, Math.min(1, x * 3)) * 0.5 + 0.5; }
function bar(c, x, y, w, col) { c.fillStyle = col; rr(c, x, y, w, 6, 3); c.fill(); }

/* Design System Template: a sheet of tokens and components */
function drawSystem(c, r, p, t) {
  var i;
  c.fillStyle = p.bg; c.fillRect(0, 0, 640, 480);
  c.strokeStyle = p.line; c.lineWidth = 1; c.globalAlpha = 0.6;
  for (i = 40; i < 640; i += 40) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 480); c.stroke(); }
  for (i = 40; i < 480; i += 40) { c.beginPath(); c.moveTo(0, i); c.lineTo(640, i); c.stroke(); }
  c.globalAlpha = 1;
  // colour tokens
  var sw = [p.ink, p.accent, p.hot, p.paper, p.line];
  for (i = 0; i < sw.length; i++) {
    c.fillStyle = sw[i]; rr(c, 40 + i * 60, 40, 48, 48, 8); c.fill();
    c.strokeStyle = p.ink; c.lineWidth = 1; rr(c, 40 + i * 60, 40, 48, 48, 8); c.stroke();
  }
  // type specimen and scale
  c.fillStyle = p.ink;
  c.font = '800 76px "Bricolage Grotesque", Arial, sans-serif';
  c.textBaseline = 'alphabetic';
  c.fillText('Aa', 384, 96);
  [14, 10, 7, 5].forEach(function (h, k) { c.fillRect(508, 40 + k * 16, 92 - k * 16, h); });
  // buttons take turns being pressed
  var hov = Math.floor(t / 1.3) % 4;
  c.save(); c.translate(0, hov === 0 ? -5 : 0);
  c.fillStyle = p.ink; rr(c, 40, 124, 132, 46, 23); c.fill(); bar(c, 76, 144, 60, p.paper); c.restore();
  c.save(); c.translate(0, hov === 1 ? -5 : 0);
  c.strokeStyle = p.ink; c.lineWidth = 2; rr(c, 188, 124, 132, 46, 23); c.stroke(); bar(c, 224, 144, 60, p.ink); c.restore();
  c.save(); c.translate(0, hov === 2 ? -5 : 0);
  c.fillStyle = p.accent; rr(c, 336, 124, 132, 46, 23); c.fill(); bar(c, 372, 144, 60, p.paper); c.restore();
  c.save(); c.translate(507, 147 + (hov === 3 ? -5 : 0)); c.rotate(hov === 3 ? (t % 1.3) / 1.3 * Math.PI / 2 : 0);
  c.fillStyle = p.hot; c.beginPath(); c.arc(0, 0, 23, 0, Math.PI * 2); c.fill();
  c.strokeStyle = p.paper; c.lineWidth = 3;
  c.beginPath(); c.moveTo(-10, 0); c.lineTo(10, 0); c.moveTo(0, -10); c.lineTo(0, 10); c.stroke(); c.restore();
  // input and select
  c.fillStyle = p.paper; rr(c, 40, 200, 280, 50, 8); c.fill();
  c.strokeStyle = p.accent; c.lineWidth = 2; rr(c, 40, 200, 280, 50, 8); c.stroke();
  var typed = 20 + Math.min(1, (t % 6) / 3.5) * 150;
  bar(c, 58, 222, typed, p.ink);
  if ((t * 1.7) % 2 < 1.2) { c.fillStyle = p.accent; c.fillRect(64 + typed, 213, 2, 24); }
  c.fillStyle = p.paper; rr(c, 336, 200, 264, 50, 8); c.fill();
  c.strokeStyle = p.ink; c.lineWidth = 1.5; rr(c, 336, 200, 264, 50, 8); c.stroke();
  bar(c, 354, 222, 120, p.line);
  c.strokeStyle = p.ink; c.lineWidth = 2; c.beginPath(); c.moveTo(566, 221); c.lineTo(574, 229); c.lineTo(582, 221); c.stroke();
  // toggles, checkbox, radio, slider
  var k1 = sway(Math.sin(t * 1.1)), k2 = sway(Math.sin(t * 0.8 + 2));
  [[40, k1], [120, k2]].forEach(function (g) {
    c.fillStyle = p.line; rr(c, g[0], 284, 64, 34, 17); c.fill();
    c.globalAlpha = g[1]; c.fillStyle = p.accent; rr(c, g[0], 284, 64, 34, 17); c.fill(); c.globalAlpha = 1;
    c.fillStyle = p.paper; c.beginPath(); c.arc(g[0] + 17 + 30 * g[1], 301, 12, 0, Math.PI * 2); c.fill();
  });
  c.fillStyle = p.ink; rr(c, 204, 284, 34, 34, 7); c.fill();
  c.globalAlpha = sway(Math.sin(t * 0.9 + 1) + 0.4); c.strokeStyle = p.paper; c.lineWidth = 3; c.beginPath(); c.moveTo(212, 301); c.lineTo(219, 308); c.lineTo(230, 294); c.stroke(); c.globalAlpha = 1;
  c.strokeStyle = p.ink; c.lineWidth = 2; c.beginPath(); c.arc(271, 301, 16, 0, Math.PI * 2); c.stroke();
  c.fillStyle = p.ink; c.beginPath(); c.arc(271, 301, 8, 0, Math.PI * 2); c.fill();
  var knob = 336 + (0.5 + 0.34 * Math.sin(t * 0.7 + r() * 6)) * 264;
  c.fillStyle = p.line; rr(c, 336, 298, 264, 6, 3); c.fill();
  c.fillStyle = p.accent; rr(c, 336, 298, knob - 336, 6, 3); c.fill();
  c.fillStyle = p.paper; c.beginPath(); c.arc(knob, 301, 12, 0, Math.PI * 2); c.fill();
  c.strokeStyle = p.accent; c.lineWidth = 3; c.beginPath(); c.arc(knob, 301, 12, 0, Math.PI * 2); c.stroke();
  // cards
  var fills = [p.hot, p.accent, p.ink];
  for (i = 0; i < 3; i++) {
    var x = 40 + i * 192;
    c.fillStyle = p.paper; rr(c, x, 352, 176, 96, 10); c.fill();
    c.strokeStyle = p.line; c.lineWidth = 1.5; rr(c, x, 352, 176, 96, 10); c.stroke();
    c.fillStyle = fills[(i + Math.floor(t / 2.6)) % 3]; rr(c, x + 14, 366, 56, 68, 6); c.fill();
    bar(c, x + 84, 374, 74, p.ink); bar(c, x + 84, 392, 56, p.line); bar(c, x + 84, 410, 66, p.line);
  }
}

/* InTeam: companies on the left, students on the right, and the matches between them */
function drawMatch(c, r, p, t) {
  var n = 6, i, k, L = [], S = [], apps = [];
  c.fillStyle = p.bg; c.fillRect(0, 0, 640, 480);
  for (i = 0; i < n; i++) { L.push({ x: 96, y: 62 + i * 71 }); S.push({ x: 544, y: 62 + i * 71 }); }
  function at(a, b, u) { // point on the curve from a to b
    var v = 1 - u, x1 = a.x + 210, x2 = b.x - 210;
    return {
      x: v * v * v * a.x + 3 * v * v * u * x1 + 3 * v * u * u * x2 + u * u * u * b.x,
      y: v * v * v * a.y + 3 * v * v * u * a.y + 3 * v * u * u * b.y + u * u * u * b.y
    };
  }
  function link(a, b, upTo) { // drawn as short segments so it can stop part-way
    var steps = Math.max(1, Math.round(48 * upTo)), q;
    c.beginPath(); c.moveTo(a.x, a.y);
    for (var s = 1; s <= steps; s++) { q = at(a, b, upTo * s / steps); c.lineTo(q.x, q.y); }
    c.stroke();
  }
  // every application that was sent, with one travelling along each
  c.strokeStyle = p.line; c.lineWidth = 1.5; c.lineCap = 'round'; c.lineJoin = 'round';
  for (i = 0; i < n; i++) for (k = 0; k < 3; k++) { var to = Math.floor(r() * n); apps.push([i, to]); link(L[i], S[to], 1); }
  c.fillStyle = p.ink;
  apps.forEach(function (a, idx) {
    var u = (t * 0.28 + idx * 0.173) % 1, q = at(L[a[0]], S[a[1]], u);
    c.globalAlpha = Math.sin(u * Math.PI); c.beginPath(); c.arc(q.x, q.y, 3.5, 0, Math.PI * 2); c.fill();
  });
  c.globalAlpha = 1;
  // the matches: a shuffled pairing, drawn one after another, held, then cleared
  var order = [0, 1, 2, 3, 4, 5];
  for (i = n - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), tmp = order[i]; order[i] = order[j]; order[j] = tmp; }
  var tt = t % 7, fade = tt > 6.2 ? Math.max(0, (7 - tt) / 0.8) : 1;
  var onL = {}, onS = {};
  c.strokeStyle = p.accent; c.lineWidth = 4;
  for (i = 0; i < 4; i++) {
    var li = i === 3 ? 5 : i, prog = Math.max(0, Math.min(1, (tt - 0.3 - i * 1.1) / 0.9));
    if (prog <= 0) continue;
    c.globalAlpha = fade; link(L[li], S[order[i]], prog);
    onL[li] = fade; if (prog >= 1) onS[order[i]] = fade;
  }
  c.globalAlpha = 1;
  for (i = 0; i < n; i++) {
    // company
    c.fillStyle = p.paper; rr(c, L[i].x - 40, L[i].y - 20, 58, 40, 7); c.fill();
    bar(c, L[i].x - 30, L[i].y - 3, 38, p.line);
    if (onL[i]) { c.globalAlpha = onL[i]; c.fillStyle = p.ink; rr(c, L[i].x - 40, L[i].y - 20, 58, 40, 7); c.fill(); bar(c, L[i].x - 30, L[i].y - 3, 38, p.paper); c.globalAlpha = 1; }
    c.strokeStyle = p.ink; c.lineWidth = 2; rr(c, L[i].x - 40, L[i].y - 20, 58, 40, 7); c.stroke();
    // student
    c.fillStyle = p.paper; c.beginPath(); c.arc(S[i].x + 12, S[i].y, 20, 0, Math.PI * 2); c.fill();
    if (onS[i]) { c.globalAlpha = onS[i]; c.fillStyle = p.hot; c.beginPath(); c.arc(S[i].x + 12, S[i].y, 20, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
    c.strokeStyle = p.ink; c.lineWidth = 2; c.beginPath(); c.arc(S[i].x + 12, S[i].y, 20, 0, Math.PI * 2); c.stroke();
  }
}

var pal = null;
export function refresh() { pal = null; drawThumbs(5.5); }
function drawThumbs(t) {
  if (!pal) pal = { bg: token('--paper-2'), paper: token('--paper'), ink: token('--ink'), accent: token('--accent'), hot: token('--hot'), line: token('--line') };
  document.querySelectorAll('.card').forEach(function (card) {
    if (card._off) return;
    var cv = card.querySelector('canvas'), c = cv.getContext('2d');
    var r = rng(parseInt(cv.dataset.seed, 10));
    c.setTransform(1, 0, 0, 1, 0, 0); c.setLineDash([]); c.lineDashOffset = 0; c.globalAlpha = 1; c.lineCap = 'butt';
    c.clearRect(0, 0, 640, 480);
    if (card.dataset.kind === 'system') drawSystem(c, r, pal, t);
    else drawMatch(c, r, pal, t);
  });
}
// Only cards on screen are redrawn; with reduced motion they are drawn once, complete.
if (!reduced && 'IntersectionObserver' in window) {
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target._off = !e.isIntersecting; }); });
  document.querySelectorAll('.card').forEach(function (card) { io.observe(card); });
}
function tick(now) { drawThumbs(now / 1000); requestAnimationFrame(tick); }
if (reduced) { if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { drawThumbs(5.5); }); }
else requestAnimationFrame(tick);
