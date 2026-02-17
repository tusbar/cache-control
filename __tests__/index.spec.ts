import {CacheControl, format, parse} from '../src/index.js'

const DEFAULT_UNSET = {
  immutable: null,
  maxAge: null,
  maxStale: null,
  maxStaleDuration: null,
  minFresh: null,
  mustRevalidate: null,
  mustUnderstand: null,
  noCache: null,
  noCacheFields: null,
  noStore: null,
  noTransform: null,
  onlyIfCached: null,
  private: null,
  privateFields: null,
  proxyRevalidate: null,
  public: null,
  sharedMaxAge: null,
  staleIfError: null,
  staleWhileRevalidate: null,
}

const DEFAULT_EMPTY = {
  immutable: false,
  maxAge: null,
  maxStale: false,
  maxStaleDuration: null,
  minFresh: null,
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
  public: false,
  sharedMaxAge: null,
  staleIfError: null,
  staleWhileRevalidate: null,
}

describe('CacheControl', () => {
  it('should return default properties by default', () => {
    const cc = new CacheControl()
    expect(cc).toEqual(DEFAULT_UNSET)
  })
})

describe('parse', () => {
  it('should return a default instance for unset header value', () => {
    const cc = parse()
    expect(cc).toEqual(DEFAULT_UNSET)
  })

  it('should return a default instance for empty header value', () => {
    const cc = parse('')
    expect(cc).toEqual(DEFAULT_UNSET)
  })

  it('should not enable anything for invalid header value', () => {
    const cc = parse('∂')
    expect(cc).toEqual(DEFAULT_EMPTY)
  })

  it('should ignore unknown properties', () => {
    const cc = parse('random-stuff=1244, hello')
    expect(cc).toEqual(DEFAULT_EMPTY)
  })

  it('should parse durations', () => {
    const cc = parse('max-age=4242')
    expect(cc).toEqual({
      ...DEFAULT_EMPTY,
      maxAge: 4242,
    })
  })

  it('should ignore booleans with values', () => {
    const cc = parse('immutable=true')
    expect(cc).toEqual(DEFAULT_EMPTY)
  })

  it('should parse booleans without values', () => {
    const cc = parse('immutable')
    expect(cc).toEqual({
      ...DEFAULT_EMPTY,
      immutable: true,
    })
  })

  it('should support max-stale without a duration', () => {
    const cc = parse('max-stale')
    expect(cc).toEqual({
      ...DEFAULT_EMPTY,
      maxStale: true,
    })
  })

  it('should support max-stale with a duration', () => {
    const cc = parse('max-stale=24')
    expect(cc).toEqual({
      ...DEFAULT_EMPTY,
      maxStale: true,
      maxStaleDuration: 24,
    })
  })

  it('should ignore max-stale invalid values', () => {
    const cc = parse('max-stale=what')
    expect(cc).toEqual(DEFAULT_EMPTY)
  })

  it('should include 0 duration values', () => {
    const cc = parse(
      'max-age=0, s-maxage=0, max-stale=0, min-fresh=0, stale-while-revalidate=0, stale-if-error=0',
    )
    expect(cc).toEqual({
      ...DEFAULT_EMPTY,
      maxAge: 0,
      sharedMaxAge: 0,
      maxStale: true,
      maxStaleDuration: 0,
      minFresh: 0,
      staleWhileRevalidate: 0,
      staleIfError: 0,
    })
  })

  it('should parse must-understand', () => {
    const cc = parse('must-understand')
    expect(cc).toEqual({
      ...DEFAULT_EMPTY,
      mustUnderstand: true,
    })
  })

  it('should ignore must-understand with a value', () => {
    const cc = parse('must-understand=1')
    expect(cc).toEqual(DEFAULT_EMPTY)
  })

  it('should parse no-cache with a single field name', () => {
    const cc = parse('no-cache="Set-Cookie"')
    expect(cc).toEqual({
      ...DEFAULT_EMPTY,
      noCache: true,
      noCacheFields: ['Set-Cookie'],
    })
  })

  it('should parse no-cache with multiple field names', () => {
    const cc = parse('no-cache="Set-Cookie, Authorization"')
    expect(cc).toEqual({
      ...DEFAULT_EMPTY,
      noCache: true,
      noCacheFields: ['Set-Cookie', 'Authorization'],
    })
  })

  it('should parse no-cache without field names', () => {
    const cc = parse('no-cache')
    expect(cc).toEqual({
      ...DEFAULT_EMPTY,
      noCache: true,
      noCacheFields: null,
    })
  })

  it('should parse private with a single field name', () => {
    const cc = parse('private="X-Custom"')
    expect(cc).toEqual({
      ...DEFAULT_EMPTY,
      private: true,
      privateFields: ['X-Custom'],
    })
  })

  it('should parse private with multiple field names', () => {
    const cc = parse('private="Set-Cookie, X-Custom"')
    expect(cc).toEqual({
      ...DEFAULT_EMPTY,
      private: true,
      privateFields: ['Set-Cookie', 'X-Custom'],
    })
  })

  it('should parse private without field names', () => {
    const cc = parse('private')
    expect(cc).toEqual({
      ...DEFAULT_EMPTY,
      private: true,
      privateFields: null,
    })
  })

  it('should return null for whitespace-only field names', () => {
    const cc = parse('no-cache="  "')
    expect(cc).toEqual({
      ...DEFAULT_EMPTY,
      noCache: true,
      noCacheFields: null,
    })
  })

  it('should return null for comma-only field names', () => {
    const cc = parse('no-cache=","')
    expect(cc).toEqual({
      ...DEFAULT_EMPTY,
      noCache: true,
      noCacheFields: null,
    })
  })

  it('should handle unclosed quoted strings gracefully', () => {
    const cc = parse('no-cache="Set-Cookie')
    expect(cc).toEqual({
      ...DEFAULT_EMPTY,
      noCache: true,
      noCacheFields: null,
    })
  })

  it('should handle empty quoted strings', () => {
    const cc = parse('no-cache=""')
    expect(cc).toEqual({
      ...DEFAULT_EMPTY,
      noCache: true,
      noCacheFields: null,
    })
  })

  it('should handle negative durations', () => {
    const cc = parse('max-age=-1')
    expect(cc).toEqual(DEFAULT_EMPTY)
  })

  it('should handle non-numeric durations', () => {
    const cc = parse('max-age=abc')
    expect(cc).toEqual(DEFAULT_EMPTY)
  })

  it('should handle extremely large durations', () => {
    const cc = parse('max-age=999999999999999999999')
    expect(cc.maxAge).toBeGreaterThan(0)
  })

  it('should handle repeated directives by using the last value', () => {
    const cc = parse('max-age=100, max-age=200')
    expect(cc).toEqual({
      ...DEFAULT_EMPTY,
      maxAge: 200,
    })
  })

  it('should handle whitespace around equals sign', () => {
    const cc = parse('max-age =300')
    expect(cc).toEqual({
      ...DEFAULT_EMPTY,
      maxAge: 300,
    })
  })

  it('should handle headers with extra commas', () => {
    const cc = parse(',,,public,,, max-age=300,,,')
    expect(cc).toEqual({
      ...DEFAULT_EMPTY,
      public: true,
      maxAge: 300,
    })
  })

  it('should not crash on a very long header', () => {
    const header = 'public, ' + 'x'.repeat(100_000)
    const cc = parse(header)
    expect(cc.public).toBe(true)
  })

  it('should be case-insensitive for directive names', () => {
    const cc = parse('Max-Age=300, Public, No-Cache')
    expect(cc).toEqual({
      ...DEFAULT_EMPTY,
      maxAge: 300,
      public: true,
      noCache: true,
    })
  })

  it('should return null for duration directives without values', () => {
    const cc = parse('max-age, min-fresh, s-maxage')
    expect(cc).toEqual({
      ...DEFAULT_EMPTY,
    })
  })

  it('should truncate float durations to integers', () => {
    const cc = parse('max-age=3.5')
    expect(cc).toEqual({
      ...DEFAULT_EMPTY,
      maxAge: 3,
    })
  })

  it('should parse durations with leading zeros', () => {
    const cc = parse('max-age=0042')
    expect(cc).toEqual({
      ...DEFAULT_EMPTY,
      maxAge: 42,
    })
  })

  it('should parse field names without spaces after commas', () => {
    const cc = parse('no-cache="Set-Cookie,Authorization"')
    expect(cc).toEqual({
      ...DEFAULT_EMPTY,
      noCache: true,
      noCacheFields: ['Set-Cookie', 'Authorization'],
    })
  })

  it('should produce consistent results when parsed twice', () => {
    const cc = new CacheControl()
    cc.parse('public, max-age=300')
    cc.parse('private, no-store')
    expect(cc).toEqual({
      ...DEFAULT_EMPTY,
      private: true,
      noStore: true,
    })
  })

  it('should parse common headers (1)', () => {
    const cc = parse('no-cache, no-store, must-revalidate')
    expect(cc).toEqual({
      ...DEFAULT_EMPTY,
      noCache: true,
      noStore: true,
      mustRevalidate: true,
    })
  })

  it('should parse common headers (2)', () => {
    const cc = parse('public, max-age=31536000')
    expect(cc).toEqual({
      ...DEFAULT_EMPTY,
      public: true,
      maxAge: 31_536_000,
    })
  })

  it('should parse all 16 IANA-registered directives', () => {
    const cc = parse(
      [
        'max-age=300',
        's-maxage=600',
        'max-stale=900',
        'min-fresh=60',
        'no-cache="Set-Cookie"',
        'no-store',
        'no-transform',
        'only-if-cached',
        'must-revalidate',
        'must-understand',
        'private="X-Custom"',
        'proxy-revalidate',
        'public',
        'immutable',
        'stale-while-revalidate=3600',
        'stale-if-error=7200',
      ].join(', '),
    )
    expect(cc).toEqual({
      maxAge: 300,
      sharedMaxAge: 600,
      maxStale: true,
      maxStaleDuration: 900,
      minFresh: 60,
      noCache: true,
      noCacheFields: ['Set-Cookie'],
      noStore: true,
      noTransform: true,
      onlyIfCached: true,
      mustRevalidate: true,
      mustUnderstand: true,
      private: true,
      privateFields: ['X-Custom'],
      proxyRevalidate: true,
      public: true,
      immutable: true,
      staleWhileRevalidate: 3600,
      staleIfError: 7200,
    })
  })
})

