/*************************************************
 *  Dark mode, shared by every page.
 *
 *  Three modes, stored in localStorage under "dark_mode":
 *    0 = light, 1 = dark, 2 = auto (follow the OS; the default).
 *  Clicking .js-dark-toggle cycles light → dark → auto → light …
 *
 *  Load at the end of <body> so the theme is applied before first paint.
 **************************************************/

(function () {
  var KEY = 'dark_mode';
  var osDark = window.matchMedia('(prefers-color-scheme: dark)');

  function getMode() {
    try {
      var stored = parseInt(localStorage.getItem(KEY), 10);
      return stored === 0 || stored === 1 ? stored : 2;
    } catch (e) {
      return 2;
    }
  }

  function setMode(mode) {
    try { localStorage.setItem(KEY, String(mode)); } catch (e) { /* private mode */ }
  }

  function isDark(mode) {
    return mode === 1 || (mode === 2 && osDark.matches);
  }

  function render(dark, animate) {
    var body = document.body;
    if (body.classList.contains('dark') === dark) return;
    body.classList.toggle('dark', dark);
    if (animate && body.animate) {
      body.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500 });
    }
  }

  function updateIcon(mode) {
    var icons = document.querySelectorAll('.js-dark-toggle i');
    var icon = ['fa-moon', 'fa-palette', 'fa-sun'][mode];
    Array.prototype.forEach.call(icons, function (i) {
      i.classList.remove('fa-moon', 'fa-palette', 'fa-sun');
      i.classList.add(icon);
    });
  }

  var mode = getMode();
  render(isDark(mode), false);

  function init() {
    updateIcon(getMode());
    Array.prototype.forEach.call(document.querySelectorAll('.js-dark-toggle'), function (toggle) {
      toggle.addEventListener('click', function (event) {
        event.preventDefault();
        var next = (getMode() + 1) % 3;
        setMode(next);
        updateIcon(next);
        render(isDark(next), true);
      });
    });
    osDark.addEventListener('change', function () {
      if (getMode() === 2) render(osDark.matches, true);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
