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

  // A talk reads as "<type> <connector> <event>, <location>", dropping whichever
  // parts are absent. Kept in one place so the CV generator can compose the same
  // sentence from the same fields.
  function describeTalk(talk) {
    var text = talk.type || "";
    var connector = talk.connector || "at";
    if (talk.event) {
      text += " " + connector + " " + talk.event;
      if (talk.location) {
        text += ", " + talk.location;
      }
    } else if (talk.location) {
      text += " " + connector + " " + talk.location;
    }
    return text;
  }

  function renderTalkCard(talk) {
    var buttons = [
      { label: "PDF", url: talk.pdfUrl },
      { label: "Slides", url: talk.slidesUrl },
      { label: "Video", url: talk.videoUrl }
    ].filter(function (button) {
      return button.url;
    });

    return window.Site.streamItem({
      title: talk.title,
      url: talk.talkUrl,
      description: talk.description,
      meta: [formatTalkDate(talk), describeTalk(talk)],
      buttons: buttons,
      small: true
    });
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

  // Fill <span data-talks-given="Conference,Workshop"> with how many talks in
  // those categories have already been given. Upcoming talks are excluded, so
  // the counts match the CV, which only lists talks already delivered.
  function renderGivenCounts(pastTalks) {
    var spans = document.querySelectorAll("[data-talks-given]");
    Array.prototype.forEach.call(spans, function (span) {
      var wanted = span.getAttribute("data-talks-given").split(",").map(function (name) {
        return name.trim();
      });
      span.textContent = String(pastTalks.filter(function (talk) {
        return wanted.indexOf(talk.category) !== -1;
      }).length);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!Array.isArray(window.TALKS) || window.TALKS.length === 0) {
      renderTalksInElement("talks-preview", []);
      renderTalksInElement("talks-list", []);
      renderGivenCounts([]);
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

    renderGivenCounts(pastTalks);

    var previewTalks = futureTalks.slice(0, 2).sort(byDateDesc).concat(pastTalks.slice(0, 1));

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