describe('format', () => {
  it('should return an empty string for an empty CacheControl', () => {
    const cc = format({})
    expect(cc).toBe('')
  })

  it('should return an empty string for empty defaults', () => {
    const cc = format(DEFAULT_EMPTY)
    expect(cc).toBe('')
  })

  it('should return an empty string for a default instance', () => {
    const cc = format(new CacheControl())
    expect(cc).toBe('')
  })

  it('should format durations', () => {
    const cc = format({
      maxAge: 4242,
      sharedMaxAge: 4343,
      minFresh: 4444,
      staleWhileRevalidate: 4545,
      staleIfError: 4546,
    })
    expect(cc).toBe(
      'max-age=4242, s-maxage=4343, min-fresh=4444, stale-while-revalidate=4545, stale-if-error=4546',
    )
  })

  it('should format booleans', () => {
    const cc = format({
      maxStale: true,
      immutable: true,
      mustRevalidate: true,
      mustUnderstand: true,
      noCache: true,
      noStore: true,
      noTransform: true,
      onlyIfCached: true,
      private: true,
      proxyRevalidate: true,
      public: true,
    })
    expect(cc).toBe(
      'max-stale, immutable, must-revalidate, must-understand, no-cache, no-store, no-transform, only-if-cached, private, proxy-revalidate, public',
    )
  })

  it('should format no-cache with field names', () => {
    const cc = format({
      noCache: true,
      noCacheFields: ['Set-Cookie'],
    })
    expect(cc).toBe('no-cache="Set-Cookie"')
  })

  it('should format no-cache with multiple field names', () => {
    const cc = format({
      noCache: true,
      noCacheFields: ['Set-Cookie', 'Authorization'],
    })
    expect(cc).toBe('no-cache="Set-Cookie, Authorization"')
  })

  it('should format private with field names', () => {
    const cc = format({
      private: true,
      privateFields: ['X-Custom', 'X-Other'],
    })
    expect(cc).toBe('private="X-Custom, X-Other"')
  })

  it('should strip invalid field names when formatting', () => {
    const cc = format({
      noCache: true,
      noCacheFields: ['Set-Cookie', 'invalid"field', 'Authorization'],
    })
    expect(cc).toBe('no-cache="Set-Cookie, Authorization"')
  })

  it('should trim field names before validating', () => {
    const cc = format({
      noCache: true,
      noCacheFields: [' Set-Cookie ', '  Authorization'],
    })
    expect(cc).toBe('no-cache="Set-Cookie, Authorization"')
  })

  it('should fall back to unqualified when all field names are invalid', () => {
    const cc = format({
      noCache: true,
      noCacheFields: ['bad field', 'also bad'],
    })
    expect(cc).toBe('no-cache')
  })

  it('should not include field names without the boolean flag', () => {
    const cc = format({
      noCacheFields: ['Set-Cookie'],
      privateFields: ['X-Custom'],
    })
    expect(cc).toBe('')
  })

  it('should not include max-stale duration if maxStale is not true', () => {
    const cc = format({
      maxStaleDuration: 4242,
    })
    expect(cc).toBe('')
  })

  it('should include max-stale duration if maxStale is true', () => {
    const cc = format({
      maxStale: true,
      maxStaleDuration: 4242,
    })
    expect(cc).toBe('max-stale=4242')
  })

  it('should fall back to unqualified for empty field name arrays', () => {
    const cc = format({
      noCache: true,
      noCacheFields: [],
      private: true,
      privateFields: [],
    })
    expect(cc).toBe('no-cache, private')
  })

  it('should produce a round-trippable header', () => {
    const header = 'max-age=300, no-cache="Set-Cookie", no-store, public'
    const parsed = parse(header)
    const formatted = format(parsed)
    const reparsed = parse(formatted)
    expect(reparsed).toEqual(parsed)
  })

  it('should include zero duration values', () => {
    const cc = format({
      maxAge: 0,
      sharedMaxAge: 0,
      public: true,
      maxStale: true,
      maxStaleDuration: 0,
      minFresh: 0,
      staleWhileRevalidate: 0,
      staleIfError: 0,
    })
    expect(cc).toBe(
      'max-age=0, s-maxage=0, max-stale=0, min-fresh=0, public, stale-while-revalidate=0, stale-if-error=0',
    )
  })
})
