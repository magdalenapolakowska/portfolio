// Lulu, a Maine Coon with white paws, keeps you company along the bottom of the screen.
// She walks to match how far down the page you are, sits when you stop,
// falls asleep if you leave her alone, and likes being petted (click her).

import { reduced, token } from './util.js';

var W = 72, H = 68, GROUND = 52, TOP = 12; // TOP leaves room above her for hearts and her name
var canvas = document.createElement('canvas');
canvas.className = 'cat';
canvas.setAttribute('aria-hidden', 'true');
canvas.title = 'Lulu';
document.body.appendChild(canvas);
var ctx = canvas.getContext('2d');
var D = Math.min(window.devicePixelRatio || 1, 3);
canvas.width = W * D; canvas.height = H * D;

var x = 12, target = 12, facing = 1, mode = 'sit', phase = 0;
var idleSince = performance.now(), petUntil = 0, last = 0, frame = 0;
var col = { fur: '#222', paw: '#fff', eye: '#fff', love: '#f60' };

function colours() {
  col.fur = token('--cat') || token('--ink');
  col.paw = token('--cat-paw') || '#fff';
  col.eye = token('--paper');
  col.love = token('--hot');
}
function goal() {
  var room = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  var p = Math.max(0, Math.min(1, window.scrollY / room));
  return 12 + p * Math.max(0, window.innerWidth - W - 24);
}

