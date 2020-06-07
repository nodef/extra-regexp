/**
 * Escapes string for use in RegExp.
 * @param s a string
 */
function escape(s: string): string {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
export default escape;
