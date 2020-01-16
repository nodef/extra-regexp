// Global variables
const RUNESCAPE = /\\(u\{([0-9A-Fa-f]+)\}|u([0-9A-Fa-f]{4})|x([0-9A-Fa-f]{2})|([1-7][0-7]{0,2}|[0-7]{2,3})|(.))/g;
const ESCCHAR = new Map([
  ['0', '\0'],
  ['b', '\b'],
  ['f', '\f'],
  ['n', '\n'],
  ['r', '\r'],
  ['t', '\t'],
  ['v', '\v']
]);



function unescapeBy(m, p1, hex, hex4, hex2, oct, chr) {
  if(chr!=null) return ESCCHAR.get(chr)||chr;
  if(oct!=null) return String.fromCodePoint(parseInt(oct, 8));
  return String.fromCodePoint(parseInt(hex||hex4||hex2, 16));
}

/**
 * Unescapes RegExp string for readability.
 * @param {string} str string to unescape.
 * @returns {string} unescaped string
 */
function unescape(str) {
  return str.replace(RUNESCAPE, unescapeBy);
}



/**
 * Escapes string for use in RegExp.
 * @param {string} str string to escape
 * @returns {string} escaped string
 */
function escape(str) {
  return str.replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
}
RegExp.unescape = unescape;
RegExp.escape = escape;
module.exports = RegExp;
