// Lulu, a brown tabby Maine Coon with white paws, bib, muzzle and tail tip.
// She keeps you company along the bottom of the screen: she walks to match how
// far down the page you are, stands, sits, falls asleep when left alone,
// watches the pointer, and likes being petted (click her).
//
// She is drawn on a 170 x 130 design grid, facing right, feet on GROUND.

import { reduced, token } from './util.js';

var DW = 170, DH = 130, GROUND = 118;
var P = {
  fur: '#8E6238', furFar: '#6F4B2A', dark: '#4A301C', belly: '#BC9160',
  white: '#FCF8EF', whiteFar: '#E6DECF', ear: '#D9A391', nose: '#C8776A',
  iris: '#A9B742', pupil: '#16130E', edge: 'rgba(52,34,20,.38)'
};

var canvas = document.createElement('canvas');
canvas.className = 'cat';
canvas.setAttribute('aria-hidden', 'true');
document.body.appendChild(canvas);
var ctx = canvas.getContext('2d');
var cssW = 136, k = 0.8, D = 1;
function fit() {
  cssW = canvas.clientWidth || 136; k = cssW / DW;
  D = Math.min(window.devicePixelRatio || 1, 3);
  canvas.width = Math.round(cssW * D); canvas.height = Math.round(cssW * DH / DW * D);
}

/* ---------- state ---------- */
var x = 8, vel = 0, facing = 1, flip = 1, mode = 'sit', phase = 0, gait = 0;
var since = performance.now(), petUntil = 0, last = 0, squashAt = -1e9;
var mouse = null, whisker = 'rgba(40,30,20,.5)', frame = 0;

function goal() {
  var room = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  var p = Math.max(0, Math.min(1, window.scrollY / room));
  return 8 + p * Math.max(0, window.innerWidth - cssW - 16);
}
function setMode(m, now) { if (m !== mode) { mode = m; since = now; squashAt = now; } }

