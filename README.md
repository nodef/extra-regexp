A [regular expression] defines a pattern for matching text.

▌
📦 [JSR](https://jsr.io/@nodef/extra-regexp),
📦 [NPM](https://www.npmjs.com/package/@nodef/extra-regexp),
📰 [Docs](https://jsr.io/@nodef/extra-regexp/doc).

This package is a **single flat module** that adds a few small helpers on top
of JavaScript's built-in `RegExp`. Following the convention used across the
`@nodef/*` packages, **asynchronous functions have a bare name** and
**synchronous functions carry a `Sync` suffix**. None of the functions here are
asynchronous, so all names are bare.

The additions are:

- **Type check**: [`is()] — a safe `instanceof RegExp` check that also works
  across realms (it uses the standard `RegExp` constructor from the current
  realm, so a fake object does not pass).
- **Escaping**: [`escape()`] — escape a string so it can be embedded *literally*
  inside a `RegExp` (for example, between `^` and `$`).
- **Unescaping**: [`unescape()`] — turn backslash escapes in a regex source
  string back into the characters they represent, for human-readable output.

[`is()]: #is
[`escape()`]: #escape
[`unescape()`]: #unescape


<br>

```ts
import * as rx from "jsr:@nodef/extra-regexp";


// 1. Check if a value is a RegExp.
rx.is(/abc/);                 // → true
rx.is("/abc/");               // → false
rx.is(new RegExp("abc"));     // → true


// 2. Escape a string for literal use in a RegExp.
const literal = "1 + 1 = 2? [yes] (maybe) .*";
const re = new RegExp(`^${rx.escape(literal)}$`);
re.test(literal);             // → true
re.test(literal + "extra");   // → false


// 3. Unescape a regex source string for readability.
rx.unescape("\\u0048\\u0065\\u006c\\u006c\\u006f");
// → "Hello"

rx.unescape("a\\tb\\nc\\x41");
// → "a\tb\ncA"
```

Run with `deno run example.ts`.

<br>
<br>


## Index

### Added by this package

| Property | Description |
|  ----  |  ----  |
| [is] | Check if a value is a `RegExp`. |
| [escape] | Escape a string for literal use inside a `RegExp`. |
| [unescape] | Unescape a regex source string back into plain characters. |

### Re-exported from JavaScript's `RegExp`

This package does **not** wrap or re-export `RegExp` itself. Use the built-in
constructor directly for matching, testing, and flag handling, for example:

| Property | Description |
|  ----  |  ----  |
| [`RegExp`] | Constructor for regular expressions. |
| [`RegExp.prototype.test`] | Test whether a string matches. |
| [`RegExp.prototype.exec`] | Execute a search and return the match array. |
| [`String.prototype.match`] | Match a string against a regex. |
| [`String.prototype.matchAll`] | Iterate over all matches. |
| [`String.prototype.replace`] | Replace matches in a string. |
| [`String.prototype.split`] | Split a string by a regex. |

See [MDN's `RegExp` docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp)
for the complete list.

[`RegExp`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
[`RegExp.prototype.test`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test
[`RegExp.prototype.exec`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
[`String.prototype.match`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match
[`String.prototype.matchAll`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll
[`String.prototype.replace`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
[`String.prototype.split`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split

<br>
<br>


## Reference

### is

```ts
function is(v: unknown): boolean;
```

Checks whether `v` is a `RegExp`. This is equivalent to
`v instanceof RegExp`, and returns `false` for primitives (`null`, `undefined`,
numbers, strings, booleans, symbols, bigints), plain objects, arrays, and
functions.

> Because `instanceof` uses the `RegExp` constructor of the current realm,
> a `RegExp` created in a *different* realm (such as an iframe or a `vm`
> context) will **not** be recognized. Duck-typed objects (e.g.
> `{source, flags, test}`) are also rejected.

### escape

```ts
function escape(str: string): string;
```

Escapes every character that has a special meaning inside a regular expression
pattern, so the result can be used to match `str` **literally**. The set of
escaped characters is:

```
-  /  \  ^  $  *  +  ?  .  (  )  |  {  }  [  ]
```

This is the same character class used by many polyfills of the proposed
[`RegExp.escape`](https://github.com/tc39/proposal-regex-escaping) (with the
addition of `-`, which is special inside character classes).

```ts
escape("a.b*c");      // → "a\\.b\\*c"
escape("[abc]+");     // → "\\[abc\\]\\+"
escape("hello");      // → "hello"      (no special chars)
```

### unescape

```ts
function unescape(str: string): string;
```

Turns backslash escapes in a *regex source* string back into the characters
they represent, for display or debugging. Supported escape forms:

| Form | Meaning | Example |
|  ----  |  ----  |  ----  |
| `\0 \b \f \n \r \t \v` | Control-character escapes | `"\n"` → `"\n"` |
| `\xHH` | 2-digit hexadecimal (1 byte) | `"\x41"` → `"A"` |
| `\uHHHH` | 4-digit Unicode escape | `"\u0041"` → `"A"` |
| `\u{H…}` | Unicode code point (ES2015) | `"\u{1F525}"` → `"🔥"` |
| `\ooo` | Octal (1–3 digits, first `0–7`) | `"\101"` → `"A"` |
| `\c` | Any other single character | `"\."` → `"."` |

Surrogate pairs written as `\uD83D\uDD25` are **not** combined by this function;
each escape is converted independently. Use the `\u{…}` form if you want a
single code point back.

```ts
unescape("line1\\nline2");           // → "line1\nline2"
unescape("\\x41\\x42\\x43");         // → "ABC"
unescape("\\u4f60\\u597d");          // → "你好"
unescape("\\u{1F600}");              // → "😀"
```

> A **lone trailing backslash** (`"abc\\"`) is left untouched, because the
> internal pattern requires a character after the backslash.

<br>
<br>


## Story

A **regular expression** is a *pattern* that describes a *set of strings*. In
JavaScript it is represented by the built-in [`RegExp`] object, which can be
created from a *literal* (`/ab+c/`) or from a *source string* (`new RegExp("ab+c")`).
The **source** of a regex is the text between the delimiters — the *pattern* —
and its **flags** (`g`, `i`, `m`, `s`, `u`, `y`, `d`) modify how matching
behaves. A regex is *applied* to a string with [`test()`] (boolean result) or
[`exec()`] (a match array, with named groups and the match `index`), and is
used implicitly by [`String.prototype.match`], [`matchAll`], [`replace`], and
[`split`].

Most characters in a pattern match themselves, but a small set is **special**:
`.` matches any character (except a line terminator, unless the `s` flag is
set); `*` `+` `?` `{n,m}` quantify the preceding atom; `^` and `$` anchor to
the start and end of the input (or of a line, with `m`); `|` is alternation;
`(...)` groups and captures; `[...]` is a character class; `\` escapes the
next character. When you want to match *these characters literally* — for
instance, when embedding a user-supplied string in a pattern — every one of
them must be **escaped** with a backslash. That is exactly what
[`escape()`] does.

The inverse operation, **unescaping**, is useful when *displaying* a regex to a
human. A source string like `\u0048\u0065\u006c\u006c\u006f\s+world` is not
easy to read; [`unescape()`] rewrites it to `Hello\s+world`, preserving the
`\s` class while converting the redundant Unicode escapes. It supports `\xHH`,
`\uHHHH`, `\u{…}`, octal escapes, and control-character escapes (`\n`, `\t`,
`\b`, …), and falls back to the literal character for any other `\c` pair.

Finally, [`is()] is a tiny but recurring utility: `value instanceof RegExp` is
the idiomatic way to detect a regex, and this package wraps it under a short
name so that it can be used in conditions without importing `RegExp` explicitly.
It is deliberately *not* a duck-typed check — objects that merely look like a
regex (with `source`, `flags`, and `test`) do not pass.

<br>
<br>


## See also

- [MDN: `RegExp`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp)
- [MDN: Regular expressions guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions)
- [TC39 proposal: `RegExp.escape`](https://github.com/tc39/proposal-regex-escaping)
- [`regex` (npm)](https://www.npmjs.com/package/regex) — the reverse: *build* a regex from a string
- [`regexp-tree` (npm)](https://www.npmjs.com/package/regexp-tree) — parse and transform regex ASTs
- [`regjsparser` (npm)](https://www.npmjs.com/package/regjsparser) — ECMAScript regex parser
- [`regenerate` (npm)](https://www.npmjs.com/package/regenerate) — generate strings matched by a regex
- [`randexp` (npm)](https://www.npmjs.com/package/randexp) — random string from a regex
- [RegExr](https://regexr.com) — online regex tester

<br>
<br>

[![](https://raw.githubusercontent.com/qb40/designs/gh-pages/0/image/11.png)](https://wolfram77.github.io)<br>
[![ORG](https://img.shields.io/badge/org-nodef-green?logo=Org)](https://nodef.github.io)
![](https://ga-beacon.deno.dev/G-RC63DPBH3P:SH3Eq-NoQ9mwgYeHWxu7cw/github.com/nodef/extra-regexp)


[is]: #is
[escape]: #escape
[unescape]: #unescape
[`RegExp`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
[`test()`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test
[`exec()`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
[`String.prototype.match`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match
[`matchAll`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll
[`replace`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
[`split`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split
[regular expression]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
