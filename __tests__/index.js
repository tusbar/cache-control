const {CacheControl, parse, format} = require('..')

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
  noCache: false,
  noStore: false,
  noTransform: false,
  onlyIfCached: false,
  private: false,
  proxyRevalidate: false,
  public: false,
  sharedMaxAge: null,
  staleIfError: null,
  staleWhileRevalidate: null,
}

describe('index', () => {
  it('should return default properties by default', () => {
    const cc = new CacheControl()
    expect(cc).toEqual(DEFAULT_UNSET)
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
      const cc = parse('max-age=0, s-maxage=0, max-stale=0, min-fresh=0, stale-while-revalidate=0, stale-if-error=0')
      expect(cc).toEqual({
        ...DEFAULT_EMPTY,
        maxAge: 0,
        sharedMaxAge: 0,
        maxStaleDuration: 0,
        minFresh: 0,
        staleWhileRevalidate: 0,
        staleIfError: 0,
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
      expect(cc).toBe('max-age=4242, s-maxage=4343, min-fresh=4444, stale-while-revalidate=4545, stale-if-error=4546')
    })

    it('should format booleans', () => {
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
        public: true,
      })
      expect(cc).toBe('max-stale, immutable, must-revalidate, no-cache, no-store, no-transform, only-if-cached, private, proxy-revalidate, public')
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
      expect(cc).toBe('max-age=0, s-maxage=0, max-stale=0, min-fresh=0, public, stale-while-revalidate=0, stale-if-error=0')
    })
  })
})
