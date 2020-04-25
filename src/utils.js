const { loadScript } = require('./constants');

exports.makeLoadScript = (modern, legacy) => `
addEventListener('DOMContentLoaded', function() {
  ${(modern.length > legacy.length ? modern : legacy).reduce((acc, _m, i) => `
${acc}$l(${modern[i] ? `"${modern[i].attributes.src}"` : undefined}, ${legacy[i] ? `"${legacy[i].attributes.src}"` : undefined})
  `, '').trim()}
})
${loadScript}
`;
