// The sun and moon button: switches light and dark, remembers the choice,
// and lets the new theme spread from the button like a drop of ink.

import { root, reduced } from './util.js';

var themeBtn = document.getElementById('theme');
function isDark() {
  var t = root.getAttribute('data-theme');
  return t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
}
function labelTheme() {
  var dark = isDark();
  themeBtn.classList.toggle('is-dark', dark);
  themeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
}
themeBtn.addEventListener('click', function () {
  var next = isDark() ? 'light' : 'dark';
  function apply() {
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (err) {}
    labelTheme();
  }
  if (reduced || !document.startViewTransition) { apply(); return; }
  var b = themeBtn.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height / 2;
  var far = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  document.startViewTransition(apply).ready.then(function () {
    root.animate(
      { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + far + 'px at ' + x + 'px ' + y + 'px)'] },
      { duration: 750, easing: 'cubic-bezier(.6, 0, .3, 1)', pseudoElement: '::view-transition-new(root)' }
    );
  }).catch(function () {});
});
labelTheme();
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', labelTheme);