/* ---- drawing: everything is in a 72 by 56 box, facing right, feet on GROUND ---- */
function line(x1, y1, x2, y2, w) { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
function blob(cx, cy, rx, ry, rot) { ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, rot || 0, 0, Math.PI * 2); ctx.fill(); }
function head(cx, cy, asleep, blink) {
  blob(cx, cy, 9.2, 8.2, 0);
  ctx.beginPath(); ctx.moveTo(cx - 7.5, cy - 4); ctx.lineTo(cx - 5, cy - 14); ctx.lineTo(cx - 0.5, cy - 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx + 0.5, cy - 7); ctx.lineTo(cx + 5.5, cy - 14); ctx.lineTo(cx + 7.5, cy - 3.5); ctx.fill();
  line(cx - 5, cy - 13.5, cx - 5.9, cy - 15.8, 1); line(cx + 5.5, cy - 13.5, cx + 6.6, cy - 15.8, 1);
  ctx.strokeStyle = col.eye; ctx.fillStyle = col.eye;
  if (asleep || blink) { ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(cx + 3.2, cy - 0.6, 2, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); }
  else { ctx.beginPath(); ctx.arc(cx + 3.4, cy - 0.8, 1.5, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = col.fur; ctx.fillStyle = col.fur;
  ctx.globalAlpha = 0.55; line(cx + 6.5, cy + 2, cx + 13, cy + 0.8, 0.8); line(cx + 6.5, cy + 3.2, cx + 12.5, cy + 4.6, 0.8); ctx.globalAlpha = 1;
}
function paw(px, py) { // white, with a rim of fur so it shows on a pale page
  blob(px, py, 3.1, 2.7, 0); ctx.fillStyle = col.paw; blob(px, py, 2.3, 1.9, 0); ctx.fillStyle = col.fur;
}
function tail(x1, y1, cx, cy, x2, y2) {
  ctx.lineWidth = 7.5; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(cx, cy, x2, y2); ctx.stroke();
  blob(x2, y2, 5, 5, 0); // the plume at the tip
}
function drawWalk(t) {
  var bob = Math.sin(t * 2) * 0.8;
  tail(20, 34 + bob, 7, 34, 9 + Math.sin(t) * 2, 17 + Math.cos(t) * 2);
  [[45, 0], [40, Math.PI], [27, Math.PI], [22, 0]].forEach(function (leg) {
    var s = Math.sin(t + leg[1]), lift = Math.max(0, Math.cos(t + leg[1])) * 3;
    line(leg[0], 40 + bob, leg[0] + s * 5, GROUND - lift - 1, 3.8);
    paw(leg[0] + s * 5 + 0.6, GROUND - lift - 1.4);
  });
  blob(34, 36 + bob, 16, 9.4, 0);
  blob(45.5, 33 + bob, 6.5, 7.5, 0); // ruff
  head(52, 27 + bob, false, false);
}
function drawSit(t, blink, hop) {
  ctx.translate(0, -hop);
  tail(22, 49, 5, 55, 9, 41 + Math.sin(t * 0.9) * 3);
  blob(30, 41, 12.5, 11.5, -0.25);
  blob(37, 33.5, 6.5, 7.2, 0); // ruff
  line(38, 40, 38, GROUND - 1, 3.8); line(43, 40, 43, GROUND - 1, 3.8);
  paw(38.4, GROUND - 1.4); paw(43.6, GROUND - 1.4); paw(30, GROUND - 1.2);
  head(41, 24, false, blink);
}
function drawSleep(t) {
  var breathe = Math.sin(t * 0.5) * 0.6;
  blob(33, 45 - breathe / 2, 18, 7.6 + breathe, 0);
  tail(18, 47, 12, 55, 36, 52.5);
  head(48, 43.5, true, false);
  paw(40, 51.2);
  ctx.font = '600 9px ui-monospace, Menlo, monospace';
  for (var i = 0; i < 2; i++) {
    var u = ((t * 0.12) + i * 0.5) % 1;
    ctx.globalAlpha = Math.sin(u * Math.PI) * 0.8;
    ctx.fillText('z', 56 + u * 8, 30 - u * 20);
  }
  ctx.globalAlpha = 1;
}
function hearts(u) {
  ctx.fillStyle = col.love;
  for (var i = 0; i < 3; i++) {
    var v = Math.min(1, u * 1.3 - i * 0.15);
    if (v <= 0) continue;
    var hx = 36 + i * 9 - 4, hy = TOP + 12 - v * 11, s = 2.2;
    ctx.globalAlpha = 1 - v;
    ctx.beginPath(); ctx.arc(hx - s / 2, hy, s / 1.6, 0, Math.PI * 2); ctx.arc(hx + s / 2, hy, s / 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(hx - s * 1.15, hy + 0.5); ctx.lineTo(hx, hy + s * 1.7); ctx.lineTo(hx + s * 1.15, hy + 0.5); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function draw(now) {
  ctx.setTransform(D, 0, 0, D, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  ctx.translate(0, TOP);
  if (facing < 0) { ctx.translate(W, 0); ctx.scale(-1, 1); }
  ctx.fillStyle = ctx.strokeStyle = col.fur; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  var t = now / 1000, petting = now < petUntil, u = petting ? 1 - (petUntil - now) / 1100 : 0;
  if (mode === 'walk') drawWalk(phase);
  else if (mode === 'sleep') drawSleep(t * 6);
  else drawSit(t * 3, (t % 4.2) < 0.16, petting ? Math.sin(u * Math.PI) * 5 : 0);
  ctx.restore();
  if (petting) {
    hearts(u);
    ctx.fillStyle = col.fur; ctx.globalAlpha = Math.sin(u * Math.PI);
    ctx.font = '600 10px ui-monospace, Menlo, monospace'; ctx.textAlign = 'center';
    ctx.fillText('Lulu', W / 2, 9);
    ctx.textAlign = 'start'; ctx.globalAlpha = 1;
  }
  canvas.style.transform = 'translateX(' + Math.round(x) + 'px)';
}

/* ---- behaviour ---- */
function tick(now) {
  requestAnimationFrame(tick);
  if (document.hidden) return;
  var dt = Math.min(50, now - last); last = now;
  if (++frame % 90 === 1) colours();
  target = goal();
  var gap = target - x;
  if (Math.abs(gap) > 3 && now > petUntil) {
    var step = Math.max(-5, Math.min(5, gap * 0.06));
    if (Math.abs(step) < 0.9) step = gap > 0 ? 0.9 : -0.9;
    x += step * dt / 16.7; facing = gap > 0 ? 1 : -1;
    phase += Math.abs(step) * 0.11 * dt / 16.7; mode = 'walk'; idleSince = now;
  } else if (mode === 'walk') { mode = 'sit'; idleSince = now; }
  else if (mode === 'sit' && now - idleSince > 9000 && now > petUntil) mode = 'sleep';
  draw(now);
}
canvas.addEventListener('click', function () {
  var now = performance.now();
  mode = 'sit'; idleSince = now; petUntil = now + 1100;
  if (reduced) { draw(now - 500); }
});

colours();
if (reduced) {
  // No walking: the cat simply sits where the page position puts it.
  var place = function () { x = goal(); colours(); draw(1000); };
  place();
  window.addEventListener('scroll', place, { passive: true });
  window.addEventListener('resize', place);
  new MutationObserver(function () { setTimeout(place, 0); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
} else {
  x = goal();
  requestAnimationFrame(tick);
}