/* ---------- drawing helpers ---------- */
function fill(c) { ctx.fillStyle = c; }
function ell(cx, cy, rx, ry, rot) { ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, rot || 0, 0, Math.PI * 2); }
function seg(ax, ay, bx, by, w1, w2) { // a tapered limb with round ends
  var a = Math.atan2(by - ay, bx - ax), s = Math.sin(a), c = Math.cos(a);
  ctx.beginPath();
  ctx.moveTo(ax + s * w1 / 2, ay - c * w1 / 2);
  ctx.lineTo(bx + s * w2 / 2, by - c * w2 / 2);
  ctx.arc(bx, by, w2 / 2, a - Math.PI / 2, a + Math.PI / 2);
  ctx.lineTo(ax - s * w1 / 2, ay + c * w1 / 2);
  ctx.arc(ax, ay, w1 / 2, a + Math.PI / 2, a + Math.PI * 1.5);
  ctx.fill();
}
function knee(hx, hy, fx, fy, l1, l2, dir) { // two-bone leg: where the middle joint sits
  var dx = fx - hx, dy = fy - hy, d = Math.min(Math.sqrt(dx * dx + dy * dy), l1 + l2 - 0.01);
  var a = Math.atan2(dy, dx), A = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
  return [hx + Math.cos(a + dir * A) * l1, hy + Math.sin(a + dir * A) * l1];
}
function paw(px, py, far, long) {
  fill(far ? P.whiteFar : P.white); ell(px, py, long || 6.2, 3.7, 0); ctx.fill();
  ctx.strokeStyle = P.edge; ctx.lineWidth = 0.8; ctx.stroke();
}
function leg(hx, hy, fx, fy, dir, far, hind) {
  var l1 = hind ? 22 : 21, l2 = hind ? 22 : 21, j = knee(hx, hy, fx, fy, l1, l2, dir);
  fill(far ? P.furFar : P.fur);
  seg(hx, hy, j[0], j[1], hind ? 15 : 12, 9.5);
  seg(j[0], j[1], fx, fy, 9.5, 7.4);
  var mx = j[0] + (fx - j[0]) * 0.5, my = j[1] + (fy - j[1]) * 0.5; // the white sock
  fill(far ? P.whiteFar : P.white); seg(mx, my, fx, fy, 8.2, 7.2);
  paw(fx + 2.2, fy + 0.4, far);
}
function stripes(list, w) {
  ctx.strokeStyle = P.dark; ctx.lineWidth = w || 3.2; ctx.lineCap = 'round'; ctx.globalAlpha = 0.72;
  list.forEach(function (s) { ctx.beginPath(); ctx.moveTo(s[0], s[1]); ctx.quadraticCurveTo(s[2], s[3], s[4], s[5]); ctx.stroke(); });
  ctx.globalAlpha = 1;
}
function tail(bx, by, angles, step) { // a bushy tail: overlapping tufts along a curve, banded, white at the tip
  var n = angles.length, px = bx, py = by, pts = [];
  for (var i = 0; i < n; i++) { px += Math.cos(angles[i]) * step; py += Math.sin(angles[i]) * step; pts.push([px, Math.min(py, GROUND - 3)]); }
  for (i = 0; i < n; i++) {
    var u = (i + 1) / n, r = 3.6 + 6.4 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 0.92 + 0.06)), 0.6);
    fill(u > 0.84 ? P.white : (i % 4 > 1 ? P.dark : P.fur));
    ell(pts[i][0], pts[i][1], r, r * 0.92, 0); ctx.fill();
  }
  return pts[n - 1];
}
function bib(pts, dy) { // the white ruff, with a ragged lower edge
  ctx.beginPath();
  pts.forEach(function (p, i) { if (i) ctx.lineTo(p[0], p[1] + dy); else ctx.moveTo(p[0], p[1] + dy); });
  ctx.closePath(); fill(P.white); ctx.fill();
  ctx.strokeStyle = P.edge; ctx.lineWidth = 0.7; ctx.lineJoin = 'round'; ctx.stroke();
}
function head(cx, cy, rot, o) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
  // far ear
  fill(P.furFar); ctx.beginPath(); ctx.moveTo(1, -10); ctx.lineTo(10.5, -27); ctx.lineTo(14, -7); ctx.fill();
  // skull and cheek fluff
  fill(P.fur); ell(0, 0, 16.5, 14.5, 0); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-14, 2); ctx.lineTo(-20, 8); ctx.lineTo(-13, 8); ctx.lineTo(-16, 14); ctx.lineTo(-8, 12); ctx.lineTo(-4, 14); ctx.lineTo(-2, 4); ctx.fill();
  // near ear, which can twitch
  ctx.save(); ctx.translate(-5, -10); ctx.rotate(o.ear || 0);
  fill(P.fur); ctx.beginPath(); ctx.moveTo(-6.5, 3); ctx.lineTo(-1.5, -18.5); ctx.lineTo(9, 0); ctx.fill();
  fill(P.ear); ctx.beginPath(); ctx.moveTo(-3, 1.5); ctx.lineTo(-0.8, -12.5); ctx.lineTo(5.5, 0.5); ctx.fill();
  ctx.strokeStyle = P.dark; ctx.lineWidth = 1; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-1.5, -18.5); ctx.lineTo(-2.4, -21.6); ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = P.dark; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(10.5, -27); ctx.lineTo(11.4, -29.8); ctx.stroke();
  // tabby marks: the forehead "M" and a line back from the eye
  stripes([[-1, -13, 0, -9, 1.5, -6.5], [3.5, -13.5, 4.5, -10, 5.5, -7.5], [-5.5, -12, -5, -8.5, -3, -6], [-2, -1, -8, -1, -12.5, 2], [-3, 4, -8, 5, -11, 8]], 1.5);
  // white muzzle and chin
  fill(P.white); ell(9.5, 6, 8.6, 6.6, -0.1); ctx.fill();
  ctx.strokeStyle = P.edge; ctx.lineWidth = 0.7; ctx.stroke();
  fill(P.nose); ctx.beginPath(); ctx.moveTo(14.4, 1.4); ctx.lineTo(18.2, 2.2); ctx.lineTo(16, 4.8); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(60,40,30,.6)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(16, 4.8); ctx.quadraticCurveTo(15.5, 8.2, 12, 8.6); ctx.stroke();
  // eye
  if (o.shut) {
    ctx.strokeStyle = P.pupil; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
    ctx.beginPath(); if (o.happy) ctx.arc(6, -1.6, 3.3, Math.PI * 1.12, Math.PI * 1.88); else ctx.arc(6, -4.4, 3.3, Math.PI * 0.14, Math.PI * 0.86); ctx.stroke();
  } else {
    fill(P.pupil); ell(6, -3, 4.5, 4, 0.12); ctx.fill();
    fill(P.iris); ell(6, -3, 3.8, 3.4, 0.12); ctx.fill();
    var lx = o.look ? o.look[0] : 0.7, ly = o.look ? o.look[1] : 0;
    fill(P.pupil); ell(6.2 + lx * 1.3, -3 + ly * 1, 1.5, 2.9, 0); ctx.fill();
    fill('#fff'); ell(7.2 + lx * 0.6, -4.4, 0.9, 0.9, 0); ctx.fill();
  }
  // whiskers
  ctx.strokeStyle = whisker; ctx.lineWidth = 0.7;
  [[30, -1], [31, 5], [29, 11]].forEach(function (w, i) { ctx.beginPath(); ctx.moveTo(13, 5 + i); ctx.quadraticCurveTo(22, 3 + i * 2, w[0], w[1] + (o.wh || 0)); ctx.stroke(); });
  ctx.restore();
}
function shadow(cx, w) { fill('rgba(0,0,0,.13)'); ell(cx, GROUND + 1.5, w, 3.2, 0); ctx.fill(); }

