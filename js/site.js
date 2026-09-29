/*************************************************
 *  Philipp Schicho – site.js
 *
 *  Scroll, Isotope, navbar. Dark mode lives in theme.js.
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
   * Scrollspy: highlight the navbar link of the section at the top of the view.
   * (Bootstrap 5's own scrollspy uses IntersectionObserver thresholds, which
   * misbehave for sections taller than the viewport.)
   * --------------------------------------------------------------------------- */

  function updateScrollspy() {
    let $links = $('#navbar-main .navbar-nav .nav-link');
    let scrollTop = $(window).scrollTop() + getNavBarHeight() + 1;
    let atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1;
    let $active = $links.first();
    let best = -Infinity;
    $links.each(function () {
      if (!this.hash || this.pathname !== window.location.pathname) return;
      let target = document.getElementById(this.hash.substring(1));
      if (!target) return;
      let top = $(target).offset().top;
      if ((atBottom || top <= scrollTop) && top > best) {
        best = top;
        $active = $(this);
      }
    });
    $links.not($active).removeClass('active');
    $active.addClass('active');
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
   * Project filters. Bound right away rather than after window load, so a click
   * while images are still loading doesn't follow href="#" to the top. Before
   * Isotope is ready, items are shown/hidden directly and the chosen filter is
   * remembered for Isotope's initial layout.
   * --------------------------------------------------------------------------- */

  $('.project-filters a').on('click', function (event) {
    event.preventDefault();
    let selector   = $(this).attr('data-filter');
    let $section   = $(this).closest('section');
    let $container = $section.find('.projects-container');
    $section.data('project-filter', selector);
    if ($container.data('isotope')) {
      $container.isotope({ filter: selector });
    } else {
      $container.find('.isotope-item').each(function () {
        $(this).toggle($(this).is(selector));
      });
    }
    $(this).addClass('active').siblings().removeClass('active all');
  });

  /* ---------------------------------------------------------------------------
   * Collapse mobile navbar when a link is clicked.
   * --------------------------------------------------------------------------- */

  $(document).on('click', '.navbar-collapse.show', function (e) {
    let $target = $(e.target).is('a') ? $(e.target) : $(e.target).parent();
    if ($target.is('a') && $target.attr('class') !== 'dropdown-toggle') {
      bootstrap.Collapse.getOrCreateInstance(this, { toggle: false }).hide();
    }
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

    // Scrollspy.
    updateScrollspy();
    $(window).on('scroll', updateScrollspy);

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

    // Update Scrollspy when window is resized.
    let resizeTimer;
    $(window).on('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateScrollspy, 200);
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
          filter:       $section.data('project-filter') || $section.find('.default-project-filter').text()
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
  });

})(jQuery);
