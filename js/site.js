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
  });

})(jQuery);