/* ---------- poses ---------- */
function footAt(p, base, stride, lift) { // stance slides back along the ground, swing lifts and reaches forward
  if (p < 0.6) return [base + stride / 2 - stride * (p / 0.6), GROUND - 3];
  var u = (p - 0.6) / 0.4, e = 0.5 - 0.5 * Math.cos(Math.PI * u);
  return [base - stride / 2 + stride * e, GROUND - 3 - lift * Math.sin(Math.PI * u)];
}
function poseStand(t, o) {
  var stride = 34 * gait, lift = 8 * gait, ph = phase;
  var bob = -6 + Math.sin(ph * Math.PI * 4) * 1.3 * gait, hb = -6 + Math.sin(ph * Math.PI * 4 + 1) * 1.1 * gait; // -6: she stands tall
  function f(off, base) { return footAt(((ph + off) % 1 + 1) % 1, base, stride, lift); }
  var nh = f(0, 54), nf = f(0.25, 104), fh = f(0.5, 60), ff = f(0.75, 110);
  shadow(82, 46);
  // tail: carried high, the motion travels down it with a delay
  var a = [], sw = 0.16 + 0.1 * gait;
  for (var i = 0; i < 15; i++) a.push(Math.PI * 1.04 + i * 0.15 + Math.sin(t * (1.6 + gait * 3) - i * 0.42) * sw * (0.4 + i / 15) + (o.happy ? Math.sin(t * 22) * 0.05 * i / 15 - 0.25 * i / 15 : 0));
  tail(47, 70 + bob, a, 4.1);
  leg(60, 84 + bob, fh[0], fh[1], -1, true, true);
  leg(108, 84 + bob, ff[0], ff[1], 1, true, false);
  // body
  ctx.beginPath();
  ctx.moveTo(113, 66 + bob);
  ctx.bezierCurveTo(98, 57 + bob, 70, 56 + bob, 50, 62 + bob);
  ctx.bezierCurveTo(37, 66 + bob, 37, 86 + bob, 48, 93 + bob);
  ctx.bezierCurveTo(62, 101 + bob, 92, 101 + bob, 106, 94 + bob);
  ctx.bezierCurveTo(118, 89 + bob, 121, 76 + bob, 113, 66 + bob);
  fill(P.fur); ctx.fill();
  ctx.save(); ctx.clip();
  fill(P.belly); ell(78, 103 + bob, 44, 10, 0); ctx.fill();
  stripes([[52, 60, 48, 72, 53, 84], [62, 57, 58, 70, 63, 84], [72, 56, 69, 68, 74, 82], [82, 56, 80, 68, 85, 81], [92, 57, 91, 68, 96, 80], [102, 60, 102, 69, 106, 78]]);
  ctx.restore();
  // belly fringe
  fill(P.belly); ctx.beginPath(); ctx.moveTo(60, 97 + bob);
  for (i = 0; i < 6; i++) { ctx.lineTo(64 + i * 7, 104 + bob + (i % 2) * 1.5); ctx.lineTo(67.5 + i * 7, 98 + bob); }
  ctx.fill();
  leg(54, 85 + bob, nh[0], nh[1], -1, false, true);
  leg(102, 85 + bob, nf[0], nf[1], 1, false, false);
  fill(P.fur); seg(108, 74 + bob, 122, 60 + hb, 22, 19);
  bib([[108, 66], [122, 66], [126, 73], [121, 75], [124, 82], [118, 82], [119, 90], [113, 88], [110, 95], [106, 86], [103, 78]], bob);
  head(127, 55 + hb, -0.04 + (o.tilt || 0), o);
}
function poseSit(t, o) {
  shadow(80, 40);
  leg(96, 84, 99, 114, 1, true, false);
  // body
  ctx.beginPath();
  ctx.moveTo(101, 60);
  ctx.bezierCurveTo(80, 60, 52, 76, 45, 100);
  ctx.bezierCurveTo(42, 112, 48, 117.5, 60, 117.5);
  ctx.lineTo(99, 117.5);
  ctx.bezierCurveTo(110, 111, 114, 84, 109, 66);
  ctx.closePath(); fill(P.fur); ctx.fill();
  ctx.save(); ctx.clip();
  stripes([[92, 62, 86, 72, 88, 84], [82, 65, 75, 76, 78, 88], [71, 70, 63, 81, 66, 93], [61, 78, 54, 88, 57, 98], [53, 88, 47, 96, 50, 105]]);
  ctx.restore();
  // haunch and hind paw
  fill(P.fur); ell(67, 103, 19, 14.5, -0.15); ctx.fill();
  stripes([[58, 94, 64, 99, 62, 108], [68, 91, 74, 97, 73, 107]], 2.8);
  paw(85, 114.6, false, 9.5);
  // tail: back, round, then along the ground, with a flick at the tip
  var a = [];
  for (var i = 0; i < 15; i++) {
    var ang = i < 3 ? Math.PI * 1.02 : i < 8 ? Math.PI * (1.02 - (i - 2) * 0.2) : 0.04;
    a.push(ang - (i > 9 ? (Math.sin(t * (o.happy ? 9 : 1.3)) * 0.5 + 0.5) * 0.16 * (i - 9) : 0));
  }
  tail(52, 100, a, 4.3);
  // near front leg
  fill(P.fur); seg(104, 82, 106, 100, 12, 9);
  fill(P.white); seg(105.8, 100, 106, 113.5, 8.6, 7.6);
  paw(108.5, 114.6, false);
  fill(P.fur); seg(103, 70, 113, 56, 22, 19);
  bib([[101, 63], [116, 62], [119, 70], [114, 72], [117, 80], [111, 80], [113, 89], [107, 87], [105, 96], [100, 88], [97, 76]], 0);
  head(115, 47, -0.06 + (o.tilt || 0), o);
}
function poseSleep(t) {
  var br = Math.sin(t * 1.5);
  shadow(84, 50);
  // curled body
  ctx.beginPath();
  ctx.moveTo(40, 117.5);
  ctx.bezierCurveTo(34, 100, 54, 84 - br, 84, 84 - br);
  ctx.bezierCurveTo(112, 84 - br, 128, 98, 126, 117.5);
  ctx.closePath(); fill(P.fur); ctx.fill();
  ctx.save(); ctx.clip();
  stripes([[52, 92, 50, 102, 56, 112], [63, 87, 61, 98, 67, 110], [75, 85, 73, 96, 79, 108], [87, 85, 86, 96, 91, 107], [99, 87, 99, 97, 104, 107]]);
  ctx.restore();
  // head resting on the paws
  bib([[104, 104], [118, 102], [122, 110], [117, 117.5], [103, 117.5]], 0);
  paw(121, 114.8, false, 7.5);
  head(120, 101, 0.3, { shut: true, ear: Math.sin(t * 0.7) > 0.96 ? -0.3 : 0, wh: 2 });
  // tail wrapped round the front
  var a = [];
  for (var i = 0; i < 16; i++) a.push(i < 2 ? Math.PI * 1.05 : i < 7 ? Math.PI * (1.05 - (i - 1) * 0.2) : 0.02);
  tail(47, 102, a, 4.2);
  // zzz
  fill(token('--ink-soft') || '#777'); ctx.font = '700 11px ui-monospace, Menlo, monospace';
  for (i = 0; i < 2; i++) { var u = (t * 0.16 + i * 0.5) % 1; ctx.globalAlpha = Math.sin(u * Math.PI) * 0.85; ctx.fillText('z', 138 + u * 10, 78 - u * 26); }
  ctx.globalAlpha = 1;
}
function hearts(u) {
  fill(token('--hot') || '#f60');
  for (var i = 0; i < 3; i++) {
    var v = Math.min(1, u * 1.35 - i * 0.16);
    if (v <= 0) continue;
    var hx = 70 + i * 16, hy = 30 - v * 16, s = 3.4;
    ctx.globalAlpha = 1 - v;
    ctx.beginPath(); ctx.arc(hx - s / 2, hy, s / 1.6, 0, Math.PI * 2); ctx.arc(hx + s / 2, hy, s / 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(hx - s * 1.15, hy + 0.6); ctx.lineTo(hx, hy + s * 1.75); ctx.lineTo(hx + s * 1.15, hy + 0.6); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function draw(now) {
  var t = now / 1000, petting = now < petUntil, u = petting ? 1 - (petUntil - now) / 1300 : 0;
  ctx.setTransform(D * k, 0, 0, D * k, 0, 0);
  ctx.clearRect(0, 0, DW, DH);
  ctx.save();
  // turning is a quick flip around her middle; changing pose gives a little squash
  var q = Math.min(1, (now - squashAt) / 260), sq = 1 - Math.sin(q * Math.PI) * 0.06;
  var hop = petting ? Math.sin(Math.min(1, u * 2.2) * Math.PI) * 4 : 0;
  ctx.translate(DW / 2, GROUND); ctx.scale(flip, sq); ctx.translate(-DW / 2, -GROUND - hop);
  // where she is looking: at the pointer if there is one
  var look = null, tilt = 0;
  if (mouse) {
    var r = canvas.getBoundingClientRect(), hx = r.left + r.width * (flip > 0 ? 0.72 : 0.28), hy = r.top + r.height * 0.4;
    var dx = (mouse.x - hx) * (flip > 0 ? 1 : -1), dy = mouse.y - hy, d = Math.sqrt(dx * dx + dy * dy) + 1;
    look = [dx / d, dy / d]; tilt = Math.max(-0.22, Math.min(0.16, dy / d * 0.2)) * (dx > -40 ? 1 : 0.3);
  }
  var blink = (t % 4.6) < 0.14 || ((t + 1.3) % 7.1) < 0.12;
  var o = { look: look, tilt: tilt, shut: blink || petting, happy: petting, ear: (t % 5.3) < 0.18 ? -0.28 : 0 };
  if (mode === 'sleep') poseSleep(t);
  else if (mode === 'sit') poseSit(t, o);
  else poseStand(t, o);
  ctx.restore();
  if (petting) {
    hearts(u);
    fill(token('--ink') || '#222'); ctx.globalAlpha = Math.sin(u * Math.PI);
    ctx.font = '600 12px ui-monospace, Menlo, monospace'; ctx.textAlign = 'center';
    ctx.fillText('Lulu', DW / 2 + 6, 11);
    ctx.textAlign = 'start'; ctx.globalAlpha = 1;
  }
  canvas.style.transform = 'translateX(' + x.toFixed(1) + 'px)';
}

/* ---------- behaviour ---------- */
function tick(now) {
  requestAnimationFrame(tick);
  if (document.hidden) return;
  var dt = Math.min(50, now - last) / 16.7; last = now;
  if (++frame % 120 === 1) whisker = document.documentElement.matches('[data-theme="dark"]') || (!document.documentElement.dataset.theme && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'rgba(240,240,230,.55)' : 'rgba(40,30,20,.5)';
  var gap = goal() - x, busy = now < petUntil;
  var top = (Math.abs(gap) > 220 ? 5 : 1.7) * k / 0.8; // a walk when close, a trot when far behind
  var want = busy || Math.abs(gap) < 3 ? 0 : Math.max(-top, Math.min(top, gap * 0.045));
  if (want && Math.abs(want) < 0.5) want = gap > 0 ? 0.5 : -0.5;
  vel += (want - vel) * 0.14 * dt;
  if (!want && Math.abs(vel) < 1.2) vel = 0; // settle on the spot instead of drifting past it
  if (Math.abs(vel) > 0.08) {
    if (mode !== 'walk') setMode('walk', now);
    x += vel * dt; since = now;
    if (Math.abs(gap) > 6) facing = gap > 0 ? 1 : -1;
    // One step cycle covers the ground her feet push over, so they do not slide; a trot stretches it.
    var trot = Math.max(0, Math.min(1, (Math.abs(vel) * 0.8 / k - 1.7) / 3.3));
    phase = (phase + Math.abs(vel) * dt / (34 / 0.6 * k * (1 + trot * 1.3))) % 1;
    gait += (Math.min(1, Math.abs(vel) / (1.1 * k / 0.8)) - gait) * 0.2;
  } else {
    vel = 0; gait += (0 - gait) * 0.18;
    if (mode === 'walk' && gait < 0.06) { mode = 'stand'; since = now; }
    else if (mode === 'stand' && now - since > 900) setMode('sit', now);
    else if (mode === 'sit' && now - since > 10000 && !busy) setMode('sleep', now);
  }
  flip += (facing - flip) * 0.28 * dt;
  draw(now);
}
function hit(e) {
  var r = canvas.getBoundingClientRect();
  return e.clientX > r.left + r.width * 0.12 && e.clientX < r.right - r.width * 0.05 && e.clientY > r.top + r.height * 0.22 && e.clientY < r.bottom;
}
function pet() {
  var now = performance.now();
  if (mode === 'sleep' || mode === 'stand') setMode('sit', now);
  since = now; petUntil = now + 1300;
  if (reduced) { draw(now + 400); setTimeout(function () { draw(performance.now() + 5000); }, 1300); }
}
// The canvas only takes clicks while the pointer is over her, so links beneath it keep working.
window.addEventListener('mousemove', function (e) {
  mouse = { x: e.clientX, y: e.clientY };
  canvas.style.pointerEvents = hit(e) ? 'auto' : 'none';
});
document.addEventListener('mouseleave', function () { mouse = null; });
canvas.addEventListener('click', pet);
document.addEventListener('click', function (e) { if (e.target !== canvas && hit(e)) pet(); });
window.addEventListener('resize', function () { fit(); if (reduced) { x = goal(); draw(performance.now()); } });

fit();
x = goal();
if (reduced) {
  // No walking: she sits wherever the page position puts her.
  flip = 1;
  var place = function () { x = goal(); draw(performance.now() + 5000); };
  place();
  window.addEventListener('scroll', place, { passive: true });
} else {
  requestAnimationFrame(tick);
}
