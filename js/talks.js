(function () {
  function parseTalkDate(talk) {
    return new Date(talk.date + "T00:00:00");
  }

  function formatTalkDate(talk) {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit"
    }).format(parseTalkDate(talk));
  }

  function byClosestToNow(a, b) {
    var now = new Date();
    var diffA = Math.abs(parseTalkDate(a).getTime() - now.getTime());
    var diffB = Math.abs(parseTalkDate(b).getTime() - now.getTime());
    if (diffA !== diffB) {
      return diffA - diffB;
    }
    return parseTalkDate(b).getTime() - parseTalkDate(a).getTime();
  }

  function byDateDesc(a, b) {
    return parseTalkDate(b).getTime() - parseTalkDate(a).getTime();
  }

  function byDateAsc(a, b) {
    return parseTalkDate(a).getTime() - parseTalkDate(b).getTime();
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderTalkCard(talk) {
    var descriptionHtml = talk.description
      ? '<div class="article-style">' + escapeHtml(talk.description) + "</div>"
      : "";

    var buttons = [];
    if (talk.pdfUrl) {
      buttons.push(
        '<a class="btn btn-outline-primary my-1 mr-1 btn-sm" href="' +
          escapeHtml(talk.pdfUrl) +
          '" target="_blank" rel="noopener">PDF</a>'
      );
    }
    if (talk.slidesUrl) {
      buttons.push(
        '<a class="btn btn-outline-primary my-1 mr-1 btn-sm" href="' +
          escapeHtml(talk.slidesUrl) +
          '" target="_blank" rel="noopener">Slides</a>'
      );
    }
    if (talk.videoUrl) {
      buttons.push(
        '<a class="btn btn-outline-primary my-1 mr-1 btn-sm" href="' +
          escapeHtml(talk.videoUrl) +
          '" target="_blank" rel="noopener">Video</a>'
      );
    }

    var titleHtml = escapeHtml(talk.title);
    if (talk.talkUrl) {
      titleHtml =
        '<a href="' +
        escapeHtml(talk.talkUrl) +
        '" itemprop="url" target="_blank" rel="noopener">' +
        escapeHtml(talk.title) +
        '</a>';
    }

    return [
      '<div class="media stream-item view-compact">',
      '  <div class="media-body">',
      '    <div class="section-subheading article-title mb-0 mt-0">',
      '      ' + titleHtml,
      "    </div>",
      descriptionHtml,
      '    <div class="stream-meta article-metadata">',
      "      <div>",
      '        <span itemprop="startDate">' + escapeHtml(formatTalkDate(talk)) + "</span>",
      '        <span class="middot-divider"></span>',
      '        <span itemprop="location">' + escapeHtml(talk.location) + "</span>",
      "      </div>",
      "    </div>",
      '    <div class="btn-links">' + buttons.join("\n") + "</div>",
      "  </div>",
      '  <div class="ml-3"></div>',
      "</div>"
    ]
      .filter(Boolean)
      .join("\n");
  }

  function renderTalksInElement(elementId, talks) {
    var container = document.getElementById(elementId);
    if (!container) {
      return;
    }

    if (!Array.isArray(window.TALKS) || window.TALKS.length === 0) {
      container.innerHTML = "<p>No talks available yet.</p>";
      return;
    }

    container.innerHTML = talks.map(renderTalkCard).join("\n");
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!Array.isArray(window.TALKS) || window.TALKS.length === 0) {
      renderTalksInElement("talks-preview", []);
      renderTalksInElement("talks-list", []);
      return;
    }

    var now = new Date();
    var futureTalks = window.TALKS
      .filter(function (talk) {
        return parseTalkDate(talk).getTime() >= now.getTime();
      })
      .sort(byDateAsc);
    var pastTalks = window.TALKS
      .filter(function (talk) {
        return parseTalkDate(talk).getTime() < now.getTime();
      })
      .sort(byDateDesc);

    var previewTalks = futureTalks.slice(0, 2).concat(pastTalks.slice(0, 1));

    // Fallback: if one side is missing, fill from remaining talks closest to now.
    if (previewTalks.length < 3) {
      var remainingTalks = window.TALKS.filter(function (talk) {
        return previewTalks.indexOf(talk) === -1;
      });
      var fillers = remainingTalks.sort(byClosestToNow).slice(0, 3 - previewTalks.length);
      previewTalks = previewTalks.concat(fillers);
    }

    renderTalksInElement("talks-preview", previewTalks);

    var allTalks = window.TALKS.slice().sort(byDateDesc);
    renderTalksInElement("talks-list", allTalks);
  });
})();
