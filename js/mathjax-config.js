// MathJax 2 configuration. Must load before MathJax.js.
// Renders $…$ and \(…\) inline, $$…$$ and \[…\] as display math
// (INSPIRE titles use e.g. "ℝ$^{3}$ × S$^{1}$").
window.MathJax = {
  CommonHTML: { linebreaks: { automatic: true } },
  tex2jax: { inlineMath: [ ['$', '$'], ['\\(','\\)'] ],
  displayMath: [ ['$$','$$'], ['\\[', '\\]'] ], processEscapes: false },
  TeX: { noUndefined: { attributes: { mathcolor: 'red', mathbackground: '#FFEEEE', mathsize: '90%' } } },
  messageStyle: 'none'
};
