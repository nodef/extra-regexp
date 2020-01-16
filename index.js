/**
 * Escapes string for use in RegExp.
 * @param {string} str string to escape
 * @returns {string} escaped string
 */
function escape(str) {
  return str.replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
};
RegExp.escape = escape;
module.exports = RegExp;
