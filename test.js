import test from 'ava'
import {CacheControl, parse, format} from '.'

function toPlainObject(cc) {
  return Object.entries(cc).reduce((o, [k, v]) => {
    o[k] = v
    return o
  }, {})
}

const DEFAULT_UNSET = {
  immutable: null,
  maxAge: null,
  maxStale: null,
  maxStaleDuration: null,
  minFresh: null,
  mustRevalidate: null,
  noCache: null,
  noStore: null,
  noTransform: null,
  onlyIfCached: null,
  private: null,
  proxyRevalidate: null,
  public: null,
  sharedMaxAge: null
}

const DEFAULT_EMPTY = {
  immutable: false,
  maxAge: null,
  maxStale: false,
  maxStaleDuration: null,
  minFresh: null,
  mustRevalidate: false,
  noCache: false,
  noStore: false,
  noTransform: false,
  onlyIfCached: false,
  private: false,
  proxyRevalidate: false,
  public: false,
  sharedMaxAge: null
}

test('default object properties should all be null', t => {
  const cc = new CacheControl()

  t.deepEqual(toPlainObject(cc), DEFAULT_UNSET)
})

test('parse: unset header value should return a default instance', t => {
  const cc = parse()

  t.deepEqual(toPlainObject(cc), DEFAULT_UNSET)
})

test('parse: empty header value should return a default instance', t => {
  const cc = parse('')

  t.deepEqual(toPlainObject(cc), DEFAULT_UNSET)
})

test('parse: invalid header value should not enable anything', t => {
  const cc = parse('∂')

  t.deepEqual(toPlainObject(cc), DEFAULT_EMPTY)
})

test('parse: unknown properties should be ignored', t => {
  const cc = parse('random-stuff=1244, hello')

  t.deepEqual(toPlainObject(cc), DEFAULT_EMPTY)
})

test('parse: durations should be parsed', t => {
  const cc = parse('max-age=4242')

  t.deepEqual(toPlainObject(cc), {
    ...DEFAULT_EMPTY,
    maxAge: 4242
  })
})

test('parse: booleans with values should be ignored', t => {
  const cc = parse('immutable=true')

  t.deepEqual(toPlainObject(cc), DEFAULT_EMPTY)
})

test('parse: booleans without values should be parsed', t => {
  const cc = parse('immutable')

  t.deepEqual(toPlainObject(cc), {
    ...DEFAULT_EMPTY,
    immutable: true
  })
})

test('parse: max-stale should work without a duration', t => {
  const cc = parse('max-stale')

  t.deepEqual(toPlainObject(cc), {
    ...DEFAULT_EMPTY,
    maxStale: true
  })
})

test('parse: max-stale should work with a duration', t => {
  const cc = parse('max-stale=24')

  t.deepEqual(toPlainObject(cc), {
    ...DEFAULT_EMPTY,
    maxStale: true,
    maxStaleDuration: 24
  })
})

test('parse: max-stale should ignore invalid values', t => {
  const cc = parse('max-stale=what')

  t.deepEqual(toPlainObject(cc), DEFAULT_EMPTY)
})

test('parse: should parse common headers (1)', t => {
  const cc = parse('no-cache, no-store, must-revalidate')

  t.deepEqual(toPlainObject(cc), {
    ...DEFAULT_EMPTY,
    noCache: true,
    noStore: true,
    mustRevalidate: true
  })
})

test('parse: should parse common headers (2)', t => {
  const cc = parse('public, max-age=31536000')

  t.deepEqual(toPlainObject(cc), {
    ...DEFAULT_EMPTY,
    public: true,
    maxAge: 31536000
  })
})

test('format: empty CacheControl should return an empty string', t => {
  const cc = format({})

  t.is(cc, '')
})

test('format: empty defaults should return an empty string', t => {
  const cc = format(DEFAULT_EMPTY)

  t.is(cc, '')
})

test('format: default CacheControl instance should return an empty string', t => {
  const cc = format(new CacheControl())

  t.is(cc, '')
})

test('format: should format durations', t => {
  const cc = format({
    maxAge: 4242,
    sharedMaxAge: 4343,
    minFresh: 4444
  })

  t.is(cc, 'max-age=4242, s-max-age=4343, min-fresh=4444')
})

test('format: should format booleans', t => {
  const cc = format({
    maxStale: true,
    immutable: true,
    mustRevalidate: true,
    noCache: true,
    noStore: true,
    noTransform: true,
    onlyIfCached: true,
    private: true,
    proxyRevalidate: true,
    public: true
  })

  t.is(cc, 'max-stale, immutable, must-revalidate, no-cache, no-store, no-transform, only-if-cached, private, proxy-revalidate, public')
})

test('format: max-stale duration should not be included if maxStale is not true', t => {
  const cc = format({
    maxStaleDuration: 4242
  })

  t.is(cc, '')
})

test('format: max-stale duration should be included if maxStale is true', t => {
  const cc = format({
    maxStale: true,
    maxStaleDuration: 4242
  })

  t.is(cc, 'max-stale=4242')
})
