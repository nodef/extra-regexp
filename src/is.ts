/**
 * Checks if value is regexp.
 * @param v a value
 */
function is(v: any): boolean {
  return v instanceof RegExp;
}
export default is;
