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

function unescapeBy(m: string, p1: string, hex: string, hex4: string, hex2: string, oct: string, chr: string): string {
  if(chr!=null) return ESCCHAR.get(chr)||chr;
  if(oct!=null) return String.fromCodePoint(parseInt(oct, 8));
  return String.fromCodePoint(parseInt(hex||hex4||hex2, 16));
}

/**
 * Unescapes RegExp string for readability.
 * @param s a string
 */
function unescape(s: string): string {
  return s.replace(RUNESCAPE, unescapeBy);
}
export default unescape;
