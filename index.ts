/**
 * Check if value is regexp.
 * @param v a value
 */
export function is(v: unknown): boolean {
  return v instanceof RegExp;
}


/**
 * Escape string for use in RegExp.
 * @param str a string
 */
export function escape(str: string): string {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}




//#region UNESCAPE
/** RegExp for unescape string. */
const RUNESCAPE = /\\(u\{([0-9A-Fa-f]+)\}|u([0-9A-Fa-f]{4})|x([0-9A-Fa-f]{2})|([1-7][0-7]{0,2}|[0-7]{2,3})|(.))/g;

/** Map for escape characters. */
const ESCCHAR = new Map([
  ['0', '\0'],
  ['b', '\b'],
  ['f', '\f'],
  ['n', '\n'],
  ['r', '\r'],
  ['t', '\t'],
  ['v', '\v']
]);


/** Unescape string by regexp. */
function unescapeBy(_m: string, _p1: string, hex: string, hex4: string, hex2: string, oct: string, chr: string): string {
  if(chr!=null) return ESCCHAR.get(chr)||chr;
  if(oct!=null) return String.fromCodePoint(parseInt(oct, 8));
  return String.fromCodePoint(parseInt(hex||hex4||hex2, 16));
}


/**
 * Unescape regexp string for readability.
 * @param str a string
 */
export function unescape(str: string): string {
  return str.replace(RUNESCAPE, unescapeBy);
}
//#endregion
