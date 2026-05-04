/*************************************************
 *  Philipp Schicho – site.js
 *
 *  Scroll, dark mode, Isotope, navbar.
 *  Based on Hugo Academic / Wowchemy (MIT).
 **************************************************/

(function ($) {

  /* ---------------------------------------------------------------------------
   * Navbar height (dynamic – accounts for mobile vs desktop).
   * --------------------------------------------------------------------------- */

  function getNavBarHeight() {
    return $('#navbar-main').outerHeight();
  }

  /* ---------------------------------------------------------------------------
   * Hash-based smooth scrolling, offset for fixed navbar.
   * --------------------------------------------------------------------------- */

  /**
   * Scroll to a target anchor, accounting for the fixed navbar.
   * If target is omitted or a HashChangeEvent, uses window.location.hash.
   */
  function scrollToAnchor(target) {
    target = (typeof target === 'undefined' || typeof target === 'object')
      ? decodeURIComponent(window.location.hash)
      : target;

    if (target && $(target).length) {
      let escaped = '#' + $.escapeSelector(target.substring(1));
      let offset = Math.ceil($(escaped).offset().top - getNavBarHeight());
      $('body').addClass('scrolling');
      $('html, body').animate({ scrollTop: offset }, 600, function () {
        $('body').removeClass('scrolling');
      });
    }
  }

  // Scroll to anchor on hash change (e.g. footnote links).
  window.addEventListener('hashchange', scrollToAnchor);

  /* ---------------------------------------------------------------------------
   * Scrollspy helpers.
   * --------------------------------------------------------------------------- */

  function fixScrollspy() {
    let $body = $('body');
    let data = $body.data('bs.scrollspy');
    if (data) {
      data._config.offset = getNavBarHeight();
      $body.data('bs.scrollspy', data);
      $body.scrollspy('refresh');
    }
  }

  /* ---------------------------------------------------------------------------
   * Smooth scroll for navbar links.
   * --------------------------------------------------------------------------- */

  $('#navbar-main li.nav-item a.nav-link').on('click', function (event) {
    let hash = this.hash;
    // Only intercept same-page section links on the homepage.
    if (this.pathname === window.location.pathname &&
        hash && $(hash).length && $('#homepage').length > 0) {
      event.preventDefault();
      let offset = Math.ceil($(hash).offset().top - getNavBarHeight());
      $('html, body').animate({ scrollTop: offset }, 800);
    }
  });

  /* ---------------------------------------------------------------------------
   * Back to top.
   * --------------------------------------------------------------------------- */

  $('#back_to_top').on('click', function (event) {
    event.preventDefault();
    $('html, body').animate({ scrollTop: 0 }, 800, function () {
      window.location.hash = '';
    });
  });

  /* ---------------------------------------------------------------------------
   * Collapse mobile navbar when a link is clicked.
   * --------------------------------------------------------------------------- */

  $(document).on('click', '.navbar-collapse.show', function (e) {
    let $target = $(e.target).is('a') ? $(e.target) : $(e.target).parent();
    if ($target.is('a') && $target.attr('class') !== 'dropdown-toggle') {
      $(this).collapse('hide');
    }
  });

  /* ---------------------------------------------------------------------------
   * Dark mode – three states: 0 = light, 1 = dark, 2 = auto (follow OS).
   * Cycles on toggle click: light → dark → auto → light …
   * --------------------------------------------------------------------------- */

  function getThemeMode() {
    // Default to auto (2) if nothing stored.
    let stored = localStorage.getItem('dark_mode');
    return stored !== null ? parseInt(stored, 10) : 2;
  }

  function getThemeVariation() {
    let mode = getThemeMode();
    if (mode === 0) return 0;
    if (mode === 1) return 1;
    // Auto: follow OS, fall back to light.
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 1 : 0;
  }

  function renderThemeVariation(isDark, init) {
    init = init || false;
    let $hlLight = $('link[title=hl-light]');
    let $hlDark  = $('link[title=hl-dark]');

    // Skip if already in the requested state (except on first init).
    if (!init) {
      if (isDark === 0 && !$('body').hasClass('dark')) return;
      if (isDark === 1 &&  $('body').hasClass('dark'))  return;
      $('body').css({ opacity: 0, visibility: 'visible' }).animate({ opacity: 1 }, 500);
    }

    if (isDark === 1) {
      $('body').addClass('dark');
      if ($hlLight.length) $hlLight[0].disabled = true;
      if ($hlDark.length)  $hlDark[0].disabled  = false;
    } else {
      $('body').removeClass('dark');
      if ($hlLight.length) $hlLight[0].disabled = false;
      if ($hlDark.length)  $hlDark[0].disabled  = true;
    }
  }

  function updateThemeIcon(mode) {
    let $icon = $('.js-dark-toggle i');
    switch (mode) {
      case 0:  $icon.removeClass('fa-sun fa-palette').addClass('fa-moon');    break; // light
      case 1:  $icon.removeClass('fa-moon fa-sun').addClass('fa-palette');    break; // dark
      default: $icon.removeClass('fa-moon fa-palette').addClass('fa-sun');    break; // auto
    }
  }

  function initThemeVariation() {
    let mode = getThemeMode();
    updateThemeIcon(mode);
    renderThemeVariation(getThemeVariation(), true);
  }

  function cycleThemeMode() {
    // light (0) → dark (1) → auto (2) → light (0) …
    let nextMode = (getThemeMode() + 1) % 3;
    localStorage.setItem('dark_mode', String(nextMode));
    updateThemeIcon(nextMode);
    renderThemeVariation(getThemeVariation());
  }

  /* ---------------------------------------------------------------------------
   * Publication filter (used on the publication index page, not the homepage).
   * --------------------------------------------------------------------------- */

  let pubFilters  = {};
  let searchRegex;
  let filterValues;
  let $grid_pubs  = $('#container-publications');

  if ($grid_pubs.length) {
    $grid_pubs.isotope({
      itemSelector: '.isotope-item',
      percentPosition: true,
      masonry: { columnWidth: '.grid-sizer' },
      filter: function () {
        let $el = $(this);
        let matchSearch = searchRegex ? $el.text().match(searchRegex) : true;
        let matchFilter = filterValues ? $el.is(filterValues)           : true;
        return matchSearch && matchFilter;
      }
    });
  }

  function debounce(fn, threshold) {
    let timeout;
    threshold = threshold || 100;
    return function () {
      clearTimeout(timeout);
      let args = arguments, ctx = this;
      timeout = setTimeout(function () { fn.apply(ctx, args); }, threshold);
    };
  }

  function concatValues(obj) {
    let value = '';
    for (let prop in obj) { value += obj[prop]; }
    return value;
  }

  let $quickSearch = $('.filter-search').keyup(debounce(function () {
    searchRegex = new RegExp($quickSearch.val(), 'gi');
    $grid_pubs.isotope();
  }));

  $('.pub-filters').on('change', function () {
    let filterGroup = this.getAttribute('data-filter-group');
    pubFilters[filterGroup] = this.value;
    filterValues = concatValues(pubFilters);
    $grid_pubs.isotope();
    if (filterGroup === 'pubtype') {
      let val = $(this).val();
      window.location.hash = val.startsWith('.pubtype-') ? val.substring(9) : '';
    }
  });

  function filter_publications() {
    let urlHash = window.location.hash.replace('#', '');
    let filterValue = urlHash !== '' && !isNaN(urlHash) ? '.pubtype-' + urlHash : '*';
    pubFilters['pubtype'] = filterValue;
    filterValues = concatValues(pubFilters);
    $grid_pubs.isotope();
    $('.pubtype-select').val(filterValue);
  }

  /* ---------------------------------------------------------------------------
   * Document ready.
   * --------------------------------------------------------------------------- */

  $(document).ready(function () {
    // Apply stored / OS-preferred theme immediately.
    initThemeVariation();

    // Toggle dark / light / auto on click.
    $('.js-dark-toggle').on('click', function (e) {
      e.preventDefault();
      cycleThemeMode();
    });

    // Live-update when the OS preference changes (only matters in auto mode).
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (getThemeMode() === 2) {
        renderThemeVariation(e.matches ? 1 : 0);
      }
    });
  });

  /* ---------------------------------------------------------------------------
   * Window loaded (after images + scripts).
   * --------------------------------------------------------------------------- */

  $(window).on('load', function () {

    // Handle #top or plain hash navigation arriving from another page.
    if (window.location.hash) {
      if (window.location.hash === '#top') {
        window.location.hash = '';
      } else if (!$('.projects-container').length) {
        // No Isotope containers – safe to scroll right away.
        scrollToAnchor();
      }
    }

    // Save exact pixel position before the page is left so a reload can restore it.
    $(window).on('beforeunload', function () {
      sessionStorage.setItem('ps_scrollY', window.scrollY);
    });

    // Initialize Bootstrap Scrollspy.
    $('body').scrollspy({ offset: getNavBarHeight() });

    // Keep the URL hash in sync with the visible section.
    // This enables a page reload to land on the same section.
    let _hashSyncTimer;
    $(window).on('scroll.hashsync', function () {
      clearTimeout(_hashSyncTimer);
      _hashSyncTimer = setTimeout(function () {
        let scrollTop = $(window).scrollTop() + getNavBarHeight() + 1;
        let current = '';
        $('section[id]').each(function () {
          if ($(this).offset().top <= scrollTop) { current = '#' + this.id; }
        });
        if (current && current !== '#top') {
          history.replaceState(null, null, current);
        } else {
          history.replaceState(null, null, window.location.pathname + window.location.search);
        }
      }, 100);
    });

    // Re-init Scrollspy when window is resized.
    let resizeTimer;
    $(window).on('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(fixScrollspy, 200);
    });

    // Initialize Isotope project grids once all images have loaded.
    $('.projects-container').each(function (index, container) {
      let $container = $(container);
      let $section   = $container.closest('section');
      let layout     = $section.find('.isotope').hasClass('js-layout-row') ? 'fitRows' : 'masonry';

      $container.imagesLoaded(function () {
        $container.isotope({
          itemSelector: '.isotope-item',
          layoutMode:   layout,
          masonry:      { gutter: 20 },
          filter:       $section.find('.default-project-filter').text()
        });

        $section.find('.project-filters a').on('click', function () {
          let selector = $(this).attr('data-filter');
          $container.isotope({ filter: selector });
          $(this).removeClass('active').addClass('active').siblings().removeClass('active all');
          return false;
        });

        // Restore scroll position once layout is fully stable (post-Isotope).
        // On reload: restore exact saved pixel offset.
        // On direct hash navigation: scroll to the anchor.
        let navEntry = performance.getEntriesByType('navigation')[0];
        let isReload = navEntry && navEntry.type === 'reload';
        let savedY   = sessionStorage.getItem('ps_scrollY');
        if (isReload && savedY !== null) {
          window.scrollTo(0, parseInt(savedY, 10));
        } else if (window.location.hash) {
          scrollToAnchor();
        }
      });
    });

    // Publication index filter.
    if ($('.pub-filters-select').length) {
      filter_publications();
    }

    // Citation modal – load and display BibTeX.
    $('.js-cite-modal').on('click', function (e) {
      e.preventDefault();
      let filename = $(this).attr('data-filename');
      let $modal   = $('#modal');
      $modal.find('.modal-body code').load(filename, function (response, status, xhr) {
        if (status === 'error') {
          $('#modal-error').html('Error: ' + xhr.status + ' ' + xhr.statusText);
        } else {
          $('.js-download-cite').attr('href', filename);
        }
      });
      $modal.modal('show');
    });

    // Citation modal – copy BibTeX to clipboard.
    $('.js-copy-cite').on('click', function (e) {
      e.preventDefault();
      let range = document.createRange();
      range.selectNode(document.querySelector('#modal .modal-body'));
      window.getSelection().addRange(range);
      try { document.execCommand('copy'); } catch (err) { /* silent */ }
      window.getSelection().removeAllRanges();
    });

    // Syntax highlighting (only if hljs was loaded).
    if (typeof hljs !== 'undefined') {
      hljs.highlightAll();
    }

  });

})(jQuery);
