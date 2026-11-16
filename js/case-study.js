// The case study dialog: opened from the featured project, closed with the
// Close button, the Escape key, or a click on the dimmed page behind it.

var dialog = document.getElementById('case');
var opener = document.getElementById('open-case');

function close() { dialog.close(); }

opener.addEventListener('click', function () {
  dialog.showModal();
  dialog.querySelector('.case-body').scrollTop = 0;
  document.documentElement.classList.add('dialog-open'); // stop the page behind from scrolling
});
document.getElementById('close-case').addEventListener('click', close);
dialog.addEventListener('click', function (e) { if (e.target === dialog) close(); }); // the backdrop
dialog.addEventListener('close', function () {
  document.documentElement.classList.remove('dialog-open');
  opener.focus();
});
