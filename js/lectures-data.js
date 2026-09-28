// Lectures and lecture courses, rendered into the Teaching section by js/teaching.js.
// Shown newest first (sorted by `date`, so order here does not matter).
// Fields:
//   title      – display title (required)
//   date       – "YYYY-MM", used for sorting and shown as e.g. "Sep 2026" (required)
//   dateLabel  – optional text shown instead of the formatted date, e.g. "Winter term 2023/24"
//   where      – optional venue / event, shown after the date
//   url        – optional link on the title (event or course page)
//   links      – optional buttons, e.g. [{ label: "Lecture 1", url: "assets/talks/foo.pdf" }]

window.LECTURES = [
  {
    title: "Gravitational waves from first-order phase transitions",
    date:  "2026-09",
    where: "MPA Retreat 2026, Castle Ebernburg, Bad Kreuznach",
    url:   "https://indico.mitp.uni-mainz.de/event/468/",
    links: [
      { label: "Lecture 1", url: "assets/talks/mpa26_lec1.pdf" },
      { label: "Lecture 2", url: "assets/talks/mpa26_lec2.pdf" },
      { label: "Lecture 3", url: "assets/talks/mpa26_lec3.pdf" }
    ]
  },
  {
    title: "Bubble wall velocities in cosmological phase transitions",
    date:  "2025-02",
    where: "Yonsei-Konkuk-Sogang mini-workshop on first-order phase transitions, Seoul"
  },
  {
    title:     "Theoretische Physik 1: Mathematische Ergänzungen",
    date:      "2023-10",
    dateLabel: "Winter term 2023/24",
    where:     "Goethe University Frankfurt",
    url:       "https://qis.server.uni-frankfurt.de/qisserver/rds?state=verpublish&status=init&vmfile=no&moduleCall=webInfo&publishConfFile=webInfo&publishSubDir=veranstaltung&veranstaltung.veranstid=360363",
    links: [
      { label: "Skript", url: "lectures/metp1.pdf" }
    ]
  },
  {
    title: "Phase transitions in the early universe (exercises)",
    date:  "2022-03",
    where: "Theoretical Aspects of Astroparticle Physics, Cosmology and Gravitation school, Galileo Galilei Institute, Florence",
    url:   "https://agenda.infn.it/event/28760/"
  }
];
