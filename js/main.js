// Entry point: loads each part of the page, then redraws the canvases
// whenever the theme or the window size changes.

import { root } from './util.js';
import './theme.js';
// import './cat.js'; // Lulu is resting for now. Uncomment this line to bring her back.
import { canvas, start as restartHero } from './hero.js';
import { refresh as refreshProjects } from './projects.js';

function drawAll() { refreshProjects(); restartHero(); }
drawAll();

new MutationObserver(drawAll).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', drawAll);

var lastW = canvas.clientWidth, timer;
window.addEventListener('resize', function () {
  clearTimeout(timer);
  timer = setTimeout(function () {
    if (canvas.clientWidth !== lastW) { lastW = canvas.clientWidth; restartHero(); }
  }, 200);
});
