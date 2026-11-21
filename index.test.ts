import {
  assert,
  assertEquals,
  assertFalse,
  assertStrictEquals,
} from "@std/assert";

import {is, escape, unescape} from "./index.ts";



//#region is()
Deno.test("is() - returns true for RegExp instances", () => {
  assert(is(/abc/));
  assert(is(new RegExp("abc")));
  assert(is(/abc/gi));
  assert(is(new RegExp("a", "gimsuy")));
  assert(is(RegExp("")));
});

Deno.test("is() - returns false for non-RegExp values", () => {
  assertFalse(is(undefined));
  assertFalse(is(null));
  assertFalse(is(""));
  assertFalse(is("/abc/"));
  assertFalse(is(0));
  assertFalse(is(1));
  assertFalse(is(NaN));
  assertFalse(is(true));
  assertFalse(is(false));
  assertFalse(is({}));
  assertFalse(is([]));
  assertFalse(is([/abc/]));
  assertFalse(is(() => /abc/));
  assertFalse(is(Symbol("regexp")));
  assertFalse(is(10n));
});

Deno.test("is() - distinguishes cross-realm-like objects (duck-typed but not real RegExp)", () => {
  const fake = {source: "abc", flags: "g", test: () => true};
  assertFalse(is(fake));
});
//#endregion




//#region escape()
Deno.test("escape() - returns empty string unchanged", () => {
  assertEquals(escape(""), "");
});

Deno.test("escape() - returns plain alphanumeric string unchanged", () => {
  assertEquals(escape("abc123"), "abc123");
  assertEquals(escape("HelloWorld"), "HelloWorld");
});

Deno.test("escape() - escapes all special RegExp characters", () => {
  assertEquals(escape("-"), "\\-");
  assertEquals(escape("/"), "\\/");
  assertEquals(escape("\\"), "\\\\");
  assertEquals(escape("^"), "\\^");
  assertEquals(escape("$"), "\\$");
  assertEquals(escape("*"), "\\*");
  assertEquals(escape("+"), "\\+");
  assertEquals(escape("?"), "\\?");
  assertEquals(escape("."), "\\.");
  assertEquals(escape("("), "\\(");
  assertEquals(escape(")"), "\\)");
  assertEquals(escape("|"), "\\|");
  assertEquals(escape("{"), "\\{");
  assertEquals(escape("}"), "\\}");
  assertEquals(escape("["), "\\[");
  assertEquals(escape("]"), "\\]");
});

Deno.test("escape() - escapes a full regex-like string", () => {
  assertEquals(
    escape("a.b*c+d?e"),
    "a\\.b\\*c\\+d\\?e",
  );
  assertEquals(
    escape("[abc]+(def){2}|x^y$z"),
    "\\[abc\\]\\+\\(def\\)\\{2\\}\\|x\\^y\\$z",
  );
  assertEquals(escape("a-b/c\\d"), "a\\-b\\/c\\\\d");
});

Deno.test("escape() - escaped output is usable as a literal regex", () => {
  const literal = "1 + 1 = 2? [yes] (maybe) .*";
  const re = new RegExp(`^${escape(literal)}$`);
  assert(re.test(literal));
  assertFalse(re.test(literal + "extra"));
  assertFalse(re.test("1 + 1 = 2? [yes] (maybe) xyz"));
});

Deno.test("escape() - leaves Unicode / non-ASCII alone", () => {
  assertEquals(escape("héllo wörld"), "héllo wörld");
  assertEquals(escape("你好"), "你好");
  assertEquals(escape("🔥.*"), "🔥\\.\\*");
});
//#endregion




//#region unescape()
Deno.test("unescape() - empty and plain strings unchanged", () => {
  assertEquals(unescape(""), "");
  assertEquals(unescape("abc"), "abc");
  assertEquals(unescape("hello world"), "hello world");
});

Deno.test("unescape() - standard control character escapes", () => {
  assertEquals(unescape("\\0"), "\0");
  assertEquals(unescape("\\b"), "\b");
  assertEquals(unescape("\\f"), "\f");
  assertEquals(unescape("\\n"), "\n");
  assertEquals(unescape("\\r"), "\r");
  assertEquals(unescape("\\t"), "\t");
  assertEquals(unescape("\\v"), "\v");
});

Deno.test("unescape() - unknown single-char escapes fall back to the char", () => {
  assertEquals(unescape("\\a"), "a");
  assertEquals(unescape("\\z"), "z");
  assertEquals(unescape("\\."), ".");
  assertEquals(unescape("\\*"), "*");
  assertEquals(unescape("\\/"), "/");
  assertEquals(unescape("\\\\"), "\\");
});

