// The interactive drawings in the hero: four figures sharing one canvas,
// with the picker underneath. Each figure has init(), frame() and click().

import { reduced, token } from './util.js';

export var canvas = document.getElementById('fieldCanvas');
var ctx = canvas.getContext('2d');
var fieldBtn = document.getElementById('field');
var figTitle = document.getElementById('figTitle'), figHint = document.getElementById('figHint');
var figBtns = document.querySelectorAll('.figs button');
var raf = 0, W = 0, H = 0, D = 1, pointer = null, heroVisible = true, cur = 0, C = {};
function rnd(a) { return Math.random() * a; }
function wash(a) { ctx.globalAlpha = a == null ? 1 : a; ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
function spot() { return pointer ? { x: pointer.x, y: pointer.y } : { x: W / 2, y: H / 2 }; }

var figs = [
  { // 1. flow field: draws itself once, then rests
    hint: 'Move to bend it. Click to redraw.', still: 340,
    init: function () {
      wash();
      var n = Math.floor(rnd(900)) + 100, cols = [C.ink, C.ink, C.ink, C.accent, C.accent, C.hot];
      this.seed = n / 37; this.f = 0; this.p = [];
      for (var i = 0; i < 520; i++) this.p.push({ x: rnd(W), y: rnd(H), c: cols[i % cols.length] });
      return 'flow field, 520 particles, seed ' + n;
    },
    frame: function () {
      var s = this.seed;
      ctx.lineWidth = 0.9 * D; ctx.globalAlpha = 0.38;
      for (var i = 0; i < this.p.length; i++) {
        var p = this.p[i], u = p.x / W * 5, v = p.y / W * 5;
        var a = (Math.sin(u * 1.3 + s) + Math.cos(v * 1.7 - s * 1.3) + Math.sin((u + v) * 0.8 + s * 0.7)) * Math.PI * 0.85;
        if (pointer) {
          var dx = p.x - pointer.x, dy = p.y - pointer.y, pull = Math.exp(-Math.sqrt(dx * dx + dy * dy) / (W * 0.16));
          a = a * (1 - pull) + (Math.atan2(dy, dx) + Math.PI / 2) * pull;
        }
        var nx = p.x + Math.cos(a) * 2.2 * D, ny = p.y + Math.sin(a) * 2.2 * D;
        ctx.strokeStyle = p.c; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny); ctx.stroke();
        p.x = nx; p.y = ny;
        if (nx < 0 || ny < 0 || nx > W || ny > H) { p.x = rnd(W); p.y = rnd(H); }
      }
      ctx.globalAlpha = 1;
      return ++this.f < 340;
    },
    click: function () { start(); }
  },
  { // 2. constellation: nodes link up when they come close
    hint: 'Move to gather them. Click to scatter.', still: 1,
    init: function () {
      this.n = [];
      for (var i = 0; i < 70; i++) { var a = rnd(6.283); this.n.push({ x: rnd(W), y: rnd(H), vx: Math.cos(a) * 0.35 * D, vy: Math.sin(a) * 0.35 * D }); }
      return 'constellation, 70 nodes';
    },
    frame: function () {
      var n = this.n, R = W * 0.17, i, j, a, b, dx, dy, d;
      wash();
      for (i = 0; i < n.length; i++) {
        a = n[i];
        if (pointer) {
          dx = pointer.x - a.x; dy = pointer.y - a.y; d = Math.sqrt(dx * dx + dy * dy) + 1;
          var pull = d < W * 0.1 ? -0.05 : d < W * 0.34 ? 0.018 : 0;
          a.vx += dx / d * pull * D; a.vy += dy / d * pull * D;
        }
        var sp = Math.sqrt(a.vx * a.vx + a.vy * a.vy), keep = sp > 0.45 * D ? 0.96 : 1.004;
        a.vx *= keep; a.vy *= keep; a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > W) { a.vx *= -1; a.x = Math.max(0, Math.min(W, a.x)); }
        if (a.y < 0 || a.y > H) { a.vy *= -1; a.y = Math.max(0, Math.min(H, a.y)); }
      }
      ctx.lineWidth = D; ctx.strokeStyle = C.ink;
      for (i = 0; i < n.length; i++) for (j = i + 1; j < n.length; j++) {
        dx = n[i].x - n[j].x; dy = n[i].y - n[j].y; d = Math.sqrt(dx * dx + dy * dy);
        if (d < R) { ctx.globalAlpha = (1 - d / R) * 0.75; ctx.beginPath(); ctx.moveTo(n[i].x, n[i].y); ctx.lineTo(n[j].x, n[j].y); ctx.stroke(); }
      }
      if (pointer) {
        ctx.strokeStyle = C.accent; ctx.lineWidth = 1.4 * D;
        for (i = 0; i < n.length; i++) {
          dx = n[i].x - pointer.x; dy = n[i].y - pointer.y; d = Math.sqrt(dx * dx + dy * dy);
          if (d < R * 1.3) { ctx.globalAlpha = 1 - d / (R * 1.3); ctx.beginPath(); ctx.moveTo(n[i].x, n[i].y); ctx.lineTo(pointer.x, pointer.y); ctx.stroke(); }
        }
      }
      ctx.globalAlpha = 1;
      for (i = 0; i < n.length; i++) {
        ctx.fillStyle = i % 7 === 0 ? C.hot : C.ink;
        ctx.beginPath(); ctx.arc(n[i].x, n[i].y, (i % 7 === 0 ? 3.4 : 2.3) * D, 0, Math.PI * 2); ctx.fill();
      }
      return true;
    },
    click: function () {
      var s = spot();
      this.n.forEach(function (a) {
        var dx = a.x - s.x, dy = a.y - s.y, d = Math.sqrt(dx * dx + dy * dy) + 1, k = 7 * D * Math.exp(-d / (W * 0.3));
        a.vx += dx / d * k; a.vy += dy / d * k;
      });
    }
  },
  { // 3. ink in water: drops carried by a slow current
    hint: 'Drag to stir. Click to add a drop.', still: 90,
    init: function () {
      ctx.clearRect(0, 0, W, H); this.p = []; this.t = rnd(50); this.k = 0;
      this.drop(W * 0.3, H * 0.35); this.drop(W * 0.68, H * 0.45); this.drop(W * 0.45, H * 0.72);
      return 'ink in water, three colours';
    },
    drop: function (x, y) {
      var col = [C.accent, C.hot, C.ink][this.k++ % 3];
      for (var i = 0; i < 240; i++) {
        var a = rnd(6.283), q = rnd(1), rad = q * W * 0.05;
        this.p.push({ x: x + Math.cos(a) * rad, y: y + Math.sin(a) * rad, vx: Math.cos(a) * q * 1.6 * D, vy: Math.sin(a) * q * 1.6 * D, c: col, s: (0.8 + rnd(2.4)) * D });
      }
      if (this.p.length > 1700) this.p.splice(0, this.p.length - 1700);
    },
    frame: function () {
      ctx.globalCompositeOperation = 'destination-out'; ctx.globalAlpha = 0.09; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over'; this.t += 0.004;
      var t = this.t, R = W * 0.15;
      ctx.globalAlpha = 0.5;
      for (var i = 0; i < this.p.length; i++) {
        var p = this.p[i], u = p.x / W * 4, v = p.y / W * 4;
        var a = (Math.sin(u + t * 3) + Math.cos(v - t * 2) + Math.sin((u - v) * 0.7 + t)) * Math.PI;
        p.vx += Math.cos(a) * 0.022 * D; p.vy += Math.sin(a) * 0.022 * D;
        if (pointer) {
          var dx = p.x - pointer.x, dy = p.y - pointer.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < R) { var w = (1 - d / R) * 0.09; p.vx += pointer.vx * w; p.vy += pointer.vy * w; }
        }
        p.vx *= 0.965; p.vy *= 0.965; p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x += W; else if (p.x > W) p.x -= W;
        if (p.y < 0) p.y += H; else if (p.y > H) p.y -= H;
        ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      return true;
    },
    click: function () { var s = spot(); this.drop(s.x, s.y); }
  },
  { // 4. wave: slow rolling lines that ripple when touched
    hint: 'Move to press into it. Click to send a ripple.', still: 1,
    init: function () { this.t = rnd(100); this.f = 0; this.rip = []; return 'wave, 28 lines'; },
    frame: function () {
      wash(); this.t += 0.004; this.f++;
      var t = this.t, N = 28, R = W * 0.22, f = this.f, rip = this.rip;
      while (rip.length && f - rip[0].f > 320) rip.shift();
      for (var i = 0; i < N; i++) {
        var y0 = H * (i + 0.5) / N, v = y0 / H;
        ctx.beginPath();
        for (var x = 0; x <= W + 8 * D; x += 8 * D) {
          var u = x / W;
          var dy = (Math.sin(u * 5 + t * 2 + v * 6) * 0.5 + Math.sin(u * 11 - t * 3 + v * 3) * 0.25 + Math.sin((u + v) * 3 + t) * 0.5) * H * 0.03;
          for (var k = 0; k < rip.length; k++) {
            var age = (f - rip[k].f) / 60, ex = x - rip[k].x, ey = y0 - rip[k].y, q = (Math.sqrt(ex * ex + ey * ey) - age * W * 0.38) / (W * 0.055);
            dy -= H * 0.04 * Math.exp(-age * 0.8) * Math.exp(-q * q);
          }
          if (pointer) {
            var px = x - pointer.x, py = y0 - pointer.y, d = Math.sqrt(px * px + py * py);
            if (d < R) dy += H * 0.045 * (1 - d / R) * (1 - d / R);
          }
          if (x === 0) ctx.moveTo(x, y0 + dy); else ctx.lineTo(x, y0 + dy);
        }
        ctx.strokeStyle = i % 5 === 2 ? C.accent : C.ink; ctx.lineWidth = (i % 5 === 2 ? 1.9 : 1.1) * D;
        ctx.globalAlpha = i % 5 === 2 ? 1 : 0.7; ctx.stroke();
      }
      ctx.globalAlpha = 1;
      return true;
    },
    click: function () { var s = spot(); this.rip.push({ x: s.x, y: s.y, f: this.f }); }
  }
];

