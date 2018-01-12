# cachecontrol

[![npm version](https://img.shields.io/npm/v/cachecontrol.svg)](https://www.npmjs.com/package/cachecontrol)
[![dependencies Status](https://david-dm.org/tusbar/cachecontrol/status.svg)](https://david-dm.org/tusbar/cachecontrol)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

> Format and parse HTTP Cache-Control header

## API

This library exposes a `CacheControl` class and two shortcut methods: `parse()` and `format()`.

### parse(header)

`parse()` takes `Cache-Control` HTTP header value and returns a `CacheControl` instance.

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
  noCache: false,
  noStore: false,
  noTransform: false,
  onlyIfCached: false,
  private: false,
  proxyRevalidate: false,
  public: true }
```

### format(cacheControl)

`format()` takes a `CacheControl` instance (or similar object) and returns a `Cache-Control` HTTP header value.

For example, `format({maxAge: 31536000, public: true})` will return

```js
max-age=31536000, public
```

## License

MIT