Deno.test("unescape() - hex escapes (\\xHH)", () => {
  assertEquals(unescape("\\x41"), "A");
  assertEquals(unescape("\\x00"), "\x00");
  assertEquals(unescape("\\x7a"), "z");
  assertEquals(unescape("\\xff"), "ÿ");
  assertEquals(unescape("a\\x41b"), "aAb");
});

Deno.test("unescape() - unicode escapes (\\uHHHH)", () => {
  assertEquals(unescape("\\u0041"), "A");
  assertEquals(unescape("\\u00e9"), "é");
  assertEquals(unescape("\\u4f60\\u597d"), "你好");
  assertEquals(unescape("\\uD83D\\uDD25"), "🔥"); // surrogate pair
});

Deno.test("unescape() - unicode code point escapes (\\u{...})", () => {
  assertEquals(unescape("\\u{41}"), "A");
  assertEquals(unescape("\\u{1F525}"), "🔥");
  assertEquals(unescape("\\u{1f600}"), "😀");
  assertEquals(unescape("\\u{10FFFF}"), "\u{10FFFF}");
});

Deno.test("unescape() - octal escapes", () => {
  assertEquals(unescape("\\101"), "A"); // 0o101 = 65 = 'A'
  assertEquals(unescape("\\0"), "\0");
  assertEquals(unescape("\\12"), "\n"); // 0o12 = 10
  assertEquals(unescape("\\7"), "\x07");
  assertEquals(unescape("\\777"), String.fromCodePoint(0o777));
});

Deno.test("unescape() - mixed escapes in one string", () => {
  assertEquals(
    unescape("a\\tb\\nc\\x41\\u0042\\u{43}"),
    "a\tb\ncABC",
  );
  assertEquals(
    unescape("line1\\nline2\\ttabbed"),
    "line1\nline2\ttabbed",
  );
});

Deno.test("unescape() - trailing backslash", () => {
  // "\\" (single backslash) with nothing to escape => falls into chr group as "\\"?
  // RUNESCAPE requires a following char; a lone backslash at end is untouched.
  assertEquals(unescape("\\"), "\\");
  assertEquals(unescape("abc\\"), "abc\\");
});

Deno.test("unescape() - multiple escape sequences", () => {
  assertEquals(
    unescape("\\x41\\x42\\x43"),
    "ABC",
  );
  assertEquals(
    unescape("\\u0048\\u0065\\u006c\\u006c\\u006f"),
    "Hello",
  );
});

Deno.test("unescape() - does not touch non-escape content", () => {
  assertEquals(unescape("hello.world"), "hello.world");
  assertEquals(unescape("a+b*c?"), "a+b*c?");
  assertEquals(unescape("[abc]"), "[abc]");
  assertEquals(unescape("{1,2}"), "{1,2}");
});

Deno.test("unescape() - uppercase and lowercase hex digits", () => {
  assertEquals(unescape("\\x4A"), "J");
  assertEquals(unescape("\\x4a"), "J");
  assertEquals(unescape("\\u00E9"), "é");
  assertEquals(unescape("\\u00e9"), "é");
  assertEquals(unescape("\\u{1F600}"), "😀");
  assertEquals(unescape("\\u{1f600}"), "😀");
});
//#endregion




//#region Round-trip sanity
Deno.test("round-trip: escape -> RegExp -> match original string", () => {
  const samples = [
    "hello.world",
    "a+b*c?",
    "(parens) [brackets] {braces}",
    "path/to/file",
    "back\\slash",
    "caret^dollar$",
    "pipes|everywhere",
    "user@example.com",
    "1 + 1 = 2?",
  ];

  for (const s of samples) {
    const re = new RegExp(`^${escape(s)}$`);
    assertStrictEquals(re.test(s), true, `failed for: ${JSON.stringify(s)}`);
  }
});

Deno.test("round-trip: unescape(escape-of-escaped) style sanity", () => {
  // escape() wraps special chars, unescape() removes backslashes
  assertEquals(unescape(escape("a.b")), "a.b");
  assertEquals(unescape(escape("[x]")), "[x]");
  // Note: unescape(escape("\\")) === unescape("\\\\") === "\\" (a single backslash is preserved as-is)
  assertEquals(unescape(escape("\\")), "\\");
});
//#endregion