function settle() { var f = figs[cur]; for (var k = 0; k < f.still; k++) if (f.frame() === false) break; }
function kick() { if (!raf && heroVisible && !reduced) raf = requestAnimationFrame(loop); }
function loop() {
  raf = 0;
  if (pointer) { pointer.vx *= 0.8; pointer.vy *= 0.8; }
  if (figs[cur].frame() !== false) kick();
}
export function start() {
  cancelAnimationFrame(raf); raf = 0;
  D = Math.min(window.devicePixelRatio || 1, 2);
  W = canvas.width = Math.max(1, Math.round(canvas.clientWidth * D));
  H = canvas.height = Math.max(1, Math.round(canvas.clientHeight * D));
  C = { paper: token('--paper'), ink: token('--ink'), accent: token('--accent'), hot: token('--hot') };
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.lineCap = 'butt';
  var f = figs[cur];
  figTitle.textContent = 'Fig. ' + (cur + 1) + ': ' + f.init();
  figHint.textContent = f.hint;
  fieldBtn.setAttribute('aria-label', 'Interactive drawing. ' + f.hint);
  if (reduced) settle(); else kick();
}
function track(e) {
  var r = canvas.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W, y = (e.clientY - r.top) / r.height * H;
  pointer = { x: x, y: y, vx: pointer ? x - pointer.x : 0, vy: pointer ? y - pointer.y : 0 };
}
fieldBtn.addEventListener('pointermove', function (e) { track(e); kick(); });
var lastType = 'mouse';
fieldBtn.addEventListener('pointerdown', function (e) { lastType = e.pointerType || 'mouse'; track(e); });
fieldBtn.addEventListener('pointerleave', function () { pointer = null; });
fieldBtn.addEventListener('pointercancel', function () { pointer = null; });
fieldBtn.addEventListener('click', function (e) {
  var touch = lastType !== 'mouse';
  // A tap ends with the finger leaving, which clears the pointer before the click arrives,
  // so take the position from the click itself. Keyboard clicks act on the centre.
  if (e.detail === 0 && !e.clientX && !e.clientY) pointer = null; else { pointer = null; track(e); }
  figs[cur].click();
  if (reduced) settle(); else kick();
  if (touch) pointer = null;
});
figBtns.forEach(function (b, i) {
  b.addEventListener('click', function () {
    cur = i;
    figBtns.forEach(function (o, k) { o.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
    try { localStorage.setItem('figure', b.dataset.fig); } catch (err) {}
    pointer = null; start();
  });
});
try {
  var saved = localStorage.getItem('figure');
  figBtns.forEach(function (o, k) { if (o.dataset.fig === saved) cur = k; });
  figBtns.forEach(function (o, k) { o.setAttribute('aria-pressed', k === cur ? 'true' : 'false'); });
} catch (err) {}
if ('IntersectionObserver' in window) {
  new IntersectionObserver(function (es) { heroVisible = es[0].isIntersecting; kick(); }).observe(canvas);
}
