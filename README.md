# cache-control

[![npm version](https://img.shields.io/npm/v/@tusbar/cache-control)](https://www.npmjs.com/package/@tusbar/cache-control)
[![codecov](https://codecov.io/gh/tusbar/cache-control/graph/badge.svg?token=O8MvGFz46p)](https://codecov.io/gh/tusbar/cache-control)
[![XO code style](https://img.shields.io/badge/code_style-xo-cyan)](https://github.com/xojs/xo)

Format and parse HTTP Cache-Control header.

Supports all 16 [IANA-registered Cache-Control directives](https://www.iana.org/assignments/http-cache-directives/) as defined in:

- [RFC 9111](https://httpwg.org/specs/rfc9111.html) — HTTP Caching
- [RFC 8246](https://httpwg.org/specs/rfc8246.html) — HTTP Immutable Responses
- [RFC 5861](https://httpwg.org/specs/rfc5861.html) — HTTP Cache-Control Extensions for Stale Content

## CI

[![Tests](https://github.com/tusbar/cache-control/actions/workflows/tests.yml/badge.svg)](https://github.com/tusbar/cache-control/actions/workflows/tests.yml)
[![Release](https://github.com/tusbar/cache-control/actions/workflows/release.yml/badge.svg)](https://github.com/tusbar/cache-control/actions/workflows/release.yml)

## Getting started

```bash
$ npm install @tusbar/cache-control
```

## API

This library exposes a `CacheControl` class and two shortcut methods: `parse()` and `format()`.

### `parse(header)`

```js
import { parse } from "@tusbar/cache-control";
```

`parse()` takes a `Cache-Control` HTTP header value and returns a `CacheControl` instance.

For example, `parse('max-age=31536000, public')` will return

```js
CacheControl {
  maxAge: 31536000,
  sharedMaxAge: null,
  maxStale: false,
  maxStaleDuration: null,
  minFresh: null,
  immutable: false,
  mustRevalidate: false,
  mustUnderstand: false,
  noCache: false,
  noCacheFields: null,
  noStore: false,
  noTransform: false,
  onlyIfCached: false,
  private: false,
  privateFields: null,
  proxyRevalidate: false,
  public: true,
  staleIfError: null,
  staleWhileRevalidate: null }
```

### `format(cacheControl)`

```js
import { format } from "@tusbar/cache-control";
```

`format()` takes a `CacheControl` instance (or similar object) and returns a `Cache-Control` HTTP header value.

For example, `format({maxAge: 31536000, public: true})` will return

```
max-age=31536000, public
```

## Example usage

```js
import { format } from "@tusbar/cache-control";

res.setHeader(
  "Cache-Control",
  format({
    public: true,
    immutable: true,
  }),
);
```

## Supported directives

### Request directives

| Property           | Directive        | Type              | Reference                                                                                         |
| ------------------ | ---------------- | ----------------- | ------------------------------------------------------------------------------------------------- |
| `maxAge`           | `max-age`        | `number \| null`  | [RFC 9111 §5.2.1.1](https://httpwg.org/specs/rfc9111.html#cache-request-directive.max-age)        |
| `maxStale`         | `max-stale`      | `boolean \| null` | [RFC 9111 §5.2.1.2](https://httpwg.org/specs/rfc9111.html#cache-request-directive.max-stale)      |
| `maxStaleDuration` | `max-stale`      | `number \| null`  | [RFC 9111 §5.2.1.2](https://httpwg.org/specs/rfc9111.html#cache-request-directive.max-stale)      |
| `minFresh`         | `min-fresh`      | `number \| null`  | [RFC 9111 §5.2.1.3](https://httpwg.org/specs/rfc9111.html#cache-request-directive.min-fresh)      |
| `noCache`          | `no-cache`       | `boolean \| null` | [RFC 9111 §5.2.1.4](https://httpwg.org/specs/rfc9111.html#cache-request-directive.no-cache)       |
| `noStore`          | `no-store`       | `boolean \| null` | [RFC 9111 §5.2.1.5](https://httpwg.org/specs/rfc9111.html#cache-request-directive.no-store)       |
| `noTransform`      | `no-transform`   | `boolean \| null` | [RFC 9111 §5.2.1.6](https://httpwg.org/specs/rfc9111.html#cache-request-directive.no-transform)   |
| `onlyIfCached`     | `only-if-cached` | `boolean \| null` | [RFC 9111 §5.2.1.7](https://httpwg.org/specs/rfc9111.html#cache-request-directive.only-if-cached) |
| `staleIfError`     | `stale-if-error` | `number \| null`  | [RFC 5861 §4](https://httpwg.org/specs/rfc5861.html#stale-if-error)                               |

### Response directives

| Property               | Directive                | Type               | Reference                                                                                            |
| ---------------------- | ------------------------ | ------------------ | ---------------------------------------------------------------------------------------------------- |
| `maxAge`               | `max-age`                | `number \| null`   | [RFC 9111 §5.2.2.1](https://httpwg.org/specs/rfc9111.html#cache-response-directive.max-age)          |
| `mustRevalidate`       | `must-revalidate`        | `boolean \| null`  | [RFC 9111 §5.2.2.2](https://httpwg.org/specs/rfc9111.html#cache-response-directive.must-revalidate)  |
| `mustUnderstand`       | `must-understand`        | `boolean \| null`  | [RFC 9111 §5.2.2.3](https://httpwg.org/specs/rfc9111.html#cache-response-directive.must-understand)  |
| `noCache`              | `no-cache`               | `boolean \| null`  | [RFC 9111 §5.2.2.4](https://httpwg.org/specs/rfc9111.html#cache-response-directive.no-cache)         |
| `noCacheFields`        | `no-cache`               | `string[] \| null` | [RFC 9111 §5.2.2.4](https://httpwg.org/specs/rfc9111.html#cache-response-directive.no-cache)         |
| `noStore`              | `no-store`               | `boolean \| null`  | [RFC 9111 §5.2.2.5](https://httpwg.org/specs/rfc9111.html#cache-response-directive.no-store)         |
| `noTransform`          | `no-transform`           | `boolean \| null`  | [RFC 9111 §5.2.2.6](https://httpwg.org/specs/rfc9111.html#cache-response-directive.no-transform)     |
| `private`              | `private`                | `boolean \| null`  | [RFC 9111 §5.2.2.7](https://httpwg.org/specs/rfc9111.html#cache-response-directive.private)          |
| `privateFields`        | `private`                | `string[] \| null` | [RFC 9111 §5.2.2.7](https://httpwg.org/specs/rfc9111.html#cache-response-directive.private)          |
| `proxyRevalidate`      | `proxy-revalidate`       | `boolean \| null`  | [RFC 9111 §5.2.2.8](https://httpwg.org/specs/rfc9111.html#cache-response-directive.proxy-revalidate) |
| `public`               | `public`                 | `boolean \| null`  | [RFC 9111 §5.2.2.9](https://httpwg.org/specs/rfc9111.html#cache-response-directive.public)           |
| `sharedMaxAge`         | `s-maxage`               | `number \| null`   | [RFC 9111 §5.2.2.10](https://httpwg.org/specs/rfc9111.html#cache-response-directive.s-maxage)        |
| `immutable`            | `immutable`              | `boolean \| null`  | [RFC 8246](https://httpwg.org/specs/rfc8246.html)                                                    |
| `staleWhileRevalidate` | `stale-while-revalidate` | `number \| null`   | [RFC 5861 §3](https://httpwg.org/specs/rfc5861.html#stale-while-revalidate)                          |
| `staleIfError`         | `stale-if-error`         | `number \| null`   | [RFC 5861 §4](https://httpwg.org/specs/rfc5861.html#stale-if-error)                                  |

### Qualified directives

The `no-cache` and `private` response directives optionally accept a list of header field names:

```js
// no-cache="Set-Cookie, Authorization"
parse('no-cache="Set-Cookie, Authorization"');
// → { noCache: true, noCacheFields: ['Set-Cookie', 'Authorization'], ... }

// private="Set-Cookie"
parse('private="Set-Cookie"');
// → { private: true, privateFields: ['Set-Cookie'], ... }
```

When formatting, field names are included when both the boolean flag and the fields array are set:

```js
format({ noCache: true, noCacheFields: ["Set-Cookie"] });
// → 'no-cache="Set-Cookie"'

format({ noCache: true });
// → 'no-cache'
```

## FAQ

**Why another cache-control library?**

None of the existing libraries focus on just parsing the `Cache-Control` headers. There are some that expose Express (or connect-like) middlewares, and some unmaintained other ones that do rudimentary parsing of the header. The idea of this module is to parse the header according to the RFCs with no further analysis or integration.

## License

MIT

## Miscellaneous

```
    ╚⊙ ⊙╝
  ╚═(███)═╝
 ╚═(███)═╝
╚═(███)═╝
 ╚═(███)═╝
  ╚═(███)═╝
   ╚═(███)═╝
```
