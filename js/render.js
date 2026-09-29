/*************************************************
 *  Shared rendering helpers, exposed as window.Site.
 *  Used by talks.js, teaching.js, group.js and publications.js.
 **************************************************/

(function () {
  // Site root, derived from this script's own URL (…/js/render.js).
  var script = document.currentScript;
  var siteRoot = script && script.src ? script.src.replace(/js\/render\.js(?:\?.*)?$/, '') : '';

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Root-relative URLs ("/assets/…") only work when served over http(s).
  // For local file:// previews, rewrite them against the site root.
  function resolveUrl(url) {
    if (url && window.location.protocol === 'file:' && url.charAt(0) === '/' && siteRoot) {
      return siteRoot + url.slice(1);
    }
    return url;
  }

  function externalLink(url, html, attrs) {
    return '<a href="' + escapeHtml(resolveUrl(url)) + '"' + (attrs || '') +
      ' target="_blank" rel="noopener">' + html + '</a>';
  }

  // One entry in a talks / lectures / outreach list:
  //   title        text (required)
  //   url          optional link on the title
  //   description  optional text below the title
  //   meta         list of texts joined by middots, e.g. [date, venue]
  //   buttons      list of { label, url }
  //   small        true for compact buttons (talks), false for the
  //                research-block style (lectures, outreach)
  function streamItem(item) {
    var title = item.url ? externalLink(item.url, escapeHtml(item.title)) : escapeHtml(item.title);
    var meta = (item.meta || []).filter(Boolean).map(function (text) {
      return '<span>' + escapeHtml(text) + '</span>';
    }).join('<span class="middot-divider"></span>');
    var btnClass = item.small
      ? 'btn btn-outline-primary my-1 mr-1 btn-sm'
      : 'btn btn-outline-primary btn-page-header';
    var buttons = (item.buttons || []).map(function (b) {
      return externalLink(b.url, escapeHtml(b.label), ' class="' + btnClass + '"');
    }).join('\n');

    return [
      '<div class="media stream-item view-compact">',
      '  <div class="media-body">',
      '    <div class="section-subheading article-title mb-0 mt-0">' + title + '</div>',
      item.description ? '    <div class="article-style">' + escapeHtml(item.description) + '</div>' : '',
      '    <div class="stream-meta article-metadata"><div>' + meta + '</div></div>',
      buttons ? '    <div class="btn-links">' + buttons + '</div>' : '',
      '  </div>',
      '</div>'
    ].filter(Boolean).join('\n');
  }

  window.Site = {
    escapeHtml: escapeHtml,
    resolveUrl: resolveUrl,
    externalLink: externalLink,
    streamItem: streamItem
  };
})();
